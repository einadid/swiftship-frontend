# SwiftShip — Frontend (React + Tailwind)

Courier & Logistics Management Platform — frontend for the Phitron Final Exam SDP project.

> 👉 **Backend-এ কী কী পরিবর্তন করতে হবে:** [`BACKEND_INTEGRATION.md`](./BACKEND_INTEGRATION.md)
> (endpoint contract, JWT/response shapes, seed data, route-order trap, copy-paste FastAPI snippets + curl checklist)

## Stack (as required by the exam)

- **React 18** + Vite
- **React Router** (protected + role-based routes)
- **Tailwind CSS** + **DaisyUI**
- **React Icons**
- **React Hot Toast** (success/error feedback)
- `fetch`-based API client with JWT storage + automatic token refresh

## Run (dev)

```bash
cd frontend
npm install
npm run dev
```

- App: `http://localhost:5173`
- The dev server proxies `/api/*` → `http://127.0.0.1:8000` (see `vite.config.js`),
  so **start the backend first**. Change the target with
  `VITE_PROXY_TARGET=http://127.0.0.1:9000 npm run dev`.

## Build (deploy)

```bash
npm run build     # outputs dist/
npm run preview   # local preview of the production build
```

Deploy `dist/` to Netlify/Vercel and set:

```
VITE_API_URL = https://<your-backend-host>/api
```

`public/_redirects` (`/* /index.html 200`) already handles SPA deep links on Netlify;
for Vercel add the same rewrite.

## Pages & routes

| Route | Access | What it shows |
|---|---|---|
| `/` | public | Landing page (hero, features, how-it-works) |
| `/login`, `/signup` | public | Auth (JWT) + client-side validation + demo-credential quick fill |
| `/forgot-password`, `/reset-password?token=…` | public | Password recovery flow |
| `/track` | public | Track any parcel by tracking number (timeline UI, auto-tracks from router state) |
| `/dashboard` | user | Personal stats + recent parcels |
| `/parcels` | user | My parcels — search / filter / sort / page-size / pagination, edit + delete while pending |
| `/parcels/book` | user | Booking form with live price estimate |
| `/admin` | admin | Analytics: totals, revenue, status breakdown, latest bookings |
| `/admin/parcels` | admin | Full CRUD + inline status-pipeline management |
| `/admin/services` | admin | Delivery-services catalog CRUD |
| `/admin/users` | admin | User list, block/unblock, password reset |

## Project structure

```
frontend/src/
├── api/client.js            # fetch wrapper: JWT storage, auto-refresh, error normalisation
├── context/AuthContext.jsx  # auth state (login/signup/logout/refresh user, boot-time token refresh)
├── components/
│   ├── Layout.jsx           # public navbar + footer
│   ├── AppLayout.jsx        # authenticated shell: top bar, breadcrumb, sidebar, mobile bottom nav, footer
│   ├── ProtectedRoute.jsx   # auth + role gate
│   ├── FiltersBar.jsx       # reusable search/filter/sort/page-size bar
│   ├── Pagination.jsx       # reusable pagination (configurable page size, gaps)
│   ├── Modal.jsx            # reusable always-open modal (+ Esc/backdrop close)
│   ├── ConfirmModal.jsx     # confirmation dialog for destructive actions
│   ├── StatCard.jsx / Badge.jsx / FullPageSpinner.jsx (spinner + ErrorBox + EmptyState)
│   ├── ParcelForm.jsx       # book/edit parcel (validation + price estimate)
│   └── ServiceForm.jsx      # create/edit service (validation)
└── pages/
    ├── Home, Login, Signup, ForgotPassword, ResetPassword, TrackPage, NotFound
    ├── user/  (Dashboard, MyParcels, BookParcel)
    └── admin/ (AdminDashboard, AdminParcels, AdminServices, AdminUsers)
```

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@swiftship.com` | `Admin@123` |
| User | `user@swiftship.com` | `User@123` |

Try public tracking with: `SS20260001DEMO`

(These values are also required by the backend seed — see `BACKEND_INTEGRATION.md` § 8.)

## Bug fixes in this revision

The site was crashing/behaving badly on several pages; all of the following are fixed:

1. **`StatusBadge is not defined` crash** on **My Parcels** and **All Parcels** (the whole page went blank) — `FiltersBar` used `<StatusBadge>` without importing it.
2. **A permanent "Loading…" spinner** was rendered at the bottom of every page (stray `<FullPageSpinner/>` in `App.jsx`).
3. **Session loss on refresh** — a stored refresh token was ignored on boot, so a reload logged the user out. Now the access token is silently refreshed (`ensureFreshToken`).
4. **Pagination rendered dozens of `…` buttons** — the gap detection logic never matched.
5. **Modals could silently disappear** — native `<dialog open>` + `<form method="dialog">` closed itself on submit. Replaced by `Modal.jsx` (`div.modal.modal-open`, Esc/backdrop close, sticky state).
6. **"Track" button in My Parcels did nothing** — router state was ignored; `TrackPage` now auto-searches.
7. **Admin parcels page logged `destroy is not a function`** — an effect returned a promise (`useEffect(() => loadServices())`).
8. **No way to logout on mobile** — added a top bar (brand, breadcrumb, role badge, logout) to the authenticated area.
9. **Missing `.status-dot` CSS class** — status dots and the hero card dot were invisible.
10. **Invalid Tailwind class** `hover:bg-error-100` → `hover:bg-error/10`.
11. **404 page had no navbar/footer** — the catch-all route now lives inside `Layout`.
12. Added features to cover the rubric: **configurable page size** (5/10/20/50), **edit pending parcels** (user CRUD), **demo-credential quick fill** on login, **retry buttons** on error states, aria-labels on every icon button, and scroll-to-top on navigation.

## Verification

Every route was exercised end-to-end (guest / user / admin) against an in-memory
implementation of the API contract in `BACKEND_INTEGRATION.md`, covering: render of all 13
routes, search/filter/sort/pagination, create-edit-delete parcel, service CRUD, user
block/reset, public tracking, both role guards and boot-time token refresh.
It now passes 18/18 scenarios with zero console errors (before the fixes, the two listing
pages crashed with `StatusBadge is not defined`).
