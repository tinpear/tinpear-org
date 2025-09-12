'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  AlertTriangle,
  ShieldCheck,
  Home,
} from 'lucide-react';

// --- Config ------------------------------------------------------------------
const PROGRESS_KEY = 'ai-everyone-week1:everyday-workflows';

const SECTIONS = [
  { id: 'intro', label: 'Overview' },
  { id: 'email', label: 'Email & Messages' },
  { id: 'docs', label: 'Docs & Reports' },
  { id: 'planning', label: 'Planning & To‑Dos' },
  { id: 'learning', label: 'Learning & Research' },
  { id: 'templates', label: 'Copy‑Paste Templates' },
  { id: 'practice', label: 'Mini Practice' },
  { id: 'next', label: 'Next Topic' },
];

// --- Helpers -----------------------------------------------------------------
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
    <div className={cx('rounded-xl border p-4 flex gap-3 items-start', palette)}>
      <div className="mt-0.5">{icon}</div>
      <div>
        <div className="font-medium mb-1">{title}</div>
        <div className="text-sm md:text-[0.95rem] leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

// --- Page --------------------------------------------------------------------
export default function EverydayWorkflowsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (cancelled) return;
        setUser(user ?? null);

        if (user) {
          const { data } = await supabase
            .from('tracking')
            .select('completed')
            .eq('user_id', user.id)
            .eq('key', PROGRESS_KEY)
            .maybeSingle();
          if (!cancelled) setCompleted(Boolean(data?.completed));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
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

  const handleNext = async () => {
    if (!completed) await markComplete();
    router.push('/learn/ai-for-everyone/week1/prompting-basics');
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
      {/* Header (home icon, centered title, tidy mobile toggle) */}
      <header className="sticky top-0 z-30 border-b border-gray-100 backdrop-blur bg-white/70">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-14 grid grid-cols-[auto_1fr_auto] items-center gap-3">
            <Link
              href="/learn/ai-for-everyone"
              aria-label="Go to course home"
              prefetch={false}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2"
            >
              <Home className="h-5 w-5" />
            </Link>

            <div className="flex items-center justify-center">
              <span className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                Week 1 · Everyday Workflows
              </span>
            </div>

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

      {/* Body */}
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
                    isActive ? 'bg-green-50 text-green-800' : 'hover:bg-gray-50 text-gray-700'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  {s.label}
                </a>
              );
            })}
          </nav>
          <div className="mt-6 p-3 rounded-xl bg-gray-50 text-xs text-gray-600">
            Reusable prompts • Real tasks • No code.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-8">
          {/* Intro */}
          <section
            id="intro"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
          >
            <h2 className="text-xl font-semibold">Overview</h2>
            <p className="text-gray-700">
              This page translates big ideas into everyday wins. You will use AI to write clearer messages, shape stronger documents, organize your work into simple plans, and learn faster without drowning in tabs. Each section shows how to start with a real task, give a tight brief, and iterate once or twice for quality. By the end, you will have a tiny toolkit you can apply every week—no code required.
            </p>
            <Box tone="tip" title="Rule of thumb">
              Begin with something you already write regularly. Ask for two or three options, choose the strongest one, and make a small tweak so it sounds like you. Consistency beats cleverness.
            </Box>
          </section>

          {/* Email & Messages */}
          <section
            id="email"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
          >
            <h2 className="text-xl font-semibold">Email & Messages</h2>
            <p className="text-gray-700">
              When your thoughts are scattered but the clock is ticking, let the assistant turn rough notes into a concise, friendly message. Begin with the single point you need the reader to take away, then ask for a short version that leads with that point, follows with the most relevant detail, and closes with a clear next step. If subject lines matter, request a few options tuned for your audience. You can nudge tone—more formal, warmer, or lighter—without losing the substance.
            </p>
            <Box tone="tip" title="Prompt you can paste">
              I’m writing to <em>[customer/team/partner]</em> about <em>[topic]</em>. Please draft a concise, clear, and kind message that starts with the key update, includes only what the reader needs to act, and ends with a specific next step and date. Provide three subject line options.
            </Box>
          </section>

          {/* Docs & Reports */}
          <section
            id="docs"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
          >
            <h2 className="text-xl font-semibold">Docs & Reports</h2>
            <p className="text-gray-700">
              Strong documents are outlined before they are written. Ask the model for a lean outline aimed at your audience, then expand one section at a time so you keep control of the story. Reserve the executive summary for last; it will be sharper once you see the full structure. If you plan to reuse the content elsewhere, request a structured format—like a small table for tasks, owners, and dates—so you can paste it straight into your workflow.
            </p>
            <Box tone="tip" title="Prompt you can paste">
              Create a clear outline for a <em>[report/blog post]</em> aimed at <em>[audience]</em>. Include five sections with 2–3 bullets each and a suggested title. Wait for my edits before drafting. After I approve, draft section 1 only.
            </Box>
            <Box tone="pro" title="Formatting boost">
              If the document includes tasks, ask for a second output as a table with columns for Task, Owner, and Due Date. Predictable structure makes reuse effortless.
            </Box>
          </section>

          {/* Planning & To‑Dos */}
          <section
            id="planning"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
          >
            <h2 className="text-xl font-semibold">Planning & To‑Dos</h2>
            <p className="text-gray-700">
              Turn a fuzzy goal into a short, dated plan you can actually follow. Ask for an ordered set of steps sized to your calendar, each with a single owner and a crisp definition of done. Then request a second version as a checklist so you can paste it into your task tool. One quick iteration—shorter steps, clearer owners, realistic dates—often doubles the plan’s usefulness.
            </p>
            <Box tone="tip" title="Prompt you can paste">
              I need a simple plan to <em>[goal]</em> by <em>[date]</em>. Provide an ordered list of 5–7 steps with an owner, due date, and success criteria for each. Then give a second version as a plain checklist I can copy into my task app.
            </Box>
          </section>

          {/* Learning & Research */}
          <section
            id="learning"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
          >
            <h2 className="text-xl font-semibold">Learning & Research</h2>
            <p className="text-gray-700">
              Use the assistant as a friendly explainer before you dive into sources. Ask for a five‑sentence overview that avoids jargon, then request two concrete examples and a simple analogy that sticks. Wrap up with a short list of key terms defined in one line each. Once you have that scaffold, it is much easier to evaluate articles, reports, and docs without getting lost.
            </p>
            <Box tone="tip" title="Prompt you can paste">
              Explain <em>[topic]</em> in plain language. Give a 5‑sentence overview, two real‑life examples, an analogy I can remember, and three key terms with one‑line definitions each.
            </Box>
            <Box tone="warn" title="When accuracy matters">
              If a decision or external deliverable depends on the facts, ask the model to note uncertainties and verify claims with trusted sources before you share the result.
            </Box>
          </section>

          {/* Templates */}
          <section
            id="templates"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4"
          >
            <h2 className="text-xl font-semibold">Copy‑Paste Templates</h2>
            <p className="text-gray-700">
              These short prompts cover the patterns you’ll use most. Paste, fill the brackets, and keep the best versions in your notes so you can reuse them anytime.
            </p>
            <div className="space-y-3">
              <Box tone="tip" title="Rewrite my draft">
                Here’s my rough draft for <em>[audience]</em> about <em>[topic]</em>. Make it clear, friendly, and concise. Keep it under <em>[N]</em> words. Offer two versions with different tones: (A) professional and (B) casual.
              </Box>
              <Box tone="tip" title="Outline first, then draft">
                Create a six‑section outline for <em>[doc]</em> aimed at <em>[audience]</em>. After I approve, draft section one only.
              </Box>
              <Box tone="tip" title="Turn bullets → email">
                Turn these notes into a short email with a subject line and a clear next step: <em>[paste bullets]</em>.
              </Box>
              <Box tone="pro" title="G‑C‑E habit (preview)">
                Goal • Context • Example. Say what you want, who it’s for, and show a tiny sample or format. Small clarity, big results.
              </Box>
            </div>
          </section>

          {/* Practice */}
          <section
            id="practice"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
          >
            <h2 className="text-xl font-semibold">Mini Practice (10 minutes)</h2>
            <p className="text-gray-700">
              Choose one real task from your week—perhaps a short update, a quick outline, a simple plan, or a topic you need to grasp. Paste the matching template, fill in the brackets, and ask for two alternatives. Select the stronger draft and make a tiny adjustment so it fits your voice. Save both the final output and the prompt you used in your notes. You’re building a personal library you can pull from whenever you hit a blank page.
            </p>
            <Box tone="pro" title="Tiny improvement">
              Ask one precise follow‑up—“shorter,” “more specific,” “add a checklist,” or “tone: warmer.” A single nudge often doubles the quality.
            </Box>
          </section>

          {/* Next */}
          <section
            id="next"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold mb-3">Next: Prompting Basics</h2>
            <p className="text-gray-700 mb-4">
              Next, you’ll learn the simple “Goal • Context • Example” habit that makes results consistent and easy to reuse—no matter which AI tool you choose.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="/learn/ai-for-everyone/week1/what-ai-is"
                prefetch={false}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Link>

              <button
                type="button"
                onClick={markComplete}
                disabled={completed}
                aria-disabled={completed}
                className={cx(
                  'px-4 py-2 rounded-lg border',
                  completed ? 'border-green-200 bg-green-50 text-green-800' : 'border-gray-200 hover:bg-gray-50'
                )}
              >
                {completed ? 'Progress saved ✓' : 'Mark page complete'}
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
