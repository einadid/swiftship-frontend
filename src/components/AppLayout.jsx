import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  HiOutlineHome,
  HiOutlineCube,
  HiOutlineShoppingBag,
  HiOutlineLocationMarker,
  HiOutlineUserGroup,
  HiOutlineChartBar,
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function useSidebarItems() {
  const { isAdmin } = useAuth();
  if (isAdmin) {
    return [
      { to: '/admin', label: 'Overview', icon: HiOutlineChartBar, end: true },
      { to: '/admin/parcels', label: 'Parcels', icon: HiOutlineCube },
      { to: '/admin/services', label: 'Services', icon: HiOutlineShoppingBag },
      { to: '/admin/users', label: 'Users', icon: HiOutlineUserGroup },
      { to: '/track', label: 'Track Parcel', icon: HiOutlineLocationMarker },
    ];
  }
  return [
    { to: '/dashboard', label: 'Dashboard', icon: HiOutlineHome },
    { to: '/parcels', label: 'My Parcels', icon: HiOutlineCube },
    { to: '/parcels/book', label: 'Book Parcel', icon: HiOutlineShoppingBag },
    { to: '/track', label: 'Track Parcel', icon: HiOutlineLocationMarker },
  ];
}

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  // `children` is the <Outlet/> passed by the route shell
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
    <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6">
      {/* Sidebar (hidden on mobile — bottom nav bar replaces it) */}
      <aside className="sticky top-20 hidden h-fit w-56 shrink-0 flex-col gap-1 self-start md:flex">
        <p className="px-3 pb-2 text-xs font-bold uppercase tracking-wider opacity-50">
          {user?.role === 'admin' ? 'Admin Panel' : 'User Panel'}
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
          <button onClick={handleLogout} className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-error hover:bg-error-100">
            <HiOutlineLogout className="text-lg" /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="min-w-0 flex-1 pb-16 md:pb-0">
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
                className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-[11px] font-medium ${
                  active ? 'text-brand-700' : 'opacity-60'
                }`}
              >
                <it.icon className="text-xl" />
                {it.label}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
