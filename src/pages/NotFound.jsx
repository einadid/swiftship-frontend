import { Link } from 'react-router-dom';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-7xl font-extrabold text-brand-600">404</p>
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="max-w-sm text-sm opacity-70">
        The page you're looking for doesn't exist or was moved.
      </p>
      <Link to="/" className="btn btn-primary gap-2">
        <HiOutlineMagnifyingGlass /> Back to Home
      </Link>
    </div>
  );
}
