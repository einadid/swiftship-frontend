import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineTruck,
  HiOutlineLocationMarker,
  HiOutlineChartBar,
  HiOutlinePhone,
  HiOutlineX,
  HiOutlineLogin,
  HiOutlineLogout,
} from 'react-icons/hi';
import { HiOutlineBars3, HiOutlineUserPlus, HiOutlineEnvelope } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';

const navLinkClass = ({ isActive }) =>
  `link ${isActive ? 'link-primary font-semibold' : 'link-hover opacity-80 hover:opacity-100'}`;

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const links = user
    ? [
        { to: isAdmin ? '/admin' : '/dashboard', label: isAdmin ? 'Admin Dashboard' : 'My Dashboard' },
        { to: '/track', label: 'Track Parcel' },
      ]
    : [
        { to: '/', label: 'Home' },
        { to: '/track', label: 'Track Parcel' },
      ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="navbar sticky top-0 z-40 border-b border-base-300 bg-base-100/95 shadow-sm backdrop-blur">
        <div className="navbar-start">
          <div className="flex items-center gap-2">
            <button className="btn btn-ghost btn-square btn-lg lg:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
              {mobileOpen ? <HiOutlineX className="text-2xl" /> : <HiOutlineBars3 className="text-2xl" />}
            </button>
            <Link to="/" className="flex items-center gap-2">
              <span className="brand-gradient flex h-9 w-9 items-center justify-center rounded-xl text-white shadow">
                <HiOutlineTruck className="text-2xl" />
              </span>
              <span className="text-xl font-extrabold tracking-tight">
                Swift<span className="text-brand-600">Ship</span>
              </span>
            </Link>
          </div>
        </div>

        <nav className="navbar-center hidden gap-2 lg:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={navLinkClass} end={l.to === '/'}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar-end hidden gap-2 lg:flex">
          {user ? (
            <>
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost gap-2">
                  <span className="avatar placeholder">
                    <span className="brand-gradient text-primary">
                      <span className="text-base font-bold">{user.full_name?.[0]?.toUpperCase()}</span>
                    </span>
                  </span>
                  <span className="max-w-[10rem] truncate">{user.full_name}</span>
                </div>
                <ul tabIndex={0} className="dropdown-content menu z-50 mt-2 w-56 rounded-box bg-base-100 p-2 shadow-lg">
                  <li className="menu-title opacity-70">{user.email}</li>
                  <li>
                    <Link to={isAdmin ? '/admin' : '/dashboard'}>
                      <HiOutlineChartBar /> {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
                    </Link>
                  </li>
                  <li onClick={handleLogout}>
                    <HiOutlineLogout /> Logout
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost gap-2">
                <HiOutlineLogin /> Login
              </Link>
              <Link to="/signup" className="btn brand-gradient gap-2 text-white shadow hover:opacity-90">
                <HiOutlineUserPlus /> Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="z-30 border-b border-base-300 bg-base-100 p-4 lg:hidden">
          <ul className="menu gap-1">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} onClick={closeMobile} className={navLinkClass} end={l.to === '/'}>
                  {l.label}
                </NavLink>
              </li>
            ))}
            {user ? (
              <li onClick={() => { closeMobile(); handleLogout(); }}>
                <HiOutlineLogout /> Logout ({user.full_name})
              </li>
            ) : (
              <>
                <li>
                  <Link to="/login" onClick={closeMobile}>
                    <HiOutlineLogin /> Login
                  </Link>
                </li>
                <li>
                  <Link to="/signup" onClick={closeMobile}>
                    <HiOutlineUserPlus /> Get Started
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="footer footer-center bg-base-100 p-6 text-base-content sm:footer-horizontal">
        <aside>
          <span className="text-lg font-extrabold">
            Swift<span className="text-brand-600">Ship</span>
          </span>
          <p className="max-w-xs text-sm opacity-70">
            Courier &amp; Logistics Management Platform — Phitron Final Exam SDP project (React + Tailwind + FastAPI).
          </p>
        </aside>
        <nav>
          <h6 className="footer-title">Quick Links</h6>
          <Link to="/" className="link link-hover">Home</Link>
          <Link to="/track" className="link link-hover">Track Parcel</Link>
          <Link to="/signup" className="link link-hover">Create Account</Link>
        </nav>
        <nav>
          <h6 className="footer-title">Contact</h6>
          <span className="flex items-center gap-2 text-sm"><HiOutlinePhone /> +880 1700-000000</span>
          <span className="flex items-center gap-2 text-sm"><HiOutlineEnvelope /> support@swiftship.com</span>
          <span className="flex items-center gap-2 text-sm"><HiOutlineLocationMarker /> Gulshan 2, Dhaka</span>
        </nav>
      </footer>
    </div>
  );
}
