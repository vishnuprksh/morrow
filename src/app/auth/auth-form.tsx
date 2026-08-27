'use client';

import { FormEvent, useState } from 'react';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError(null); setMessage(null);
    let result;
    try {
      const supabase = createClient();
      result = mode === 'sign-in'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { data: { display_name: displayName } } });
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Authentication is unavailable.');
      setLoading(false);
      return;
    }
    if (result.error) setError(result.error.message);
    else if (mode === 'sign-up' && !result.data.session) setMessage('Check your email to confirm your account.');
    else router.push('/');
    setLoading(false);
  }

  return <form className="auth-form" onSubmit={submit}>
    {mode === 'sign-up' && <label>Display name<input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required autoComplete="name" placeholder="How should we call you?" /></label>}
    <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="you@example.com" /></label>
    <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} placeholder="At least 6 characters" /></label>
    {error && <p className="auth-error" role="alert">{error}</p>}{message && <p className="auth-message">{message}</p>}
    <button className="auth-submit" disabled={loading}>{loading ? 'Please wait…' : <>{mode === 'sign-in' ? 'Sign in to Morrow' : 'Create account'} <ArrowRight size={15} /></>}</button>
    <p className="auth-security"><LockKeyhole size={13} /> Your notes stay private to your account.</p>
    <p className="auth-switch">{mode === 'sign-in' ? <>New to Morrow? <Link href="/auth/sign-up">Create an account</Link></> : <>Already have an account? <Link href="/auth/sign-in">Sign in</Link></>}</p>
    {mode === 'sign-in' && <Link className="auth-link" href="/auth/forgot-password">Forgot your password?</Link>}
  </form>;
}

export function SignOutButton() {
  return <button className="sign-out" onClick={async () => { await createClient().auth.signOut(); window.history.pushState({}, '', '/auth/sign-in'); window.location.reload(); }}>Sign out</button>;
}
