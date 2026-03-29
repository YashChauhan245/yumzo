import { useState } from 'react';

const getIstHour = () => {
  const hourString = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    hour12: false,
  }).format(new Date());

  return Number(hourString);
};

const getIstTimeLabel = () => (
  new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date())
);

const DashboardHeader = ({ user, theme, onToggleTheme }) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const currentIstHour = getIstHour();
  const currentIstTime = getIstTimeLabel();

  const notifications = [
    { id: 1, text: 'New order #1284 from Mumbai Central', time: '2 min ago', type: 'order' },
    { id: 2, text: 'Restaurant "Spice Garden" went offline', time: '15 min ago', type: 'alert' },
    { id: 3, text: 'Revenue milestone: ₹50K today!', time: '1 hr ago', type: 'success' },
    { id: 4, text: 'Delivery partner Ravi rated 5 stars', time: '2 hrs ago', type: 'info' },
  ];

  return (
    <header className="dash-header">
      <div className="header-left">
        <div className="header-greeting">
          <h1 className="greeting-title">
            Good {currentIstHour < 12 ? 'Morning' : currentIstHour < 17 ? 'Afternoon' : 'Evening'}, {user?.name || 'Yash'} 👋
          </h1>
          <p className="greeting-sub">Here's what's happening with Yumzo today. {currentIstTime} IST</p>
        </div>
      </div>

      <div className="header-right">
        {/* Search */}
        <div className={`header-search ${searchFocused ? 'focused' : ''}`}>
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search orders, restaurants..."
            className="search-input"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <kbd className="search-kbd">⌘K</kbd>
        </div>

        {/* Theme Toggle */}
        <button className="header-btn theme-toggle-btn" onClick={onToggleTheme} title="Toggle theme">
          {theme === 'dark' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        {/* Notifications */}
        <div className="notification-wrapper">
          <button
            className="header-btn notification-btn"
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="notification-dot"></span>
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="dropdown-header">
                <h3>Notifications</h3>
                <button className="mark-read">Mark all read</button>
              </div>
              {notifications.map((n) => (
                <div key={n.id} className={`notification-item ${n.type}`}>
                  <div className={`notif-dot ${n.type}`}></div>
                  <div className="notif-content">
                    <p className="notif-text">{n.text}</p>
                    <span className="notif-time">{n.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="profile-wrapper">
          <button
            className="header-profile"
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
          >
            <div className="profile-avatar">
              {user?.name?.charAt(0) || 'Y'}
            </div>
            <div className="profile-info">
              <span className="profile-name">{user?.name || 'Yash Chauhan'}</span>
              <span className="profile-role">{user?.role || 'Admin'}</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showProfile && (
            <div className="profile-dropdown">
              <button className="dropdown-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                My Profile
              </button>
              <button className="dropdown-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4" /></svg>
                Settings
              </button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
