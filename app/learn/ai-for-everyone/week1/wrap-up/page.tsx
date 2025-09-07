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
const PROGRESS_KEY = 'ai-everyone-week1:wrap-up';

const SECTIONS = [
  { id: 'summary', label: 'Week 1 Summary' },
  { id: 'takeaways', label: 'Key Takeaways' },
  { id: 'quiz', label: 'Quick Quiz' },
  { id: 'challenge', label: 'Practice Challenge' },
  { id: 'resources', label: 'Resources' },
  { id: 'next', label: 'Next Steps' },
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
export default function Week1WrapUpPage() {
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const [user, setUser] = useState<any>(null);

  // quiz state
  type Q = { q: string; options: string[]; answer: number; id: string };
  const QUESTIONS: Q[] = useMemo(
    () => [
      {
        id: 'q1',
        q: 'What is today’s AI especially good at?',
        options: [
          'Perfect factual accuracy without checking',
          'Language tasks like drafting, summarizing, and explaining',
          'Reading your mind and knowing your context automatically',
          'Making legal decisions on your behalf',
        ],
        answer: 1,
      },
      {
        id: 'q2',
        q: 'Which habit improves prompts the most for beginners?',
        options: [
          'Use technical jargon to sound smart',
          'Ask for the longest possible answer',
          'Goal • Context • Example (G‑C‑E)',
          'Always start with “You are a helpful assistant”',
        ],
        answer: 2,
      },
      {
        id: 'q3',
        q: 'What should you do before sharing sensitive info with an AI tool?',
        options: [
          'Nothing—AI tools always remove private data',
          'Post it first, then ask the AI to delete it',
          'Mask or remove personal details (names, IDs, phone numbers)',
          'Send a screenshot instead of text',
        ],
        answer: 2,
      },
      {
        id: 'q4',
        q: 'After the first AI response, what is a good next step?',
        options: [
          'Accept the first result as final',
          'Ask for one focused improvement (shorter, clearer, add checklist)',
          'Start a brand‑new chat every time',
          'Copy it to social media immediately',
        ],
        answer: 1,
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
  const passed = submitted && correctCount >= 3; // pass if 3/4+

  // supabase load/track
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

  // Handlers
  const selectOption = (qid: string, idx: number) =>
    setChoices((c) => ({ ...c, [qid]: idx }));
  const submitQuiz = () => setSubmitted(true);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-100 backdrop-blur bg-white/70">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span className="font-bold">Week 1 • Wrap‑Up</span>
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
            Pass the quiz (3+/4) to unlock completion.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-8">
          {/* Summary */}
          <section id="summary" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Week 1 Summary</h2>
            <p className="text-gray-700">
              You learned what AI is good at today (language tasks), where it struggles (facts, logic, missing context),
              and a simple habit for better results: <span className="font-medium">Goal • Context • Example (G‑C‑E)</span>.
              You also practiced everyday workflows—emails, documents, planning, and learning—while keeping privacy in mind.
            </p>
            <Box tone="pro" title="Mental model to keep">
              Treat AI like a fast, tireless intern: give clear instructions, ask for a format, and review important work yourself.
            </Box>
          </section>

          {/* Takeaways */}
          <section id="takeaways" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2">
            <h2 className="text-xl font-semibold">Key Takeaways</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Be clear about your <span className="font-medium">Goal</span>, add <span className="font-medium">Context</span>, and show an <span className="font-medium">Example/format</span>.</li>
              <li>Ask for <span className="font-medium">one improvement</span> after the first draft (shorter, clearer, checklist, table).</li>
              <li><span className="font-medium">Protect privacy</span>: remove names, IDs, and sensitive info before sharing.</li>
              <li>Use AI to <span className="font-medium">start faster</span>—you still make the final call.</li>
            </ul>
          </section>

          {/* Quiz */}
          <section id="quiz" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Quick Quiz</h2>
            <p className="text-gray-700">Answer 4 questions. Score 3 or more to pass.</p>

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
                          onClick={() => !submitted && selectOption(q.id, i)}
                          className={cx(
                            'text-left px-3 py-2 rounded-lg border transition',
                            selected && !submitted && 'border-green-400 bg-green-50',
                            !selected && !submitted && 'border-gray-200 hover:bg-gray-50',
                            showCorrect && 'border-emerald-300 bg-emerald-50',
                            showWrong && 'border-amber-300 bg-amber-50'
                          )}
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
                  onClick={submitQuiz}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow"
                >
                  Submit Answers
                </button>
              ) : (
                <div className={cx(
                  'inline-flex items-center gap-2 px-3 py-2 rounded-lg border',
                  passed ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-amber-200 bg-amber-50 text-amber-900'
                )}>
                  <CheckCircle className="h-4 w-4" />
                  {passed ? `Great job — ${correctCount}/4 correct` : `You got ${correctCount}/4. Try changing the wrong answers.`}
                </div>
              )}

              {submitted && !passed && (
                <button
                  onClick={() => {
                    setSubmitted(false);
                  }}
                  className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  Try Again
                </button>
              )}
            </div>

            <Box tone="tip" title="Hint">
              Revisit the earlier pages for clues: What AI can do, everyday workflows, and the G‑C‑E habit.
            </Box>
          </section>

          {/* Challenge */}
          <section id="challenge" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Practice Challenge (15 minutes)</h2>
            <ol className="list-decimal pl-5 text-gray-700 space-y-2">
              <li>Pick one real task you’ll do this week (email, summary, plan, or learning).</li>
              <li>Write a <span className="font-medium">G‑C‑E</span> prompt and ask for a <span className="font-medium">specific format</span> (bullets, steps, or table).</li>
              <li>Request <span className="font-medium">two versions</span> and choose the best.</li>
              <li>Make <span className="font-medium">one improvement</span> request (shorter/clearer/checklist).</li>
              <li>Save your prompt and final output in your notes for reuse.</li>
            </ol>
            <Box tone="pro" title="Build your library">
              Keep a simple “Prompt Bank” doc with your favorite prompts + best outputs. Reuse = speed.
            </Box>
          </section>

          {/* Resources */}
          <section id="resources" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Resources</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Week 1 pages: What AI Is → Everyday Workflows → Prompting Basics</li>
              <li>Templates from Week 1 (email rewrite, outlines, learning prompts)</li>
              <li>Personal “Prompt Bank” (start one in your notes app)</li>
            </ul>
            <Box tone="warn" title="Privacy reminder">
              Keep personal or sensitive information out of prompts whenever possible. Use placeholders like <em>[Name]</em> or <em>[Order #]</em>.
            </Box>
          </section>

          {/* Next */}
          <section id="next" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Next: Week 2 Overview</h2>
            <p className="text-gray-700 mb-4">
              In Week 2, you’ll learn safety and privacy essentials and how to choose the right AI tool for each job.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Back */}
              <Link
                href="/learn/ai-for-everyone/week1/prompting-basics"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Link>

              {/* Complete gating: require passing quiz */}
              <button
                onClick={async () => {
                  if (!submitted || !passed) {
                    alert('Please submit the quiz and score at least 3/4 to mark complete.');
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
                href="/learn/ai-for-everyone/week2"
                className={cx(
                  'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white hover:shadow',
                  submitted && passed ? 'bg-green-600' : 'bg-gray-300 pointer-events-none'
                )}
                onClick={async (e) => {
                  if (!submitted || !passed) {
                    e.preventDefault();
                    alert('Pass the quiz (3+/4) to continue to Week 2.');
                    return;
                  }
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
