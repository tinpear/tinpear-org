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
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

// --- Config ------------------------------------------------------------------
const PROGRESS_KEY = 'ethical-week-1:start';

const SECTIONS = [
  { id: 'welcome', label: 'Welcome & Goals' },
  { id: 'principles', label: 'Responsible AI Principles' },
  { id: 'why-it-matters', label: 'Why It Matters' },
  { id: 'threat-modeling', label: 'Threat Modeling (LLMs)' },
  { id: 'privacy', label: 'Privacy & PII' },
  { id: 'policies-prompts', label: 'Safety Policies & System Prompts' },
  { id: 'evaluation', label: 'Quick Safety Evaluation' },
  { id: 'next', label: 'Next Steps' },
];

// --- Utilities ---------------------------------------------------------------
function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}

function Box({ tone, title, children }: { tone: 'tip' | 'warn' | 'pro'; title: string; children: any }) {
  const palette = {
    tip: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    warn: 'border-amber-200 bg-amber-50 text-amber-900',
    pro: 'border-sky-200 bg-sky-50 text-sky-900',
  }[tone];
  const icon =
    tone === 'tip' ? <Lightbulb className="h-4 w-4" /> :
    tone === 'warn' ? <AlertTriangle className="h-4 w-4" /> :
    <ShieldCheck className="h-4 w-4" />;
  return (
    <div className={cx('rounded-xl border p-3 md:p-4 flex gap-3 items-start', palette)}>
      <div className="mt-0.5">{icon}</div>
      <div>
        <div className="font-medium mb-1">{title}</div>
        <div className="text-sm md:text-[0.95rem] leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

// --- Page --------------------------------------------------------------------
export default function EthicalAIWeek1Start() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const username = useMemo(() =>
    profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'Learner'
  , [profile, user]);

  const markComplete = async () => {
    if (!user) return alert('Please sign in to save your progress.');
    const { error } = await supabase
      .from('tracking')
      .upsert({
        user_id: user.id,
        key: PROGRESS_KEY,
        completed: true,
        completed_at: new Date().toISOString(),
      }, { onConflict: 'user_id,key' });
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
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white"><ShieldCheck className="h-4 w-4"/></span>
            <span className="font-bold">Week 1 • Ethical AI & Safety</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="lg:hidden inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200"
              onClick={() => setSidebarOpen(v => !v)}>
              {sidebarOpen ? <X className="h-4 w-4"/> : <Menu className="h-4 w-4"/>}
              Contents
            </button>
            <div className="text-sm text-gray-600">
              {loading ? 'Loading…' : user ? `Signed in as ${username}` : <Link href="/signin" className="underline">Sign in</Link>}
            </div>
          </div>
        </div>
      </header>

      {/* Content area */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6">
        {/* Sidebar */}
        <aside className={cx(
          'lg:sticky lg:top-[72px] lg:h-[calc(100vh-88px)] lg:overflow-auto',
          'rounded-2xl border border-gray-200 bg-white p-4 shadow-sm',
          sidebarOpen ? '' : 'hidden lg:block'
        )}>
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">On this page</p>
          <nav className="space-y-1">
            {SECTIONS.map(s => (
              <a key={s.id} href={`#${s.id}`} className={cx(
                'block px-3 py-2 rounded-lg text-sm',
                activeId === s.id
                  ? 'bg-green-50 text-green-800'
                  : 'hover:bg-gray-50 text-gray-700'
              )}>{s.label}</a>
            ))}
          </nav>
          <div className="mt-6 p-3 rounded-xl bg-gray-50 text-xs text-gray-600">
            Safety by design → user trust.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-8">
          <section id="welcome" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Welcome{user ? `, ${username}` : ''} </h1>
            <p className="text-lg text-gray-700">This week is your launchpad into building AI people can trust. You’ll turn high‑level ethics into tangible safeguards that ship with your product.</p>
            <Box tone="tip" title="Make it practical">
              We’ll translate principles into prompts, policies, and privacy hygiene—plus a tiny eval suite—to give you momentum fast.
            </Box>
          </section>

          <section id="principles" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Responsible AI Principles</h2>
            <p className="text-gray-700">Fairness, transparency, and accountability (FTA) are your north star. Here’s how they map to day‑to‑day builds:</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li><span className="font-medium">Fairness</span> → measure disparate impact; balance datasets; review heuristics.</li>
              <li><span className="font-medium">Transparency</span> → communicate capabilities/limits; add inline explanations; version prompts.</li>
              <li><span className="font-medium">Accountability</span> → define owners; log decisions; set escalation paths.</li>
            </ul>
            <Box tone="pro" title="Ship it mindset">
              Pick <span className="font-medium">one</span> fairness metric, <span className="font-medium">one</span> transparency UI tweak, and <span className="font-medium">one</span> accountability action to implement this week.
            </Box>
          </section>

          <section id="why-it-matters" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Why It Matters</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Reduce harmful outputs and legal/compliance risk.</li>
              <li>Boost user trust → higher retention and adoption.</li>
              <li>Catch regressions early as you iterate and scale.</li>
            </ul>
            <Box tone="tip" title="Outcome you can feel">
              By Friday you’ll have a documented policy prompt, a redaction step, and a mini test set to keep your model honest.
            </Box>
          </section>

          <section id="threat-modeling" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Threat Modeling (for LLMs)</h2>
            <p className="text-gray-700">Identify your crown jewels (PII, tools, secrets), who might attack them, and how. Start simple and iterate.</p>
            <Box tone="pro" title="3×2×1 Framework">
              List <span className="font-medium">3 assets</span> → for each, <span className="font-medium">2 threats</span> → and <span className="font-medium">1 mitigation</span> you can ship this week (e.g., input filters, tool sandboxing, rate limits).
            </Box>
          </section>

          <section id="privacy" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Privacy & PII</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li><span className="font-medium">Minimize</span> → collect/process only what’s needed.</li>
              <li><span className="font-medium">Redact</span> → scrub PII before model calls (names, emails, IDs).</li>
              <li><span className="font-medium">Log safely</span> → avoid secrets; rotate access; add retention windows.</li>
            </ul>
            <Box tone="warn" title="Common pitfall">
              Don’t log raw prompts with user identifiers. Hash or tokenize IDs; mask payloads server‑side.
            </Box>
          </section>

          <section id="policies-prompts" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Safety Policies & System Prompts</h2>
            <p className="text-gray-700">Define allow/deny boundaries and encode them into your system prompt with clear refusal style and escalation guidance.</p>
            <Box tone="tip" title="Policy Prompt Skeleton">
              <span className="block">1) Scope & intent</span>
              <span className="block">2) Allow list + examples</span>
              <span className="block">3) Deny list + refusal style</span>
              <span className="block">4) When to escalate (human-in-the-loop)</span>
            </Box>
          </section>

          <section id="evaluation" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Quick Safety Evaluation</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Create a tiny test set (10–20 prompts): risky, benign, edge‑case.</li>
              <li>Define pass/fail checks (regex/JSON assertions).</li>
              <li>Track results over time to catch drift and regressions.</li>
            </ul>
            <Box tone="pro" title="Tiny but mighty">
              A 15‑minute eval today saves hours of debugging later. Commit your test set to the repo.
            </Box>
          </section>

          <section id="next" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Ready to build responsibly?</h2>
            <p className="text-gray-700 mb-4">Next up: a hands‑on LLM threat model tailored to your feature. We’ll turn risks into quick wins.</p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Previous (route updated to your current structure) */}
              <Link
                href="/learn/ethical-ai"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Link>

              <button
                onClick={markComplete}
                className={cx(
                  'px-4 py-2 rounded-lg border',
                  completed
                    ? 'border-green-200 bg-green-50 text-green-800'
                    : 'border-gray-200 hover:bg-gray-50'
                )}
              >
                {completed ? 'Progress saved ✓' : 'Mark page complete'}
              </button>

              {/* Next route updated to your current structure */}
              <Link
                href="/learn/ethical-ai/beginner/week1/threat-modeling"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow"
                onClick={async () => { if (!completed) await markComplete(); }}
              >
                Next <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
