import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import EmptyState from '../components/ui/EmptyState';
import { RestaurantSkeleton } from '../components/ui/Skeletons';
import { getApiErrorMessage, restaurantsAPI } from '../services/api';

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('yumzo-theme') || 'light');
  const cardsRef = useRef(null);

  const applyTheme = (nextTheme) => {
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('yumzo-theme', nextTheme);
    window.dispatchEvent(new Event('yumzo-theme-change'));
  };

  const loadRestaurants = async (selectedCity = city) => {
    setLoading(true);
    try {
      const { data } = await restaurantsAPI.getAll({ city: selectedCity || undefined });
      setRestaurants(data?.data?.restaurants || []);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load restaurants.'));
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants(city);
  }, [city]);

  useEffect(() => {
    if (!loading && cardsRef.current) {
      gsap.fromTo(
        cardsRef.current.querySelectorAll('.restaurant-card'),
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, stagger: 0.06, ease: 'power2.out' },
      );
    }
  }, [loading, restaurants]);

  const filteredRestaurants = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return restaurants;
    return restaurants.filter((item) => {
      return (
        item.name?.toLowerCase().includes(q) ||
        item.city?.toLowerCase().includes(q) ||
        item.cuisine_type?.toLowerCase().includes(q)
      );
    });
  }, [restaurants, search]);

  return (
    <AppLayout>
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-10 text-white shadow-xl shadow-slate-300/40 md:px-10 md:py-14">
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-orange-500/40 blur-2xl" />
        <div className="absolute -bottom-12 -left-8 h-44 w-44 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="absolute right-10 top-8 hidden rounded-full border border-white/20 px-3 py-1 text-xs text-slate-200 md:block">
          Live discovery
        </div>
        <h1 className="text-3xl font-black tracking-tight md:text-5xl">Discover great food near you</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
          Browse local restaurants, explore menus, add favorites to cart, and place your order in minutes.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by restaurant, city, cuisine"
            className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm outline-none ring-orange-400 placeholder:text-slate-400 focus:ring-2"
          />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Filter by city"
            className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm outline-none ring-orange-400 placeholder:text-slate-400 focus:ring-2"
          />
          <button
            onClick={loadRestaurants}
            className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
          >
            Refresh list
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">Theme</span>
          <button
            onClick={() => applyTheme('light')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              theme === 'light' ? 'bg-white text-slate-900' : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
          >
            Light
          </button>
          <button
            onClick={() => applyTheme('dark')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              theme === 'dark' ? 'bg-white text-slate-900' : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
          >
            Dark
          </button>
        </div>
      </section>

      <section className="mt-7" ref={cardsRef}>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <RestaurantSkeleton key={idx} />
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <EmptyState
            title="No restaurants found"
            description="Try another city or search term. If this is your first run, add sample restaurants/menu data in the database."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRestaurants.map((restaurant) => (
              <article
                key={restaurant.id}
                className="restaurant-card group surface-card rounded-2xl p-5 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-4 overflow-hidden rounded-xl bg-slate-100">
                  {restaurant.image_url ? (
                    <img
                      src={restaurant.image_url}
                      alt={restaurant.name}
                      className="h-36 w-full object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-36 items-center justify-center text-3xl">🍽️</div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="line-clamp-1 text-lg font-semibold text-slate-900">{restaurant.name}</h3>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                    {restaurant.rating || '0.0'} ★
                  </span>
                </div>
                <p className="mt-1 line-clamp-1 text-sm text-slate-500">{restaurant.cuisine_type || 'Multi-cuisine'}</p>
                <p className="mt-3 line-clamp-2 text-sm text-slate-600">{restaurant.description || 'Fresh and tasty meals delivered fast.'}</p>
                <div className="soft-divider mt-4 pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">{restaurant.city}</p>
                    <Link
                      to={`/restaurants/${restaurant.id}`}
                      className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition group-hover:bg-orange-500"
                    >
                      View menu
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </AppLayout>
  );
};

export default Home;
