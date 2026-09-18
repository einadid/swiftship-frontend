import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';

/** daisyUI pagination with ellipsis for large ranges. */
export default function Pagination({ page, total_pages: totalPages, onChange, className = '' }) {
  const total = Number(totalPages) || 0;
  const current = Number(page) || 1;
  if (total <= 1) return null;

  // Build a compact page list: 1 … (current-1, current, current+1) … last
  const pages = [];
  let lastWasGap = false;
  for (let p = 1; p <= total; p++) {
    const visible = p === 1 || p === total || Math.abs(p - current) <= 1;
    if (visible) {
      pages.push(p);
      lastWasGap = false;
    } else if (!lastWasGap) {
      pages.push({ key: `gap-${p}`, gap: true });
      lastWasGap = true;
    }
  }

  const go = (p) => {
    if (p >= 1 && p <= total && p !== current) onChange(p);
  };

  return (
    <nav className={`join ${className}`} aria-label="Pagination">
      <button
        type="button"
        className="join-item btn btn-sm"
        disabled={current <= 1}
        onClick={() => go(current - 1)}
        aria-label="Previous page"
      >
        <HiOutlineChevronLeft />
      </button>
      {pages.map((p) =>
        p.gap ? (
          <span key={p.key} className="join-item btn btn-sm btn-disabled pointer-events-none">
            …
          </span>
        ) : (
          <button
            type="button"
            key={p}
            className={`join-item btn btn-sm ${p === current ? 'btn-primary' : ''}`}
            onClick={() => go(p)}
            aria-current={p === current ? 'page' : undefined}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        className="join-item btn btn-sm"
        disabled={current >= total}
        onClick={() => go(current + 1)}
        aria-label="Next page"
      >
        <HiOutlineChevronRight />
      </button>
    </nav>
  );
}
