import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineLockClosed } from 'react-icons/hi';
import { api } from '../api/client';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (form.password.length < 8) errs.password = 'At least 8 characters';
    else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) errs.password = 'Must contain letters and numbers';
    if (form.confirm !== form.password) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    try {
      await api('/auth/reset-password', { method: 'POST', auth: false, body: { token, new_password: form.password } });
      toast.success('Password updated! You can login now.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-lg font-bold">Missing reset token</p>
        <p className="max-w-sm text-sm opacity-70">
          This link is invalid or incomplete. Please request a new reset link from the login page.
        </p>
        <Link to="/forgot-password" className="btn btn-primary mt-2">Request New Link</Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="mx-auto mb-2 flex flex-col items-center text-center">
            <span className="brand-gradient mb-3 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow">
              <HiOutlineLockClosed className="text-3xl" />
            </span>
            <h1 className="text-2xl font-extrabold">Set a new password</h1>
            <p className="text-sm opacity-60">Make it strong — 8+ characters with letters and numbers.</p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="form-control w-full">
              <span className="label-text font-medium">New password</span>
              <input
                type="password"
                className={`input border-base-300 ${errors.password ? 'border-error' : ''}`}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              {errors.password && <span className="input-error-text">{errors.password}</span>}
            </label>
            <label className="form-control w-full">
              <span className="label-text font-medium">Confirm new password</span>
              <input
                type="password"
                className={`input border-base-300 ${errors.confirm ? 'border-error' : ''}`}
                placeholder="••••••••"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              />
              {errors.confirm && <span className="input-error-text">{errors.confirm}</span>}
            </label>
            <button type="submit" className="btn brand-gradient text-white shadow hover:opacity-90" disabled={busy}>
              {busy && <span className="loading loading-spinner loading-sm" />} Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
