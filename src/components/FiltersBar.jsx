import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi';
import { STATUS_OPTIONS } from './Badge';

/**
 * Reusable Search / Filter / Sort bar used by parcel listings.
 * `filters` shape: { search, status, service_id, date_from, date_to, sort_by, sort_order }
 */
export default function FiltersBar({ filters, onChange, services = [], withReset = true }) {
  const set = (patch) => onChange({ ...filters, ...patch });
  const hasFilters =
    filters.search || filters.status || filters.service_id || filters.date_from || filters.date_to;

  return (
    <div className="card bg-base-100 p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <label className="input flex items-center gap-2 border-base-300 bg-base-100">
          <HiOutlineSearch />
          <input
            type="search"
            className="grow"
            placeholder="Search tracking no, name, phone…"
            value={filters.search || ''}
            onChange={(e) => set({ search: e.target.value, page: 1 })}
          />
        </label>

        {/* Status filter */}
        <select
          className="select border-base-300 bg-base-100"
          value={filters.status || ''}
          onChange={(e) => set({ status: e.target.value, page: 1 })}
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {/* Service filter */}
        <select
          className="select border-base-300 bg-base-100"
          value={filters.service_id || ''}
          onChange={(e) => set({ service_id: e.target.value ? Number(e.target.value) : '', page: 1 })}
        >
          <option value="">All services</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Date range */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            className="input input-sm w-1/2 grow border-base-300"
            value={filters.date_from || ''}
            max={filters.date_to || undefined}
            onChange={(e) => set({ date_from: e.target.value, page: 1 })}
            title="Booked from"
          />
          <span className="text-xs opacity-60">→</span>
          <input
            type="date"
            className="input input-sm w-1/2 grow border-base-300"
            value={filters.date_to || ''}
            min={filters.date_from || undefined}
            onChange={(e) => set({ date_to: e.target.value, page: 1 })}
            title="Booked to"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {/* Sorting */}
        <select
          className="select select-sm border-base-300 bg-base-100"
          value={filters.sort_by || 'created_at'}
          onChange={(e) => set({ sort_by: e.target.value, page: 1 })}
        >
          <option value="created_at">Sort: Date booked</option>
          <option value="recipient_name">Sort: Recipient A→Z</option>
          <option value="sender_name">Sort: Sender A→Z</option>
          <option value="price">Sort: Price</option>
          <option value="tracking_number">Sort: Tracking no</option>
          <option value="status">Sort: Status</option>
        </select>
        <select
          className="select select-sm border-base-300 bg-base-100"
          value={filters.sort_order || 'desc'}
          onChange={(e) => set({ sort_order: e.target.value, page: 1 })}
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>

        <div className="ml-auto flex items-center gap-2">
          {hasFilters && withReset && (
            <button
              className="btn btn-ghost btn-sm gap-1 text-error"
              onClick={() =>
                onChange({ search: '', status: '', service_id: '', date_from: '', date_to: '', sort_by: 'created_at', sort_order: 'desc', page: 1 })
              }
            >
              <HiOutlineX /> Clear filters
            </button>
          )}
          <span className="badge badge-ghost gap-1 text-xs">
            <StatusBadge status={filters.status || 'pending'} />
          </span>
        </div>
      </div>
    </div>
  );
}
