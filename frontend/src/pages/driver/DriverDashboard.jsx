import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const cards = [
  {
    title: 'Available Orders',
    description: 'See confirmed orders that are ready to accept.',
    to: '/driver/orders/available',
    cta: 'View Available',
  },
  {
    title: 'Assigned Orders',
    description: 'Track your accepted deliveries and update status.',
    to: '/driver/orders/assigned',
    cta: 'View Assigned',
  },
];

export default function DriverDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#0B0B0B] px-4 py-6 md:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex items-center justify-between rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] px-5 py-4">
          <div>
            <h1 className="text-xl font-semibold text-white">Driver Panel</h1>
            <p className="text-sm text-[#A1A1AA]">Welcome, {user?.name || 'Driver'}</p>
          </div>
          <button
            onClick={logout}
            className="rounded-xl border border-[#2A2A2A] bg-[#0B0B0B] px-4 py-2 text-sm text-white transition-colors hover:border-[#3A3A3A] hover:text-[#D4D4D8]"
          >
            Logout
          </button>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {cards.map((card) => (
            <article key={card.title} className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-5">
              <h2 className="text-lg font-semibold text-white">{card.title}</h2>
              <p className="mt-2 text-sm text-[#A1A1AA]">{card.description}</p>
              <Link
                to={card.to}
                className="mt-4 inline-block rounded-xl bg-[#3A3A3A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2F2F2F]"
              >
                {card.cta}
              </Link>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
