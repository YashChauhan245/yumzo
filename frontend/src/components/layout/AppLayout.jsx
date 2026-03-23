import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DASHBOARD_ALLOWED_EMAILS = ['yashchau.work@gmail.com'];

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
  const { user, logout } = useAuth();
  const roleLabel = user?.role === 'driver' || user?.role === 'delivery_agent' ? 'Driver' : 'Customer';
  const normalizedEmail = canonicalizeEmail(user?.email || '');
  const canAccessDashboard = DASHBOARD_ALLOWED_EMAILS.map(canonicalizeEmail).includes(normalizedEmail);
  const visibleNavItems = navItems.filter((item) => item.label !== 'Dashboard' || canAccessDashboard);
  const [theme] = useState('dark');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('yumzo-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="theme-shell min-h-screen pb-20 md:pb-0" style={{ background: 'var(--bg-page)', color: 'var(--text-main)' }}>
      <header className={`theme-header sticky top-0 z-30 transition-colors ${scrolled ? 'border-b border-[#2A2A2A] bg-[#0B0B0B]' : 'bg-[#0B0B0B]'}`}>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-3 md:px-8 md:py-3">

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] text-[#D4D4D8] transition-colors group-hover:border-[#3A3A3A]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="currentColor" fillOpacity="0.16"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="9" cy="10" r="1.2" fill="currentColor"/>
                <circle cx="15" cy="10" r="1.2" fill="currentColor"/>
              </svg>
            </div>
            <span className="text-lg font-semibold tracking-tight text-white md:text-xl">
              Yumzo
            </span>
          </Link>

          <nav className="theme-nav hidden items-center gap-1 rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-1 md:flex">
            {visibleNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-3 py-2 text-[12px] font-medium transition-colors ${
                    isActive
                      ? 'bg-[#3A3A3A] text-white'
                      : 'text-[#A1A1AA] hover:bg-[#0B0B0B] hover:text-white'
                  }`
                }
              >
                <span className="opacity-80">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2.5 rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-1.5 md:flex">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2A2A2A] text-[11px] font-semibold text-white">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-medium leading-tight text-white">
                  {user?.name || 'User'}
                </span>
                <span className="text-[10px] font-medium leading-tight text-[#A1A1AA]">
                  {roleLabel}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              className="rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-2 text-[12px] font-medium text-white transition-colors hover:border-[#3A3A3A] hover:text-[#D4D4D8]"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-5 py-6 md:px-8 md:py-8">{children}</main>

      <nav className="theme-mobile-nav fixed bottom-0 left-0 right-0 z-30 border-t border-[#2A2A2A] bg-[#0B0B0B] p-2 md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
          {visibleNavItems.map((item) => (
            <NavLink
              key={`mobile-${item.to}`}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-center transition-colors ${
                  isActive
                    ? 'bg-[#3A3A3A] text-white'
                    : 'text-[#A1A1AA] hover:bg-[#1A1A1A] hover:text-white'
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
