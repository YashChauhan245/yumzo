import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';
import { adminAPI, getApiErrorMessage } from '../../services/api';
import FormModal from '../../components/ui/FormModal';
import { formFieldBaseClass, formFieldFullClass } from '../../components/ui/formFieldStyles';
import PaginationControls from '../../components/ui/PaginationControls';

const emptyForm = {
  restaurant_id: '',
  name: '',
  price: '',
  category: '',
  is_veg: false,
};

export default function AdminMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantIdFilter, setRestaurantIdFilter] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', price: '', category: '', is_veg: false });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasPrevPage: false,
    hasNextPage: false,
  });

  const loadData = useCallback(async (selectedRestaurantId = restaurantIdFilter, requestedPage = page) => {
    setLoading(true);
    try {
      const [restaurantsRes, menuRes] = await Promise.all([
        adminAPI.getRestaurants({ page: 1, limit: 30 }),
        adminAPI.getMenuItems(
          selectedRestaurantId
            ? { restaurantId: selectedRestaurantId, page: requestedPage, limit: 8 }
            : { page: requestedPage, limit: 8 },
        ),
      ]);

      setRestaurants(restaurantsRes?.data?.data?.restaurants || []);
      setMenuItems(menuRes?.data?.data?.menuItems || []);
      setPagination(
        menuRes?.data?.pagination || {
          page: requestedPage,
          totalPages: 1,
          hasPrevPage: requestedPage > 1,
          hasNextPage: false,
        },
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load menu management data'));
    } finally {
      setLoading(false);
    }
  }, [restaurantIdFilter, page]);

  useEffect(() => {
    loadData(restaurantIdFilter, page);
  }, [loadData, restaurantIdFilter, page]);

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!form.restaurant_id || !form.name || !form.price) {
      toast.error('Restaurant, name and price are required');
      return;
    }

    setSaving(true);
    try {
      await adminAPI.createMenuItem({
        ...form,
        price: Number(form.price),
      });
      toast.success('Menu item added');
      setForm(emptyForm);
      await loadData(restaurantIdFilter, page);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to add menu item'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (menuItemId) => {
    try {
      await adminAPI.deleteMenuItem(menuItemId);
      toast.success('Menu item deleted');
      setMenuItems((prev) => prev.filter((item) => item.id !== menuItemId));
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete menu item'));
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditForm({
      name: item.name || '',
      price: item.price || '',
      category: item.category || '',
      is_veg: !!item.is_veg,
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingItem(null);
    setEditForm({ name: '', price: '', category: '', is_veg: false });
  };

  const handleEditSave = async () => {
    if (!editingItem) return;
    if (!editForm.name.trim() || !editForm.price) {
      toast.error('Name and price are required');
      return;
    }

    const nextPrice = Number(editForm.price);
    if (!Number.isFinite(nextPrice) || nextPrice <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    setSaving(true);
    try {
      await adminAPI.updateMenuItem(editingItem.id, {
        name: editForm.name.trim(),
        price: nextPrice,
        category: editForm.category.trim(),
        is_veg: editForm.is_veg,
      });
      toast.success('Menu item updated');
      closeEditModal();
      await loadData(restaurantIdFilter, page);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update menu item'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Menu Management"
      subtitle="Manage food items for each restaurant."
    >
      <section className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-5">
        <h2 className="text-lg font-semibold">Add Menu Item</h2>
        <form onSubmit={handleCreate} className="mt-4 grid gap-3 md:grid-cols-2">
          <select
            value={form.restaurant_id}
            onChange={(e) => setForm((prev) => ({ ...prev, restaurant_id: e.target.value }))}
            className={formFieldBaseClass}
          >
            <option value="">Select restaurant</option>
            {restaurants.map((restaurant) => (
              <option value={restaurant.id} key={restaurant.id}>{restaurant.name}</option>
            ))}
          </select>

          <input
            placeholder="Item name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            className={formFieldBaseClass}
          />

          <input
            placeholder="Price"
            type="number"
            step="0.01"
            min="1"
            value={form.price}
            onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
            className={formFieldBaseClass}
          />

          <input
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
            className={formFieldBaseClass}
          />

          <label className="flex items-center gap-2 text-sm text-[#A1A1AA]">
            <input
              type="checkbox"
              checked={form.is_veg}
              onChange={(e) => setForm((prev) => ({ ...prev, is_veg: e.target.checked }))}
            />
            Veg item
          </label>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#3A3A3A] px-4 py-2 text-sm font-medium text-white hover:bg-[#2F2F2F] disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Add Item'}
          </button>
        </form>
      </section>

      <section className="mt-5 rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">All Menu Items</h2>
          <select
            value={restaurantIdFilter}
            onChange={(e) => {
              const nextValue = e.target.value;
              setRestaurantIdFilter(nextValue);
              setPage(1);
              loadData(nextValue, 1);
            }}
            className={formFieldBaseClass}
          >
            <option value="">All restaurants</option>
            {restaurants.map((restaurant) => (
              <option value={restaurant.id} key={restaurant.id}>{restaurant.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-[#A1A1AA]">Loading menu items...</p>
        ) : menuItems.length === 0 ? (
          <p className="mt-4 text-sm text-[#A1A1AA]">No menu items found.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {menuItems.map((item) => (
              <article key={item.id} className="rounded-xl border border-[#2A2A2A] bg-[#0B0B0B] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-white">{item.name}</p>
                    <p className="text-sm text-[#A1A1AA]">₹{Number(item.price).toFixed(2)} • {item.category || 'Uncategorized'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-1.5 text-sm text-white hover:border-[#3A3A3A]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-1.5 text-sm text-white hover:border-[#3A3A3A]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}

            <PaginationControls
              page={pagination.page}
              totalPages={pagination.totalPages}
              hasPrevPage={pagination.hasPrevPage}
              hasNextPage={pagination.hasNextPage}
              onPrev={() => setPage((prev) => Math.max(1, prev - 1))}
              onNext={() => setPage((prev) => prev + 1)}
              className="pt-2"
            />
          </div>
        )}
      </section>

      <FormModal
        isOpen={isEditModalOpen && !!editingItem}
        title="Edit menu item"
        description="Update item details and save changes."
        onCancel={closeEditModal}
        onSubmit={handleEditSave}
        submitLabel="Save Changes"
        submitting={saving}
      >
        <input
          placeholder="Item name"
          value={editForm.name}
          onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
          className={formFieldFullClass}
        />
        <input
          placeholder="Price"
          type="number"
          min="1"
          step="0.01"
          value={editForm.price}
          onChange={(e) => setEditForm((prev) => ({ ...prev, price: e.target.value }))}
          className={formFieldFullClass}
        />
        <input
          placeholder="Category"
          value={editForm.category}
          onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
          className={formFieldFullClass}
        />
        <label className="flex items-center gap-2 text-sm text-[#A1A1AA]">
          <input
            type="checkbox"
            checked={editForm.is_veg}
            onChange={(e) => setEditForm((prev) => ({ ...prev, is_veg: e.target.checked }))}
          />
          Veg item
        </label>
      </FormModal>
    </AdminLayout>
  );
}
