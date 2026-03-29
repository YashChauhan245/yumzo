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
const APP_LOGO_SRC = '/images/yumzo-logo.svg';

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
    <div className={`min-h-screen ${isDarkTheme ? 'bg-[radial-gradient(circle_at_8%_8%,rgba(236,109,49,0.16),transparent_32%),radial-gradient(circle_at_92%_14%,rgba(245,184,112,0.1),transparent_32%),linear-gradient(180deg,#0B0B0B_0%,#0E0E0E_50%,#0B0B0B_100%)] text-white' : 'bg-[radial-gradient(circle_at_8%_8%,rgba(236,109,49,0.08),transparent_30%),linear-gradient(180deg,#F8FAFC_0%,#F3F4F6_100%)] text-[#111827]'}`}>
      <header className={`border-b ${isDarkTheme ? 'border-[#2A2A2A] bg-[#0B0B0B]/90' : 'border-[#E5E7EB] bg-[#FFFFFF]/92'} backdrop-blur`}>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <Link to="/admin/dashboard" className="flex items-center gap-3 text-xl font-semibold tracking-tight">
            <img src={APP_LOGO_SRC} alt="Yumzo" className="h-9 w-auto" loading="eager" />
            <span className={`${isDarkTheme ? 'text-white' : 'text-[#111827]'}`}>Admin Console</span>
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
        <aside className={`h-fit rounded-2xl border p-3 ${isDarkTheme ? 'border-[#2A2A2A] bg-[#151515] shadow-[0_18px_34px_rgba(0,0,0,0.3)]' : 'border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_12px_24px_rgba(15,23,42,0.08)]'}`}>
          <div className={`mb-3 rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${isDarkTheme ? 'border-[#2A2A2A] bg-[#101010] text-[#A1A1AA]' : 'border-[#E5E7EB] bg-[#F8FAFC] text-[#64748B]'}`}>
            Admin Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-xl px-3 py-2 text-sm transition-all ${
                    isActive
                      ? isDarkTheme
                        ? 'bg-linear-to-r from-[#EE6A2C]/20 to-[#F68C3E]/18 text-white border border-[#EE6A2C]/35'
                        : 'bg-[#E5E7EB] text-[#111827] border border-[#CBD5E1]'
                      : isDarkTheme
                        ? 'text-[#A1A1AA] hover:bg-[#0B0B0B] hover:text-white hover:border hover:border-[#2F2F2F]'
                        : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#111827] hover:border hover:border-[#E2E8F0]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main>
          <section className={`mb-4 rounded-2xl border p-5 ${isDarkTheme ? 'border-[#2A2A2A] bg-linear-to-r from-[#1A1A1A] to-[#161616] shadow-[0_16px_30px_rgba(0,0,0,0.28)]' : 'border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_12px_22px_rgba(15,23,42,0.08)]'}`}>
            <h1 className="text-2xl font-semibold">{title}</h1>
            {subtitle ? <p className={`mt-1 text-sm ${isDarkTheme ? 'text-[#A1A1AA]' : 'text-[#64748B]'}`}>{subtitle}</p> : null}
          </section>
          {children}
        </main>
      </div>
    </div>
  );
}
