import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineShoppingBag, HiOutlineCheckCircle } from 'react-icons/hi2';
import { api, fmtMoney } from '../../api/client';
import ParcelForm from '../../components/ParcelForm';
import FullPageSpinner, { ErrorBox } from '../../components/FullPageSpinner';

export default function BookParcel() {
  const [services, setServices] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(null);

  useEffect(() => {
    api('/services/')
      .then(setServices)
      .catch((e) => setError(e.message));
  }, []);

  const handleSubmit = async (values) => {
    setBusy(true);
    try {
      const parcel = await api('/parcels/', { method: 'POST', body: values });
      toast.success(`Parcel booked! Tracking no: ${parcel.tracking_number}`);
      setCreated(parcel);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (created) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 py-10 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
          <HiOutlineCheckCircle className="text-6xl" />
        </span>
        <h1 className="text-2xl font-extrabold">Parcel booked successfully!</h1>
        <p className="text-sm opacity-70">
          Your parcel has been booked. Save this tracking number — you'll need it to follow the shipment.
        </p>
        <div className="card w-full bg-base-100 shadow-sm">
          <div className="card-body">
            <p className="text-xs font-semibold uppercase opacity-60">Tracking number</p>
            <p className="font-mono text-2xl font-extrabold text-brand-700">{created.tracking_number}</p>
            <p className="text-sm opacity-70">
              {created.service?.name} · {created.weight_kg} kg · {fmtMoney(created.price)}
            </p>
            <div className="card-actions justify-center pt-2">
              <Link to="/parcels" className="btn btn-primary">Go to My Parcels</Link>
              <Link to="/parcels/book" className="btn btn-ghost" onClick={() => setCreated(null)}>
                Book Another
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-extrabold flex items-center gap-2">
          <HiOutlineShoppingBag className="text-brand-600" /> Book a New Parcel
        </h1>
        <p className="text-sm opacity-70">Pick a service, fill in the details and confirm — it takes under a minute.</p>
      </div>

      {error && !services && <ErrorBox message={error} />}
      {!services && !error && <FullPageSpinner label="Loading services…" />}
      {services && services.length === 0 && (
        <ErrorBox message="No delivery services are currently available. Please try again later." />
      )}
      {services && services.length > 0 && (
        <div className="card bg-base-100 p-5 shadow-sm">
          <ParcelForm services={services} onSubmit={handleSubmit} submitting={busy} submitLabel="Confirm Booking" />
        </div>
      )}
    </div>
  );
}
