import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { HiOutlineTruck, HiOutlineMapPin, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { HiOutlineCube, HiOutlineExclamationCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { api, fmtDate, fmtMoney } from '../api/client';
import StatusBadge from '../components/Badge';
import FullPageSpinner, { ErrorBox, EmptyState } from '../components/FullPageSpinner';

const STEP_ORDER = ['Booked', 'Picked up', 'In transit', 'Out for delivery', 'Delivered'];
const STATUS_ORDER = ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'];
const DEMO_TRACKING = 'SS20260001DEMO';

/**
 * Steps shown in the timeline.
 * The backend may send a `history` array of { label | status, done, at } — if it
 * doesn't, we derive the progress from the current status so the timeline still
 * works (backend contract is documented in BACKEND_INTEGRATION.md).
 */
function buildSteps(result) {
  const history = Array.isArray(result?.history) ? result.history : null;
  const statusIndex = STATUS_ORDER.indexOf(result?.status);
  return STEP_ORDER.map((label, i) => {
    const fromApi = history?.[i];
    const done = typeof fromApi?.done === 'boolean' ? fromApi.done : statusIndex >= i;
    return {
      label: fromApi?.label || fromApi?.status_label || label,
      done,
      at: fromApi?.at || fromApi?.created_at || null,
    };
  });
}

export default function TrackPage() {
  const location = useLocation();
  const [input, setInput] = useState(location.state?.tracking || '');
  const [tracking, setTracking] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const autoRan = useRef(false);

  const search = useCallback(async (raw) => {
    const q = String(raw ?? '').trim().toUpperCase();
    if (q.length < 4) {
      toast.error('Enter the full tracking number (e.g. SS20260001DEMO)');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await api(`/parcels/track/${encodeURIComponent(q)}`, { auth: false });
      setResult(data);
      setTracking(q);
      setInput(q);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-track when we arrive from "My Parcels" → track button (router state)
  useEffect(() => {
    if (autoRan.current) return;
    const preset = location.state?.tracking;
    if (preset) {
      autoRan.current = true;
      search(preset);
    }
  }, [location.state, search]);

  const onSubmit = (e) => {
    e.preventDefault();
    search(input);
  };

  const steps = result ? buildSteps(result) : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="text-center">
        <span className="brand-gradient mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow">
          <HiOutlineMagnifyingGlass className="text-4xl" />
        </span>
        <h1 className="text-3xl font-extrabold">Track your parcel</h1>
        <p className="mt-1 text-sm opacity-70">
          Enter the tracking number from your booking confirmation (public — no login needed).
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-6 flex gap-2">
        <label className="input input-bordered flex grow items-center gap-2 border-base-300 bg-base-100">
          <HiOutlineMagnifyingGlass className="opacity-60" />
          <input
            className="grow uppercase"
            placeholder={`e.g. ${DEMO_TRACKING}`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label="Tracking number"
          />
        </label>
        <button type="submit" className="btn brand-gradient gap-2 text-white shadow hover:opacity-90" disabled={loading}>
          {loading ? <span className="loading loading-spinner loading-sm" /> : <HiOutlineMagnifyingGlass />} Track
        </button>
      </form>

      <div className="mt-8">
        {loading && <FullPageSpinner label="Finding your parcel…" />}
        {error && <ErrorBox message={error} onRetry={() => search(input)} />}
        {result && (
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="card-title font-mono">{result.tracking_number}</h2>
                  <p className="text-xs opacity-60">
                    Booked {fmtDate(result.booked_at || result.created_at)} · Last update{' '}
                    {fmtDate(result.last_updated || result.updated_at)}
                  </p>
                </div>
                <StatusBadge status={result.status} />
              </div>

              {result.status === 'cancelled' ? (
                <div className="alert alert-error mt-2 py-2 text-sm">
                  <HiOutlineExclamationCircle className="text-xl" />
                  <span>This parcel was cancelled.</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 py-2">
                  {steps.map((step, i) => (
                    <div key={step.label} className="flex flex-1 flex-col items-center gap-1">
                      <div className="flex w-full items-center">
                        <div
                          className={`h-1 flex-1 rounded ${i === 0 ? 'opacity-0' : step.done ? 'bg-brand-600' : 'bg-base-300'}`}
                        />
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            step.done ? 'brand-gradient text-white' : 'bg-base-300 text-base-content/60'
                          }`}
                          title={step.at ? new Date(step.at).toLocaleString() : undefined}
                        >
                          {step.done ? '✓' : i + 1}
                        </span>
                        <div
                          className={`h-1 flex-1 rounded ${
                            i === steps.length - 1 ? 'opacity-0' : steps[i + 1].done ? 'bg-brand-600' : 'bg-base-300'
                          }`}
                        />
                      </div>
                      <span className={`text-center text-[10px] leading-tight ${step.done ? 'font-semibold' : 'opacity-60'}`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 border-t border-base-200 pt-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <HiOutlineCube className="mt-1 text-xl text-brand-600" />
                  <div>
                    <p className="text-xs font-semibold uppercase opacity-60">From</p>
                    <p className="font-medium">{result.sender_name}</p>
                    <p className="text-sm opacity-70">{result.pickup_address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <HiOutlineMapPin className="mt-1 text-xl text-brand-600" />
                  <div>
                    <p className="text-xs font-semibold uppercase opacity-60">To</p>
                    <p className="font-medium">{result.recipient_name}</p>
                    <p className="text-sm opacity-70">{result.delivery_address}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-base-200 pt-4 text-sm">
                <span className="badge badge-ghost gap-1">
                  <HiOutlineTruck /> {result.service_name || result.service?.name || 'Service'}
                </span>
                <span className="badge badge-ghost">Weight: {result.weight_kg} kg</span>
                <span className="badge badge-ghost">Charge: {fmtMoney(result.price)}</span>
                {tracking && <span className="badge badge-ghost font-mono">{tracking}</span>}
              </div>
            </div>
          </div>
        )}
        {!loading && !error && !result && (
          <EmptyState
            icon={HiOutlineTruck}
            title="No parcel tracked yet"
            message={`Try the demo tracking number: ${DEMO_TRACKING}`}
            action={
              <button type="button" className="btn btn-sm btn-ghost mt-2 font-mono" onClick={() => search(DEMO_TRACKING)}>
                {DEMO_TRACKING}
              </button>
            }
          />
        )}
      </div>
    </div>
  );
}
