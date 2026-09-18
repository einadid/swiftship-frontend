import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineCube, HiOutlineCheckCircle, HiOutlineTruck, HiOutlineClock } from 'react-icons/hi';
import { HiOutlineShoppingBag, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { api, fmtDate, fmtMoney, qs } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/Badge';
import FullPageSpinner, { ErrorBox, EmptyState } from '../../components/FullPageSpinner';

export default function UserDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [s, r] = await Promise.all([
          api('/parcels/summary'),
          api(`/parcels/${qs({ sort_by: 'created_at', sort_order: 'desc', page: 1, page_size: 5 })}`),
        ]);
        setSummary(s);
        setRecent(r.items);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <FullPageSpinner label="Loading your dashboard…" />;
  if (error) return <ErrorBox message={error} />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Hi, {user?.full_name?.split(' ')[0]} 👋</h1>
          <p className="text-sm opacity-70">Here's what's happening with your shipments.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/parcels/book" className="btn btn-sm brand-gradient gap-2 text-white shadow hover:opacity-90">
            <HiOutlineShoppingBag /> Book Parcel
          </Link>
          <Link to="/track" className="btn btn-sm btn-outline gap-2">
            <HiOutlineMagnifyingGlass /> Track
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={HiOutlineCube} label="Total parcels" value={summary?.total ?? 0} tone="brand" />
        <StatCard icon={HiOutlineTruck} label="In the pipeline" value={summary?.active ?? 0} tone="amber" hint="pending → out for delivery" />
        <StatCard icon={HiOutlineCheckCircle} label="Delivered" value={summary?.delivered ?? 0} tone="green" />
        <StatCard icon={HiOutlineClock} label="Total spent (delivered)" value={fmtMoney(summary?.total_spent ?? 0)} tone="blue" />
      </div>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body p-0">
          <div className="flex items-center justify-between px-5 pt-4">
            <h2 className="font-bold">Recent parcels</h2>
            <Link to="/parcels" className="link link-hover text-sm">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Tracking no.</th>
                  <th>Recipient</th>
                  <th className="hidden sm:table-cell">Service</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th className="hidden md:table-cell">Booked</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((p) => (
                  <tr key={p.id}>
                    <td className="font-mono text-xs font-semibold">{p.tracking_number}</td>
                    <td>{p.recipient_name}</td>
                    <td className="hidden text-sm opacity-70 sm:table-cell">{p.service?.name}</td>
                    <td className="font-medium">{fmtMoney(p.price)}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td className="hidden text-sm opacity-70 md:table-cell">{fmtDate(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!recent.length && (
              <EmptyState
                icon={HiOutlineCube}
                title="No parcels yet"
                message="Book your first parcel to see it here."
                action={
                  <Link to="/parcels/book" className="btn btn-primary btn-sm mt-2">
                    Book your first parcel
                  </Link>
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
