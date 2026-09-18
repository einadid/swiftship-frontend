import { useEffect } from 'react';
import { HiOutlineXMark } from 'react-icons/hi2';

/**
 * Reusable always-open daisyUI modal.
 *
 * NOTE: we deliberately render a `div.modal.modal-open` instead of a native
 * `<dialog open>` element. A native dialog + `<form method="dialog">` closes
 * itself when an inner submit button is clicked, which used to make our
 * controlled modals disappear while React still thought they were open.
 */
export default function Modal({ open, title, subtitle, onClose, children, maxWidth = 'max-w-2xl' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal modal-open modal-bottom sm:modal-middle" role="dialog" aria-modal="true">
      <div className={`modal-box w-full ${maxWidth} max-h-[88vh] overflow-y-auto`}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">{title}</h3>
            {subtitle && <p className="mt-0.5 text-sm opacity-70">{subtitle}</p>}
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-circle"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <HiOutlineXMark className="text-xl" />
          </button>
        </div>
        {children}
      </div>
      <button type="button" className="modal-backdrop" onClick={onClose} aria-label="Close dialog">
        close
      </button>
    </div>
  );
}
