import { Link, NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { label: 'Dashboard', to: '/admin/dashboard' },
  { label: 'Restaurants', to: '/admin/restaurants' },
  { label: 'Menu', to: '/admin/menu' },
  { label: 'Orders', to: '/admin/orders' },
];

const THEME_STORAGE_KEY = 'yumzo-theme';

export default function AdminLayout({ children, title, subtitle }) {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme === 'light' ? 'light' : 'dark';
  });
  const isDarkTheme = theme === 'dark';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return (
    <div className={`min-h-screen ${isDarkTheme ? 'bg-[#0B0B0B] text-white' : 'bg-[#F8FAFC] text-[#111827]'}`}>
      <header className={`border-b ${isDarkTheme ? 'border-[#2A2A2A] bg-[#0B0B0B]' : 'border-[#E5E7EB] bg-[#FFFFFF]'}`}>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <Link to="/admin/dashboard" className="text-xl font-semibold tracking-tight">
            Yumzo Admin
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'))}
              className={`hidden rounded-xl border px-3 py-1.5 text-xs md:inline-block ${
                isDarkTheme
                  ? 'border-[#2A2A2A] bg-[#1A1A1A] text-white hover:border-[#3A3A3A]'
                  : 'border-[#E5E7EB] bg-[#F8FAFC] text-[#111827] hover:border-[#CBD5E1]'
              }`}
            >
              {isDarkTheme ? 'Light Mode' : 'Dark Mode'}
            </button>

            <span className={`hidden rounded-xl border px-3 py-1.5 text-xs md:inline-block ${isDarkTheme ? 'border-[#2A2A2A] bg-[#1A1A1A] text-[#A1A1AA]' : 'border-[#E5E7EB] bg-[#F8FAFC] text-[#64748B]'}`}>
              {user?.name || 'Admin'}
            </span>
            <button
              onClick={logout}
              className={`rounded-xl border px-3 py-2 text-sm ${
                isDarkTheme
                  ? 'border-[#2A2A2A] bg-[#1A1A1A] text-white hover:border-[#3A3A3A]'
                  : 'border-[#E5E7EB] bg-[#F8FAFC] text-[#111827] hover:border-[#CBD5E1]'
              }`}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr] md:px-8">
        <aside className={`h-fit rounded-2xl border p-3 ${isDarkTheme ? 'border-[#2A2A2A] bg-[#1A1A1A]' : 'border-[#E5E7EB] bg-[#FFFFFF]'}`}>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-xl px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? isDarkTheme
                        ? 'bg-[#3A3A3A] text-white'
                        : 'bg-[#E5E7EB] text-[#111827]'
                      : isDarkTheme
                        ? 'text-[#A1A1AA] hover:bg-[#0B0B0B] hover:text-white'
                        : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#111827]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main>
          <section className={`mb-4 rounded-2xl border p-5 ${isDarkTheme ? 'border-[#2A2A2A] bg-[#1A1A1A]' : 'border-[#E5E7EB] bg-[#FFFFFF]'}`}>
            <h1 className="text-2xl font-semibold">{title}</h1>
            {subtitle ? <p className={`mt-1 text-sm ${isDarkTheme ? 'text-[#A1A1AA]' : 'text-[#64748B]'}`}>{subtitle}</p> : null}
          </section>
          {children}
        </main>
      </div>
    </div>
  );
}
