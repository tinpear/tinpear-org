'use client';

import { useEffect, useState } from 'react';
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
const PROGRESS_KEY = 'ai-everyone-week2:overview';

const SECTIONS = [
  { id: 'welcome', label: 'Welcome & Goals' },
  { id: 'why-important', label: 'Why This Matters' },
  { id: 'how-this-week-works', label: 'How This Week Works' },
  { id: 'what-youll-do', label: "What You'll Do" },
  { id: 'outline', label: 'Week 2 Outline' },
  { id: 'checklist', label: 'Checklist' },
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
    tone === 'tip' ? (
      <Lightbulb className="h-4 w-4" />
    ) : tone === 'warn' ? (
      <AlertTriangle className="h-4 w-4" />
    ) : (
      <ShieldCheck className="h-4 w-4" />
    );

  return (
    <div
      className={cx(
        'rounded-xl border p-3 md:p-4 flex gap-3 items-start',
        palette
      )}
    >
      <div className="mt-0.5">{icon}</div>
      <div>
        <div className="font-medium mb-1">{title}</div>
        <div className="text-sm md:text-[0.95rem] leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

// --- Page --------------------------------------------------------------------
export default function AIEveryoneWeek2Overview() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user ?? null);

      if (user) {
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

  const markComplete = async () => {
    if (!user) return alert('Please sign in to save your progress.');
    const { error } = await supabase.from('tracking').upsert(
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

    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      Boolean
    ) as Element[];
    els.forEach((el) => observer.observe(el));
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
            <span className="font-bold">Week 2 • Overview</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200"
              onClick={() => setSidebarOpen((v) => !v)}
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              Contents
            </button>
            <div className="text-sm text-gray-600">
              {loading ? (
                'Loading…'
              ) : user ? (
                'Signed in'
              ) : (
                <Link href="/signin" className="underline">
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6">
        {/* Sidebar */}
        <aside
          className={cx(
            'lg:sticky lg:top-[72px] lg:h-[calc(100vh-88px)] lg:overflow-auto',
            'rounded-2xl border border-gray-200 bg-white p-4 shadow-sm',
            sidebarOpen ? '' : 'hidden lg:block'
          )}
        >
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">
            On this page
          </p>
          <nav className="space-y-1">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={cx(
                  'block px-3 py-2 rounded-lg text-sm',
                  activeId === s.id
                    ? 'bg-green-50 text-green-800'
                    : 'hover:bg-gray-50 text-gray-700'
                )}
              >
                {s.label}
              </a>
            ))}
          </nav>
          <div className="mt-6 p-3 rounded-xl bg-gray-50 text-xs text-gray-600">
            Safety first • Choose the right tool.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-8">
          {/* Welcome */}
          <section
            id="welcome"
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Welcome to Week 2
            </h1>
            <p className="text-lg text-gray-700">
              This week is about <span className="font-medium">using AI safely</span> and
              <span className="font-medium"> picking the right tool</span> for each job.
              You’ll learn practical safety habits and a simple decision guide
              for choosing between chatbots, writing tools, image generators, and automations.
            </p>
            <Box tone="tip" title="Beginner‑friendly promise">
              Plain English, no code. Short pages with tiny exercises—so you can apply
              everything at work or school immediately.
            </Box>
          </section>

          {/* Why this matters */}
          <section
            id="why-important"
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
          >
            <h2 className="text-xl font-semibold">Why This Matters</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Avoid risky mistakes with privacy and sensitive data.</li>
              <li>Make better decisions by asking AI to show uncertainty and limits.</li>
              <li>Save time by matching the tool to the task (text, image, or automation).</li>
            </ul>
            <Box tone="pro" title="Practical outcome">
              By the end of this week, you’ll have a safety checklist and a “tool picker”
              you can reuse for any task.
            </Box>
          </section>

          {/* How this week works */}
          <section
            id="how-this-week-works"
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
          >
            <h2 className="text-xl font-semibold">How This Week Works</h2>
            <p className="text-gray-700">
              Two focused topic pages + a short wrap‑up:
            </p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>
                <span className="font-medium">Ethics, Safety & Privacy:</span> simple rules,
                redaction habit, when to double‑check.
              </li>
              <li>
                <span className="font-medium">Choosing the Right Tool:</span> quick guide to chat assistants,
                writing/slide tools, image tools, and light automations.
              </li>
            </ul>
            <Box tone="tip" title="Study tip">
              Keep a notes doc open. You’ll add your safety checklist and tool picker there.
            </Box>
          </section>

          {/* What you'll do */}
          <section
            id="what-youll-do"
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
          >
            <h2 className="text-xl font-semibold">What You’ll Do This Week</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Learn a quick privacy habit: <span className="font-medium">mask names/IDs</span> before sharing.</li>
              <li>Practice asking for <span className="font-medium">sources or uncertainties</span> on important facts.</li>
              <li>Use a <span className="font-medium">tool picker</span> to choose the best AI tool for a real task you have.</li>
            </ul>
            <Box tone="pro" title="Time needed">
              About 60–90 minutes total. You can split it across a few short sessions.
            </Box>
          </section>

          {/* Outline */}
          <section
            id="outline"
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4"
          >
            <h2 className="text-xl font-semibold">Week 2 Outline</h2>
            <div className="space-y-3 text-gray-700">
              <div>
                <span className="font-medium">1) Ethics, Safety & Privacy Essentials</span>
                <span className="ml-2 text-gray-600">
                  – practical rules, redaction habit, double‑check moments.
                </span>
              </div>
              <div>
                <span className="font-medium">2) Choosing the Right AI Tool</span>
                <span className="ml-2 text-gray-600">
                  – match the tool to the outcome (text, images, automations).
                </span>
              </div>
              <div>
                <span className="font-medium">3) Week 2 Wrap‑Up (quiz + toolkit)</span>
                <span className="ml-2 text-gray-600">
                  – short quiz and your reusable checklists.
                </span>
              </div>
            </div>
            <Box tone="tip" title="Navigation">
              Use the “Next” button to start at topic 1, then continue in order. You can return here anytime.
            </Box>
          </section>

          {/* Checklist */}
          <section
            id="checklist"
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
          >
            <h2 className="text-xl font-semibold">Before You Begin</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Pick one real task this week (email/report/plan/image).</li>
              <li>Open your notes app for your <span className="font-medium">Safety Checklist</span> and <span className="font-medium">Tool Picker</span>.</li>
              <li>Sign in so your progress is tracked.</li>
            </ul>
            <Box tone="warn" title="Privacy first">
              Avoid pasting sensitive info (names, phone numbers, IDs). Use placeholders like <em>[Name]</em> or <em>[Order #]</em>.
            </Box>
          </section>

          {/* Next / actions */}
          <section
            id="next"
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold mb-3">Start Topic 1</h2>
            <p className="text-gray-700 mb-4">
              Begin with simple, practical habits for safe and responsible AI use.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Previous: Week 1 Wrap‑Up */}
              <Link
                href="/learn/ai-for-everyone/week1/wrap-up"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Week 1 Wrap‑Up
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

              {/* Next: first topic page */}
              <Link
                href="/learn/ai-for-everyone/week2/ethics-safety-privacy"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow"
                onClick={async () => {
                  if (!completed && user) await markComplete();
                }}
              >
                Next: Ethics, Safety & Privacy <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
