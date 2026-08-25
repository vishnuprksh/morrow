'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState(''); const [message, setMessage] = useState(''); const [error, setError] = useState('');
  async function submit(event: FormEvent) { event.preventDefault(); setError(''); setMessage(''); const { error } = await createClient().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/update-password` }); if (error) setError(error.message); else setMessage('If an account exists, a reset link is on its way.'); }
  return <><h1>Reset your password</h1><p className="auth-intro">We’ll email you a secure reset link.</p><form className="auth-form" onSubmit={submit}><label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>{error && <p className="auth-error" role="alert">{error}</p>}{message && <p className="auth-message">{message}</p>}<button className="auth-submit">Send reset link</button><Link className="auth-link" href="/auth/sign-in">Back to sign in</Link></form></>;
}
