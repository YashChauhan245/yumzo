import { useState } from 'react';

const ordersData = [
  {
    id: 'ORD-1284',
    customer: 'Priya Sharma',
    avatar: 'PS',
    restaurant: 'Spice Garden',
    items: 'Butter Chicken, Naan x2',
    amount: '₹780',
    status: 'delivered',
    time: '12 min ago',
  },
  {
    id: 'ORD-1283',
    customer: 'Rahul Verma',
    avatar: 'RV',
    restaurant: 'Pizza Palace',
    items: 'Margherita Pizza, Garlic Bread',
    amount: '₹520',
    status: 'on_the_way',
    time: '18 min ago',
  },
  {
    id: 'ORD-1282',
    customer: 'Anita Desai',
    avatar: 'AD',
    restaurant: 'Wok Express',
    items: 'Fried Rice, Manchurian',
    amount: '₹450',
    status: 'preparing',
    time: '25 min ago',
  },
  {
    id: 'ORD-1281',
    customer: 'Karan Singh',
    avatar: 'KS',
    restaurant: 'Burger Hub',
    items: 'Double Cheese Burger x2, Fries',
    amount: '₹640',
    status: 'delivered',
    time: '42 min ago',
  },
  {
    id: 'ORD-1280',
    customer: 'Sneha Patel',
    avatar: 'SP',
    restaurant: 'Green Bowl',
    items: 'Caesar Salad, Smoothie',
    amount: '₹380',
    status: 'cancelled',
    time: '1 hr ago',
  },
  {
    id: 'ORD-1279',
    customer: 'Arjun Mehta',
    avatar: 'AM',
    restaurant: 'Tandoori Nights',
    items: 'Paneer Tikka, Dal Makhani',
    amount: '₹690',
    status: 'preparing',
    time: '1 hr ago',
  },
  {
    id: 'ORD-1278',
    customer: 'Deepika Nair',
    avatar: 'DN',
    restaurant: 'Sushi World',
    items: 'Salmon Roll x3, Miso Soup',
    amount: '₹1,250',
    status: 'on_the_way',
    time: '1.5 hr ago',
  },
];

const statusConfig = {
  delivered: { label: 'Delivered', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.12)' },
  preparing: { label: 'Preparing', color: '#4A4A4A', bg: 'rgba(74, 74, 74, 0.2)' },
  on_the_way: { label: 'On the Way', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' },
};

const RecentOrders = () => {
  const [filter, setFilter] = useState('all');

  const filteredOrders = filter === 'all'
    ? ordersData
    : ordersData.filter(o => o.status === filter);

  return (
    <div className="orders-card">
      <div className="orders-header">
        <div>
          <h3 className="chart-title">Recent Orders</h3>
          <p className="chart-subtitle">{ordersData.length} orders today</p>
        </div>
        <div className="orders-filters">
          {['all', 'delivered', 'preparing', 'on_the_way', 'cancelled'].map(f => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : statusConfig[f]?.label}
            </button>
          ))}
        </div>
      </div>

      <div className="orders-table-wrap">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Restaurant</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => {
              const status = statusConfig[order.status];
              return (
                <tr key={order.id} className="order-row">
                  <td>
                    <span className="order-id">{order.id}</span>
                  </td>
                  <td>
                    <div className="customer-cell">
                      <div className="customer-avatar" style={{ background: `linear-gradient(135deg, ${status.color}40, ${status.color}20)`, color: status.color }}>
                        {order.avatar}
                      </div>
                      <span className="customer-name">{order.customer}</span>
                    </div>
                  </td>
                  <td><span className="restaurant-name">{order.restaurant}</span></td>
                  <td><span className="order-items">{order.items}</span></td>
                  <td><span className="order-amount">{order.amount}</span></td>
                  <td>
                    <span
                      className="status-badge"
                      style={{
                        color: status.color,
                        background: status.bg,
                      }}
                    >
                      {order.status === 'on_the_way' && <span className="status-pulse" style={{ background: status.color }}></span>}
                      {status.label}
                    </span>
                  </td>
                  <td><span className="order-time">{order.time}</span></td>
                  <td>
                    <button className="action-btn" title="View details">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="19" cy="12" r="1" />
                        <circle cx="5" cy="12" r="1" />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="orders-footer">
        <span className="orders-showing">Showing {filteredOrders.length} of {ordersData.length} orders</span>
        <div className="pagination">
          <button className="page-btn" disabled>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button className="page-btn active">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">3</button>
          <button className="page-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentOrders;
