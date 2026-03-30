import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import '../../styles/auth.css';

const APP_LOGO_SRC = '/images/yumzo-logo.svg';

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
    <div className="auth-page">
      <div className="auth-shell">
        <aside className="auth-aside" aria-hidden="true">
          <img src={APP_LOGO_SRC} alt="Yumzo" className="auth-logo" loading="eager" />
          <span className="auth-kicker">Driver portal</span>
          <h1 className="auth-aside-title">Own every delivery with confidence.</h1>
          <p className="auth-aside-copy">
            Sign in to accept nearby orders, update live status, and keep every drop smooth for customers.
          </p>
          <div className="auth-points">
            <div className="auth-point"><span className="auth-point-dot" /> Instant order assignment updates</div>
            <div className="auth-point"><span className="auth-point-dot" /> Real-time location and status flow</div>
            <div className="auth-point"><span className="auth-point-dot" /> Fast dashboard access for active runs</div>
          </div>
        </aside>

        <section className="auth-card">
          <div className="auth-card-head">
            <img src={APP_LOGO_SRC} alt="Yumzo" className="auth-logo" loading="eager" />
            <h1 className="auth-card-title">Driver Login</h1>
            <p className="auth-card-copy">Sign in to manage deliveries.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="auth-field">
              <label htmlFor="email" className="auth-label">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                className="auth-input"
                placeholder="driver@example.com"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password" className="auth-label">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={onChange}
                className="auth-input"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-submit"
            >
              {loading ? 'Signing in...' : 'Sign in as Driver'}
            </button>
          </form>

          <div className="auth-links">
            <p className="auth-link-copy">
              Customer account? <Link to="/login" className="auth-link">Login here</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
