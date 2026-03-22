import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function DriverLogin() {
  const navigate = useNavigate();
  const { driverLogin } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error('Email and password are required');
      return;
    }

    setLoading(true);
    try {
      await driverLogin(form);
      toast.success('Driver login successful');
      navigate('/driver/dashboard', { replace: true });
    } catch (error) {
      const message = error?.response?.data?.message || 'Driver login failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0B0B] p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6">
        <h1 className="text-2xl font-semibold text-white">Driver Login</h1>
        <p className="mt-1 text-sm text-[#A1A1AA]">Sign in to manage deliveries.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-white">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              className="w-full rounded-xl border border-[#2A2A2A] bg-[#0B0B0B] px-3 py-2 text-sm text-white outline-none focus:border-[#3A3A3A]"
              placeholder="driver@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-white">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              className="w-full rounded-xl border border-[#2A2A2A] bg-[#0B0B0B] px-3 py-2 text-sm text-white outline-none focus:border-[#3A3A3A]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#3A3A3A] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2F2F2F] disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign in as Driver'}
          </button>
        </form>

        <p className="mt-4 text-sm text-[#A1A1AA]">
          Customer account?{' '}
          <Link to="/login" className="text-[#D4D4D8] hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
