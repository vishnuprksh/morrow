import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <main className="auth-page"><section className="auth-card"><Link href="/auth/sign-in" className="auth-brand"><span className="brand-mark"><Sparkles size={15} /></span>Morrow</Link><p className="auth-eyebrow">A quiet place for ideas</p>{children}</section></main>;
}
