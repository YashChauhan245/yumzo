import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';
import { adminAPI, getApiErrorMessage } from '../../services/api';
import FormModal from '../../components/ui/FormModal';
import { formFieldBaseClass, formFieldFullClass } from '../../components/ui/formFieldStyles';
import PaginationControls from '../../components/ui/PaginationControls';

const emptyRestaurantForm = {
  name: '',
  address: '',
  city: '',
  cuisine_type: '',
};

export default function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [form, setForm] = useState(emptyRestaurantForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [editForm, setEditForm] = useState(emptyRestaurantForm);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasPrevPage: false,
    hasNextPage: false,
  });

  const loadRestaurants = useCallback(async (requestedPage = page) => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getRestaurants({ page: requestedPage, limit: 8 });
      setRestaurants(data?.data?.restaurants || []);
      setPagination(
        data?.pagination || {
          page: requestedPage,
          totalPages: 1,
          hasPrevPage: requestedPage > 1,
          hasNextPage: false,
        },
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load restaurants'));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadRestaurants(page);
  }, [page, loadRestaurants]);

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!form.name || !form.address || !form.city) {
      toast.error('Name, address and city are required');
      return;
    }

    setSaving(true);
    try {
      await adminAPI.createRestaurant(form);
      toast.success('Restaurant created');
      setForm(emptyRestaurantForm);
      await loadRestaurants(page);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to create restaurant'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (restaurantId) => {
    try {
      await adminAPI.deleteRestaurant(restaurantId);
      toast.success('Restaurant deleted');
      setRestaurants((prev) => prev.filter((restaurant) => restaurant.id !== restaurantId));
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete restaurant'));
    }
  };

  const openEditModal = (restaurant) => {
    setEditingRestaurant(restaurant);
    setEditForm({
      name: restaurant.name || '',
      city: restaurant.city || '',
      address: restaurant.address || '',
      cuisine_type: restaurant.cuisine_type || '',
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingRestaurant(null);
    setEditForm(emptyRestaurantForm);
  };

  const handleEditSave = async () => {
    if (!editingRestaurant) return;
    if (!editForm.name.trim() || !editForm.city.trim() || !editForm.address.trim()) {
      toast.error('Name, address and city are required');
      return;
    }

    setSaving(true);
    try {
      await adminAPI.updateRestaurant(editingRestaurant.id, {
        name: editForm.name.trim(),
        city: editForm.city.trim(),
        address: editForm.address.trim(),
        cuisine_type: editForm.cuisine_type.trim(),
      });
      toast.success('Restaurant updated');
      closeEditModal();
      await loadRestaurants(page);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update restaurant'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Restaurant Management"
      subtitle="Add, edit, and remove restaurant listings."
    >
      <section className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-5">
        <h2 className="text-lg font-semibold">Add Restaurant</h2>
        <form onSubmit={handleCreate} className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            placeholder="Restaurant name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            className={formFieldBaseClass}
          />
          <input
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
            className={formFieldBaseClass}
          />
          <input
            placeholder="Cuisine type"
            value={form.cuisine_type}
            onChange={(e) => setForm((prev) => ({ ...prev, cuisine_type: e.target.value }))}
            className={formFieldBaseClass}
          />
          <input
            placeholder="Address"
            value={form.address}
            onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
            className={formFieldBaseClass}
          />
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#3A3A3A] px-4 py-2 text-sm font-medium text-white hover:bg-[#2F2F2F] disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Add Restaurant'}
          </button>
        </form>
      </section>

      <section className="mt-5 rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-5">
        <h2 className="text-lg font-semibold">All Restaurants</h2>

        {loading ? (
          <p className="mt-4 text-sm text-[#A1A1AA]">Loading restaurants...</p>
        ) : restaurants.length === 0 ? (
          <p className="mt-4 text-sm text-[#A1A1AA]">No restaurants found.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {restaurants.map((restaurant) => (
              <article key={restaurant.id} className="rounded-xl border border-[#2A2A2A] bg-[#0B0B0B] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-white">{restaurant.name}</p>
                    <p className="text-sm text-[#A1A1AA]">{restaurant.city} • {restaurant.cuisine_type || 'N/A'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(restaurant)}
                      className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-1.5 text-sm text-white hover:border-[#3A3A3A]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(restaurant.id)}
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
        isOpen={isEditModalOpen && !!editingRestaurant}
        title="Edit restaurant"
        description="Update restaurant details and save changes."
        onCancel={closeEditModal}
        onSubmit={handleEditSave}
        submitLabel="Save Changes"
        submitting={saving}
      >
        <input
          placeholder="Restaurant name"
          value={editForm.name}
          onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
          className={formFieldFullClass}
        />
        <input
          placeholder="City"
          value={editForm.city}
          onChange={(e) => setEditForm((prev) => ({ ...prev, city: e.target.value }))}
          className={formFieldFullClass}
        />
        <input
          placeholder="Address"
          value={editForm.address}
          onChange={(e) => setEditForm((prev) => ({ ...prev, address: e.target.value }))}
          className={formFieldFullClass}
        />
        <input
          placeholder="Cuisine type"
          value={editForm.cuisine_type}
          onChange={(e) => setEditForm((prev) => ({ ...prev, cuisine_type: e.target.value }))}
          className={formFieldFullClass}
        />
      </FormModal>
    </AdminLayout>
  );
}
