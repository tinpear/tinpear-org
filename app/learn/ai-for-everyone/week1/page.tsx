'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
const PROGRESS_KEY = 'ai-everyone-week1:overview';

const SECTIONS = [
  { id: 'welcome', label: 'Welcome & Goals' },
  { id: 'why-important', label: 'Why This Matters' },
  { id: 'how-this-week-works', label: 'How This Week Works' },
  { id: 'what-youll-do', label: "What You'll Do" },
  { id: 'outline', label: 'Week 1 Outline' },
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
export default function AIEveryoneWeek1Overview() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        const {
          data: { user },
          error: userErr,
        } = await supabase.auth.getUser();
        if (userErr) console.error(userErr);
        if (cancelled) return;
        setUser(user ?? null);

        if (user) {
          const { data: profile, error: pErr } = await supabase
            .from('profiles')
            .select('username, full_name')
            .eq('id', user.id)
            .maybeSingle();
          if (pErr) console.error(pErr);
          if (!cancelled) setProfile(profile ?? null);

          const { data: track, error: tErr } = await supabase
            .from('tracking')
            .select('completed')
            .eq('user_id', user.id)
            .eq('key', PROGRESS_KEY)
            .maybeSingle();
          if (tErr) console.error(tErr);
          if (!cancelled) setCompleted(Boolean(track?.completed));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
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
    if (!user) {
      alert('Please sign in to save your progress.');
      return;
    }
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

  const handleNext = async () => {
    if (!completed) {
      await markComplete();
    }
    router.push('/learn/ai-for-everyone/week1/what-ai-is');
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
                Week 1 · Overview
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
            Week 1 = foundations • No coding needed.
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
              Welcome{user ? `, ${username}` : ''}
            </h1>
            <p className="text-lg text-gray-700">
              This first week is a calm, practical introduction to modern AI. You will
              learn what these systems are fundamentally good at, where they struggle,
              and how to collaborate with them safely and effectively in your day‑to‑day
              work. The emphasis is on simple, repeatable habits rather than jargon or
              theory. Each page gives you a clear explanation followed by a tiny
              practice moment you can finish in minutes. No coding is required; your
              only tools are curiosity and the work you already do.
            </p>
            <Box tone="tip" title="How to use this course">
              Treat each page like a small checkpoint. Read the perspective, try the
              quick exercise with a task from your real workload, and jot down anything
              useful you discover. By the end of the week you’ll have a lightweight set
              of patterns you can apply anywhere, with the confidence that comes from
              seeing them work on your own problems.
            </Box>
          </section>

          {/* Why this matters */}
          <section
            id="why-important"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
          >
            <h2 className="text-xl font-semibold">Why This Matters</h2>
            <p className="text-gray-700">
              AI is best understood as a capable assistant that accelerates thinking,
              reduces busywork, and expands what a single person can accomplish. Used
              well, it helps you draft clearer emails and reports, explore options you
              might not have considered, and learn new topics quickly without wading
              through noise. The benefit is not simply speed; it is the ability to
              clarify intent, test ideas rapidly, and move from rough concepts to
              usable work products with less friction. At the same time, trust comes
              from healthy skepticism. You will build a habit of verifying important
              facts, respecting privacy and data policies, and deciding when a human
              review is required before anything goes out the door.
            </p>
            <Box tone="pro" title="A simple mindset">
              Imagine a fast, tireless intern who is eager to help but needs precise
              direction and a clear definition of “good.” When you give context and
              boundaries, the assistant is brilliant; when you are vague, it guesses.
              This course teaches you to give crisp guidance and to keep responsibility
              for the final judgment where it belongs—with you.
            </Box>
          </section>

          {/* How this week works */}
          <section
            id="how-this-week-works"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
          >
            <h2 className="text-xl font-semibold">How This Week Works</h2>
            <p className="text-gray-700">
              The material is broken into short, focused pages that build on one
              another. Start here, then proceed to an accessible mental model of how AI
              systems operate today. From there you will practice everyday workflows
              like drafting, outlining, and planning, all through plain‑English prompts
              you can reuse later. Each step invites you to try a small exercise
              directly on your own tasks so the lessons stick. You can pause at any
              time—if you are signed in, your progress is saved and you can pick up
              where you left off without losing momentum.
            </p>
            <p className="text-gray-700">
              You will also see short templates that you can copy and adapt. They are
              deliberately simple: a clear goal, a bit of context, and a quick example.
              This shape keeps results consistent without turning the process into a
              complicated ritual. By repeating this pattern in different situations,
              you will feel the learning accumulate from page to page.
            </p>
          </section>

          {/* What you'll do */}
          <section
            id="what-youll-do"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
          >
            <h2 className="text-xl font-semibold">What You’ll Do This Week</h2>
            <p className="text-gray-700">
              Your focus is to understand where AI shines and where human judgment is
              essential, then to apply that understanding to routine work. You will try
              the assistant on tasks like turning notes into a clear message, shaping a
              rough idea into an outline, and sketching a plan you can refine with your
              team. Along the way you will adopt a simple habit—state the goal, offer
              relevant context, and include a short example—to make outputs more
              reliable. None of this requires special tools or technical knowledge; it
              only asks that you bring a real task from your week and let the assistant
              help you take the first steps.
            </p>
            <Box tone="tip" title="Time needed">
              Expect about ninety to one hundred and twenty minutes in total. You can
              complete the pages in a single sitting or spread them across a few short
              sessions. The important part is to apply each idea to your own work so
              the value is immediate and tangible.
            </Box>
          </section>

          {/* Outline */}
          <section
            id="outline"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4"
          >
            <h2 className="text-xl font-semibold">Week 1 Outline</h2>
            <p className="text-gray-700">
              We begin with a clear explanation of what AI is—and what it is not—so
              you have a grounded mental model for the rest of the course. With that
              foundation, we move into everyday workflows that matter to most people:
              communicating more clearly, structuring ideas before you write, and
              organizing scattered notes into something you can act on. Finally, we
              introduce a compact prompting habit that ties everything together. By
              the end of the week you will know how to frame a task, give just enough
              context for a good result, and nudge the assistant with a short example
              so the output matches your intent.
            </p>
            <Box tone="pro" title="Navigation">
              Use the Next button below to proceed to the first topic. You can return
              to this overview at any time, and the sidebar lets you jump between
              sections if you want to review a concept quickly.
            </Box>
          </section>

          {/* Checklist */}
          <section
            id="checklist"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
          >
            <h2 className="text-xl font-semibold">Before You Begin</h2>
            <p className="text-gray-700">
              Choose one real, low‑stakes task you handle most weeks—perhaps
              summarizing a meeting, drafting a simple update, or outlining a small
              plan. Create a notes document where you can paste your favorite prompts
              and results; this becomes your personal playbook as you discover what
              works. If you have not signed in yet, do that now so your progress and
              examples are saved. And remember privacy: avoid sharing sensitive
              information, remove details that are not necessary for the task, and
              follow your organization’s guidelines. Small precautions make it easy to
              practice safely while still getting maximum benefit.
            </p>
            <Box tone="warn" title="Privacy first">
              When a task involves personal data or confidential material, replace
              names and identifiers with placeholders or work from a redacted version.
              If a result will be shared outside your team, give it a quick human
              review to confirm accuracy and tone before it goes out.
            </Box>
          </section>

          {/* Next / actions */}
          <section
            id="next"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold mb-3">Start</h2>
            <p className="text-gray-700 mb-4">
              Begin with a friendly mental model of how today’s AI systems work. A
              clear picture of strengths and limits will help you make smarter requests
              and get dependable results from the very first prompts you try.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Previous: course home */}
              <Link
                href="/learn/ai-for-everyone"
                prefetch={false}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Course Home
              </Link>

              <button
                type="button"
                onClick={markComplete}
                disabled={completed}
                aria-disabled={completed}
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
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow"
              >
                Next: What AI Is <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
