import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineTruck, HiOutlineLockClosed, HiOutlinePhone, HiOutlineUser } from 'react-icons/hi';
import { HiOutlineEnvelope } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';

const phoneRe = /^(\+?88)?01[3-9]\d{8}$/;

// Reusable field - defined OUTSIDE component to avoid focus loss on re-render
function Field({ icon: Icon, label, error, ...props }) {
  return (
    <label className="form-control w-full">
      <span className="label-text font-medium">{label}</span>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
        <input
          className={`input border-base-300 pl-9 ${error ? 'border-error' : ''}`}
          {...props}
        />
      </div>
      {error && <span className="input-error-text">{error}</span>}
    </label>
  );
}

export default function Signup() {
  const { signup, isAuthed, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});

  // Already logged in? Skip the form.
  useEffect(() => {
    if (isAuthed) navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
  }, [isAuthed, isAdmin, navigate]);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (form.full_name.trim().length < 2) e.full_name = 'Full name is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address';
    if (!phoneRe.test(form.phone.trim())) e.phone = 'Valid BD phone required (01XXXXXXXXX)';
    if (form.password.length < 8) e.password = 'At least 8 characters';
    else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password))
      e.password = 'Must contain letters and numbers';
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the highlighted fields');
      return;
    }
    setBusy(true);
    try {
      const user = await signup({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });
      toast.success(`Account created — welcome, ${user.full_name.split(' ')[0]}!`);
      navigate('/dashboard', { replace: true });
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
            <h1 className="text-2xl font-extrabold">Create your account</h1>
            <p className="text-sm opacity-60">Start shipping in under a minute</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" autoComplete="off">
            <Field
              name="full_name"
              icon={HiOutlineUser}
              label="Full name"
              placeholder="e.g. Rahim Uddin"
              value={form.full_name}
              onChange={(e) => set('full_name', e.target.value)}
              autoComplete="name"
              error={errors.full_name}
            />
            <Field
              name="email"
              icon={HiOutlineEnvelope}
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              autoComplete="email"
              error={errors.email}
            />
            <Field
              name="phone"
              icon={HiOutlinePhone}
              label="Phone"
              type="tel"
              placeholder="01XXXXXXXXX"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              autoComplete="tel"
              inputMode="numeric"
              error={errors.phone}
            />
            <Field
              name="password"
              icon={HiOutlineLockClosed}
              label="Password"
              type="password"
              placeholder="Min 8 chars, letters + numbers"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              autoComplete="new-password"
              error={errors.password}
            />
            <Field
              name="confirm"
              icon={HiOutlineLockClosed}
              label="Confirm password"
              type="password"
              placeholder="Repeat password"
              value={form.confirm}
              onChange={(e) => set('confirm', e.target.value)}
              autoComplete="new-password"
              error={errors.confirm}
            />

            <button type="submit" className="btn brand-gradient text-white shadow hover:opacity-90" disabled={busy}>
              {busy && <span className="loading loading-spinner loading-sm" />} Create Account
            </button>
          </form>

          <p className="text-center text-sm opacity-70">
            Already registered?{' '}
            <Link to="/login" className="link link-hover font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}