'use client';

import Link from 'next/link';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  useEffect(() => { const saved = localStorage.getItem('morrow-theme') as 'light' | 'dark' | null; document.documentElement.dataset.theme = saved ?? 'light'; }, []);
  function changeTheme(next: 'light' | 'dark') { setTheme(next); localStorage.setItem('morrow-theme', next); document.documentElement.dataset.theme = next; }
  return <main className="settings-page"><Link className="settings-back" href="/"><ArrowLeft size={16} /> Back to workspace</Link><section className="settings-page-card"><p className="eyebrow">Workspace preferences</p><h1>Settings</h1><p className="settings-page-intro">Shape your Morrow workspace to feel comfortable while you write.</p><div className="settings-section"><h2>Appearance</h2><p>Choose the color theme used across the app.</p><div className="theme-options"><button className={theme === 'light' ? 'theme-option selected' : 'theme-option'} onClick={() => changeTheme('light')}><Sun size={18} /><span><strong>Light</strong><small>Warm paper and soft neutrals</small></span></button><button className={theme === 'dark' ? 'theme-option selected' : 'theme-option'} onClick={() => changeTheme('dark')}><Moon size={18} /><span><strong>Dark</strong><small>Low-glare colors for focused writing</small></span></button></div></div></section></main>;
}