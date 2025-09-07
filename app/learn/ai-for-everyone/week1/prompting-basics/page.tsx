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
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-100 backdrop-blur bg-white/70">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span className="font-bold">Week 1 • Prompting Basics</span>
          </div>
          <button
            className="lg:hidden inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            Contents
          </button>
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
          <nav className="space-y-1">
            {SECTIONS.map((s) => (
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
            Clear instructions → better results.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-8">
          {/* Intro */}
          <section id="intro" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Why Prompts Matter</h2>
            <p className="text-gray-700">
              A prompt is just the instruction you give an AI tool. Clear prompts save time and reduce
              back‑and‑forth. You don’t need special words—just say what you want, add a little context,
              and show the format you prefer.
            </p>
            <Box tone="tip" title="One small habit">
              Before you ask, decide your outcome: summary, email, table, bullets, plan, or ideas.
            </Box>
          </section>

          {/* GCE */}
          <section id="gce" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">The G‑C‑E Habit</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li><span className="font-medium">Goal</span> — what you want (“a 120‑word summary for busy parents”).</li>
              <li><span className="font-medium">Context</span> — who it’s for + key constraints (tone, must‑include, must‑avoid).</li>
              <li><span className="font-medium">Example</span> — show a tiny sample or the format (bullets, table, steps).</li>
            </ul>
            <Box tone="pro" title="Copy‑paste scaffold">
              I need <em>[output]</em> for <em>[audience]</em>. Keep it <em>[length/tone]</em>. Include <em>[must‑haves]</em>, avoid <em>[don’ts]</em>. Return it as <em>[format]</em> (show a small example if helpful).
            </Box>
          </section>

          {/* Examples */}
          <section id="examples" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Simple Examples</h2>

            <Box tone="tip" title="Email rewrite">
              Turn this into a short, friendly email for a customer. Goal: reassure about a delay. Context: they’re waiting for an order. Example format: <br />
              <em>Subject: …<br/>Hi …, one‑line context → key update → next step with date → thanks.</em>
            </Box>

            <Box tone="tip" title="Report summary">
              Summarize the following notes for executives in ~120 words. Give 3 bullet takeaways and 1 risk. Format:<br />
              <em>Summary (120 words)<br/>• Key takeaways (3 bullets)<br/>• Risk (1 line)</em>
            </Box>

            <Box tone="tip" title="Learning a topic">
              Explain <em>[topic]</em> in plain language for a beginner. Include: (1) 5‑sentence overview, (2) 2 everyday examples, (3) 3 key terms with one‑line definitions.
            </Box>
          </section>

          {/* Iterate */}
          <section id="iterate" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Iterate & Improve</h2>
            <p className="text-gray-700">After the first answer, add one line to steer it:</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>“Shorter and more direct.”</li>
              <li>“Add 3 options in different tones.”</li>
              <li>“Replace jargon with simple words.”</li>
              <li>“Turn this into a checklist with dates.”</li>
            </ul>
            <Box tone="pro" title="Two‑step rhythm">
              First: get a rough draft. Second: request one improvement. Small edits → big gains.
            </Box>
          </section>

          {/* Formatting */}
          <section id="formatting" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Ask for a Format</h2>
            <p className="text-gray-700">
              Telling the AI the format you want makes it easier to reuse. Ask for bullets, steps, or a table.
            </p>
            <Box tone="tip" title="Table request">
              Return a table with columns: Task, Owner, Due date, Notes. Include 5 rows and leave Dates blank.
            </Box>
            <Box tone="pro" title="Consistent outputs">
              Reusing the same format each time builds a “prompt you can trust” for future work.
            </Box>
          </section>

          {/* Pitfalls */}
          <section id="pitfalls" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Common Pitfalls</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li><span className="font-medium">Too vague:</span> “Write something good.” → Be specific about audience, tone, and length.</li>
              <li><span className="font-medium">No context:</span> The AI can’t guess your situation—add 1–2 lines of background.</li>
              <li><span className="font-medium">No format:</span> Ask for bullets, steps, or a table to keep it tidy.</li>
            </ul>
            <Box tone="warn" title="Privacy check">
              Don’t paste sensitive data (names, phone numbers, IDs). Mask or remove details before sharing.
            </Box>
          </section>

          {/* Practice */}
          <section id="practice" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Mini Practice (10 minutes)</h2>
            <ol className="list-decimal pl-5 text-gray-700 space-y-2">
              <li>Pick one real task (email, summary, plan).</li>
              <li>Write a G‑C‑E prompt with a clear format.</li>
              <li>Ask for 2 versions. Choose the best one.</li>
              <li>Make one improvement request (shorter / clearer / table).</li>
              <li>Save your prompt + best output in your notes.</li>
            </ol>
            <Box tone="pro" title="Reuse = speed">
              Save good prompts. Next time, you’ll start from a strong template instead of a blank page.
            </Box>
          </section>

          {/* Next */}
          <section id="next" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Next: Week 1 Wrap-up</h2>
            <p className="text-gray-700 mb-4">
              Wrap-up week1.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Back */}
              <Link
                href="/learn/ai-for-everyone/week1/everyday-workflows"
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
