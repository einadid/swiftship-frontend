import { useState } from 'react';
import toast from 'react-hot-toast';
import { fmtMoney } from '../api/client';

/**
 * Create/Edit parcel form with client-side validation.
 * For "create" (no `initial`), the service select is visible; for "edit" it is hidden
 * (the parcel keeps its service; weight changes re-price it).
 */
export default function ParcelForm({ services, initial, submitLabel = 'Book Parcel', onSubmit, submitting }) {
  const isEdit = !!initial;
  const [form, setForm] = useState({
    sender_name: initial?.sender_name || '',
    sender_phone: initial?.sender_phone || '',
    recipient_name: initial?.recipient_name || '',
    recipient_phone: initial?.recipient_phone || '',
    pickup_address: initial?.pickup_address || '',
    delivery_address: initial?.delivery_address || '',
    weight_kg: initial?.weight_kg || '',
    notes: initial?.notes || '',
    service_id: initial?.service_id || services?.[0]?.id || '',
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    const phoneRe = /^(\+?88)?01[3-9]\d{8}$/;
    if (form.sender_name.trim().length < 2) e.sender_name = 'Sender name is required';
    if (!phoneRe.test(form.sender_phone.trim())) e.sender_phone = 'Valid BD phone required (01XXXXXXXXX)';
    if (form.recipient_name.trim().length < 2) e.recipient_name = 'Recipient name is required';
    if (!phoneRe.test(form.recipient_phone.trim())) e.recipient_phone = 'Valid BD phone required (01XXXXXXXXX)';
    if (form.pickup_address.trim().length < 5) e.pickup_address = 'Full pickup address required';
    if (form.delivery_address.trim().length < 5) e.delivery_address = 'Full delivery address required';
    const w = parseFloat(form.weight_kg);
    if (!w || w <= 0 || w > 500) e.weight_kg = 'Weight must be between 0 and 500 kg';
    if (!isEdit && !form.service_id) e.service_id = 'Pick a delivery service';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const service = services?.find((s) => s.id === Number(form.service_id));
  const estPrice = service ? service.base_price + service.price_per_kg * (parseFloat(form.weight_kg) || 0) : null;

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) {
      toast.error('Please fix the highlighted fields');
      return;
    }
    onSubmit({
      sender_name: form.sender_name.trim(),
      sender_phone: form.sender_phone.trim(),
      recipient_name: form.recipient_name.trim(),
      recipient_phone: form.recipient_phone.trim(),
      pickup_address: form.pickup_address.trim(),
      delivery_address: form.delivery_address.trim(),
      weight_kg: parseFloat(form.weight_kg),
      notes: form.notes.trim() || null,
      ...(isEdit ? {} : { service_id: Number(form.service_id) }),
    });
  };

  const field = (
    label,
    key,
    { type = 'text', textarea = false, placeholder = '', span = 1, required = true } = {},
  ) => (
    <label className={`form-control w-full ${span === 2 ? 'sm:col-span-2' : ''}`}>
      <span className="label-text mb-1 font-medium">
        {label} {required && <span className="text-error">*</span>}
      </span>
      {textarea ? (
        <textarea
          className={`textarea border-base-300 bg-base-100 ${errors[key] ? 'border-error' : ''}`}
          rows={2}
          placeholder={placeholder}
          value={form[key]}
          onChange={(e) => set(key, e.target.value)}
        />
      ) : (
        <input
          type={type}
          step={type === 'number' ? '0.1' : undefined}
          className={`input border-base-300 bg-base-100 ${errors[key] ? 'border-error' : ''}`}
          placeholder={placeholder}
          value={form[key]}
          onChange={(e) => set(key, e.target.value)}
        />
      )}
      {errors[key] && <span className="input-error-text">{errors[key]}</span>}
    </label>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {!isEdit && (
        <label className="form-control w-full">
          <span className="label-text mb-1 font-medium">
            Delivery service <span className="text-error">*</span>
          </span>
          <select
            className={`select border-base-300 bg-base-100 ${errors.service_id ? 'border-error' : ''}`}
            value={form.service_id}
            onChange={(e) => set('service_id', e.target.value)}
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — base {fmtMoney(s.base_price)} + {fmtMoney(s.price_per_kg)}/kg · ETA {s.eta_days === 0 ? 'same day' : `${s.eta_days}d`}
              </option>
            ))}
          </select>
          {errors.service_id && <span className="input-error-text">{errors.service_id}</span>}
        </label>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {field('Sender name', 'sender_name', { placeholder: 'e.g. Rahim Uddin' })}
        {field('Sender phone', 'sender_phone', { placeholder: '01XXXXXXXXX' })}
        {field('Recipient name', 'recipient_name', { placeholder: 'Who receives the parcel?' })}
        {field('Recipient phone', 'recipient_phone', { placeholder: '01XXXXXXXXX' })}
        {field('Pickup address', 'pickup_address', { span: 2, textarea: true, placeholder: 'House, road, area, city' })}
        {field('Delivery address', 'delivery_address', { span: 2, textarea: true, placeholder: 'Full delivery address' })}
        {field('Weight (kg)', 'weight_kg', { type: 'number', placeholder: 'e.g. 2.5' })}
        {field('Notes (optional)', 'notes', { placeholder: 'e.g. fragile, call before delivery', required: false })}
      </div>

      {estPrice !== null && !isNaN(estPrice) && (
        <div className="alert bg-brand-50 text-brand-800">
          <p className="text-sm">
            Estimated cost: <strong>{fmtMoney(estPrice)}</strong>{' '}
            <span className="opacity-70">
              (base {fmtMoney(service?.base_price || 0)} + {fmtMoney(service?.price_per_kg || 0)}/kg × {form.weight_kg || 0} kg)
            </span>
          </p>
        </div>
      )}

      <button type="submit" className="btn brand-gradient text-white shadow hover:opacity-90" disabled={submitting}>
        {submitting && <span className="loading loading-spinner loading-sm" />}
        {submitLabel}
      </button>
    </form>
  );
}
