'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Bug,
  Lock,
  Target,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

// --- Config ------------------------------------------------------------------
const PROGRESS_KEY = 'ethical-week-2:start';

const SECTIONS = [
  { id: 'welcome', label: 'Welcome & Orientation' },
  { id: 'prompt-injection', label: 'Prompt Injection & Exfiltration' },
  { id: 'pii', label: 'PII, Redaction & Logging' },
  { id: 'evals', label: 'Red‑teaming & Quick Evals' },
  { id: 'next', label: 'Next Steps' },
];

// --- Utilities ---------------------------------------------------------------
function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}

function Box({
  tone,
  title,
  children,
}: {
  tone: 'tip' | 'warn' | 'pro';
  title: string;
  children: any;
}) {
  const palette = {
    tip: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    warn: 'border-amber-200 bg-amber-50 text-amber-900',
    pro: 'border-sky-200 bg-sky-50 text-sky-900',
  }[tone];
  const icon =
    tone === 'tip' ? <Lightbulb className="h-4 w-4" /> :
    tone === 'warn' ? <AlertTriangle className="h-4 w-4" /> :
    <CheckCircle2 className="h-4 w-4" />;
  return (
    <div className={cx('rounded-xl border p-3 md:p-4 flex gap-3 items-start', palette)}>
      <div className="mt-0.5">{icon}</div>
      <div className="min-w-0 break-words">
        <div className="font-medium mb-1">{title}</div>
        <div className="text-sm md:text-[0.95rem] leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

// --- Page --------------------------------------------------------------------
export default function EthicalAIWeek2Page() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user ?? null);

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, full_name')
          .eq('id', user.id)
          .single();
        setProfile(profile ?? null);

        const { data } = await supabase
          .from('tracking')
          .select('completed')
          .eq('user_id', user.id)
          .eq('key', PROGRESS_KEY)
          .maybeSingle();
        setCompleted(Boolean(data?.completed));
      }
      setLoading(false);
    };
    run();
  }, []);

  const username = useMemo(
    () => profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'Learner',
    [profile, user]
  );

  const markComplete = async () => {
    if (!user) return alert('Please sign in to save your progress.');
    const { error } = await supabase
      .from('tracking')
      .upsert(
        { user_id: user.id, key: PROGRESS_KEY, completed: true, completed_at: new Date().toISOString() },
        { onConflict: 'user_id,key' }
      );
    if (error) {
      console.error(error);
      alert('Could not save progress.');
    } else {
      setCompleted(true);
    }
  };

  // Scrollspy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '0px 0px -70% 0px', threshold: [0, 1] }
    );
    const els = SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean) as Element[];
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-100 backdrop-blur bg-white/70">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span className="font-bold">Week 2 • Ethical AI in Practice</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200"
              onClick={() => setSidebarOpen(v => !v)}
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              Contents
            </button>
            <div className="text-sm text-gray-600">
              {loading ? 'Loading…' : user ? `Signed in as ${username}` : <Link href="/signin" className="underline">Sign in</Link>}
            </div>
          </div>
        </div>
      </header>

      {/* Layout */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6">
        {/* Sidebar */}
        <aside
          className={cx(
            'lg:sticky lg:top-[72px] lg:h-[calc(100vh-88px)] lg:overflow-auto',
            'rounded-2xl border border-gray-200 bg-white p-4 shadow-sm',
            sidebarOpen ? '' : 'hidden lg:block'
          )}
        >
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">On this page</p>
          <nav className="space-y-1">
            {SECTIONS.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={cx(
                  'block px-3 py-2 rounded-lg text-sm',
                  activeId === s.id ? 'bg-green-50 text-green-800' : 'hover:bg-gray-50 text-gray-700'
                )}
              >
                {s.label}
              </a>
            ))}
          </nav>
          <div className="mt-6 p-3 rounded-xl bg-gray-50 text-xs text-gray-600">
            Injection • PII • Evals — practical safeguards you’ll actually ship.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-8">
          {/* Welcome & Orientation */}
          <section id="welcome" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Welcome{user ? `, ${username}` : ''}</h1>
            <p className="text-lg text-gray-700">
              You’ve set the foundation. Now we’ll turn principles into protections. This week focuses on the
              most common failure points—prompt‑level attacks, mishandled personal data, and unnoticed regressions—
              and shows how to address them in small, shippable steps.
            </p>
            <Box tone="tip" title="Your outcomes">
              <ul className="list-disc pl-5 space-y-1">
                <li>A clear pattern for handling prompt injection and data‑exfil attempts.</li>
                <li>Server‑side PII redaction and logging hygiene you can keep using as you scale.</li>
                <li>A lightweight red‑team set and a quick evaluation loop to spot regressions early.</li>
              </ul>
            </Box>
          </section>

          {/* Prompt Injection & Exfiltration */}
          <section id="prompt-injection" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Bug className="h-5 w-5 text-green-600" /> Prompt Injection & Data Exfiltration
            </h2>
            <p className="text-gray-700">
              Prompt injection tries to override your rules. Exfiltration aims to leak secrets or private data.
              Your best defense is separation of concerns and strict server checks—keep policy and capabilities out of
              reach from user‑supplied content.
            </p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li><span className="font-medium">Isolate policy</span>: system rules live outside user text; don’t let content rewrite them.</li>
              <li><span className="font-medium">Gate tools</span>: verify arguments (types, ranges), enforce roles, require justification.</li>
              <li><span className="font-medium">Treat RAG as untrusted</span>: annotate retrieved text and ignore any “instructions” inside it.</li>
            </ul>
            <Box tone="pro" title="What this unlocks">
              A predictable refusal style for unsafe requests and auditable records of why a tool call was allowed or blocked.
            </Box>
          </section>

          {/* PII, Redaction & Logging */}
          <section id="pii" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Lock className="h-5 w-5 text-green-600" /> PII Handling, Redaction & Logging Hygiene
            </h2>
            <p className="text-gray-700">
              Handle the smallest amount of personal data possible. Redact before calling the model and before anything
              touches your logs. Keep what you store brief, structured, and time‑limited.
            </p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li><span className="font-medium">Minimize</span>: collect only what’s needed for the task at hand.</li>
              <li><span className="font-medium">Redact server‑side</span>: mask emails, phones, card‑like numbers, and IDs.</li>
              <li><span className="font-medium">Log safely</span>: avoid raw prompts; hash IDs; define retention and rotate access.</li>
            </ul>
            <Box tone="warn" title="Easy mistake to avoid">
              Client‑side redaction isn’t enough. Always enforce redaction and logging hygiene on the server boundary.
            </Box>
          </section>

          {/* Red‑teaming & Quick Evals */}
          <section id="evals" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" /> Red‑teaming & Quick Safety Evals
            </h2>
            <p className="text-gray-700">
              A tiny, focused test set gives you an early alarm when behavior drifts. Mix risky, benign, and edge‑case
              prompts, define expected outcomes, and surface the score where your team will see it.
            </p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Start with 10–20 prompts mapped to your policy’s allow/refuse boundaries.</li>
              <li>Track a single number (e.g., alignment %) so trends are easy to spot.</li>
              <li>Run locally and in CI; post results in the same channel as feature checks.</li>
            </ul>
            <Box tone="tip" title="Keep it lightweight">
              Short, repeatable checks beat heavyweight frameworks. If it runs fast, you’ll run it often.
            </Box>
          </section>

          {/* Next Steps */}
          <section id="next" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Next Steps</h2>
            <p className="text-gray-700 mb-4">
              Move through the topics in order: start with prompt injection and exfiltration, add PII redaction and
              logging hygiene, then set up quick evals to make safety visible. Keep each change small and testable.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Previous */}
              <Link
                href="/learn/ethical-ai/beginner/week1/next-steps"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Link>

              {/* Mark Complete */}
              <button
                onClick={markComplete}
                className={cx(
                  'px-4 py-2 rounded-lg border',
                  completed ? 'border-green-200 bg-green-50 text-green-800' : 'border-gray-200 hover:bg-gray-50'
                )}
              >
                {completed ? 'Progress saved ✓' : 'Mark page complete'}
              </button>

              {/* Next (route to the first Week 2 topic) */}
              <Link
                href="/learn/ethical-ai/beginner/week2/prompt-injection"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow"
                onClick={async () => { if (!completed) await markComplete(); }}
              >
                Begin Topic 1 <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
