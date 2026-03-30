import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import '../../styles/auth.css';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const APP_LOGO_SRC = '/images/yumzo-logo.svg';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'customer',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    else if (form.name.trim().length < 2)
      errs.name = 'Name must be at least 2 characters';

    if (!form.email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Enter a valid email';

    if (!form.password) errs.password = 'Password is required';
    else if (!PASSWORD_REGEX.test(form.password))
      errs.password =
        'Password must be 8+ characters with uppercase, lowercase, and a number';

    if (!form.confirmPassword)
      errs.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match';

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
      await signup({
        name: form.name.trim(),
        email: form.email,
        role: form.role,
        password: form.password,
        phone: form.phone || undefined,
      });
      toast.success('Account created! Welcome to Yumzo 🎉');
      navigate('/home', { replace: true });
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) {
        const fieldErrors = {};
        serverErrors.forEach(({ path, msg }) => {
          if (path) fieldErrors[path] = msg;
        });
        setErrors(fieldErrors);
      } else {
        const msg =
          err.response?.data?.message || 'Signup failed. Please try again.';
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { id: 'name', label: 'Full name', type: 'text', placeholder: 'Jane Doe', autoComplete: 'name' },
    { id: 'email', label: 'Email address', type: 'email', placeholder: 'you@example.com', autoComplete: 'email' },
    { id: 'phone', label: 'Phone number (optional)', type: 'tel', placeholder: '+91 98765 43210', autoComplete: 'tel' },
    { id: 'password', label: 'Password', type: 'password', placeholder: '••••••••', autoComplete: 'new-password' },
    { id: 'confirmPassword', label: 'Confirm password', type: 'password', placeholder: '••••••••', autoComplete: 'new-password' },
  ];

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <aside className="auth-aside" aria-hidden="true">
          <img src={APP_LOGO_SRC} alt="Yumzo" className="auth-logo" loading="eager" />
          <span className="auth-kicker">Create account</span>
          <h1 className="auth-aside-title">Set up your Yumzo profile in under a minute.</h1>
          <p className="auth-aside-copy">
            Join as customer or driver and get a polished flow for ordering, delivery tracking, and payments.
          </p>
          <div className="auth-points">
            <div className="auth-point"><span className="auth-point-dot" /> One account, multiple order journeys</div>
            <div className="auth-point"><span className="auth-point-dot" /> Smart delivery and status visibility</div>
            <div className="auth-point"><span className="auth-point-dot" /> Secure onboarding with quick validation</div>
          </div>
        </aside>

        <section className="auth-card">
          <div className="auth-card-head">
            <img src={APP_LOGO_SRC} alt="Yumzo" className="auth-logo" loading="eager" />
            <h2 className="auth-card-title">Create an account</h2>
            <p className="auth-card-copy">Use your details below to set up your Yumzo profile.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="auth-field">
              <label htmlFor="role" className="auth-label">Account role</label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="auth-select"
              >
                <option value="customer">Customer</option>
                <option value="driver">Driver</option>
              </select>
            </div>

            {fields.map(({ id, label, type, placeholder, autoComplete }) => (
              <div key={id} className="auth-field">
                <label htmlFor={id} className="auth-label">{label}</label>
                <input
                  id={id}
                  name={id}
                  type={type}
                  autoComplete={autoComplete}
                  value={form[id]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className={`auth-input ${errors[id] ? 'error' : ''}`}
                />
                {errors[id] && <p className="auth-error">{errors[id]}</p>}
              </div>
            ))}

            <button type="submit" disabled={loading} className="auth-submit">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <div className="auth-links">
            <p className="auth-link-copy">
              Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Signup;
