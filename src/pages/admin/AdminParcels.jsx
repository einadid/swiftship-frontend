import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlinePencil, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi2';
import { HiOutlineCube } from 'react-icons/hi';
import { api, fmtDate, fmtMoney, qs } from '../../api/client';
import FiltersBar from '../../components/FiltersBar';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/Badge';
import ConfirmModal from '../../components/ConfirmModal';
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

export default function AdminParcels() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [data, setData] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // { mode: 'create' } | { mode: 'edit', parcel }
  const [busy, setBusy] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const debounceRef = useRef(null);

  const loadServices = useCallback(() => api('/services/?all=true').then(setServices).catch(() => {}), []);
  useEffect(() => loadServices(), [loadServices]);

  const load = useCallback(async (f) => {
    setLoading(true);
    setError('');
    try {
      setData(await api(`/parcels/${qs(f)}`));
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

  // --- Status change (admin) ---------------------------------------------
  const changeStatus = async (parcel, newStatus) => {
    if (newStatus === parcel.status) return;
    try {
      const updated = await api(`/parcels/${parcel.id}/status`, { method: 'PATCH', body: { status: newStatus } });
      toast.success(`${updated.tracking_number} → ${newStatus.replace('_', ' ')}`);
      load(filters);
    } catch (e) {
      toast.error(e.message);
      load(filters);
    }
  };

  // --- Create / edit -------------------------------------------------------
  const handleSave = async (values) => {
    setBusy(true);
    try {
      if (modal.mode === 'create') {
        const p = await api('/parcels/', { method: 'POST', body: values });
        toast.success(`Parcel created — ${p.tracking_number}`);
      } else {
        const p = await api(`/parcels/${modal.parcel.id}`, { method: 'PUT', body: values });
        toast.success(`Parcel ${p.tracking_number} updated`);
      }
      setModal(null);
      load(filters);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  // --- Delete ----------------------------------------------------------------
  const confirmDelete = async () => {
    setBusy(true);
    try {
      await api(`/parcels/${toDelete.id}`, { method: 'DELETE' });
      toast.success(`Parcel ${toDelete.tracking_number} deleted`);
      setToDelete(null);
      load(filters);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2">
            <HiOutlineCube className="text-brand-600" /> All Parcels
          </h1>
          <p className="text-sm opacity-70">Full CRUD + delivery status management across every user.</p>
        </div>
        <button className="btn btn-sm brand-gradient gap-2 text-white shadow hover:opacity-90" onClick={() => setModal({ mode: 'create' })}>
          <HiOutlinePlus /> New Parcel
        </button>
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
                    <th>Sender → Recipient</th>
                    <th className="hidden xl:table-cell">Owner</th>
                    <th className="hidden sm:table-cell">Service</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th className="hidden lg:table-cell">Booked</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((p) => (
                    <tr key={p.id} className={loading ? 'opacity-50' : ''}>
                      <td className="font-mono text-xs font-semibold">{p.tracking_number}</td>
                      <td className="max-w-[14rem]">
                        <span className="text-sm">{p.sender_name}</span>
                        <span className="opacity-40"> → </span>
                        <span className="text-sm font-medium">{p.recipient_name}</span>
                      </td>
                      <td className="hidden text-sm opacity-70 xl:table-cell">{p.owner?.full_name}</td>
                      <td className="hidden text-sm opacity-70 sm:table-cell">{p.service?.name}</td>
                      <td className="font-medium">{fmtMoney(p.price)}</td>
                      <td>
                        <select
                          className="select select-xs border-base-300 min-w-[9.5rem]"
                          value={p.status}
                          onChange={(e) => changeStatus(p, e.target.value)}
                        >
                          {['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled'].map((s) => (
                            <option key={s} value={s}>
                              {s.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                        <div className="mt-1"><StatusBadge status={p.status} /></div>
                      </td>
                      <td className="hidden text-sm opacity-70 lg:table-cell">{fmtDate(p.created_at)}</td>
                      <td>
                        <div className="flex justify-end gap-1">
                          <button title="Edit" onClick={() => setModal({ mode: 'edit', parcel: p })} className="btn btn-ghost btn-xs">
                            <HiOutlinePencil />
                          </button>
                          <button title="Delete" onClick={() => setToDelete(p)} className="btn btn-ghost btn-xs text-error">
                            <HiOutlineTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!data.items.length && (
                <EmptyState icon={HiOutlineCube} title="No parcels found" message="Try changing your search or filters." />
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 pb-4">
              <p className="text-xs opacity-60">
                {data.total} parcel{data.total === 1 ? '' : 's'} · page {data.page} of {data.total_pages}
              </p>
              <Pagination page={data.page} total_pages={data.total_pages} onChange={(p) => setFilters({ ...filters, page: p })} />
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      {modal && (
        <dialog className="modal modal-bottom sm:modal-middle" open>
          <div className="modal-box max-h-[85vh] w-full max-w-2xl overflow-y-auto">
            <h3 className="mb-4 text-lg font-bold">
              {modal.mode === 'create' ? 'Create Parcel (as admin)' : `Edit ${modal.parcel.tracking_number}`}
            </h3>
            <ParcelForm
              key={modal.mode === 'edit' ? modal.parcel.id : 'new'}
              services={services}
              initial={modal.mode === 'edit' ? modal.parcel : undefined}
              submitLabel={modal.mode === 'create' ? 'Create Parcel' : 'Save Changes'}
              onSubmit={handleSave}
              submitting={busy}
            />
            <form method="dialog" className="mt-4 text-right">
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(null)}>
                Close
              </button>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setModal(null)}>close</button>
          </form>
        </dialog>
      )}

      <ConfirmModal
        open={!!toDelete}
        title="Delete this parcel?"
        message={toDelete ? `Parcel ${toDelete.tracking_number} (${toDelete.sender_name} → ${toDelete.recipient_name}) will be permanently removed.` : ''}
        confirmText="Delete"
        loading={busy}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
