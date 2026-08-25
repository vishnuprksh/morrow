'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function UpdatePasswordPage() {
  const router = useRouter(); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); setLoading(true); setError(''); const { error } = await createClient().auth.updateUser({ password }); if (error) setError(error.message); else router.push('/'); setLoading(false); }
  return <><h1>Choose a new password</h1><p className="auth-intro">Make it something only you know.</p><form className="auth-form" onSubmit={submit}><label>New password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required autoComplete="new-password" /></label>{error && <p className="auth-error" role="alert">{error}</p>}<button className="auth-submit" disabled={loading}>{loading ? 'Saving…' : 'Update password'}</button></form></>;
}
