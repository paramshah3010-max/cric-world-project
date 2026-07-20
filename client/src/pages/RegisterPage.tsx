import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container-page flex min-h-[80vh] items-center justify-center py-12">
      <div className="card w-full max-w-md p-8 animate-fade-up">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Logo />
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-sm text-slate-400">Join CRIC WORLD and never miss a moment.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Full name" type="text" value={name} onChange={setName} />
          <Field label="Email" type="email" value={email} onChange={setEmail} />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            hint="At least 6 characters"
          />
          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-cyan-brand hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  hint,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-300">{label}</span>
      <input
        type={type}
        value={value}
        required
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-charcoal-600 bg-charcoal-900 px-4 py-2.5 text-white outline-none transition focus:border-cyan-brand focus:ring-2 focus:ring-cyan-brand/40"
      />
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}
