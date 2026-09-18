import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineTrash, HiOutlinePencil, HiOutlineMagnifyingGlass, HiOutlinePlus } from 'react-icons/hi2';
import { HiOutlineCube } from 'react-icons/hi';
import { api, fmtDate, fmtMoney, qs } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import FiltersBar from '../../components/FiltersBar';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/Badge';
import ConfirmModal from '../../components/ConfirmModal';
import Modal from '../../components/Modal';
import ParcelForm from '../../components/ParcelForm';
import FullPageSpinner, { ErrorBox, EmptyState } from '../../components/FullPageSpinner';

const DEFAULT_FILTERS = {
  search: '',
  status: '',
  service_id: '',
  date_from: '',
  date_to: '',
  sort_by: 'created_at',
  sort_order: 'desc',
  page: 1,
  page_size: 10,
};

const EDITABLE = ['pending'];

export default function MyParcels() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [data, setData] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    api('/services/')
      .then((s) => setServices(Array.isArray(s) ? s : []))
      .catch(() => {});
  }, []);

  const load = useCallback(async (f) => {
    setLoading(true);
    setError('');
    try {
      const res = await api(`/parcels/${qs(f)}`);
      setData({ ...res, items: Array.isArray(res?.items) ? res.items : [] });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced refetch when search filters change (page reset already in FiltersBar)
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(filters), filters.search ? 350 : 0);
    return () => clearTimeout(debounceRef.current);
  }, [filters, load]);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api(`/parcels/${toDelete.id}`, { method: 'DELETE' });
      toast.success('Parcel deleted');
      setToDelete(null);
      load(filters);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      const p = await api(`/parcels/${editTarget.id}`, { method: 'PUT', body: values });
      toast.success(`Parcel ${p.tracking_number} updated`);
      setEditTarget(null);
      load(filters);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const trackParcel = (tracking) => navigate('/track', { state: { tracking } });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">My Parcels</h1>
          <p className="text-sm opacity-70">
            {user?.full_name}'s shipments — search, filter, sort and manage.
          </p>
        </div>
        <Link to="/parcels/book" className="btn btn-sm brand-gradient gap-2 text-white shadow hover:opacity-90">
          <HiOutlinePlus /> New Parcel
        </Link>
      </div>

      <FiltersBar filters={filters} onChange={setFilters} services={services} />

      <div className="card bg-base-100 shadow-sm">
        {loading && !data && <FullPageSpinner label="Loading parcels…" />}
        {error && !data && <ErrorBox message={error} onRetry={() => load(filters)} />}
        {data && (
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Tracking no.</th>
                    <th>Recipient</th>
                    <th className="hidden lg:table-cell">Delivery to</th>
                    <th className="hidden sm:table-cell">Service</th>
                    <th>Weight</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th className="hidden md:table-cell">Booked</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((p) => (
                    <tr key={p.id} className={loading ? 'opacity-50' : ''}>
                      <td className="font-mono text-xs font-semibold">{p.tracking_number}</td>
                      <td>{p.recipient_name}</td>
                      <td className="hidden lg:table-cell">
                        <span className="block max-w-[16rem] truncate text-sm opacity-70" title={p.delivery_address}>
                          {p.delivery_address}
                        </span>
                      </td>
                      <td className="hidden text-sm opacity-70 sm:table-cell">{p.service?.name}</td>
                      <td>{p.weight_kg} kg</td>
                      <td className="font-medium">{fmtMoney(p.price)}</td>
                      <td>
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="hidden text-sm opacity-70 md:table-cell">{fmtDate(p.created_at)}</td>
                      <td>
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => trackParcel(p.tracking_number)}
                            title="Track this parcel"
                            aria-label={`Track ${p.tracking_number}`}
                            className="btn btn-ghost btn-xs"
                          >
                            <HiOutlineMagnifyingGlass />
                          </button>
                          {EDITABLE.includes(p.status) && (
                            <button
                              type="button"
                              title="Edit (pending parcels only)"
                              aria-label={`Edit ${p.tracking_number}`}
                              onClick={() => setEditTarget(p)}
                              className="btn btn-ghost btn-xs"
                            >
                              <HiOutlinePencil />
                            </button>
                          )}
                          {EDITABLE.includes(p.status) && (
                            <button
                              type="button"
                              title="Delete (pending parcels only)"
                              aria-label={`Delete ${p.tracking_number}`}
                              onClick={() => setToDelete(p)}
                              className="btn btn-ghost btn-xs text-error"
                            >
                              <HiOutlineTrash />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!data.items.length && (
                <EmptyState
                  icon={HiOutlineCube}
                  title="No parcels found"
                  message={
                    filters.search || filters.status
                      ? 'Try changing your search or filters.'
                      : "You haven't booked any parcels yet."
                  }
                  action={
                    !filters.search && !filters.status ? (
                      <Link to="/parcels/book" className="btn btn-primary btn-sm mt-2">
                        Book a parcel
                      </Link>
                    ) : undefined
                  }
                />
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 pb-4">
              <p className="text-xs opacity-60">
                {data.total} parcel{data.total === 1 ? '' : 's'} · page {data.page} of {data.total_pages}
              </p>
              <Pagination
                page={data.page}
                total_pages={data.total_pages}
                onChange={(p) => setFilters({ ...filters, page: p })}
              />
            </div>
          </div>
        )}
      </div>

      {/* Edit (pending parcels only) */}
      {editTarget && (
        <Modal
          open
          title={`Edit ${editTarget.tracking_number}`}
          subtitle="Weight changes are re-priced by the server."
          onClose={() => setEditTarget(null)}
        >
          <ParcelForm
            key={editTarget.id}
            services={services}
            initial={editTarget}
            submitLabel="Save Changes"
            onSubmit={handleSave}
            submitting={saving}
          />
        </Modal>
      )}

      <ConfirmModal
        open={!!toDelete}
        title="Delete this parcel?"
        message={
          toDelete
            ? `Parcel ${toDelete.tracking_number} to ${toDelete.recipient_name} will be permanently removed. This only works while the parcel is still pending.`
            : ''
        }
        confirmText="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
