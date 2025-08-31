'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Waypoints,
  Workflow,
  Layers,
  Rocket,
  Target,
  FlaskConical,
} from 'lucide-react';

// --- Config ------------------------------------------------------------------
const PROGRESS_KEY = 'pe-week-2:intro';

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'goals', label: 'Goals for Week 2' },
  { id: 'map', label: 'Lesson Map' },
  { id: 'patterns', label: 'Few‑Shot Patterns' },
  { id: 'cot', label: 'Chain‑of‑Thought vs Concise' },
  { id: 'capstone', label: 'Capstone: Ship It' },
  { id: 'tips', label: 'Tips & Pitfalls' },
  { id: 'next', label: 'Save & Start' },
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
  const palette =
    tone === 'tip'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
      : tone === 'warn'
      ? 'border-amber-200 bg-amber-50 text-amber-900'
      : 'border-sky-200 bg-sky-50 text-sky-900';
  const icon =
    tone === 'tip' ? (
      <Lightbulb className="h-4 w-4" />
    ) : tone === 'warn' ? (
      <AlertTriangle className="h-4 w-4" />
    ) : (
      <Sparkles className="h-4 w-4" />
    );
  return (
    <div className={`rounded-xl border p-3 md:p-4 flex gap-3 items-start ${palette}`}>
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="font-medium mb-1">{title}</div>
        <div className="text-sm md:text-[0.95rem] leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

// --- Page --------------------------------------------------------------------
export default function Week2Overview() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
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

  const username = useMemo(
    () =>
      profile?.full_name ||
      profile?.username ||
      user?.email?.split('@')[0] ||
      'Learner',
    [profile, user]
  );

  const markComplete = async () => {
    if (!user) return alert('Please sign in to save your progress.');
    const { error } = await supabase
      .from('tracking')
      .upsert(
        {
          user_id: user.id,
          key: PROGRESS_KEY,
          completed: true,
          completed_at: new Date().toISOString(),
        },
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
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as Element[];
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-100 backdrop-blur bg-white/70">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-bold text-sm sm:text-base">Week 2 • Patterns & Reasoning</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              className="lg:hidden inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-expanded={sidebarOpen}
              aria-controls="mobile-sidebar"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              Contents
            </button>
            <div className="text-xs sm:text-sm text-gray-600">
              {loading ? 'Loading…' : user ? `Signed in as ${username}` : <Link href="/signin" className="underline">Sign in</Link>}
            </div>
          </div>
        </div>
      </header>

      {/* Content area */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-4 sm:gap-6">
        {/* Sidebar */}
        <aside
          id="mobile-sidebar"
          className={cx(
            'rounded-2xl border border-gray-200 bg-white p-3 sm:p-4 shadow-sm',
            'lg:sticky lg:top-[72px] lg:h-[calc(100vh-88px)] lg:overflow-auto',
            sidebarOpen ? 'block' : 'hidden lg:block'
          )}
        >
          <p className="text-[11px] sm:text-xs uppercase tracking-wide text-gray-500 mb-2 sm:mb-3">On this page</p>
          <nav className="space-y-1">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setSidebarOpen(false)}
                className={cx(
                  'block rounded-lg text-xs sm:text-sm px-3 py-2',
                  activeId === s.id ? 'bg-green-50 text-green-800' : 'hover:bg-gray-50 text-gray-700'
                )}
              >
                {s.label}
              </a>
            ))}
          </nav>

          <div className="mt-4 sm:mt-6 p-3 rounded-xl bg-gray-50 text-[11px] sm:text-xs text-gray-600">
            Bring your Week‑1 artifacts (contract + golden set). We’ll build on them.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-4 sm:space-y-6">
          {/* Overview */}
          <section id="overview" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Week 2 • Few‑Shot Patterns & Reasoning</h1>
            <p className="text-base sm:text-lg text-gray-700">
              This week is about <b>patterning</b> and <b>reasoning control</b>. You’ll use small, high‑quality examples to lock style and structure, then decide when to expand internal reasoning (Chain‑of‑Thought) versus keeping outputs concise and fast.
            </p>
            <Box tone="tip" title="Bring your contract">
              Keep using structured JSON outputs — they make patterns measurable and regression‑safe.
            </Box>
          </section>

          {/* Goals */}
          <section id="goals" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Goals for Week 2</h2>
            </div>
            <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700 space-y-1">
              <li>Design effective <b>few‑shot examples</b> that “show, not tell”.</li>
              <li>Choose between <b>CoT</b> and <b>Concise</b> prompting for reliability and speed.</li>
              <li>Combine patterns + quick evals to <b>ship reliably</b>.</li>
            </ul>
          </section>

          {/* Lesson Map */}
          <section id="map" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Waypoints className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Lesson Map</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <Link
                href="/beginner/week2/patterns"
                className="rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 p-4 block"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="h-4 w-4 text-green-700" />
                  <h3 className="font-medium">Few‑Shot Patterns</h3>
                </div>
                <p className="text-sm text-gray-700">Contrastive pairs, style locks, structured examples, and anti‑patterns.</p>
              </Link>

              <Link
                href="/beginner/week2/cot-vs-concise"
                className="rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 p-4 block"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Workflow className="h-4 w-4 text-green-700" />
                  <h3 className="font-medium">Chain‑of‑Thought vs Concise</h3>
                </div>
                <p className="text-sm text-gray-700">When to reason step‑by‑step vs demand compact answers.</p>
              </Link>

              <Link
                href="/beginner/week2/capstone"
                className="rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 p-4 block"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Rocket className="h-4 w-4 text-green-700" />
                  <h3 className="font-medium">Capstone: Ship It</h3>
                </div>
                <p className="text-sm text-gray-700">Bundle prompt + examples + contract + golden set; run A/B + regression.</p>
              </Link>
            </div>
          </section>

          {/* Focus: Patterns */}
          <section id="patterns" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Few‑Shot Patterns (Show, Not Tell)</h2>
            </div>
            <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700 space-y-1">
              <li><b>Style locks:</b> short, polished samples that match your contract exactly.</li>
              <li><b>Contrastive pairs:</b> show a bad vs good example to clarify boundaries.</li>
              <li><b>Schema‑true outputs:</b> every example follows your JSON keys & types.</li>
              <li><b>Minimal set:</b> 1–3 examples usually suffice; avoid “example soup”.</li>
            </ul>
            <Box tone="pro" title="Golden rule">
              Examples must be <i>perfectly aligned</i> with your desired output contract.
            </Box>
          </section>

          {/* Focus: CoT vs Concise */}
          <section id="cot" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Workflow className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Chain‑of‑Thought vs Concise</h2>
            </div>
            <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700 space-y-1">
              <li><b>Use CoT</b> when tasks require reasoning or multi‑step checks.</li>
              <li><b>Use Concise</b> for deterministic, format‑heavy outputs and speed.</li>
              <li><b>Hybrid:</b> reason privately, then emit concise JSON with a short rationale.</li>
            </ul>
            <Box tone="tip" title="Latency matters">
              CoT can increase cost/latency; prefer concise when the schema + assertions already keep quality high.
            </Box>
          </section>

          {/* Capstone */}
          <section id="capstone" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Capstone: Ship a Reliable Prompt</h2>
            </div>
            <ol className="list-decimal pl-5 text-sm sm:text-base text-gray-700 space-y-2">
              <li>Start from your Week‑1 contract; add 1–3 few‑shot examples.</li>
              <li>Decide CoT vs concise; add a brief rationale if needed.</li>
              <li>Run your golden set + assertions + a tiny rubric; save results.</li>
              <li>Try one A/B variant; keep the winner; log changes.</li>
            </ol>
            <Box tone="tip" title="Deliverable">
              A single folder containing: prompt.md, examples.jsonl, schema.json, golden.json, eval-notes.md.
            </Box>
          </section>

          {/* Tips & Pitfalls */}
          <section id="tips" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Tips & Pitfalls</h2>
            </div>
            <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700 space-y-1">
              <li>Avoid long example blocks — they dilute signal.</li>
              <li>Never mix example formats — keep keys/types identical.</li>
              <li>Change one variable at a time (role, example count, constraint).</li>
            </ul>
          </section>

          {/* Bottom Nav & Save */}
          <section id="next" className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
            <Link
              href="/learn/prompt-engineering/beginner/week1/wrap-up"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 w-full sm:w-auto"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Week 1 Wrap‑Up
            </Link>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={markComplete}
                className={cx(
                  'px-4 py-2 rounded-lg border w-full sm:w-auto',
                  completed
                    ? 'border-green-200 bg-green-50 text-green-800'
                    : 'border-gray-200 hover:bg-gray-50'
                )}
                title={user ? 'Save progress for this page' : 'Sign in to save progress'}
              >
                {completed ? 'Progress saved ✓' : 'Mark overview complete'}
              </button>
              <Link
                href="/learn/prompt-engineering/beginner/week2/patterns"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow w-full sm:w-auto"
                onClick={async () => { if (!completed) await markComplete(); }}
              >
                Start: Few‑Shot Patterns <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
