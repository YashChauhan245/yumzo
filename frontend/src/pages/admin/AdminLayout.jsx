import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { label: 'Dashboard', to: '/admin/dashboard' },
  { label: 'Restaurants', to: '/admin/restaurants' },
  { label: 'Menu', to: '/admin/menu' },
  { label: 'Orders', to: '/admin/orders' },
];

export default function AdminLayout({ children, title, subtitle }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      <header className="border-b border-[#2A2A2A] bg-[#0B0B0B]">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <Link to="/admin/dashboard" className="text-xl font-semibold tracking-tight">
            Yumzo Admin
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-1.5 text-xs text-[#A1A1AA] md:inline-block">
              {user?.name || 'Admin'}
            </span>
            <button
              onClick={logout}
              className="rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm text-white hover:border-[#3A3A3A]"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr] md:px-8">
        <aside className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-3 h-fit">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-xl px-3 py-2 text-sm transition-colors ${
                    isActive ? 'bg-[#3A3A3A] text-white' : 'text-[#A1A1AA] hover:bg-[#0B0B0B] hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main>
          <section className="mb-4 rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-5">
            <h1 className="text-2xl font-semibold">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-[#A1A1AA]">{subtitle}</p> : null}
          </section>
          {children}
        </main>
      </div>
    </div>
  );
}
