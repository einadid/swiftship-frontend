import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  HiOutlineHome,
  HiOutlineCube,
  HiOutlineShoppingBag,
  HiOutlineLocationMarker,
  HiOutlineUserGroup,
  HiOutlineChartBar,
  HiOutlineLogout,
  HiOutlineUser,
} from 'react-icons/hi';
import { HiOutlineTruck, HiOutlineBars3BottomLeft } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function useSidebarItems() {
  const { isAdmin } = useAuth();
  if (isAdmin) {
    return [
      { to: '/admin', label: 'Overview', icon: HiOutlineChartBar, end: true },
      { to: '/admin/parcels', label: 'Parcels', icon: HiOutlineCube },
      { to: '/admin/services', label: 'Services', icon: HiOutlineShoppingBag },
      { to: '/admin/users', label: 'Users', icon: HiOutlineUserGroup },
      { to: '/track', label: 'Track Parcel', icon: HiOutlineLocationMarker },
      { to: '/profile', label: 'Profile', icon: HiOutlineUser },
    ];
  }
  return [
    { to: '/dashboard', label: 'Dashboard', icon: HiOutlineHome, end: true },
    { to: '/parcels', label: 'My Parcels', icon: HiOutlineCube },
    { to: '/parcels/book', label: 'Book Parcel', icon: HiOutlineShoppingBag },
    { to: '/track', label: 'Track Parcel', icon: HiOutlineLocationMarker },
    { to: '/profile', label: 'Profile', icon: HiOutlineUser },
  ];
}

const CRUMB_LABELS = {
  dashboard: 'Dashboard',
  parcels: 'My Parcels',
  book: 'Book Parcel',
  admin: 'Admin',
  services: 'Services',
  users: 'Users',
  track: 'Track Parcel',
  profile: 'Profile',
};

/** Simple breadcrumb built from the current path. */
function Breadcrumb() {
  const { pathname } = useLocation();
  const parts = pathname.split('/').filter(Boolean);
  return (
    <nav className="hidden items-center gap-1 text-sm opacity-80 sm:flex" aria-label="Breadcrumb">
      <Link to="/" className="link link-hover inline-flex items-center gap-1">
        <HiOutlineTruck /> SwiftShip
      </Link>
      {parts.map((part, i) => (
        <span key={`${part}-${i}`} className="flex items-center gap-1">
          <span className="opacity-40">/</span>
          <span className={i === parts.length - 1 ? 'font-semibold' : ''}>
            {CRUMB_LABELS[part] || part}
          </span>
        </span>
      ))}
    </nav>
  );
}

export default function AppLayout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  // `children` is the <Outlet /> passed by the route shell
  const navigate = useNavigate();
  const items = useSidebarItems();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive ? 'brand-gradient text-white shadow' : 'hover:bg-base-200'
    }`;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6">
      {/* Top bar — always visible so mobile users can logout too */}
      <header className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-base-100 px-4 py-2 shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 md:hidden">
            <span className="brand-gradient flex h-8 w-8 items-center justify-center rounded-lg text-white">
              <HiOutlineTruck className="text-xl" />
            </span>
            <span className="font-extrabold">
              Swift<span className="text-brand-600">Ship</span>
            </span>
          </Link>
          <Breadcrumb />
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`badge badge-sm ${isAdmin ? 'badge-primary' : 'badge-ghost'} hidden sm:inline-flex`}
            title="Your role"
          >
            {isAdmin ? 'Admin' : 'User'}
          </span>
          <span className="max-w-[9rem] truncate text-sm font-medium">{user?.full_name}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-ghost btn-sm gap-1"
            title="Logout"
            aria-label="Logout"
          >
            <HiOutlineLogout /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex gap-6">
        {/* Sidebar (hidden on mobile — bottom nav bar replaces it) */}
        <aside className="sticky top-6 hidden h-fit w-56 shrink-0 flex-col gap-1 self-start md:flex">
          <p className="flex items-center gap-2 px-3 pb-2 text-xs font-bold uppercase tracking-wider opacity-50">
            <HiOutlineBars3BottomLeft /> {user?.role === 'admin' ? 'Admin Panel' : 'User Panel'}
          </p>
          {items.map((it) => (
            <NavLink key={it.to} to={it.to} end={it.end} className={linkClass}>
              <it.icon className="text-lg" />
              {it.label}
            </NavLink>
          ))}
          <div className="mt-4 border-t border-base-300 pt-3">
            <div className="flex items-center gap-3 px-3">
              <span className="avatar placeholder">
                <span className="bg-base-200 text-base-content">
                  <span className="text-base font-bold">{user?.full_name?.[0]?.toUpperCase()}</span>
                </span>
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user?.full_name}</p>
                <p className="truncate text-xs opacity-60">{user?.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-error hover:bg-error/10"
            >
              <HiOutlineLogout className="text-lg" /> Logout
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="min-w-0 flex-1 pb-20 md:pb-0">
          {children}

          {/* Mobile bottom nav */}
          <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-base-300 bg-base-100 py-2 md:hidden">
            {items.map((it) => {
              const active = it.end ? location.pathname === it.to : location.pathname.startsWith(it.to);
              return (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={it.end}
                  className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[11px] font-medium ${
                    active ? 'text-brand-700' : 'opacity-60'
                  }`}
                >
                  <it.icon className="text-xl" />
                  {it.label.replace(' Parcel', '')}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      <footer className="pb-16 text-center text-xs opacity-60 md:pb-0">
        SwiftShip · Courier &amp; Logistics Management Platform —{' '}
        <Link to="/track" className="link link-hover">
          Track a parcel
        </Link>
      </footer>
    </div>
  );
}
