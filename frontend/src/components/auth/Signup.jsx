import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { gsap } from 'gsap';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

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
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    gsap.fromTo(
      containerRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out' },
    );
  }, []);

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
      navigate('/', { replace: true });
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="absolute -right-28 -top-20 h-80 w-80 rounded-full bg-orange-200/70 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-amber-200/70 blur-3xl" />
      <div ref={containerRef} className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black tracking-tight text-orange-600">Yumzo</h1>
          <p className="mt-2 text-slate-500">Create your account and start ordering in seconds.</p>
        </div>

        <div className="glass-card rounded-3xl p-8 shadow-2xl shadow-slate-300/40">
          <h2 className="mb-2 text-2xl font-semibold text-slate-900">
            Create an account
          </h2>
          <p className="mb-6 text-sm text-slate-500">Use your details below to set up your Yumzo profile.</p>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="role" className="mb-1 block text-sm font-medium text-slate-700">
                Account role
              </label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none ring-orange-300 transition focus:ring-2"
              >
                <option value="customer">Customer</option>
                <option value="driver">Driver</option>
              </select>
            </div>

            {fields.map(({ id, label, type, placeholder, autoComplete }) => (
              <div key={id}>
                <label
                  htmlFor={id}
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  {label}
                </label>
                <input
                  id={id}
                  name={id}
                  type={type}
                  autoComplete={autoComplete}
                  value={form[id]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className={`w-full rounded-xl border px-4 py-3 text-slate-800 outline-none ring-orange-300 transition focus:ring-2 ${
                    errors[id] ? 'border-red-400' : 'border-slate-300'
                  }`}
                />
                {errors[id] && (
                  <p className="mt-1 text-sm text-red-500">{errors[id]}</p>
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-orange-500 disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-orange-600 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
