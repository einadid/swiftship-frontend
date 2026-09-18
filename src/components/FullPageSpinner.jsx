import { HiOutlineExclamationCircle } from 'react-icons/hi';

export default function FullPageSpinner({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[40vh] w-full flex-col items-center justify-center gap-3 text-brand-700">
      <span className="loading loading-spinner loading-lg" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function ErrorBox({ message, onRetry }) {
  return (
    <div className="alert alert-error my-4 min-h-[120px] flex-col items-start py-4">
      <div className="flex items-center gap-3">
        <HiOutlineExclamationCircle className="text-2xl" />
        <div>
          <p className="font-semibold">Something went wrong</p>
          <p className="text-sm opacity-90">{message || 'Unexpected error'}</p>
        </div>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-sm btn-ghost">
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
      {Icon && <Icon className="text-4xl opacity-40" />}
      <p className="font-semibold">{title}</p>
      {message && <p className="max-w-sm text-sm opacity-70">{message}</p>}
      {action}
    </div>
  );
}
