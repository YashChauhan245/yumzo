import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const loggedInUser = await login({ email: form.email, password: form.password });
      toast.success('Welcome back! 🎉');
      const fallbackPath = loggedInUser?.role === 'driver' ? '/driver/dashboard' : '/';
      const nextPath = from === '/login' ? fallbackPath : from;
      navigate(nextPath || fallbackPath, { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0B0B] p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-left">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Yumzo</h1>
          <p className="mt-2 text-sm text-[#A1A1AA]">Sign in to continue.</p>
        </div>

        <div className="surface-card rounded-2xl p-6">
          <h2 className="mb-1 text-xl font-semibold text-white">
            Welcome back
          </h2>
          <p className="mb-6 text-sm text-[#A1A1AA]">Sign in to continue ordering from your favorite places.</p>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-white"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full rounded-xl border bg-[#0B0B0B] px-4 py-3 text-sm text-white outline-none transition focus:border-[#3A3A3A] ${
                  errors.email ? 'border-red-400' : 'border-[#2A2A2A]'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-white"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full rounded-xl border bg-[#0B0B0B] px-4 py-3 text-sm text-white outline-none transition focus:border-[#3A3A3A] ${
                  errors.password ? 'border-red-400' : 'border-[#2A2A2A]'
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#3A3A3A] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2F2F2F] disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-sm text-[#A1A1AA]">
            Don&apos;t have an account?{' '}
            <Link
              to="/signup"
              className="font-medium text-[#D4D4D8] hover:underline"
            >
              Sign up
            </Link>
          </p>

          <p className="mt-2 text-sm text-[#A1A1AA]">
            Driver account?{' '}
            <Link to="/driver/login" className="font-medium text-[#D4D4D8] hover:underline">
              Driver login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
