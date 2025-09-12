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
  Home,
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
      {/* Header (home icon, centered title, tidy mobile toggle) */}
      <header className="sticky top-0 z-30 border-b border-gray-100 backdrop-blur bg-white/70">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-14 grid grid-cols-[auto_1fr_auto] items-center gap-3">
            {/* Left: Home icon */}
            <Link
              href="/learn/ai-for-everyone"
              aria-label="Go to course home"
              prefetch={false}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2"
            >
              <Home className="h-5 w-5" />
            </Link>

            {/* Center: Title */}
            <div className="flex items-center justify-center">
              <span className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                Week 2 · Overview
              </span>
            </div>

            {/* Right: Contents toggle (mobile only) */}
            <button
              type="button"
              aria-label="Toggle contents"
              className="lg:hidden inline-flex h-10 items-center gap-2 px-3 rounded-xl border border-gray-200 text-gray-800 hover:bg-gray-50 justify-self-end focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2"
              onClick={() => setSidebarOpen((v) => !v)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Contents</span>
            </button>
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
          <nav role="navigation" aria-label="On this page" className="space-y-1">
            {SECTIONS.map((s) => {
              const isActive = activeId === s.id;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  aria-current={isActive ? 'true' : undefined}
                  className={cx(
                    'block px-3 py-2 rounded-lg text-sm',
                    isActive
                      ? 'bg-green-50 text-green-800'
                      : 'hover:bg-gray-50 text-gray-700'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  {s.label}
                </a>
              );
            })}
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
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Welcome to Week 2
            </h1>
            <p className="text-lg text-gray-700">
              This week focuses on two abilities that make everyday AI use dependable:
              staying safe with information, and selecting the right tool for the job.
              You will turn common-sense privacy into a simple habit, learn when to
              double-check facts, and practice choosing between chat assistants,
              writing and slide helpers, image tools, and light automations. The goal
              is confidence: you will know how to proceed, what to avoid, and which
              kind of tool unlocks the fastest, safest path from idea to outcome.
            </p>
            <Box tone="tip" title="Beginner-friendly promise">
              Everything is in plain English with tiny, real tasks. No code required—
              just the work you already do and a few guardrails that make it easier.
            </Box>
          </section>

          {/* Why This Matters */}
          <section
            id="why-important"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
          >
            <h2 className="text-xl font-semibold">Why This Matters</h2>
            <p className="text-gray-700">
              AI speeds up drafting and thinking, but speed is useful only when it is
              safe and appropriate. A short privacy habit prevents accidental sharing
              of names, IDs, or sensitive details. Asking for uncertainty or for the
              model to explain its assumptions helps you see where a careful human
              review is still needed. And matching the tool to the task—text, images,
              or a small automation—removes friction so your effort flows into the
              result instead of into fighting the wrong interface. Together, these
              habits give you output you can actually use.
            </p>
            <Box tone="pro" title="Practical outcome">
              By the end of this week you will have a concise safety checklist and a
              reusable “tool picker” you can apply to any new task in under a minute.
            </Box>
          </section>

          {/* How This Week Works */}
          <section
            id="how-this-week-works"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
          >
            <h2 className="text-xl font-semibold">How This Week Works</h2>
            <p className="text-gray-700">
              You will move through two short topic pages and a wrap-up. First, you
              will practice ethics, safety, and privacy with simple redaction and
              verification steps that fit into any prompt. Next, you will learn a quick
              decision guide for choosing between common AI tools based on the outcome
              you want. The wrap-up ties both threads together, giving you a compact
              checklist and a tiny quiz to confirm what stuck.
            </p>
            <Box tone="tip" title="Study tip">
              Keep your notes doc open as you read; you will copy the safety checklist
              and tool picker into it and tune them to your own work.
            </Box>
          </section>

          {/* What You'll Do */}
          <section
            id="what-youll-do"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
          >
            <h2 className="text-xl font-semibold">What You’ll Do This Week</h2>
            <p className="text-gray-700">
              You will adopt a quick privacy habit—mask names, IDs, or internal codes
              before sharing text—and you will practice asking the model to surface
              uncertainties when accuracy matters. You will also run a real task from
              your week through the tool picker so that you feel the difference between
              a chat assistant for language tasks, a writing or slide helper for
              structured documents, an image tool for visual explanations, and a small
              automation when repetition is the bottleneck. Expect light exercises that
              build muscle memory rather than theory.
            </p>
            <Box tone="pro" title="Time needed">
              Most learners finish in about sixty to ninety minutes. Break it into a
              few short sessions, and apply each idea to something on your actual
              to-do list so the value is immediate.
            </Box>
          </section>

          {/* Week 2 Outline */}
          <section
            id="outline"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4"
          >
            <h2 className="text-xl font-semibold">Week 2 Outline</h2>
            <p className="text-gray-700">
              We begin with Ethics, Safety, and Privacy where you learn a redaction
              habit, recognize moments that require verification, and practice asking
              for uncertainty when a confident answer might hide weak assumptions. We
              then move into Choosing the Right Tool, a simple decision guide to match
              the outcome you want—like a clear email, a tidy report, a quick visual,
              or a lightweight automation—to the tool that gets you there the fastest.
              Finally, a short wrap-up consolidates your checklist and confirms that
              you can apply it on your own.
            </p>
            <Box tone="tip" title="Navigation">
              Use the Next button below to start with safety, then continue in order.
              You can return to this overview any time.
            </Box>
          </section>

          {/* Checklist */}
          <section
            id="checklist"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
          >
            <h2 className="text-xl font-semibold">Before You Begin</h2>
            <p className="text-gray-700">
              Choose one real task you will complete this week—perhaps a customer
              update, a simple status report, a short plan, or a small image to
              clarify an idea. Open your notes app and create two sections labeled
              “Safety Checklist” and “Tool Picker”; you will fill them as you go. If
              you are not signed in yet, take a moment to do so now so your progress
              is saved and you can pick up where you left off.
            </p>
            <Box tone="warn" title="Privacy first">
              Avoid pasting sensitive details. Replace names, phone numbers, order
              identifiers, or internal codes with placeholders like <em>[Name]</em> or{' '}
              <em>[Order #]</em>. If a result will be shared externally, give it a
              quick human review before it goes out.
            </Box>
          </section>

          {/* Next / actions */}
          <section
            id="next"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold mb-3">Start Topic 1</h2>
            <p className="text-gray-700 mb-4">
              Begin with simple, practical habits for safe and responsible AI use.
              A few tiny precautions make the rest of your work faster and easier.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Previous: Week 1 Wrap-Up */}
              <Link
                href="/learn/ai-for-everyone/week1/wrap-up"
                prefetch={false}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Week 1 Wrap-Up
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
                prefetch={false}
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
