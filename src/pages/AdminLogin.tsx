import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) navigate('/admin/dashboard', { replace: true });
    });
    return () => { active = false; };
  }, [navigate]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase || busy) return;
    setBusy(true);
    setError('');
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) setError('Email or password is incorrect. Please try again.');
      else navigate('/admin/dashboard', { replace: true });
    } catch {
      setError('Could not connect to Supabase. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-page">
      <section className="admin-card login-card" aria-labelledby="login-title">
        <Link to="/" className="admin-back"><span aria-hidden="true">←</span> Back to portfolio</Link>
        <div className="login-mark" aria-hidden="true">✳</div>
        <p className="login-eyebrow">PRIVATE WORKSPACE</p>
        <h1 id="login-title">Welcome back</h1>
        <p className="login-intro">Sign in to manage your portfolio content.</p>

        {!isSupabaseConfigured ? (
          <div className="admin-setup" role="alert">
            <p>Supabase isn’t connected. Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your local <code>.env</code> file, then restart the dev server.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="admin-form login-form">
            <label htmlFor="admin-email">Email address</label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
            />

            <div className="login-password-label">
              <label htmlFor="admin-password">Password</label>
            </div>
            <div className="login-password-wrap">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((shown) => !shown)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                disabled={busy}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {error && <p className="admin-error login-error" role="alert">{error}</p>}
            <button className="primary-action login-submit" type="submit" disabled={busy}>
              <span>{busy ? 'Signing in…' : 'Sign in securely'}</span>
              <span aria-hidden="true">{busy ? '···' : '↗'}</span>
            </button>
            <p className="admin-hint login-hint">Use the admin account created in Supabase → Authentication → Users.</p>
          </form>
        )}
      </section>
    </main>
  );
}
