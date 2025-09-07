'use client';

import { useEffect, useMemo, useState } from 'react';
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
  CheckCircle,
} from 'lucide-react';

// --- Config ------------------------------------------------------------------
const PROGRESS_KEY = 'ai-everyone-week2:wrap-up';

const SECTIONS = [
  { id: 'summary', label: 'Week 2 Summary' },
  { id: 'toolkit', label: 'Reusable Toolkit' },
  { id: 'quiz', label: 'Quick Quiz' },
  { id: 'challenge', label: 'Practice Challenge' },
  { id: 'resources', label: 'Resources' },
  { id: 'next', label: 'Finish Course' },
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
export default function Week2WrapUpPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  // Quiz state
  type Q = { id: string; q: string; options: string[]; answer: number };
  const QUESTIONS: Q[] = useMemo(
    () => [
      {
        id: 'q1',
        q: 'What should you do before sharing text that may include personal data?',
        options: [
          'Post it and ask AI to delete later',
          'Replace identifiers with placeholders like [Name] or [ID]',
          'Convert to PDF first',
          'Nothing—AI removes PII automatically',
        ],
        answer: 1,
      },
      {
        id: 'q2',
        q: 'You need a polished slide deck with clear structure. What tool category is the best fit?',
        options: [
          'Chat assistant (generalist)',
          'Writer/slide tools (specialist)',
          'Image generator',
          'Agents/integrations',
        ],
        answer: 1,
      },
      {
        id: 'q3',
        q: 'When should you double‑check AI output with sources?',
        options: [
          'Only when the text is long',
          'Whenever the stakes are high or the info is time‑sensitive',
          'Never—AI is always up‑to‑date',
          'Only if the model asks you to',
        ],
        answer: 1,
      },
      {
        id: 'q4',
        q: 'What’s a safe way to reduce bias in examples?',
        options: [
          'Ask for diverse, inclusive examples and avoid stereotypes',
          'Use one demographic for consistency',
          'Hide the audience',
          'Ask for humor to make it neutral',
        ],
        answer: 0,
      },
      {
        id: 'q5',
        q: 'You repeat the same weekly flow (draft → summary → email). Which category can chain steps?',
        options: [
          'Chat assistant',
          'Writer/slide tools',
          'Image tools',
          'Agents/integrations',
        ],
        answer: 3,
      },
    ],
    []
  );

  const [choices, setChoices] = useState<Record<string, number | null>>(
    Object.fromEntries(QUESTIONS.map((q) => [q.id, null]))
  );
  const [submitted, setSubmitted] = useState(false);
  const correctCount = useMemo(
    () =>
      QUESTIONS.reduce((sum, q) => {
        const picked = choices[q.id];
        return sum + (picked === q.answer ? 1 : 0);
      }, 0),
    [choices, QUESTIONS]
  );
  const passed = submitted && correctCount >= 4; // pass if 4/5+

  // Supabase load/track
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
            <span className="font-bold">Week 2 • Wrap‑Up</span>
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
              {loading ? 'Loading…' : user ? 'Signed in' : <Link href="/signin" className="underline">Sign in</Link>}
            </div>
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
            Pass quiz (4+/5) → mark complete → finish course.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-8">
          {/* Summary */}
          <section id="summary" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Week 2 Summary</h2>
            <p className="text-gray-700">
              You learned simple safety habits (redact PII, request uncertainties/sources, avoid stereotypes)
              and how to pick the right tool for the job (chat for flexible text, writer/slide tools for polish,
              image tools for visuals, and agents/integrations for repeatable flows).
            </p>
            <Box tone="pro" title="Keep this mindset">
              Safety is a small habit, not a slowdown. Tool choice begins with your outcome—then ask for a format you can reuse.
            </Box>
          </section>

          {/* Toolkit */}
          <section id="toolkit" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Reusable Toolkit (copy to your notes)</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Box tone="tip" title="Safety Checklist">
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  <li>🔒 Redact names/IDs → placeholders: [Name], [Email], [ID].</li>
                  <li>🔎 Important facts → ask for uncertainties + 2–3 sources.</li>
                  <li>⚖️ Request inclusive, stereotype‑free examples.</li>
                  <li>🧭 Define allow/deny; escalate risky requests.</li>
                </ul>
              </Box>
              <Box tone="tip" title="Tool Picker">
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  <li>Need flexible text now → Chat assistant.</li>
                  <li>Need polished docs/slides → Writer/slide tool.</li>
                  <li>Need visuals → Image tool (describe style/size).</li>
                  <li>Repeatable weekly flow → Agent/integration.</li>
                </ul>
              </Box>
            </div>
            <Box tone="pro" title="Format nudge">
              “Return the result as bullets / numbered steps / a table with columns: Task, Owner, Due, Notes.”
            </Box>
          </section>

          {/* Quiz */}
          <section id="quiz" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Quick Quiz</h2>
            <p className="text-gray-700">Answer 5 questions. Score 4 or more to pass.</p>

            <div className="space-y-6">
              {QUESTIONS.map((q, idx) => (
                <div key={q.id} className="border rounded-xl p-4">
                  <div className="font-medium mb-3">{idx + 1}. {q.q}</div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {q.options.map((opt, i) => {
                      const selected = choices[q.id] === i;
                      const showCorrect = submitted && i === q.answer;
                      const showWrong = submitted && selected && i !== q.answer;
                      return (
                        <button
                          key={i}
                          onClick={() => !submitted && setChoices((c) => ({ ...c, [q.id]: i }))}
                          className={cx(
                            'text-left px-3 py-2 rounded-lg border transition',
                            selected && !submitted && 'border-green-400 bg-green-50',
                            !selected && !submitted && 'border-gray-200 hover:bg-gray-50',
                            showCorrect && 'border-emerald-300 bg-emerald-50',
                            showWrong && 'border-amber-300 bg-amber-50'
                          )}
                          disabled={submitted}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
              {!submitted ? (
                <button
                  onClick={() => setSubmitted(true)}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow"
                >
                  Submit Answers
                </button>
              ) : (
                <div
                  className={cx(
                    'inline-flex items-center gap-2 px-3 py-2 rounded-lg border',
                    passed
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                      : 'border-amber-200 bg-amber-50 text-amber-900'
                  )}
                >
                  <CheckCircle className="h-4 w-4" />
                  {passed ? `Great job — ${correctCount}/5 correct` : `You got ${correctCount}/5. Change the wrong answers and resubmit.`}
                </div>
              )}

              {submitted && !passed && (
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  Try Again
                </button>
              )}
            </div>

            <Box tone="tip" title="Hint">
              Revisit Ethics/Safety/Privacy and Choosing Tools pages for quick refreshers.
            </Box>
          </section>

          {/* Challenge */}
          <section id="challenge" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Practice Challenge (15 minutes)</h2>
            <ol className="list-decimal pl-5 text-gray-700 space-y-2">
              <li>Pick one real task this week (email/report/slide/image/automation).</li>
              <li>Use the <span className="font-medium">Tool Picker</span> to choose a tool category.</li>
              <li>Write a short prompt with <span className="font-medium">Goal • Context • Example</span> and a clear format.</li>
              <li>Ask for 2 options → pick the best → make one improvement (shorter/clearer/table).</li>
              <li>Save your prompt + best output in your notes (your growing “Prompt Bank”).</li>
            </ol>
            <Box tone="pro" title="Small upgrade">
              Create a saved snippet for your Safety Checklist and paste it into any new chat.
            </Box>
          </section>

          {/* Resources */}
          <section id="resources" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Resources</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Week 2 pages: Ethics/Safety/Privacy → Choosing Tools</li>
              <li>Safety Checklist + Tool Picker (copy above to your notes)</li>
              <li>Your “Prompt Bank” from Week 1 & 2</li>
            </ul>
            <Box tone="warn" title="Privacy reminder">
              Keep sensitive info out of prompts whenever possible. Use placeholders like <em>[Name]</em>, <em>[Order #]</em>.
            </Box>
          </section>

          {/* Next */}
          <section id="next" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Finish the Course</h2>
            <p className="text-gray-700 mb-4">
              Pass the quiz and mark complete to unlock the final page.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Back */}
              <Link
                href="/learn/ai-for-everyone/week2/choosing-tools"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Link>

              {/* Complete gating: require passing quiz */}
              <button
                onClick={async () => {
                  if (!submitted || !passed) {
                    alert('Please submit the quiz and score at least 4/5 to mark complete.');
                    return;
                  }
                  await markComplete();
                }}
                className={cx(
                  'px-4 py-2 rounded-lg border',
                  completed
                    ? 'border-green-200 bg-green-50 text-green-800'
                    : 'border-gray-200 hover:bg-gray-50'
                )}
              >
                {completed ? 'Progress saved ✓' : 'Mark page complete'}
              </button>

              {/* Next */}
              <Link
                href="/learn/ai-for-everyone/completion"
                className={cx(
                  'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white hover:shadow',
                  submitted && passed ? 'bg-green-600' : 'bg-gray-300 pointer-events-none'
                )}
                onClick={async (e) => {
                  if (!submitted || !passed) {
                    e.preventDefault();
                    alert('Pass the quiz (4+/5) to continue to the completion page.');
                    return;
                  }
                  if (!completed && user) await markComplete();
                }}
              >
                Finish Course <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
