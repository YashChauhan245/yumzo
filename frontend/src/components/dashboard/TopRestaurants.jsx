import { Link } from 'react-router-dom';

const restaurants = [
  {
    name: 'Spice Garden',
    cuisine: 'North Indian',
    rating: 4.8,
    orders: 342,
    revenue: '₹1,28,400',
    growth: '+15%',
    avatar: '🌶️',
  },
  {
    name: 'Pizza Palace',
    cuisine: 'Italian',
    rating: 4.6,
    orders: 289,
    revenue: '₹98,500',
    growth: '+12%',
    avatar: '🍕',
  },
  {
    name: 'Sushi World',
    cuisine: 'Japanese',
    rating: 4.9,
    orders: 198,
    revenue: '₹1,45,200',
    growth: '+22%',
    avatar: '🍣',
  },
  {
    name: 'Burger Hub',
    cuisine: 'American',
    rating: 4.5,
    orders: 267,
    revenue: '₹76,800',
    growth: '+8%',
    avatar: '🍔',
  },
  {
    name: 'Green Bowl',
    cuisine: 'Healthy',
    rating: 4.7,
    orders: 178,
    revenue: '₹62,300',
    growth: '+18%',
    avatar: '🥗',
  },
];

const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  return (
    <div className="star-rating">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={i < fullStars ? '#4A4A4A' : (i === fullStars && hasHalf ? 'url(#halfGrad)' : 'none')}
          stroke={i < fullStars || (i === fullStars && hasHalf) ? '#4A4A4A' : 'currentColor'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: i >= fullStars && !(i === fullStars && hasHalf) ? 0.3 : 1 }}
        >
          <defs>
            <linearGradient id="halfGrad">
              <stop offset="50%" stopColor="#4A4A4A" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span className="rating-num">{rating}</span>
    </div>
  );
};

const TopRestaurants = ({ viewAllTo = '/dashboard/manage-restaurants' }) => {
  const getFocusLink = (restaurantName) => `${viewAllTo}?focus=${encodeURIComponent(restaurantName)}`;

  return (
    <div className="top-restaurants-card">
      <div className="chart-card-header">
        <div>
          <h3 className="chart-title">Top Restaurants</h3>
          <p className="chart-subtitle">Best performers this month</p>
        </div>
        <Link to={viewAllTo} className="view-all-btn">View All →</Link>
      </div>

      <div className="restaurant-list">
        {restaurants.map((r, i) => (
          <Link
            key={r.name}
            to={getFocusLink(r.name)}
            className="restaurant-item"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="restaurant-rank">#{i + 1}</div>
            <div className="restaurant-avatar">{r.avatar}</div>
            <div className="restaurant-details">
              <div className="restaurant-header">
                <span className="restaurant-title">{r.name}</span>
                <span className="restaurant-cuisine">{r.cuisine}</span>
              </div>
              <StarRating rating={r.rating} />
            </div>
            <div className="restaurant-stats">
              <div className="rest-stat">
                <span className="rest-stat-val">{r.orders}</span>
                <span className="rest-stat-label">Orders</span>
              </div>
              <div className="rest-stat">
                <span className="rest-stat-val">{r.revenue}</span>
                <span className="rest-stat-label">Revenue</span>
              </div>
              <span className="rest-growth">{r.growth}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TopRestaurants;
