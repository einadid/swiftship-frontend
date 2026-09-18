import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ServiceForm({ initial, submitLabel = 'Save Service', onSubmit, submitting }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    description: initial?.description || '',
    base_price: initial?.base_price ?? '',
    price_per_kg: initial?.price_per_kg ?? '',
    eta_days: initial?.eta_days ?? '',
    is_active: initial?.is_active ?? true,
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'Name is required';
    const bp = parseFloat(form.base_price);
    if (isNaN(bp) || bp < 0) errs.base_price = 'Enter a valid base price';
    const pk = parseFloat(form.price_per_kg);
    if (isNaN(pk) || pk < 0) errs.price_per_kg = 'Enter a valid per-kg price';
    const eta = parseInt(form.eta_days, 10);
    if (isNaN(eta) || eta < 0 || eta > 90) errs.eta_days = 'ETA must be 0-90 days';
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error('Please fix the highlighted fields');
      return;
    }
    onSubmit({
      name: form.name.trim(),
      description: form.description.trim() || null,
      base_price: bp,
      price_per_kg: pk,
      eta_days: eta,
      is_active: form.is_active,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="form-control w-full">
        <span className="label-text font-medium">Service name *</span>
        <input className={`input border-base-300 ${errors.name ? 'border-error' : ''}`} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Express Delivery" />
        {errors.name && <span className="input-error-text">{errors.name}</span>}
      </label>
      <label className="form-control w-full">
        <span className="label-text font-medium">Description</span>
        <textarea className="textarea border-base-300" rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} />
      </label>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="form-control">
          <span className="label-text font-medium">Base price (৳) *</span>
          <input type="number" step="0.01" className={`input border-base-300 ${errors.base_price ? 'border-error' : ''}`} value={form.base_price} onChange={(e) => set('base_price', e.target.value)} />
          {errors.base_price && <span className="input-error-text">{errors.base_price}</span>}
        </label>
        <label className="form-control">
          <span className="label-text font-medium">Price per kg (৳) *</span>
          <input type="number" step="0.01" className={`input border-base-300 ${errors.price_per_kg ? 'border-error' : ''}`} value={form.price_per_kg} onChange={(e) => set('price_per_kg', e.target.value)} />
          {errors.price_per_kg && <span className="input-error-text">{errors.price_per_kg}</span>}
        </label>
        <label className="form-control">
          <span className="label-text font-medium">ETA (days) *</span>
          <input type="number" className={`input border-base-300 ${errors.eta_days ? 'border-error' : ''}`} value={form.eta_days} onChange={(e) => set('eta_days', e.target.value)} />
          {errors.eta_days && <span className="input-error-text">{errors.eta_days}</span>}
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" className="checkbox checkbox-primary" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} />
        Active (visible to users when booking)
      </label>
      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting && <span className="loading loading-spinner loading-sm" />}
        {submitLabel}
      </button>
    </form>
  );
}
