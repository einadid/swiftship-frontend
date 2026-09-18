import { HiOutlineExclamationTriangle } from 'react-icons/hi2';

/** Confirmation modal (used before destructive actions). */
export default function ConfirmModal({
  open,
  title = 'Are you sure?',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;
  return (
    <dialog className="modal modal-bottom sm:modal-middle" open>
      <div className="modal-box">
        <div className="flex items-start gap-3">
          <span className={danger ? 'text-error' : 'text-brand-600'}>
            <HiOutlineExclamationTriangle className="text-3xl" />
          </span>
          <div>
            <h3 className="font-bold">{title}</h3>
            {message && <p className="mt-1 text-sm opacity-80">{message}</p>}
          </div>
        </div>
        <div className="modal-action">
          <form method="dialog">
            <button className="btn btn-ghost" onClick={onCancel}>
              {cancelText}
            </button>
            <button
              className={`btn ${danger ? 'btn-error' : 'btn-primary'}`}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading && <span className="loading loading-spinner loading-sm" />}
              {confirmText}
            </button>
          </form>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onCancel}>close</button>
      </form>
    </dialog>
  );
}
