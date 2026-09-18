import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineTruck,
  HiOutlineShoppingBag,
  HiOutlineShieldCheck,
  HiOutlineClock,
  HiOutlineCurrencyRupee,
  HiOutlineCheckCircle,
  HiOutlineCube,
  HiOutlineLocationMarker,
} from 'react-icons/hi';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import { HiOutlineArrowRight as Arrow } from 'react-icons/hi2';

const FEATURES = [
  { icon: HiOutlineShoppingBag, title: 'Book in Seconds', text: 'Create a shipment with sender, recipient, weight and service — price is calculated instantly.' },
  { icon: HiOutlineSearch, title: 'Live Tracking', text: 'Every parcel gets a unique tracking number. Anyone can follow it from booking to doorstep.' },
  { icon: HiOutlineTruck, title: 'Smart Status Pipeline', text: 'Pending → Picked up → In transit → Out for delivery → Delivered. Full visibility for admins and senders.' },
  { icon: HiOutlineCurrencyRupee, title: 'Transparent Pricing', text: 'Base fee + per-kg rate per service. No surprises — you see the cost before you confirm.' },
  { icon: HiOutlineShieldCheck, title: 'Secure by Design', text: 'JWT authentication with bcrypt-hashed passwords, role-based access and protected routes.' },
  { icon: HiOutlineClock, title: 'Flexible Services', text: 'Standard, Express, Same-Day and International delivery — admins manage the catalog.' },
];

const STEPS = [
  { icon: HiOutlineCube, title: '1 · Book', text: 'Sign up and book a parcel — pick a service, enter addresses and weight.' },
  { icon: HiOutlineTruck, title: '2 · Ship', text: 'Our team picks up, scans and moves your parcel through the status pipeline.' },
  { icon: HiOutlineLocationMarker, title: '3 · Track & Receive', text: 'Track live with your tracking number until it lands at the doorstep.' },
];

export default function Home() {
  const { isAuthed, isAdmin } = useAuth();
  const navigate = useNavigate();
  return (
    <div>
      {/* Hero */}
      <section className="brand-gradient text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="mb-3 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              Courier &amp; Logistics Management Platform
            </p>
            <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
              Ship anything.
              <br />
              Track everything.
            </h1>
            <p className="mt-4 max-w-md text-base opacity-90 md:text-lg">
              SwiftShip is a full-stack parcel delivery platform — book shipments, manage delivery status and
              track parcels in real time.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {isAuthed ? (
                <button
                  className="btn btn-lg gap-2 bg-white font-semibold text-brand-700 hover:bg-white/90"
                  onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}
                >
                  Go to Dashboard <Arrow />
                </button>
              ) : (
                <Link to="/signup" className="btn btn-lg gap-2 bg-white font-semibold text-brand-700 hover:bg-white/90">
                  Get Started Free <Arrow />
                </Link>
              )}
              <Link to="/track" className="btn btn-lg btn-outline btn-info gap-2">
                <HiOutlineMagnifyingGlass /> Track a Parcel
              </Link>
            </div>
          </div>
          <div className="hidden justify-center md:flex">
            <div className="card w-80 rotate-2 border-0 bg-white/95 shadow-2xl">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <h2 className="card-title text-base-content">SS20260001DEMO</h2>
                  <span className="badge badge-success badge-sm gap-1">
                    <span className="status-dot" /> Delivered
                  </span>
                </div>
                <p className="text-sm text-base-content/70">
                  <HiOutlineLocation className="inline" /> Dhanmondi, Dhaka → Uttara, Dhaka
                </p>
                <progress className="progress progress-success mt-2 w-full" value="100" max="100" />
                <p className="mt-1 text-xs opacity-60">Booked 2 days ago · Delivered today, 11:42 AM</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-b border-base-300 bg-base-100">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-8 text-center md:grid-cols-4">
          {[
            ['4', 'Delivery services'],
            ['6', 'Status stages tracked'],
            ['8', 'Divisions covered'],
            ['24/7', 'Tracking available'],
          ].map(([v, l]) => (
            <div key={l}>
              <p className="text-3xl font-extrabold text-brand-700">{v}</p>
              <p className="text-sm opacity-70">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-center text-3xl font-extrabold">Why SwiftShip?</h2>
        <p className="mx-auto mt-2 max-w-xl text-center opacity-70">
          Everything a modern logistics platform needs — built for the Phitron final exam with React, Tailwind
          CSS and FastAPI.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card bg-base-100 shadow-sm transition hover:shadow-md">
              <div className="card-body">
                <span className="brand-gradient mb-1 flex h-11 w-11 items-center justify-center rounded-xl text-white">
                  <f.icon className="text-2xl" />
                </span>
                <h3 className="card-title">{f.title}</h3>
                <p className="text-sm opacity-70">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-base-100 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-3xl font-extrabold">How it works</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.title} className="flex gap-4 rounded-2xl border border-base-300 bg-base-200/50 p-5">
                <s.icon className="mt-1 shrink-0 text-3xl text-brand-600" />
                <div>
                  <h3 className="font-bold">{s.title}</h3>
                  <p className="mt-1 text-sm opacity-70">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 text-center">
        <HiOutlineCheckCircle className="mx-auto text-5xl text-brand-600" />
        <h2 className="mt-4 text-3xl font-extrabold">Ready to ship?</h2>
        <p className="mx-auto mt-2 max-w-md opacity-70">
          Create an account in under a minute and book your first parcel today.
        </p>
        <Link to="/signup" className="btn btn-lg brand-gradient mt-6 gap-2 font-semibold text-white shadow hover:opacity-90">
          Create Account <HiOutlineArrowRight />
        </Link>
      </section>
    </div>
  );
}
