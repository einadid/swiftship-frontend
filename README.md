# SwiftShip Frontend - Courier & Logistics Platform

SwiftShip e user parcel book, nijer parcel list dekhte, track korte pare. Admin full platform control kore.

### Tech Stack
- React 18 + Vite
- React Router, Tailwind CSS + DaisyUI
- React Icons, React Hot Toast
- JWT + auto refresh

### Pages & Features
- Public: Home, Login, Signup, Forgot/Reset Password, Track Parcel (SS20260001DEMO)
- User: Dashboard (stats), My Parcels (search/filter/sort/pagination), Book Parcel, Profile + Change Password
- Admin: Overview (analytics), All Parcels (status pipeline), Services CRUD, Users (block/unblock, reset password)

### Key Features
- Protected Routes (admin vs user)
- JWT auto refresh on 401
- Search, Filter by status/service/date, Sorting, Configurable page size
- Loading, Error (retry), Empty states
- Responsive - Mobile bottom nav, Desktop sidebar
- Toast feedback, Confirmation modal

### Run Locally
```bash
cd frontend
npm install
npm run dev