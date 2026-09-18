import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineKey } from 'react-icons/hi';
import { HiOutlineEnvelope } from 'react-icons/hi2';
import { api } from '../api/client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [devUrl, setDevUrl] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Enter a valid email address');
      return;
    }
    setError('');
    setBusy(true);
    try {
      const data = await api('/auth/forgot-password', { method: 'POST', auth: false, body: { email: email.trim() } });
      setSent(true);
      setDevUrl(data.reset_url || null);
      toast.success(data.message);
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
          <div className="mx-auto mb-2 flex flex-col items-center text-center">
            <span className="brand-gradient mb-3 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow">
              <HiOutlineKey className="text-3xl" />
            </span>
            <h1 className="text-2xl font-extrabold">Forgot your password?</h1>
            <p className="text-sm opacity-60">
              Enter your account email and we'll send you a secure link to set a new password.
            </p>
          </div>

          {sent ? (
            <div className="flex flex-col gap-3">
              <div className="alert alert-success py-3 text-sm">
                <HiOutlineEnvelope className="text-2xl" />
                <div>
                  <p className="font-semibold">Check your inbox</p>
                  <p>If an account exists for <strong>{email}</strong>, a reset link has been sent to it.</p>
                </div>
              </div>
              {devUrl && (
                <div className="alert py-3 text-sm">
                  <div>
                    <p className="font-semibold">Demo shortcut (no email server in exam sandbox)</p>
                    <Link to={devUrl.replace(/^https?:\/\/[^/]+/, '')} className="link link-primary break-all text-xs">
                      {devUrl}
                    </Link>
                  </div>
                </div>
              )}
              <Link to="/login" className="btn btn-primary">Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="form-control w-full">
                <span className="label-text font-medium">Email</span>
                <div className="relative">
                  <HiOutlineEnvelope className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                  <input
                    type="email"
                    className={`input border-base-300 pl-9 ${error ? 'border-error' : ''}`}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {error && <span className="input-error-text">{error}</span>}
              </label>
              <button type="submit" className="btn brand-gradient text-white shadow hover:opacity-90" disabled={busy}>
                {busy && <span className="loading loading-spinner loading-sm" />} Send Reset Link
              </button>
              <Link to="/login" className="text-center text-sm opacity-70 hover:opacity-100">
                ← Back to login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
