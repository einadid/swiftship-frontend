import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi';
import { HiOutlineFunnel } from 'react-icons/hi2';
import StatusBadge, { STATUS_OPTIONS } from './Badge';

/**
 * Reusable Search / Filter / Sort / Page-size bar used by the listings.
 * `filters` shape:
 *   { search, status, service_id, date_from, date_to, sort_by, sort_order, page, page_size }
 *
 * Every setter resets `page` to 1 so the user never lands on an empty page.
 */
export default function FiltersBar({ filters, onChange, services = [], withReset = true }) {
  const set = (patch) => onChange({ ...filters, ...patch, page: 1 });

  const hasFilters = Boolean(
    filters.search ||
      filters.status ||
      filters.service_id ||
      filters.date_from ||
      filters.date_to ||
      (filters.sort_by && filters.sort_by !== 'created_at') ||
      (filters.sort_order && filters.sort_order !== 'desc'),
  );

  const clear = () =>
    onChange({
      search: '',
      status: '',
      service_id: '',
      date_from: '',
      date_to: '',
      sort_by: 'created_at',
      sort_order: 'desc',
      page: 1,
      page_size: filters.page_size || 10,
    });

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
            onChange={(e) => set({ search: e.target.value })}
          />
        </label>

        {/* Status filter */}
        <select
          className="select border-base-300 bg-base-100"
          value={filters.status || ''}
          onChange={(e) => set({ status: e.target.value })}
          aria-label="Filter by status"
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
          onChange={(e) => set({ service_id: e.target.value ? Number(e.target.value) : '' })}
          aria-label="Filter by service"
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
            onChange={(e) => set({ date_from: e.target.value })}
            title="Booked from"
            aria-label="Booked from date"
          />
          <span className="text-xs opacity-60">→</span>
          <input
            type="date"
            className="input input-sm w-1/2 grow border-base-300"
            value={filters.date_to || ''}
            min={filters.date_from || undefined}
            onChange={(e) => set({ date_to: e.target.value })}
            title="Booked to"
            aria-label="Booked to date"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {/* Sorting */}
        <select
          className="select select-sm border-base-300 bg-base-100"
          value={filters.sort_by || 'created_at'}
          onChange={(e) => set({ sort_by: e.target.value })}
          aria-label="Sort by"
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
          onChange={(e) => set({ sort_order: e.target.value })}
          aria-label="Sort order"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>

        {/* Configurable page size (requirement: pagination with configurable page size) */}
        <select
          className="select select-sm border-base-300 bg-base-100"
          value={filters.page_size || 10}
          onChange={(e) => set({ page_size: Number(e.target.value) })}
          aria-label="Items per page"
        >
          {[5, 10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-2">
          {filters.status && <StatusBadge status={filters.status} />}
          {hasFilters && withReset && (
            <button type="button" className="btn btn-ghost btn-sm gap-1 text-error" onClick={clear}>
              <HiOutlineX /> Clear filters
            </button>
          )}
          <span className="hidden items-center gap-1 text-xs opacity-60 sm:flex">
            <HiOutlineFunnel /> live filters
          </span>
        </div>
      </div>
    </div>
  );
}
