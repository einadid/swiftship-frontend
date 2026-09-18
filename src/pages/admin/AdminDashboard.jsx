import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineCube,
  HiOutlineUserGroup,
  HiOutlineCurrencyRupee,
  HiOutlineTruck,
} from 'react-icons/hi';
import { api, fmtMoney } from '../../api/client';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/Badge';
import FullPageSpinner, { ErrorBox, EmptyState } from '../../components/FullPageSpinner';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    return api('/parcels/stats')
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <FullPageSpinner label="Loading admin analytics…" />;
  if (error) return <ErrorBox message={error} onRetry={load} />;

  const byStatus = stats?.by_status || {};
  const recent = Array.isArray(stats?.recent_parcels) ? stats.recent_parcels : [];
  const maxCount = Math.max(1, ...Object.values(byStatus).map((n) => Number(n) || 0));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Admin Overview</h1>
          <p className="text-sm opacity-70">Platform-wide shipment analytics.</p>
        </div>
        <Link to="/admin/parcels" className="btn btn-sm btn-primary">Manage Parcels →</Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={HiOutlineCube} label="Total parcels" value={stats.total_parcels ?? 0} tone="brand" />
        <StatCard icon={HiOutlineTruck} label="Active shipments" value={stats.active_parcels ?? 0} tone="amber" hint="not delivered / cancelled" />
        <StatCard icon={HiOutlineCurrencyRupee} label="Revenue (delivered)" value={fmtMoney(stats.total_revenue)} tone="green" />
        <StatCard icon={HiOutlineUserGroup} label="Registered users" value={stats.total_users ?? 0} tone="blue" hint={`${stats.total_services ?? 0} services in catalog`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Status breakdown */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="font-bold">Parcels by status</h2>
            <div className="flex flex-col gap-3">
              {Object.entries(byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center gap-3">
                  <div className="w-32 shrink-0 text-xs font-medium opacity-80 capitalize">{status.replace('_', ' ')}</div>
                  <div className="h-4 flex-1 overflow-hidden rounded-full bg-base-200">
                    <div
                      className="h-full rounded-full brand-gradient transition-all"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                  <div className="w-8 text-right text-sm font-bold">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent parcels */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-0">
            <div className="flex items-center justify-between px-5 pt-4">
              <h2 className="font-bold">Latest bookings</h2>
              <Link to="/admin/parcels" className="link link-hover text-sm">View all →</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Tracking</th>
                    <th>Sender</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((p) => (
                    <tr key={p.id}>
                      <td className="font-mono text-xs font-semibold">{p.tracking_number}</td>
                      <td className="text-sm">{p.sender_name}</td>
                      <td className="font-medium">{fmtMoney(p.price)}</td>
                      <td><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!recent.length && <EmptyState icon={HiOutlineCube} title="No parcels yet" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
