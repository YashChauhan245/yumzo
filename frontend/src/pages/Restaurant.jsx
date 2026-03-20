import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { gsap } from 'gsap';
import AppLayout from '../components/layout/AppLayout';
import EmptyState from '../components/ui/EmptyState';
import { MenuSkeleton } from '../components/ui/Skeletons';
import { cartAPI, getApiErrorMessage, restaurantsAPI } from '../services/api';

const Restaurant = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [foodType, setFoodType] = useState('all');
  const [addingItemId, setAddingItemId] = useState('');

  const loadMenu = async (selectedCategory = category) => {
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
  };

  useEffect(() => {
    loadMenu(category);
  }, [category, id]);

  useEffect(() => {
    if (!loading) {
      gsap.fromTo('.menu-card', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.05 });
    }
  }, [loading, menuItems]);

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
      <section className="surface-card rounded-3xl p-6 md:p-8">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-4xl">{restaurant?.name || 'Restaurant menu'}</h1>
        <p className="mt-2 text-sm text-slate-500">{restaurant?.description || 'Explore available dishes and add your favorites to cart.'}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((value) => {
            const active = (value === 'All' && category === '') || value === category;
            return (
              <button
                key={value}
                onClick={() => setCategory(value === 'All' ? '' : value)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  active ? 'bg-orange-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              foodType === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Show All
          </button>
          <button
            onClick={() => setFoodType('veg')}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              foodType === 'veg' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
            }`}
          >
            Veg Only
          </button>
          <button
            onClick={() => setFoodType('nonveg')}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              foodType === 'nonveg' ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
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
              <article key={item.id} className="menu-card surface-card rounded-2xl p-5 transition hover:-translate-y-1 hover:shadow-xl">
                <div className="mb-3 overflow-hidden rounded-xl bg-slate-100">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-32 w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-32 items-center justify-center text-3xl">🍲</div>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold text-slate-900">{item.name}</h3>
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
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{item.description || 'Delicious dish prepared fresh.'}</p>
                <div className="soft-divider mt-4 flex items-center justify-between pt-4">
                  <p className="text-lg font-bold text-slate-900">₹{item.price}</p>
                  <button
                    onClick={() => handleAddToCart(item.id)}
                    disabled={addingItemId === item.id}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-orange-500 disabled:opacity-60"
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
