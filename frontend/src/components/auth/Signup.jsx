import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

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
    <div className="flex min-h-screen items-center justify-center bg-[#0B0B0B] p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-left">
          <img src={APP_LOGO_SRC} alt="Yumzo" className="h-10 w-auto" loading="eager" />
          <p className="mt-2 text-sm text-[#A1A1AA]">Create your account.</p>
        </div>

        <div className="surface-card rounded-2xl p-6">
          <h2 className="mb-1 text-xl font-semibold text-white">
            Create an account
          </h2>
          <p className="mb-6 text-sm text-[#A1A1AA]">Use your details below to set up your Yumzo profile.</p>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="role" className="mb-1 block text-sm font-medium text-white">
                Account role
              </label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#2A2A2A] bg-[#0B0B0B] px-4 py-3 text-sm text-white outline-none transition focus:border-[#3A3A3A]"
              >
                <option value="customer">Customer</option>
                <option value="driver">Driver</option>
              </select>
            </div>

            {fields.map(({ id, label, type, placeholder, autoComplete }) => (
              <div key={id}>
                <label
                  htmlFor={id}
                  className="mb-1 block text-sm font-medium text-white"
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
                  className={`w-full rounded-xl border bg-[#0B0B0B] px-4 py-3 text-sm text-white outline-none transition focus:border-[#3A3A3A] ${
                    errors[id] ? 'border-red-400' : 'border-[#2A2A2A]'
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
              className="w-full rounded-xl bg-[#3A3A3A] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2F2F2F] disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-sm text-[#A1A1AA]">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-[#D4D4D8] hover:underline"
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
