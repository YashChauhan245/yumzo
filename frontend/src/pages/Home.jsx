import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import EmptyState from '../components/ui/EmptyState';
import { RestaurantSkeleton } from '../components/ui/Skeletons';
import { getApiErrorMessage, restaurantsAPI } from '../services/api';

/* ─── Fallback restaurant data with images ───────── */
const fallbackRestaurants = [
  {
    id: 'r1', name: 'Spice Garden', city: 'Mumbai', cuisine_type: 'North Indian',
    rating: 4.8, delivery_time: '30-40 min', price_range: '₹₹',
    image_url: '/images/dishes/indian.png',
    description: 'Authentic North Indian flavors with handmade butter naan, smoky tandoori kebabs, and rich curries prepared fresh daily.',
  },
  {
    id: 'r2', name: 'Pizza Paradiso', city: 'Bangalore', cuisine_type: 'Italian',
    rating: 4.6, delivery_time: '25-35 min', price_range: '₹₹₹',
    image_url: '/images/dishes/italian.png',
    description: 'Wood-fired Neapolitan pizzas, handmade pastas, and classic Italian desserts. A slice of Italy in every bite.',
  },
  {
    id: 'r3', name: 'Sushi Samurai', city: 'Delhi', cuisine_type: 'Japanese',
    rating: 4.9, delivery_time: '35-45 min', price_range: '₹₹₹₹',
    image_url: '/images/dishes/japanese.png',
    description: 'Premium sushi rolls, fresh sashimi, and authentic ramen bowls prepared by our trained Japanese chefs.',
  },
  {
    id: 'r4', name: 'Burger Republic', city: 'Pune', cuisine_type: 'American',
    rating: 4.5, delivery_time: '20-30 min', price_range: '₹₹',
    image_url: '/images/dishes/american.png',
    description: 'Juicy smash burgers, loaded fries, crispy wings, and thick shakes. American comfort food at its finest.',
  },
  {
    id: 'r5', name: 'Green Bowl Co.', city: 'Mumbai', cuisine_type: 'Healthy',
    rating: 4.7, delivery_time: '20-25 min', price_range: '₹₹',
    image_url: '/images/dishes/healthy.png',
    description: 'Nutritious Buddha bowls, fresh smoothies, and protein-packed meals for the health-conscious foodie.',
  },
  {
    id: 'r6', name: 'Dragon Wok', city: 'Hyderabad', cuisine_type: 'Chinese',
    rating: 4.4, delivery_time: '25-35 min', price_range: '₹₹',
    image_url: '/images/dishes/chinese.png',
    description: 'Fiery Indo-Chinese cuisine with crispy wontons, hakka noodles, and mouth-watering Manchurian gravies.',
  },
  {
    id: 'r7', name: 'Dosa Junction', city: 'Chennai', cuisine_type: 'South Indian',
    rating: 4.8, delivery_time: '15-25 min', price_range: '₹',
    image_url: '/images/dishes/south_indian.png',
    description: 'Crispy dosas, fluffy idlis, and authentic filter coffee. Traditional South Indian breakfast and meals.',
  },
  {
    id: 'r8', name: 'Taco Fiesta', city: 'Goa', cuisine_type: 'Mexican',
    rating: 4.6, delivery_time: '25-35 min', price_range: '₹₹',
    image_url: '/images/dishes/mexican.png',
    description: 'Loaded tacos, cheesy quesadillas, fresh guacamole, and fiery salsas. Taste Mexico in every bite.',
  },
  {
    id: 'r9', name: 'Beirut Bites', city: 'Bangalore', cuisine_type: 'Mediterranean',
    rating: 4.7, delivery_time: '30-40 min', price_range: '₹₹₹',
    image_url: '/images/dishes/mediterranean.png',
    description: 'Authentic falafel wraps, creamy hummus, and grilled shawarma platters with warm pita bread.',
  },
];

const cuisineFilters = ['All', 'North Indian', 'Italian', 'Japanese', 'American', 'Healthy', 'Chinese', 'South Indian', 'Mexican', 'Mediterranean'];

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCuisine, setActiveCuisine] = useState('All');
  const cardsRef = useRef(null);
  const heroRef = useRef(null);

  const loadRestaurants = async () => {
    setLoading(true);
    try {
      const { data } = await restaurantsAPI.getAll({});
      const apiRestaurants = data?.data?.restaurants || [];
      setRestaurants(apiRestaurants.length > 0 ? apiRestaurants : fallbackRestaurants);
    } catch {
      setRestaurants(fallbackRestaurants);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    if (!loading && cardsRef.current) {
      gsap.fromTo(
        cardsRef.current.querySelectorAll('.restaurant-card'),
        { y: 30, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.07, ease: 'power3.out' },
      );
    }
  }, [loading, restaurants, activeCuisine]);

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(heroRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' });
    }
  }, []);

  const filteredRestaurants = useMemo(() => {
    let result = restaurants;
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((item) =>
        item.name?.toLowerCase().includes(q) ||
        item.city?.toLowerCase().includes(q) ||
        item.cuisine_type?.toLowerCase().includes(q)
      );
    }
    if (activeCuisine !== 'All') {
      result = result.filter(r => r.cuisine_type === activeCuisine);
    }
    return result;
  }, [restaurants, search, activeCuisine]);

  return (
    <AppLayout>
      {/* ─── Hero Section ─── */}
      <section ref={heroRef} className="hero-section relative overflow-hidden rounded-3xl px-8 py-12 text-white shadow-2xl md:px-14 md:py-16">
        {/* Background elements */}
        <div className="hero-bg-pattern"></div>
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-orange-500/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-12 h-60 w-60 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute right-20 top-20 h-20 w-20 rounded-full bg-orange-300/15 blur-2xl" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
            Live — 128 restaurants near you
          </div>

          <h1 className="mt-5 text-4xl font-black tracking-tight leading-tight md:text-6xl md:max-w-3xl">
            Discover <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">great food</span> near you
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-300 leading-relaxed md:text-lg">
            Browse 9+ restaurants, explore 54+ dishes, watch cooking reels, and get your favorites delivered in minutes.
          </p>

          {/* Search */}
          <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1 max-w-xl">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search restaurants, cuisines, cities..."
                className="w-full rounded-2xl border border-white/10 bg-white/10 py-4 pl-12 pr-4 text-sm outline-none ring-orange-400 placeholder:text-slate-400 focus:ring-2 backdrop-blur-sm"
              />
            </div>
            <button
              onClick={loadRestaurants}
              className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98]"
            >
              Explore Now
            </button>
          </div>

          {/* Quick stats */}
          <div className="mt-8 flex flex-wrap gap-6">
            {[
              { num: '9+', label: 'Restaurants' },
              { num: '54+', label: 'Dishes' },
              { num: '4.7', label: 'Avg Rating' },
              { num: '25 min', label: 'Avg Delivery' },
            ].map(s => (
              <div key={s.label} className="flex flex-col">
                <span className="text-2xl font-extrabold text-white md:text-3xl">{s.num}</span>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Cuisine Filter Tabs ─── */}
      <section className="mt-8">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {cuisineFilters.map(cuisine => (
            <button
              key={cuisine}
              onClick={() => setActiveCuisine(cuisine)}
              className={`whitespace-nowrap rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                activeCuisine === cuisine
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25'
                  : 'bg-white/80 text-slate-600 border border-slate-200/80 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50'
              }`}
            >
              {cuisine}
            </button>
          ))}
        </div>
      </section>

      {/* ─── Restaurants Grid ─── */}
      <section className="mt-6" ref={cardsRef}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
              {activeCuisine === 'All' ? 'All Restaurants' : activeCuisine}
            </h2>
            <p className="text-sm text-slate-500 mt-1">{filteredRestaurants.length} restaurants available</p>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, idx) => (
              <RestaurantSkeleton key={idx} />
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <EmptyState
            title="No restaurants found"
            description="Try another cuisine or search term."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRestaurants.map((restaurant) => (
              <article
                key={restaurant.id}
                className="restaurant-card group surface-card rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-500/10"
              >
                {/* Image */}
                <div className="relative overflow-hidden">
                  {restaurant.image_url ? (
                    <img
                      src={restaurant.image_url}
                      alt={restaurant.name}
                      className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-5xl">🍽️</div>
                  )}

                  {/* Overlay badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-bold text-white">
                      {restaurant.delivery_time || '25-35 min'}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white shadow-lg">
                      ★ {restaurant.rating || '4.5'}
                    </span>
                  </div>

                  {/* Cuisine tag */}
                  <div className="absolute bottom-3 left-3">
                    <span className="rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-xs font-semibold text-slate-700">
                      {restaurant.cuisine_type || 'Multi-cuisine'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-500 transition-colors">{restaurant.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span className="text-xs text-slate-500">{restaurant.city}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-semibold text-orange-500">{restaurant.price_range || '₹₹'}</span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-slate-500 leading-relaxed line-clamp-2">{restaurant.description || 'Fresh and tasty meals delivered fast.'}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 rounded-full bg-green-400"></span>
                      <span className="text-xs text-slate-500">Open now</span>
                    </div>
                    <Link
                      to={`/restaurants/${restaurant.id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:from-orange-500 hover:to-amber-500 hover:shadow-orange-500/25"
                    >
                      View Menu
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ─── Quick Reels Preview ─── */}
      <section className="mt-12 mb-4">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">🎬 Food Reels</h2>
            <p className="text-sm text-slate-500 mt-1">Trending cooking videos from top chefs</p>
          </div>
          <Link to="/reels" className="text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { img: '/images/reels/reel1.png', title: 'Wok Mastery 🔥', views: '12K' },
            { img: '/images/reels/reel2.png', title: 'Chocolate Lava 🍫', views: '28K' },
            { img: '/images/reels/reel3.png', title: 'Fresh Naan 🫓', views: '8K' },
            { img: '/images/reels/reel4.png', title: 'Latte Art ☕', views: '15K' },
            { img: '/images/reels/reel5.png', title: 'Sushi Roll 🍣', views: '21K' },
            { img: '/images/reels/reel6.png', title: 'Cheese Pull 🧀', views: '34K' },
          ].map((reel, i) => (
            <Link key={i} to="/reels" className="group relative overflow-hidden rounded-2xl aspect-[9/14]">
              <img src={reel.img} alt={reel.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-xs font-bold text-white">{reel.title}</p>
                <div className="mt-1 flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  <span className="text-[10px] text-white/80">{reel.views} views</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </AppLayout>
  );
};

export default Home;
