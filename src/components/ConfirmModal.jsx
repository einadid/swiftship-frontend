import { HiOutlineExclamationTriangle, HiOutlineCheckCircle } from 'react-icons/hi2';
import Modal from './Modal';

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
    <Modal open={open} title={title} onClose={onCancel} maxWidth="max-w-md">
      <div className="flex items-start gap-3">
        <span className={danger ? 'text-error' : 'text-success'}>
          {danger ? (
            <HiOutlineExclamationTriangle className="text-3xl" />
          ) : (
            <HiOutlineCheckCircle className="text-3xl" />
          )}
        </span>
        {message && <p className="mt-1 text-sm opacity-80">{message}</p>}
      </div>
      <div className="modal-action">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={loading}>
          {cancelText}
        </button>
        <button
          type="button"
          className={`btn ${danger ? 'btn-error' : 'btn-primary'}`}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading && <span className="loading loading-spinner loading-sm" />}
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
