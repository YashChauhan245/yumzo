import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import EmptyState from '../components/ui/EmptyState';
import { MenuSkeleton } from '../components/ui/Skeletons';
import { cartAPI, getApiErrorMessage, restaurantsAPI } from '../services/api';

const withFallbackImage = (event, fallbackSrc) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = fallbackSrc;
};

const Restaurant = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [foodType, setFoodType] = useState('all');
  const [addingItemId, setAddingItemId] = useState('');

  const loadMenu = useCallback(async (selectedCategory = category) => {
    setLoading(true);
    try {
      const { data } = await restaurantsAPI.getMenu(id, {
        category: selectedCategory || undefined,
      });
      setRestaurant(data?.data?.restaurant || null);
      setMenuItems(data?.data?.menuItems || []);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load menu.'));
      setRestaurant(null);
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  }, [category, id]);

  useEffect(() => {
    loadMenu(category);
  }, [category, loadMenu]);

  const categories = useMemo(() => {
    const set = new Set(menuItems.map((item) => item.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [menuItems]);

  const visibleMenuItems = useMemo(() => {
    if (foodType === 'veg') {
      return menuItems.filter((item) => item.is_veg);
    }
    if (foodType === 'nonveg') {
      return menuItems.filter((item) => !item.is_veg);
    }
    return menuItems;
  }, [menuItems, foodType]);

  const handleAddToCart = async (menuItemId) => {
    setAddingItemId(menuItemId);
    try {
      await cartAPI.addItem({ menu_item_id: menuItemId, quantity: 1 });
      toast.success('Item added to cart');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not add item to cart.'));
    } finally {
      setAddingItemId('');
    }
  };

  return (
    <AppLayout>
      <section className="surface-card rounded-2xl p-6 md:p-7">
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">{restaurant?.name || 'Restaurant menu'}</h1>
        <p className="mt-2 text-sm text-[#A1A1AA]">{restaurant?.description || 'Explore available dishes and add your favorites to cart.'}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((value) => {
            const active = (value === 'All' && category === '') || value === category;
            return (
              <button
                key={value}
                onClick={() => setCategory(value === 'All' ? '' : value)}
                className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors ${
                  active ? 'border-[#3A3A3A] bg-[#3A3A3A] text-white' : 'border-[#2A2A2A] bg-[#0B0B0B] text-[#A1A1AA] hover:text-white'
                }`}
              >
                {value}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setFoodType('all')}
            className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
              foodType === 'all' ? 'border-[#3A3A3A] bg-[#3A3A3A] text-white' : 'border-[#2A2A2A] bg-[#0B0B0B] text-[#A1A1AA] hover:text-white'
            }`}
          >
            Show All
          </button>
          <button
            onClick={() => setFoodType('veg')}
            className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
              foodType === 'veg' ? 'border-[#3A3A3A] bg-[#3A3A3A] text-white' : 'border-[#2A2A2A] bg-[#0B0B0B] text-[#A1A1AA] hover:text-white'
            }`}
          >
            Veg Only
          </button>
          <button
            onClick={() => setFoodType('nonveg')}
            className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
              foodType === 'nonveg' ? 'border-[#3A3A3A] bg-[#3A3A3A] text-white' : 'border-[#2A2A2A] bg-[#0B0B0B] text-[#A1A1AA] hover:text-white'
            }`}
          >
            Non-Veg Only
          </button>
        </div>
      </section>

      <section className="mt-6">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <MenuSkeleton key={idx} />
            ))}
          </div>
        ) : visibleMenuItems.length === 0 ? (
          <EmptyState
            title="No matching items"
            description="Try changing category or veg/non-veg filter to see more dishes."
            ctaLabel="Back to restaurants"
            ctaTo="/"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleMenuItems.map((item) => (
              <article key={item.id} className="menu-card surface-card rounded-2xl p-5 transition-colors">
                <div className="mb-3 overflow-hidden rounded-xl bg-[#0B0B0B]">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-32 w-full object-cover"
                      loading="lazy"
                      onError={(event) => withFallbackImage(event, '/images/dishes/indian.png')}
                    />
                  ) : (
                    <div className="flex h-32 items-center justify-center text-3xl">🍲</div>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                  {item.is_veg ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                      <span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-600" />
                      Veg
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-1 text-[11px] font-semibold text-rose-700">
                      <span className="mr-1 inline-block h-2 w-2 rounded-full bg-rose-600" />
                      Non-Veg
                    </span>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-[#A1A1AA]">{item.description || 'Delicious dish prepared fresh.'}</p>
                <div className="soft-divider mt-4 flex items-center justify-between pt-4">
                  <p className="text-lg font-semibold text-white">₹{item.price}</p>
                  <button
                    onClick={() => handleAddToCart(item.id)}
                    disabled={addingItemId === item.id}
                    className="rounded-lg bg-[#3A3A3A] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2F2F2F] disabled:opacity-60"
                  >
                    {addingItemId === item.id ? 'Adding...' : 'Add to cart'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </AppLayout>
  );
};

export default Restaurant;
