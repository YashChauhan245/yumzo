import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
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

const emptyDishForm = {
  name: '',
  price: '',
  category: '',
  is_veg: false,
};

const hasRestaurantBasics = (restaurant) => {
  return Boolean(restaurant.name?.trim() && restaurant.address?.trim() && restaurant.city?.trim());
};

const getValidPrice = (priceValue) => {
  const price = Number(priceValue);
  return Number.isFinite(price) && price > 0 ? price : null;
};

export default function AdminRestaurants() {
  const [searchParams] = useSearchParams();
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
  const [activeDishRestaurantId, setActiveDishRestaurantId] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [dishForm, setDishForm] = useState(emptyDishForm);
  const [dishLoading, setDishLoading] = useState(false);
  const [dishSaving, setDishSaving] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [dishEditForm, setDishEditForm] = useState(emptyDishForm);
  const [isDishEditModalOpen, setIsDishEditModalOpen] = useState(false);
  const [isFocusApplied, setIsFocusApplied] = useState(false);

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

    if (!hasRestaurantBasics(form)) {
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
    if (!hasRestaurantBasics(editForm)) {
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

  const loadRestaurantDishes = async (restaurantId) => {
    setDishLoading(true);
    try {
      const { data } = await adminAPI.getMenuItems({ restaurantId, page: 1, limit: 100 });
      setDishes(data?.data?.menuItems || []);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load dishes'));
      setDishes([]);
    } finally {
      setDishLoading(false);
    }
  };

  useEffect(() => {
    const focusName = (searchParams.get('focus') || '').trim().toLowerCase();
    if (!focusName || isFocusApplied || restaurants.length === 0) return;

    const matchedRestaurant = restaurants.find(
      (restaurant) => (restaurant.name || '').trim().toLowerCase() === focusName,
    );

    if (matchedRestaurant) {
      setActiveDishRestaurantId(matchedRestaurant.id);
      setDishForm(emptyDishForm);
      loadRestaurantDishes(matchedRestaurant.id);
    }

    setIsFocusApplied(true);
  }, [restaurants, searchParams, isFocusApplied]);

  const handleToggleDishes = async (restaurantId) => {
    if (activeDishRestaurantId === restaurantId) {
      setActiveDishRestaurantId(null);
      setDishes([]);
      setDishForm(emptyDishForm);
      return;
    }

    setActiveDishRestaurantId(restaurantId);
    setDishForm(emptyDishForm);
    await loadRestaurantDishes(restaurantId);
  };

  const handleAddDish = async (restaurantId) => {
    if (!dishForm.name.trim() || !dishForm.price) {
      toast.error('Dish name and price are required');
      return;
    }

    const price = getValidPrice(dishForm.price);
    if (price == null) {
      toast.error('Price must be greater than 0');
      return;
    }

    setDishSaving(true);
    try {
      await adminAPI.createMenuItem({
        restaurant_id: restaurantId,
        name: dishForm.name.trim(),
        price,
        category: dishForm.category.trim(),
        is_veg: dishForm.is_veg,
      });
      toast.success('Dish added');
      setDishForm(emptyDishForm);
      await loadRestaurantDishes(restaurantId);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to add dish'));
    } finally {
      setDishSaving(false);
    }
  };

  const handleDeleteDish = async (dishId, restaurantId) => {
    setDishSaving(true);
    try {
      await adminAPI.deleteMenuItem(dishId);
      toast.success('Dish deleted');
      await loadRestaurantDishes(restaurantId);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete dish'));
    } finally {
      setDishSaving(false);
    }
  };

  const openDishEditModal = (dish) => {
    setEditingDish(dish);
    setDishEditForm({
      name: dish.name || '',
      price: dish.price || '',
      category: dish.category || '',
      is_veg: !!dish.is_veg,
    });
    setIsDishEditModalOpen(true);
  };

  const closeDishEditModal = () => {
    setIsDishEditModalOpen(false);
    setEditingDish(null);
    setDishEditForm(emptyDishForm);
  };

  const handleDishEditSave = async () => {
    if (!editingDish || !activeDishRestaurantId) return;
    if (!dishEditForm.name.trim() || !dishEditForm.price) {
      toast.error('Dish name and price are required');
      return;
    }

    const price = getValidPrice(dishEditForm.price);
    if (price == null) {
      toast.error('Price must be greater than 0');
      return;
    }

    setDishSaving(true);
    try {
      await adminAPI.updateMenuItem(editingDish.id, {
        name: dishEditForm.name.trim(),
        price,
        category: dishEditForm.category.trim(),
        is_veg: dishEditForm.is_veg,
      });
      toast.success('Dish updated');
      closeDishEditModal();
      await loadRestaurantDishes(activeDishRestaurantId);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update dish'));
    } finally {
      setDishSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Restaurant Management"
      subtitle="Add, edit, and remove restaurant listings."
    >
      <section className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-5 transition-all duration-300 hover:border-[#3A3A3A] hover:shadow-[0_16px_30px_rgba(0,0,0,0.28)]">
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
            className="rounded-xl bg-linear-to-r from-[#EE6A2C] to-[#F68C3E] px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-105 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Add Restaurant'}
          </button>
        </form>
      </section>

      <section className="mt-5 rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-5 transition-all duration-300 hover:border-[#3A3A3A] hover:shadow-[0_16px_30px_rgba(0,0,0,0.28)]">
        <h2 className="text-lg font-semibold">All Restaurants</h2>

        {loading ? (
          <p className="mt-4 text-sm text-[#A1A1AA]">Loading restaurants...</p>
        ) : restaurants.length === 0 ? (
          <p className="mt-4 text-sm text-[#A1A1AA]">No restaurants found.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {restaurants.map((restaurant) => (
              <article key={restaurant.id} className="rounded-xl border border-[#2A2A2A] bg-[#0B0B0B] p-4 transition-all duration-300 hover:border-[#3A3A3A] hover:-translate-y-0.5 hover:shadow-[0_12px_22px_rgba(0,0,0,0.22)]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-white">{restaurant.name}</p>
                    <p className="text-sm text-[#A1A1AA]">{restaurant.city} • {restaurant.cuisine_type || 'N/A'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(restaurant)}
                      className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-1.5 text-sm text-white transition-all hover:border-[#EE6A2C]/55 hover:bg-[#18120E]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleDishes(restaurant.id)}
                      className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-1.5 text-sm text-white transition-all hover:border-[#EE6A2C]/55 hover:bg-[#18120E]"
                    >
                      {activeDishRestaurantId === restaurant.id ? 'Close Dish Editor' : 'Edit Dishes'}
                    </button>
                    <button
                      onClick={() => handleDelete(restaurant.id)}
                      className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-1.5 text-sm text-white transition-all hover:border-rose-500/55 hover:bg-rose-500/10"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {activeDishRestaurantId === restaurant.id ? (
                  <div className="mt-4 rounded-xl border border-[#2A2A2A] bg-[#141414] p-3 transition-all duration-300 hover:border-[#333]">
                    <p className="text-sm font-medium text-white">Edit Dishes</p>

                    <div className="mt-3 grid gap-2 md:grid-cols-4">
                      <input
                        placeholder="Dish name"
                        value={dishForm.name}
                        onChange={(e) => setDishForm((prev) => ({ ...prev, name: e.target.value }))}
                        className={formFieldBaseClass}
                      />
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        placeholder="Price"
                        value={dishForm.price}
                        onChange={(e) => setDishForm((prev) => ({ ...prev, price: e.target.value }))}
                        className={formFieldBaseClass}
                      />
                      <input
                        placeholder="Category"
                        value={dishForm.category}
                        onChange={(e) => setDishForm((prev) => ({ ...prev, category: e.target.value }))}
                        className={formFieldBaseClass}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddDish(restaurant.id)}
                        disabled={dishSaving}
                        className="rounded-xl bg-linear-to-r from-[#EE6A2C] to-[#F68C3E] px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-105 disabled:opacity-60"
                      >
                        {dishSaving ? 'Saving...' : 'Add Dish'}
                      </button>
                    </div>

                    <label className="mt-2 flex items-center gap-2 text-xs text-[#A1A1AA]">
                      <input
                        type="checkbox"
                        checked={dishForm.is_veg}
                        onChange={(e) => setDishForm((prev) => ({ ...prev, is_veg: e.target.checked }))}
                      />
                      Veg dish
                    </label>

                    {dishLoading ? (
                      <p className="mt-3 text-sm text-[#A1A1AA]">Loading dishes...</p>
                    ) : dishes.length === 0 ? (
                      <p className="mt-3 text-sm text-[#A1A1AA]">No dishes yet.</p>
                    ) : (
                      <div className="mt-3 space-y-2">
                        {dishes.map((dish) => (
                          <div key={dish.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#2A2A2A] bg-[#0B0B0B] p-2 transition-all duration-300 hover:border-[#3A3A3A]">
                            <div>
                              <p className="text-sm text-white">{dish.name}</p>
                              <p className="text-xs text-[#A1A1AA]">
                                ₹{Number(dish.price).toFixed(2)} • {dish.category || 'Uncategorized'} • {dish.is_veg ? 'Veg' : 'Non-veg'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openDishEditModal(dish)}
                                className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-1 text-xs text-white transition-all hover:border-[#EE6A2C]/55 hover:bg-[#18120E]"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteDish(dish.id, restaurant.id)}
                                className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-1 text-xs text-white transition-all hover:border-rose-500/55 hover:bg-rose-500/10"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
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

      <FormModal
        isOpen={isDishEditModalOpen && !!editingDish}
        title="Edit dish"
        description="Update dish details and save changes."
        onCancel={closeDishEditModal}
        onSubmit={handleDishEditSave}
        submitLabel="Save Dish"
        submitting={dishSaving}
      >
        <input
          placeholder="Dish name"
          value={dishEditForm.name}
          onChange={(e) => setDishEditForm((prev) => ({ ...prev, name: e.target.value }))}
          className={formFieldFullClass}
        />
        <input
          placeholder="Price"
          type="number"
          min="1"
          step="0.01"
          value={dishEditForm.price}
          onChange={(e) => setDishEditForm((prev) => ({ ...prev, price: e.target.value }))}
          className={formFieldFullClass}
        />
        <input
          placeholder="Category"
          value={dishEditForm.category}
          onChange={(e) => setDishEditForm((prev) => ({ ...prev, category: e.target.value }))}
          className={formFieldFullClass}
        />
        <label className="flex items-center gap-2 text-sm text-[#A1A1AA]">
          <input
            type="checkbox"
            checked={dishEditForm.is_veg}
            onChange={(e) => setDishEditForm((prev) => ({ ...prev, is_veg: e.target.checked }))}
          />
          Veg dish
        </label>
      </FormModal>
    </AdminLayout>
  );
}
