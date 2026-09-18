import { useState } from 'react';
import { HiOutlineTruck, HiOutlineMapPin, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { HiOutlineCube } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { api, fmtDate, fmtMoney } from '../api/client';
import StatusBadge from '../components/Badge';
import FullPageSpinner, { ErrorBox, EmptyState } from '../components/FullPageSpinner';

const STEP_ORDER = ['Booked', 'Picked up', 'In transit', 'Out for delivery', 'Delivered'];

export default function TrackPage() {
  const [input, setInput] = useState('');
  const [tracking, setTracking] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = async (e) => {
    e?.preventDefault();
    const q = input.trim().toUpperCase();
    if (q.length < 4) {
      toast.error('Enter the full tracking number (e.g. SS2026XXXXXXXX)');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await api(`/parcels/track/${q}`, { auth: false });
      setResult(data);
      setTracking(q);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

      <form onSubmit={search} className="mt-6 flex gap-2">
        <input
          className="input grow border-base-300 bg-base-100 uppercase"
          placeholder="e.g. SS20260001DEMO"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
        />
        <button className="btn brand-gradient gap-2 text-white shadow hover:opacity-90" disabled={loading}>
          <HiOutlineMagnifyingGlass /> Track
        </button>
      </form>

      <div className="mt-8">
        {loading && <FullPageSpinner label="Finding your parcel…" />}
        {error && <ErrorBox message={error} />}
        {result && (
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="card-title">{result.tracking_number}</h2>
                  <p className="text-xs opacity-60">
                    Booked {fmtDate(result.booked_at)} · Last update {fmtDate(result.last_updated)}
                  </p>
                </div>
                <StatusBadge status={result.status} />
              </div>

              {/* Progress timeline */}
              <div className="flex items-center gap-1 py-2">
                {STEP_ORDER.map((label, i) => {
                  const done = result.history[i]?.done ?? false;
                  return (
                    <div key={label} className="flex flex-1 flex-col items-center gap-1">
                      <div className="flex w-full items-center">
                        <div className={`h-1 flex-1 rounded ${i === 0 ? 'opacity-0' : done ? 'bg-brand-600' : 'bg-base-300'}`} />
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            done ? 'brand-gradient text-white' : 'bg-base-300 text-base-content/60'
                          }`}
                        >
                          {done ? '✓' : i + 1}
                        </span>
                        <div className={`h-1 flex-1 rounded ${i === STEP_ORDER.length - 1 ? 'opacity-0' : result.history[i + 1]?.done ? 'bg-brand-600' : 'bg-base-300'}`} />
                      </div>
                      <span className={`text-center text-[10px] leading-tight ${done ? 'font-semibold' : 'opacity-60'}`}>{label}</span>
                    </div>
                  );
                })}
              </div>

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
                  <HiOutlineTruck /> {result.service_name}
                </span>
                <span className="badge badge-ghost">Weight: {result.weight_kg} kg</span>
                <span className="badge badge-ghost">Charge: {fmtMoney(result.price)}</span>
              </div>
            </div>
          </div>
        )}
        {!loading && !error && !result && (
          <EmptyState
            icon={HiOutlineTruck}
            title="No parcel tracked yet"
            message="Try a demo tracking number: SS20260001DEMO"
          />
        )}
      </div>
    </div>
  );
}
