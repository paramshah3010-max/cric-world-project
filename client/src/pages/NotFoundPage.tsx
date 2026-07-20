import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="text-7xl font-black text-cyan-brand">404</p>
      <h1 className="mt-4 text-2xl font-bold text-white">Page not found</h1>
      <p className="mt-2 max-w-md text-slate-400">
        The page you&apos;re looking for has been run out. Let&apos;s get you back to the action.
      </p>
      <Link to="/" className="btn-primary mt-6">
        Back to Home
      </Link>
    </div>
  );
}
