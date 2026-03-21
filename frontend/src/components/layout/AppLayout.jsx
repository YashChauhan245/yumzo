import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  {
    label: 'Home',
    to: '/',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: 'Reels',
    to: '/reels',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M2 12h20" />
        <path d="M12 2v10" />
        <path d="M7 2l5 5 5-5" />
      </svg>
    ),
  },
  {
    label: 'Cart',
    to: '/cart',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
  },
  {
    label: 'Orders',
    to: '/orders',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        <path d="M9 14l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: 'Dashboard',
    to: '/dashboard-preview',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
];

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const roleLabel = user?.role === 'delivery_agent' ? 'Driver' : 'Customer';
  const [theme, setTheme] = useState(localStorage.getItem('yumzo-theme') || 'light');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('yumzo-theme', theme);
  }, [theme]);

  useEffect(() => {
    const syncTheme = () => {
      const savedTheme = localStorage.getItem('yumzo-theme') || 'light';
      setTheme(savedTheme);
    };
    window.addEventListener('yumzo-theme-change', syncTheme);
    return () => window.removeEventListener('yumzo-theme-change', syncTheme);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    window.dispatchEvent(new Event('yumzo-theme-change'));
  };

  return (
    <div className="theme-shell min-h-screen pb-20 md:pb-0" style={{ background: 'var(--bg-page)', color: 'var(--text-main)' }}>
      {/* Premium Navbar */}
      <header className={`theme-header sticky top-0 z-30 backdrop-blur-xl transition-all duration-300 ${scrolled ? 'border-b border-slate-200/70 bg-white/90 shadow-sm shadow-slate-200/50' : 'bg-white/60'}`}>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-3 md:px-8 md:py-3.5">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/25 transition-transform group-hover:scale-105">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="white" fillOpacity="0.9"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="9" cy="10" r="1.2" fill="#f97316"/>
                <circle cx="15" cy="10" r="1.2" fill="#f97316"/>
              </svg>
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent md:text-2xl">
              Yumzo
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="theme-nav hidden items-center gap-1 rounded-2xl border border-slate-200/80 bg-white/80 p-1.5 shadow-sm md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`
                }
              >
                <span className="opacity-80">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-500 transition-all hover:border-orange-300 hover:bg-orange-50 hover:text-orange-500"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
              )}
            </button>

            {/* User info */}
            <div className="hidden items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-1.5 md:flex">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-[11px] font-bold text-white">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-semibold leading-tight text-slate-800">
                  {user?.name || 'User'}
                </span>
                <span className="text-[10px] font-medium leading-tight text-slate-400">
                  {roleLabel}
                </span>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-2 text-[13px] font-semibold text-white shadow-md shadow-slate-900/25 transition-all hover:from-orange-500 hover:to-amber-500 hover:shadow-orange-500/25"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl px-5 py-6 md:px-8 md:py-9">{children}</main>

      {/* Mobile Bottom Nav */}
      <nav className="theme-mobile-nav fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200/80 bg-white/95 p-2 backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
          {navItems.map((item) => (
            <NavLink
              key={`mobile-${item.to}`}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-center transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {item.icon}
              <span className="text-[10px] font-semibold">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
