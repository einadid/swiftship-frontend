import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineUserGroup, HiOutlineKey } from 'react-icons/hi2';
import { HiOutlineBan, HiOutlineCheckCircle } from 'react-icons/hi';
import { api, fmtDate, qs } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Pagination from '../../components/Pagination';
import ConfirmModal from '../../components/ConfirmModal';
import Modal from '../../components/Modal';
import FullPageSpinner, { ErrorBox, EmptyState } from '../../components/FullPageSpinner';

const DEFAULT_FILTERS = { search: '', page: 1, page_size: 10, sort_by: 'created_at', sort_order: 'desc' };

export default function AdminUsers() {
  const { user: admin } = useAuth();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [toggleTarget, setToggleTarget] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const debounceRef = useRef(null);

  const load = useCallback(async (f) => {
    setLoading(true);
    setError('');
    try {
      setData(await api(`/users/${qs(f)}`));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(filters), filters.search ? 350 : 0);
    return () => clearTimeout(debounceRef.current);
  }, [filters, load]);

  const confirmToggle = async () => {
    setBusy(true);
    try {
      await api(`/users/${toggleTarget.id}/active`, {
        method: 'PATCH',
        body: { is_active: !toggleTarget.is_active },
      });
      toast.success(
        toggleTarget.is_active ? `${toggleTarget.email} blocked` : `${toggleTarget.email} unblocked`,
      );
      setToggleTarget(null);
      load(filters);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const openReset = (u) => {
    setResetTarget(u);
    setNewPassword('');
    setPwError('');
  };

  const confirmReset = async () => {
    const pw = newPassword;
    if (pw.length < 8 || !/[A-Za-z]/.test(pw) || !/\d/.test(pw)) {
      setPwError('At least 8 characters with letters and numbers');
      return;
    }
    setBusy(true);
    try {
      await api(`/users/${resetTarget.id}/reset-password`, { method: 'POST', body: { new_password: pw } });
      toast.success(`Password for ${resetTarget.email} reset`);
      setResetTarget(null);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-extrabold flex items-center gap-2">
          <HiOutlineUserGroup className="text-brand-600" /> Users
        </h1>
        <p className="text-sm opacity-70">Search, block/unblock accounts and force-reset passwords.</p>
      </div>

      {/* Simplified search bar (user list doesn't use status/service/date filters) */}
      <div className="card bg-base-100 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <label className="input flex w-full max-w-xs items-center gap-2 border-base-300 bg-base-100">
            <HiOutlineUserGroup />
            <input
              type="search"
              className="grow"
              placeholder="Search name, email, phone…"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              aria-label="Search users"
            />
          </label>
          <select
            className="select select-sm border-base-300 bg-base-100"
            value={filters.page_size}
            onChange={(e) => setFilters({ ...filters, page_size: Number(e.target.value), page: 1 })}
            aria-label="Users per page"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
          <select
            className="select select-sm border-base-300 bg-base-100"
            value={filters.sort_order}
            onChange={(e) => setFilters({ ...filters, sort_order: e.target.value, page: 1 })}
          >
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm">
        {loading && !data && <FullPageSpinner label="Loading users…" />}
        {error && !data && <ErrorBox message={error} onRetry={() => load(filters)} />}
        {data && (
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th className="hidden sm:table-cell">Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th className="hidden lg:table-cell">Joined</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((u) => (
                    <tr key={u.id} className={loading ? 'opacity-50' : ''}>
                      <td className="font-semibold">{u.full_name}</td>
                      <td className="text-sm">{u.email}</td>
                      <td className="hidden text-sm opacity-70 sm:table-cell">{u.phone}</td>
                      <td>
                        <span className={`badge badge-sm ${u.role === 'admin' ? 'badge-primary' : 'badge-ghost'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-sm ${u.is_active ? 'badge-success' : 'badge-error'}`}>
                          {u.is_active ? 'Active' : 'Blocked'}
                        </span>
                      </td>
                      <td className="hidden text-sm opacity-70 lg:table-cell">{fmtDate(u.created_at)}</td>
                      <td>
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            title="Reset password"
                            aria-label={`Reset password for ${u.email}`}
                            onClick={() => openReset(u)}
                            className="btn btn-ghost btn-xs"
                          >
                            <HiOutlineKey />
                          </button>
                          {u.id !== admin?.id && (
                            <button
                              type="button"
                              title={u.is_active ? 'Block user' : 'Unblock user'}
                              aria-label={u.is_active ? `Block ${u.email}` : `Unblock ${u.email}`}
                              onClick={() => setToggleTarget(u)}
                              className={`btn btn-ghost btn-xs ${u.is_active ? 'text-error' : 'text-success'}`}
                            >
                              {u.is_active ? <HiOutlineBan /> : <HiOutlineCheckCircle />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!data.items.length && <EmptyState icon={HiOutlineUserGroup} title="No users found" message="Try a different search." />}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 pb-4">
              <p className="text-xs opacity-60">
                {data.total} user{data.total === 1 ? '' : 's'} · page {data.page} of {data.total_pages}
              </p>
              <Pagination page={data.page} total_pages={data.total_pages} onChange={(p) => setFilters({ ...filters, page: p })} />
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!toggleTarget}
        title={toggleTarget?.is_active ? 'Block this user?' : 'Unblock this user?'}
        message={
          toggleTarget
            ? toggleTarget.is_active
              ? `${toggleTarget.email} will be blocked and cannot login until unblocked.`
              : `${toggleTarget.email} will be able to login again.`
            : ''
        }
        confirmText={toggleTarget?.is_active ? 'Block' : 'Unblock'}
        danger={toggleTarget?.is_active}
        loading={busy}
        onConfirm={confirmToggle}
        onCancel={() => setToggleTarget(null)}
      />

      {resetTarget && (
        <Modal
          open
          title={`Reset password for ${resetTarget.email}`}
          subtitle="The user can login immediately with the new password."
          onClose={() => setResetTarget(null)}
          maxWidth="max-w-md"
        >
          <label className="form-control w-full">
            <span className="label-text font-medium">New password</span>
            <input
              type="text"
              className={`input border-base-300 ${pwError ? 'border-error' : ''}`}
              placeholder="Min 8 chars, letters + numbers"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPwError('');
              }}
            />
            {pwError && <span className="input-error-text">{pwError}</span>}
          </label>
          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={() => setResetTarget(null)} disabled={busy}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={confirmReset} disabled={busy}>
              {busy && <span className="loading loading-spinner loading-sm" />}
              Reset Password
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
