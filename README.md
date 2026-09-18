# SwiftShip — Frontend (React + Tailwind)

Courier & Logistics Management Platform — frontend for the Phitron Final Exam SDP project.

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
- The dev server proxies `/api/*` → `http://localhost:8000` (see `vite.config.js`),
  so **start the backend first** (`../backend` README).

## Build (deploy)

```bash
npm run build     # outputs dist/
npm run preview   # local preview of the production build
```

Deploy `dist/` to Netlify/Vercel and set:

```
VITE_API_URL = https://<your-backend-host>/api
```

## Pages & routes

| Route | Access | What it shows |
|---|---|---|
| `/` | public | Landing page (hero, features, how-it-works) |
| `/login`, `/signup` | public | Auth (JWT) + client-side validation |
| `/forgot-password`, `/reset-password?token=…` | public | Password recovery flow |
| `/track` | public | Track any parcel by tracking number (timeline UI) |
| `/dashboard` | user | Personal stats + recent parcels |
| `/parcels` | user | My parcels — search / filter / sort / pagination, delete while pending |
| `/parcels/book` | user | Booking form with live price estimate |
| `/admin` | admin | Analytics: totals, revenue, status breakdown, latest bookings |
| `/admin/parcels` | admin | Full CRUD + inline status-pipeline management |
| `/admin/services` | admin | Delivery-services catalog CRUD |
| `/admin/users` | admin | User list, block/unblock, password reset |

## Project structure

```
frontend/src/
├── api/client.js            # fetch wrapper: JWT storage, auto-refresh, error normalisation
├── context/AuthContext.jsx  # auth state (login/signup/logout/refresh user)
├── components/
│   ├── Layout.jsx           # public navbar + footer
│   ├── AppLayout.jsx        # authenticated sidebar (role-based) + mobile bottom nav
│   ├── ProtectedRoute.jsx   # auth + role gate
│   ├── FiltersBar.jsx       # reusable search/filter/sort bar
│   ├── Pagination.jsx       # reusable pagination (configurable)
│   ├── StatCard.jsx / Badge.jsx / ConfirmModal.jsx / FullPageSpinner.jsx
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
"# swiftship-frontend" 
