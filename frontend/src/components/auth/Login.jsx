import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import '../../styles/auth.css';

const APP_LOGO_SRC = '/images/yumzo-logo.svg';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/home';

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
      const fallbackPath = loggedInUser?.role === 'driver'
        ? '/driver/dashboard'
        : loggedInUser?.role === 'admin'
          ? '/admin/dashboard'
          : '/home';
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
    <div className="auth-page">
      <div className="auth-shell">
        <aside className="auth-aside" aria-hidden="true">
          <img src={APP_LOGO_SRC} alt="Yumzo" className="auth-logo" loading="eager" />
          <span className="auth-kicker">Fast food flow</span>
          <h1 className="auth-aside-title">Your next order should feel effortless.</h1>
          <p className="auth-aside-copy">
            Sign in to continue with live tracking, quick re-orders, and all your saved places in one flow.
          </p>
          <div className="auth-points">
            <div className="auth-point"><span className="auth-point-dot" /> Real-time order updates</div>
            <div className="auth-point"><span className="auth-point-dot" /> Faster checkout for repeat orders</div>
            <div className="auth-point"><span className="auth-point-dot" /> Unified customer and driver access</div>
          </div>
        </aside>

        <section className="auth-card">
          <div className="auth-card-head">
            <img src={APP_LOGO_SRC} alt="Yumzo" className="auth-logo" loading="eager" />
            <h2 className="auth-card-title">Welcome back</h2>
            <p className="auth-card-copy">Sign in to continue ordering from your favorite places.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="auth-field">
              <label htmlFor="email" className="auth-label">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`auth-input ${errors.email ? 'error' : ''}`}
              />
              {errors.email && <p className="auth-error">{errors.email}</p>}
            </div>

            <div className="auth-field">
              <label htmlFor="password" className="auth-label">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`auth-input ${errors.password ? 'error' : ''}`}
              />
              {errors.password && <p className="auth-error">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="auth-submit">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="auth-links">
            <p className="auth-link-copy">
              Don&apos;t have an account? <Link to="/signup" className="auth-link">Sign up</Link>
            </p>
            <p className="auth-link-copy">
              Driver account? <Link to="/driver/login" className="auth-link">Driver login</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
