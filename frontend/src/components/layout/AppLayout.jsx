import { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cartAPI } from '../../services/api';

const DASHBOARD_ALLOWED_EMAILS = ['yashchau.work@gmail.com'];
const APP_LOGO_SRC = '/images/yumzo-logo.svg';
const THEME_STORAGE_KEY = 'yumzo-theme';

const canonicalizeEmail = (email) => {
  const normalized = String(email || '').trim().toLowerCase();
  const [localPart, domain] = normalized.split('@');
  if (!localPart || !domain) return normalized;

  if (domain === 'gmail.com') {
    const baseLocal = localPart.split('+')[0].replace(/\./g, '');
    return `${baseLocal}@${domain}`;
  }

  return normalized;
};

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
    label: 'Group Order',
    to: '/group-order',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: 'Dashboard',
    to: '/dashboard',
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
  const location = useLocation();
  const { user, logout } = useAuth();
  const roleLabel = user?.role === 'driver' || user?.role === 'delivery_agent' ? 'Driver' : 'Customer';
  const normalizedEmail = canonicalizeEmail(user?.email || '');
  const canAccessDashboard = DASHBOARD_ALLOWED_EMAILS.map(canonicalizeEmail).includes(normalizedEmail);
  const visibleNavItems = navItems.filter((item) => item.label !== 'Dashboard' || canAccessDashboard);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme === 'light' ? 'light' : 'dark';
  });
  const [scrolled, setScrolled] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const isDarkTheme = theme === 'dark';

  const loadCartItemCount = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return 0;
    }

    try {
      const { data } = await cartAPI.getCart();
      const items = data?.data?.items || [];
      const totalItems = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
      return totalItems;
    } catch {
      return 0;
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let isDisposed = false;

    const syncCartCount = async () => {
      const totalItems = await loadCartItemCount();
      if (!isDisposed) {
        setCartItemCount(totalItems);
      }
    };

    void syncCartCount();

    return () => {
      isDisposed = true;
    };
  }, [location.pathname, loadCartItemCount]);

  useEffect(() => {
    const refreshCartCount = async () => {
      const totalItems = await loadCartItemCount();
      setCartItemCount(totalItems);
    };

    window.addEventListener('cart:updated', refreshCartCount);
    return () => window.removeEventListener('cart:updated', refreshCartCount);
  }, [loadCartItemCount]);

  return (
    <div className="theme-shell min-h-screen pb-20 md:pb-0" style={{ background: 'var(--bg-page)', color: 'var(--text-main)' }}>
      <header
        className={`theme-header sticky top-0 z-30 transition-colors ${
          scrolled
            ? isDarkTheme
              ? 'border-b border-[#2A2A2A] bg-[#0B0B0B]'
              : 'border-b border-[#E5E7EB] bg-[#FFFFFF]'
            : isDarkTheme
              ? 'bg-[#0B0B0B]'
              : 'bg-[#FFFFFF]'
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-3 md:px-8 md:py-3">

          <Link to="/" className="flex items-center gap-2.5">
            <img
              src={APP_LOGO_SRC}
              alt="Yumzo"
              className="h-11 w-auto md:h-12"
              loading="eager"
            />
          </Link>

          <nav
            className={`theme-nav hidden items-center gap-1 rounded-2xl border p-1 md:flex ${
              isDarkTheme ? 'border-[#2A2A2A] bg-[#1A1A1A]' : 'border-[#E5E7EB] bg-[#F8FAFC]'
            }`}
          >
            {visibleNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-3 py-2 text-[12px] font-medium transition-colors ${
                    isActive
                      ? isDarkTheme
                        ? 'bg-[#3A3A3A] text-white'
                        : 'bg-[#E5E7EB] text-[#111827]'
                      : isDarkTheme
                        ? 'text-[#A1A1AA] hover:bg-[#0B0B0B] hover:text-white'
                        : 'text-[#4B5563] hover:bg-[#EEF2F7] hover:text-[#111827]'
                  }`
                }
              >
                <span className="opacity-80">{item.icon}</span>
                <span className="relative inline-flex items-center">
                  {item.label}
                  {item.label === 'Cart' && cartItemCount > 0 ? (
                    <span className="ml-1 inline-flex min-w-4 items-center justify-center rounded-full bg-[#D4D4D8] px-1.5 py-0.5 text-[10px] font-bold text-[#0B0B0B]">
                      {cartItemCount}
                    </span>
                  ) : null}
                </span>
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`hidden items-center gap-2 rounded-xl border px-3 py-2 text-[12px] font-medium transition-colors md:flex ${
                isDarkTheme
                  ? 'border-[#2A2A2A] bg-[#1A1A1A] text-white hover:border-[#3A3A3A]'
                  : 'border-[#E5E7EB] bg-[#F8FAFC] text-[#111827] hover:border-[#CBD5E1]'
              }`}
              aria-label="Toggle theme"
              title={isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkTheme ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
              {isDarkTheme ? 'Light' : 'Dark'}
            </button>

            <div
              className={`hidden items-center gap-2.5 rounded-2xl border px-3 py-1.5 md:flex ${
                isDarkTheme
                  ? 'border-[#2A2A2A] bg-[#1A1A1A]'
                  : 'border-[#E5E7EB] bg-[#F8FAFC]'
              }`}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2A2A2A] text-[11px] font-semibold text-white">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex flex-col">
                <span className={`text-[12px] font-medium leading-tight ${isDarkTheme ? 'text-white' : 'text-[#111827]'}`}>
                  {user?.name || 'User'}
                </span>
                <span className={`text-[10px] font-medium leading-tight ${isDarkTheme ? 'text-[#A1A1AA]' : 'text-[#6B7280]'}`}>
                  {roleLabel}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              className={`rounded-xl border px-4 py-2 text-[12px] font-medium transition-colors ${
                isDarkTheme
                  ? 'border-[#2A2A2A] bg-[#1A1A1A] text-white hover:border-[#3A3A3A] hover:text-[#D4D4D8]'
                  : 'border-[#E5E7EB] bg-[#F8FAFC] text-[#111827] hover:border-[#CBD5E1]'
              }`}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-5 py-6 md:px-8 md:py-8">{children}</main>

      <nav
        className={`theme-mobile-nav fixed bottom-0 left-0 right-0 z-30 border-t p-2 md:hidden ${
          isDarkTheme ? 'border-[#2A2A2A] bg-[#0B0B0B]' : 'border-[#E5E7EB] bg-[#FFFFFF]'
        }`}
      >
        <div
          className="mx-auto grid max-w-lg gap-1"
          style={{ gridTemplateColumns: `repeat(${Math.max(visibleNavItems.length, 1)}, minmax(0, 1fr))` }}
        >
          {visibleNavItems.map((item) => (
            <NavLink
              key={`mobile-${item.to}`}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-center transition-colors ${
                  isActive
                    ? isDarkTheme
                      ? 'bg-[#3A3A3A] text-white'
                      : 'bg-[#E5E7EB] text-[#111827]'
                    : isDarkTheme
                      ? 'text-[#A1A1AA] hover:bg-[#1A1A1A] hover:text-white'
                      : 'text-[#4B5563] hover:bg-[#EEF2F7] hover:text-[#111827]'
                }`
              }
            >
              {item.icon}
              <span className="text-[10px] font-semibold">
                {item.label}
                {item.label === 'Cart' && cartItemCount > 0 ? ` (${cartItemCount})` : ''}
              </span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
