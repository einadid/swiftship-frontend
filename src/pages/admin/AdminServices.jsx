import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';
import { HiOutlineShoppingBag } from 'react-icons/hi';
import { api, fmtMoney } from '../../api/client';
import ServiceForm from '../../components/ServiceForm';
import ConfirmModal from '../../components/ConfirmModal';
import FullPageSpinner, { ErrorBox, EmptyState } from '../../components/FullPageSpinner';

export default function AdminServices() {
  const [services, setServices] = useState(null);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // { mode: 'create' } | { mode: 'edit', service }
  const [busy, setBusy] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(() => {
    api('/services/?all=true')
      .then(setServices)
      .catch((e) => setError(e.message));
  }, []);

  useEffect(load, [load]);

  const handleSave = async (values) => {
    setBusy(true);
    try {
      if (modal.mode === 'create') {
        await api('/services/', { method: 'POST', body: values });
        toast.success(`Service "${values.name}" created`);
      } else {
        await api(`/services/${modal.service.id}`, { method: 'PUT', body: values });
        toast.success(`Service "${values.name}" updated`);
      }
      setModal(null);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await api(`/services/${toDelete.id}`, { method: 'DELETE' });
      toast.success(`Service "${toDelete.name}" deleted`);
      setToDelete(null);
      load();
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
            <HiOutlineShoppingBag className="text-brand-600" /> Delivery Services
          </h1>
          <p className="text-sm opacity-70">Manage the services users can book — pricing and ETA.</p>
        </div>
        <button className="btn btn-sm brand-gradient gap-2 text-white shadow hover:opacity-90" onClick={() => setModal({ mode: 'create' })}>
          <HiOutlinePlus /> New Service
        </button>
      </div>

      {error && !services && <ErrorBox message={error} onRetry={load} />}
      {!services && !error && <FullPageSpinner label="Loading services…" />}

      {services && (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th className="hidden md:table-cell">Description</th>
                    <th>Base</th>
                    <th>Per kg</th>
                    <th>ETA</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((s) => (
                    <tr key={s.id}>
                      <td className="font-semibold">{s.name}</td>
                      <td className="hidden max-w-xs truncate text-sm opacity-70 md:table-cell" title={s.description}>
                        {s.description || '—'}
                      </td>
                      <td>{fmtMoney(s.base_price)}</td>
                      <td>{fmtMoney(s.price_per_kg)}</td>
                      <td>{s.eta_days === 0 ? 'Same day' : `${s.eta_days} day${s.eta_days === 1 ? '' : 's'}`}</td>
                      <td>
                        <span className={`badge badge-sm ${s.is_active ? 'badge-success' : 'badge-ghost'}`}>
                          {s.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="flex justify-end gap-1">
                          <button title="Edit" onClick={() => setModal({ mode: 'edit', service: s })} className="btn btn-ghost btn-xs">
                            <HiOutlinePencil />
                          </button>
                          <button title="Delete" onClick={() => setToDelete(s)} className="btn btn-ghost btn-xs text-error">
                            <HiOutlineTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!services.length && <EmptyState icon={HiOutlineShoppingBag} title="No services yet" message="Create your first delivery service." />}
            </div>
          </div>
        </div>
      )}

      {modal && (
        <dialog className="modal modal-bottom sm:modal-middle" open>
          <div className="modal-box w-full max-w-lg">
            <h3 className="mb-4 text-lg font-bold">
              {modal.mode === 'create' ? 'Create Service' : `Edit: ${modal.service.name}`}
            </h3>
            <ServiceForm
              key={modal.mode === 'edit' ? modal.service.id : 'new'}
              initial={modal.mode === 'edit' ? modal.service : undefined}
              submitLabel={modal.mode === 'create' ? 'Create Service' : 'Save Changes'}
              onSubmit={handleSave}
              submitting={busy}
            />
            <form method="dialog" className="mt-4 text-right">
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(null)}>Close</button>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setModal(null)}>close</button>
          </form>
        </dialog>
      )}

      <ConfirmModal
        open={!!toDelete}
        title="Delete this service?"
        message={
          toDelete
            ? `Service "${toDelete.name}" will be removed. Services in use by parcels cannot be deleted — deactivate them instead.`
            : ''
        }
        confirmText="Delete"
        loading={busy}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
