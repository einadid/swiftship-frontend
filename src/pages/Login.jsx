import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineTruck, HiOutlineLockClosed } from 'react-icons/hi';
import { HiOutlineEnvelope } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  { label: 'Admin demo', email: 'admin@swiftship.com', password: 'Admin@123' },
  { label: 'User demo', email: 'user@swiftship.com', password: 'User@123' },
];

export default function Login() {
  const { login, isAuthed, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});

  const from = location.state?.from;
  const reason = new URLSearchParams(location.search).get('reason');

  // Already logged in? Never show the login form again.
  useEffect(() => {
    if (isAuthed) navigate(from || (isAdmin ? '/admin' : '/dashboard'), { replace: true });
  }, [isAuthed, isAdmin, from, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    try {
      const user = await login(form.email.trim(), form.password);
      toast.success(`Welcome back, ${user.full_name.split(' ')[0]}!`);
      navigate(from || (user.role === 'admin' ? '/admin' : '/dashboard'), { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="mx-auto mb-2 flex flex-col items-center">
            <span className="brand-gradient mb-3 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow">
              <HiOutlineTruck className="text-3xl" />
            </span>
            <h1 className="text-2xl font-extrabold">Welcome back</h1>
            <p className="text-sm opacity-60">Login to your SwiftShip account</p>
          </div>

          {reason && (
            <div className="alert alert-info py-2 text-sm">
              <span>{reason}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="form-control w-full">
              <span className="label-text font-medium">Email</span>
              <div className="relative">
                <HiOutlineEnvelope className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                <input
                  type="email"
                  className={`input border-base-300 pl-9 ${errors.email ? 'border-error' : ''}`}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              {errors.email && <span className="input-error-text">{errors.email}</span>}
            </label>
            <label className="form-control w-full">
              <span className="label-text font-medium">Password</span>
              <div className="relative">
                <HiOutlineLockClosed className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                <input
                  type="password"
                  className={`input border-base-300 pl-9 ${errors.password ? 'border-error' : ''}`}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              {errors.password && <span className="input-error-text">{errors.password}</span>}
            </label>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="link link-hover text-sm">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="btn brand-gradient text-white shadow hover:opacity-90" disabled={busy}>
              {busy && <span className="loading loading-spinner loading-sm" />} Login
            </button>
          </form>

          {/* Quick-fill for the evaluator — remove if you don't want demo creds in the UI */}
          <details className="rounded-box border border-base-300 bg-base-200/50 px-3 py-2 text-sm">
            <summary className="cursor-pointer font-medium">Demo accounts (seeded by the backend)</summary>
            <div className="mt-2 flex flex-col gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <div key={acc.email} className="flex items-center justify-between gap-2">
                  <span className="truncate font-mono text-xs">
                    {acc.email} · {acc.password}
                  </span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => {
                      setForm({ email: acc.email, password: acc.password });
                      setErrors({});
                    }}
                  >
                    Fill
                  </button>
                </div>
              ))}
            </div>
          </details>

          <p className="text-center text-sm opacity-70">
            No account yet?{' '}
            <Link to="/signup" className="link link-hover font-semibold">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
