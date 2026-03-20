import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Cart', to: '/cart' },
  { label: 'Orders', to: '/orders' },
];

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const roleLabel = user?.role === 'delivery_agent' ? 'Driver' : 'Customer';
  const [theme, setTheme] = useState(localStorage.getItem('yumzo-theme') || 'light');

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

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    window.dispatchEvent(new Event('yumzo-theme-change'));
  };

  return (
    <div className="theme-shell min-h-screen bg-slate-50 pb-20 text-slate-900 md:pb-0">
      <header className="theme-header sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
          <Link to="/" className="text-2xl font-black tracking-tight text-orange-500 md:text-3xl">
            Yumzo
          </Link>

          <nav className="theme-nav hidden items-center gap-1 rounded-xl border border-slate-200/80 bg-white p-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              {theme === 'light' ? 'Dark' : 'Light'}
            </button>
            <span className="hidden text-sm text-slate-500 sm:block md:text-[13px]">
              Hi, <span className="font-semibold text-slate-700">{user?.name || 'User'}</span>
            </span>
            <span className="hidden rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 md:block">
              {roleLabel}
            </span>
            <button
              onClick={logout}
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-9">{children}</main>

      <nav className="theme-mobile-nav fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200/80 bg-white/95 p-2 backdrop-blur-md md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-3 gap-2">
          {navItems.map((item) => (
            <NavLink
              key={`mobile-${item.to}`}
              to={item.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-center text-sm font-semibold transition ${
                  isActive
                    ? 'bg-orange-500 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
