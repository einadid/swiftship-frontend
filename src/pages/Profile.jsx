import { useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineUser, HiOutlineLockClosed, HiOutlineMail, HiOutlinePhone } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.current_password) errs.current_password = 'Current password required';
    if (form.new_password.length < 8) errs.new_password = 'At least 8 characters';
    else if (!/[A-Za-z]/.test(form.new_password) || !/\d/.test(form.new_password)) {
      errs.new_password = 'Must contain letters and numbers';
    }
    if (form.new_password !== form.confirm) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    try {
      await api('/auth/change-password', { method: 'POST', body: { current_password: form.current_password, new_password: form.new_password } });
      toast.success('Password changed successfully');
      setForm({ current_password: '', new_password: '', confirm: '' });
      refreshUser();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold flex items-center gap-2">
          <HiOutlineUser className="text-brand-600" /> Profile
        </h1>
        <p className="text-sm opacity-70">Manage your account information and password.</p>
      </div>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="font-bold text-lg">Account Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-2">
            <div className="flex items-center gap-3">
              <HiOutlineUser className="text-xl opacity-50" />
              <div>
                <p className="text-xs opacity-60">Full Name</p>
                <p className="font-medium">{user?.full_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <HiOutlineMail className="text-xl opacity-50" />
              <div>
                <p className="text-xs opacity-60">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <HiOutlinePhone className="text-xl opacity-50" />
              <div>
                <p className="text-xs opacity-60">Phone</p>
                <p className="font-medium">{user?.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`badge ${user?.role === 'admin' ? 'badge-primary' : 'badge-ghost'}`}>{user?.role}</span>
              <span className={`badge ${user?.is_active ? 'badge-success' : 'badge-error'}`}>{user?.is_active ? 'Active' : 'Blocked'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <HiOutlineLockClosed /> Change Password
          </h2>
          <form onSubmit={handleChangePassword} className="flex flex-col gap-4 mt-2">
            <label className="form-control w-full">
              <span className="label-text font-medium">Current Password</span>
              <input
                type="password"
                className={`input border-base-300 ${errors.current_password ? 'border-error' : ''}`}
                value={form.current_password}
                onChange={(e) => setForm({ ...form, current_password: e.target.value })}
                placeholder="••••••••"
              />
              {errors.current_password && <span className="input-error-text">{errors.current_password}</span>}
            </label>
            <label className="form-control w-full">
              <span className="label-text font-medium">New Password</span>
              <input
                type="password"
                className={`input border-base-300 ${errors.new_password ? 'border-error' : ''}`}
                value={form.new_password}
                onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                placeholder="Min 8 chars, letters + numbers"
              />
              {errors.new_password && <span className="input-error-text">{errors.new_password}</span>}
            </label>
            <label className="form-control w-full">
              <span className="label-text font-medium">Confirm New Password</span>
              <input
                type="password"
                className={`input border-base-300 ${errors.confirm ? 'border-error' : ''}`}
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                placeholder="Repeat new password"
              />
              {errors.confirm && <span className="input-error-text">{errors.confirm}</span>}
            </label>
            <button type="submit" className="btn brand-gradient text-white" disabled={busy}>
              {busy && <span className="loading loading-spinner loading-sm" />} Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
