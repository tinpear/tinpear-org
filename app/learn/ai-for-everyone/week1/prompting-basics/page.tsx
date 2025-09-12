'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
const PROGRESS_KEY = 'ai-everyone-week1:prompting-basics';

const SECTIONS = [
  { id: 'intro', label: 'Why Prompts Matter' },
  { id: 'gce', label: 'The G‑C‑E Habit' },
  { id: 'examples', label: 'Simple Examples' },
  { id: 'iterate', label: 'Iterate & Improve' },
  { id: 'formatting', label: 'Ask for a Format' },
  { id: 'pitfalls', label: 'Common Pitfalls' },
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
export default function PromptingBasicsPage() {
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
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
                Week 1 · Prompting Basics
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
            Clear instructions → better results.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-8">
          {/* Intro */}
          <section
            id="intro"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
          >
            <h2 className="text-xl font-semibold">Why Prompts Matter</h2>
            <p className="text-gray-700">
              A prompt is not magic language; it is simply the brief you give your assistant. When the brief is sharp, you skip the back‑and‑forth and land on a useful draft quickly. The fastest way to sharpen a prompt is to decide the outcome before you type a word. Are you asking for a summary, an email, a plan, a list of options, or a table you can paste into another tool? Once the outcome is clear in your head, the rest of the prompt becomes easy to write—and much easier for the model to satisfy.
            </p>
            <Box tone="tip" title="One small habit">
              Name the destination first—“a 120‑word executive summary,” “a friendly customer email,” or “a 6‑step plan with dates.” Everything else aligns behind that target.
            </Box>
          </section>

          {/* GCE */}
          <section
            id="gce"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
          >
            <h2 className="text-xl font-semibold">The G‑C‑E Habit</h2>
            <p className="text-gray-700">
              The simplest reliable structure is Goal • Context • Example. The <span className="font-medium">Goal</span> is the outcome in one sentence—what you want and, often, the audience and length. The <span className="font-medium">Context</span> trims ambiguity by naming tone, must‑include details, constraints, and anything the model cannot reasonably guess. The <span className="font-medium">Example</span> shows the shape of success: a tiny sample of the tone you like or the exact format you want back. With G‑C‑E, your prompt becomes a short contract the model can fulfill repeatedly.
            </p>
            <Box tone="pro" title="Copy‑paste scaffold">
              I need <em>[output]</em> for <em>[audience]</em>. Keep it <em>[length/tone]</em>. Include <em>[must‑haves]</em> and avoid <em>[don’ts]</em>. Return it as <em>[format]</em>. Here is a tiny example of the style/shape I want: <em>[one or two lines]</em>.
            </Box>
          </section>

          {/* Examples */}
          <section
            id="examples"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4"
          >
            <h2 className="text-xl font-semibold">Simple Examples</h2>
            <p className="text-gray-700">
              To feel the habit, try it on three common tasks. For an email rewrite, tell the model you want a short, friendly message that reassures a customer about a delay. Give one line of context and ask it to lead with the key update, then close with a specific next step and date. For a report summary, ask for one tight paragraph aimed at executives and append a compact structure for key takeaways and a single risk; this makes the result easy to skim and reuse. For learning a topic, request a five‑sentence overview in plain language, two everyday examples, and three key terms with one‑line definitions so you can anchor new reading.
            </p>
            <Box tone="tip" title="Email rewrite (drop‑in)">
              Turn this into a short, friendly email for a customer. Goal: reassure about a delay. Start with the key update, keep details minimal, and end with a clear next step and date. Include three subject line options.
            </Box>
            <Box tone="tip" title="Report summary (drop‑in)">
              Summarize the following notes for executives in ~120 words. Then add a compact structure: “Key takeaways: 3 bullets” and “Risk: 1 line.”
            </Box>
            <Box tone="tip" title="Learn a topic (drop‑in)">
              Explain <em>[topic]</em> in plain language. Provide a 5‑sentence overview, two everyday examples, and three key terms with one‑line definitions.
            </Box>
          </section>

          {/* Iterate */}
          <section
            id="iterate"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
          >
            <h2 className="text-xl font-semibold">Iterate & Improve</h2>
            <p className="text-gray-700">
              The first answer is the starting line, not the finish. Ask for one deliberate improvement and watch quality jump without extra effort. You might request a shorter version with the same meaning, a tone shift that better fits your audience, or an alternative framed as a checklist you can tick off. The rhythm is simple: get a rough draft, make a single precise request, and accept the version that reads best to you. Two quick iterations usually outperform one long prompt.
            </p>
            <Box tone="pro" title="Two‑step rhythm">
              Draft → Nudge. Try “shorter and more direct,” “give three tone options,” or “replace jargon with simple words.” Small nudges compound.
            </Box>
          </section>

          {/* Formatting */}
          <section
            id="formatting"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
          >
            <h2 className="text-xl font-semibold">Ask for a Format</h2>
            <p className="text-gray-700">
              Outputs that arrive in a consistent shape are easier to trust and reuse. If you will paste results into another tool, request bullets, numbered steps, or a small table with named columns. Predictable structure allows light validation—did every row include an owner and a date?—and turns your prompt into a reusable tool rather than a one‑off experiment.
            </p>
            <Box tone="tip" title="Table request (drop‑in)">
              Return a table with columns: Task, Owner, Due date, and Notes. Include five rows and leave Due date blank so I can fill it.
            </Box>
            <Box tone="pro" title="Consistent outputs">
              Keeping the same format for similar tasks builds a mini‑library of prompts you can rely on week after week.
            </Box>
          </section>

          {/* Pitfalls */}
          <section
            id="pitfalls"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
          >
            <h2 className="text-xl font-semibold">Common Pitfalls</h2>
            <p className="text-gray-700">
              Most prompt problems trace back to vagueness, missing context, or a lack of structure. If you ask for “something good,” the assistant will guess what “good” means; tell it who you are writing for, how long it should be, and which details matter. If you assume it knows your situation, it will fill gaps with generic advice; add two lines of background and watch relevance rise. And if you do not specify a format, you will spend time cleaning up text you could have received as bullets, steps, or a tidy table.
            </p>
            <Box tone="warn" title="Privacy check">
              Treat sensitive information with care. Redact names and identifiers, and follow your organization’s data policies. When stakes are high, verify facts before sharing externally.
            </Box>
          </section>

          {/* Practice */}
          <section
            id="practice"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
          >
            <h2 className="text-xl font-semibold">Mini Practice (10 minutes)</h2>
            <p className="text-gray-700">
              Choose one real task from your week—a short update, a summary, or a tiny plan. Write a one‑sentence Goal, add two lines of Context that truly matter, and include a one‑line Example that shows tone or format. Ask for two versions, select the stronger draft, and request one targeted improvement. Save both the prompt and the final output in your notes; you just created a reusable asset that will save you time every time this task appears again.
            </p>
            <Box tone="pro" title="Reuse = speed">
              Good prompts compound. Each time you save one that works, future tasks start at 60% instead of 0%.
            </Box>
          </section>

          {/* Next */}
          <section
            id="next"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold mb-3">Next: Week 1 Wrap‑Up</h2>
            <p className="text-gray-700 mb-4">
              We’ll wrap the week by reviewing the key habits, capturing your best prompts in a simple library, and setting you up for steady, confident use in your daily work.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Back */}
              <Link
                href="/learn/ai-for-everyone/week1/everyday-workflows"
                prefetch={false}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Link>

              {/* Mark complete */}
              <button
                onClick={markComplete}
                className={cx(
                  'px-4 py-2 rounded-lg border',
                  completed ? 'border-green-200 bg-green-50 text-green-800' : 'border-gray-200 hover:bg-gray-50'
                )}
              >
                {completed ? 'Progress saved ✓' : 'Mark page complete'}
              </button>

              {/* Next */}
              <Link
                href="/learn/ai-for-everyone/week1/wrap-up"
                prefetch={false}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow"
                onClick={async () => {
                  if (!completed) await markComplete();
                }}
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
