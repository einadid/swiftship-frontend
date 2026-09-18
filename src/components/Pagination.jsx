import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';

/** daisyUI pagination with ellipsis for large ranges */
export default function Pagination({ page, total_pages: totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const pages = [];
  const add = (p) => pages.push(p);
  const gap = (key) => pages.push({ key, gap: true });

  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) add(p);
    else if (pages[pages.length - 1]?.value !== 'gap') gap(`gap-${p}`);
  }

  const go = (p) => {
    if (p >= 1 && p <= totalPages && p !== page) onChange(p);
  };

  return (
    <div className="join mt-6">
      <button className="join-item btn btn-sm" disabled={page <= 1} onClick={() => go(page - 1)} aria-label="Previous page">
        <HiOutlineChevronLeft />
      </button>
      {pages.map((p) =>
        p.gap ? (
          <span key={p.key} className="join-item btn btn-sm btn-disabled pointer-events-none">
            …
          </span>
        ) : (
          <button
            key={p}
            className={`join-item btn btn-sm ${p === page ? 'btn-primary' : ''}`}
            onClick={() => go(p)}
          >
            {p}
          </button>
        ),
      )}
      <button className="join-item btn btn-sm" disabled={page >= totalPages} onClick={() => go(page + 1)} aria-label="Next page">
        <HiOutlineChevronRight />
      </button>
    </div>
  );
}
