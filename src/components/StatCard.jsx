import { HiOutlineTrendingUp } from 'react-icons/hi';

const TONES = {
  brand: 'bg-brand-50 text-brand-700',
  green: 'bg-green-50 text-green-700',
  amber: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-700',
  blue: 'bg-sky-50 text-sky-700',
  purple: 'bg-purple-50 text-purple-700',
};

export default function StatCard({ icon: Icon, label, value, tone = 'brand', hint }) {
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body flex-row items-center gap-4 p-5">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${TONES[tone] || TONES.brand}`}>
          {Icon ? <Icon className="text-2xl" /> : <HiOutlineTrendingUp className="text-2xl" />}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium opacity-70">{label}</p>
          <p className="truncate text-2xl font-extrabold">{value}</p>
          {hint && <p className="truncate text-xs opacity-60">{hint}</p>}
        </div>
      </div>
    </div>
  );
}
