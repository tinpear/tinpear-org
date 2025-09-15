'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  ListChecks,
  CheckCircle2,
  Trophy,
  Home,
  ShieldCheck,
  FileText,
  BookOpenCheck,
} from 'lucide-react';

/**
 * Week 1 • Wrap-Up & Final Check (Quiz + Gating)
 * - Reads from `public.profiles` (username/full_name) for friendly header
 * - Tracks progress and gate in `tracking` (user_id, key, completed, completed_at)
 * - Saves quiz attempts to `assessments` (user_id, key, score, passed, answers, submitted_at)
 * - Unlocks "Next (Week 2)" when PASS_THRESHOLD met (or gate flag already present)
 * - Sticky, mobile-friendly sidebar with scrollspy
 * - Pyodide runner with quick-loads + beginner error hints
 */

const PROGRESS_KEY = 'week-1:wrap-up';
const QUIZ_KEY = 'week-1:final-quiz';
const PASS_KEY = 'week-1:passed';
const PASS_THRESHOLD = 70;

const SECTIONS = [
  { id: 'congrats', label: '🎉 Congrats!' },
  { id: 'big-picture', label: 'AI → ML → Python' },
  { id: 'you-learned', label: 'What you learned' },
  { id: 'python-recap', label: 'Python recap' },
  { id: 'structures-recap', label: 'Data structures recap' },
  { id: 'ml-recap', label: 'ML workflow recap' },
  { id: 'mistakes', label: '🚨 Common mistakes' },
  { id: 'practice-plan', label: 'Daily practice plan' },
  { id: 'exam', label: 'Final Check (Quiz)' },
  { id: 'result', label: 'Result & Unlock' },
  { id: 'try', label: '🏃‍♂️ Try it now' },
  { id: 'save', label: 'Save & Continue' },
];

type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answer: number; // index of correct option
};

type AnswersState = Record<string, number | undefined>;

const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: 'In this course’s framing, what’s the relationship between AI, ML, and Python?',
    options: [
      'ML is a subset of Python, and AI is a subset of ML.',
      'AI is the umbrella goal, ML is one way to achieve it, and Python is the tool we use to build it.',
      'Python is smarter than AI for most tasks.',
      'AI and ML are the same, Python is unrelated.',
    ],
    answer: 1,
  },
  {
    id: 'q2',
    prompt: 'Which Python operator checks equality?',
    options: ['=', '==', '===', 'is equal to'],
    answer: 1,
  },
  {
    id: 'q3',
    prompt: 'Which structure stores key → value pairs?',
    options: ['List', 'Tuple', 'Dictionary', 'Set'],
    answer: 2,
  },
  {
    id: 'q4',
    prompt: 'What is the purpose of a baseline in ML?',
    options: [
      'To tune hyperparameters only',
      'A simple rule to beat (e.g., mean predictor) that grounds your expectations',
      'To overfit training data',
      'A final test metric',
    ],
    answer: 1,
  },
  {
    id: 'q5',
    prompt: 'Why do we keep a held-out test set hidden until the end?',
    options: [
      'To save storage space',
      'To avoid leakage and keep the final score honest',
      'Because models can’t read test files',
      'It speeds up training batches',
    ],
    answer: 1,
  },
  {
    id: 'q6',
    prompt: 'When your classes are highly imbalanced, why can “accuracy” be misleading?',
    options: [
      'Because it ignores runtime',
      'Because a model predicting the majority class can have high accuracy but be useless on the minority class',
      'Because accuracy requires probabilities',
      'Because accuracy is only for regression',
    ],
    answer: 1,
  },
  {
    id: 'q7',
    prompt: 'Pick the best description of sets in Python.',
    options: [
      'Ordered, allow duplicates, indexable',
      'Unordered, unique elements, fast membership checks',
      'Key → value mapping',
      'Immutable sequence',
    ],
    answer: 1,
  },
  {
    id: 'q8',
    prompt: 'In the ML pipeline, which order is correct?',
    options: [
      'Train → Evaluate → Split → Frame → Iterate',
      'Split → Frame → Prepare → Train → Baseline → Evaluate',
      'Frame → Split → Prepare → Baseline → Train → Evaluate → Iterate',
      'Prepare → Train → Frame → Split',
    ],
    answer: 2,
  },
  {
    id: 'q9',
    prompt: 'Which Python feature prints formatted text like “Hello Ada, score: 93.8”?',
    options: ['docstrings', 'f-strings', 'triple quotes', 'format files'],
    answer: 1,
  },
  {
    id: 'q10',
    prompt: 'What’s a safe everyday habit when learning to code?',
    options: [
      'Change many things at once to move fast',
      'Print values often, change one small thing, run again',
      'Never read error messages',
      'Skip simple baselines',
    ],
    answer: 1,
  },
];

// ---------- UI helpers ----------
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
      <Sparkles className="h-4 w-4" />
    );

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

export default function Week1WrapUpPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  // gating / quiz state
  const [gateFromDb, setGateFromDb] = useState(false);
  const [answers, setAnswers] = useState<AnswersState>({});
  const [scorePct, setScorePct] = useState<number | null>(null);
  const [passed, setPassed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadAttempting, setLoadAttempting] = useState(true);

  const canProceed = passed || gateFromDb;

  // Reflection (local only)
  const [reflection, setReflection] = useState('');
  useEffect(() => {
    const saved = localStorage.getItem('week1_reflection') || '';
    setReflection(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem('week1_reflection', reflection || '');
  }, [reflection]);

  // Force light mode
  useEffect(() => {
    try {
      const el = document.documentElement;
      el.classList.remove('dark');
      el.style.colorScheme = 'light';
      ['theme', 'color-theme', 'ui-theme'].forEach((k) => {
        if (localStorage.getItem(k) === 'dark') localStorage.setItem(k, 'light');
      });
    } catch {}
  }, []);

  // Load user, profile, progress, gate, and last attempt
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) console.error(error);
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

          // progress
          const { data: wrap } = await supabase
            .from('tracking')
            .select('completed')
            .eq('user_id', user.id)
            .eq('key', PROGRESS_KEY)
            .maybeSingle();
          if (!cancelled) setCompleted(Boolean(wrap?.completed));

          // gate
          const { data: gate } = await supabase
            .from('tracking')
            .select('completed')
            .eq('user_id', user.id)
            .eq('key', PASS_KEY)
            .maybeSingle();
          if (!cancelled) setGateFromDb(Boolean(gate?.completed));

          // last attempt
          const { data: attempt } = await supabase
            .from('assessments')
            .select('score, passed, answers')
            .eq('user_id', user.id)
            .eq('key', QUIZ_KEY)
            .maybeSingle();
          if (!cancelled && attempt) {
            setScorePct(attempt.score ?? null);
            setPassed(Boolean(attempt.passed));
            if (attempt.answers && typeof attempt.answers === 'object') {
              setAnswers(attempt.answers as AnswersState);
            }
          }
        }
      } finally {
        if (!cancelled) {
          setLoadAttempting(false);
          setLoading(false);
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const username = useMemo(
    () => profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'Learner',
    [profile, user]
  );

  const markComplete = async () => {
    if (!user) return alert('Please sign in to save progress.');
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

  // Scrollspy (largest visible section)
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('main section[id]'));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId((visible[0].target as HTMLElement).id);
      },
      {
        root: null,
        rootMargin: '-112px 0px -55% 0px',
        threshold: [0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Quiz helpers
  const letter = (i: number) => String.fromCharCode(65 + i);
  function selectAnswer(qid: string, optIndex: number) {
    setAnswers((prev) => ({ ...prev, [qid]: optIndex }));
  }
  function countCorrect(a: AnswersState): number {
    return QUIZ.reduce((acc, q) => (a[q.id] === q.answer ? acc + 1 : acc), 0);
  }
  async function submitQuiz() {
    if (!user) {
      alert('Please sign in to submit your quiz.');
      return;
    }
    const answered = Object.keys(answers).length;
    if (answered < QUIZ.length) {
      const missing = QUIZ.length - answered;
      const ok = confirm(`You have ${missing} unanswered question${missing > 1 ? 's' : ''}. Submit anyway?`);
      if (!ok) return;
    }
    const correct = countCorrect(answers);
    const pct = Math.round((correct / QUIZ.length) * 100);
    const didPass = pct >= PASS_THRESHOLD;

    setScorePct(pct);
    setPassed(didPass);
    setSaving(true);
    try {
      const { error: aerr } = await supabase.from('assessments').upsert(
        {
          user_id: user.id,
          key: QUIZ_KEY,
          score: pct,
          passed: didPass,
          answers,
          submitted_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,key' }
      );
      if (aerr) throw aerr;

      if (didPass) {
        const { error: gateErr } = await supabase.from('tracking').upsert(
          {
            user_id: user.id,
            key: PASS_KEY,
            completed: true,
            completed_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,key' }
        );
        if (gateErr) throw gateErr;

        const { error: wrapErr } = await supabase.from('tracking').upsert(
          {
            user_id: user.id,
            key: PROGRESS_KEY,
            completed: true,
            completed_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,key' }
        );
        if (wrapErr) throw wrapErr;

        setGateFromDb(true);
        setCompleted(true);
      }
    } catch (e: any) {
      console.error(e);
      alert(
        'Your score was calculated, but saving to the database failed. Please try again.\n\n' +
          (e?.message || '')
      );
    } finally {
      setSaving(false);
    }
  }
  function resetQuiz() {
    setAnswers({});
    setScorePct(null);
    setPassed(false);
  }
  const goNext = () => {
    if (canProceed) router.push('/course/week-2');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-100 backdrop-blur bg-white/70">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-14 grid grid-cols-[auto_1fr_auto] items-center gap-3">
            {/* Left: Home */}
            <Link
              href="/learn/beginner"
              aria-label="Go to beginner home"
              prefetch={false}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2"
            >
              <Home className="h-5 w-5" />
            </Link>

            {/* Center: Title */}
            <div className="flex items-center justify-center">
              <span className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                Week 1 · Wrap-Up & Final Check
              </span>
            </div>

            {/* Right: Contents toggle (mobile) */}
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

      {/* Shell */}
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
          <nav className="space-y-1" aria-label="On this page">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={cx(
                  'block px-3 py-2 rounded-lg text-sm',
                  activeId === s.id ? 'bg-green-50 text-green-800' : 'hover:bg-gray-50 text-gray-700'
                )}
                onClick={() => setSidebarOpen(false)}
              >
                {s.label}
              </a>
            ))}
          </nav>

          <div className="mt-6 p-3 rounded-xl bg-gray-50 text-xs text-gray-600">
            Score <b>{PASS_THRESHOLD}%+</b> on the quiz to unlock Week 2.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-8">
          {/* Congrats */}
          <section id="congrats" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-700" />
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                Week 1 Wrap-Up{user ? ` — great job, ${username}!` : ''}
              </h1>
            </div>
            <p className="text-gray-700">
              You learned core Python, essential data structures, and a clean, honest ML workflow. Tiny reps → big progress.
              Lock in your wins below and take the final check to unlock Week 2.
            </p>
            <div className="mt-2 inline-flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <span>Tip: Mark this page complete to save progress.</span>
            </div>
          </section>

          {/* Big Picture */}
          <section id="big-picture" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">AI → ML → Python (how they connect)</h2>
            <p className="text-gray-700">
              <strong>AI</strong> is the big goal (useful “smart” behavior). <strong>ML</strong> is one powerful way to get there (learn from examples).
              <strong> Python</strong> is the friendly tool we use to clean data, train, and test ideas fast.
            </p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">{`AI (goal)
 └─ ML (learn from data)
     └─ Python (our tool)`}</pre>
            <Box tone="tip" title="Plain English">
              You now have the language (Python), the containers (data structures), and the recipe (ML workflow).
            </Box>
          </section>

          {/* You learned */}
          <section id="you-learned" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <BookOpenCheck className="h-5 w-5 text-green-700" />
              <h2 className="text-xl font-semibold">What you learned this week</h2>
            </div>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Python basics: variables, types, printing, decisions, loops, and functions.</li>
              <li>Data structures: <strong>list, tuple, set, dict</strong> — when and why to use each.</li>
              <li>ML workflow: frame → split → prepare → baseline → train → evaluate → iterate.</li>
              <li>Debugging mindset: print often, change one small thing, learn from error messages.</li>
            </ul>
          </section>

          {/* Python recap */}
          <section id="python-recap" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2">
            <h2 className="text-xl font-semibold">Python recap (quick)</h2>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">{`# Variables and types
age = 18
price = 19.99
name = "Ada"
is_student = True
print(f"{name} - age {age}, student? {is_student}")`}</pre>
            <Box tone="warn" title="Avoid this">
              Don’t mix text and numbers without converting (<code>"7" + 2</code> → error). Use <code>int("7") + 2</code> or <code>str(7) + "2"</code>.
            </Box>
          </section>

          {/* Data structures recap */}
          <section id="structures-recap" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Data structures recap</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <h3 className="font-medium mb-1">Lists & Dicts</h3>
                <pre className="text-sm whitespace-pre-wrap">{`scores = [85, 92, 90]
scores.append(88)
user = {"name": "Ada", "city": "Lagos"}
user["age"] = 18
print(scores)
print(user.get("email", "missing"))`}</pre>
              </div>
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <h3 className="font-medium mb-1">Tuples & Sets</h3>
                <pre className="text-sm whitespace-pre-wrap">{`point = (3, 4)  # fixed pair
colors = {"red", "blue", "red"}  # unique
print(point, colors)`}</pre>
              </div>
            </div>
          </section>

          {/* ML workflow recap */}
          <section id="ml-recap" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2">
            <h2 className="text-xl font-semibold">ML workflow recap (your reliable recipe)</h2>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">{`Frame → Split → Prepare → Baseline → Train → Evaluate → Iterate`}</pre>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li><strong>Frame:</strong> define the question and metric.</li>
              <li><strong>Split:</strong> train for learning, validation for tuning, test for final honesty.</li>
              <li><strong>Prepare:</strong> clean + explore + create helpful features.</li>
              <li><strong>Baseline:</strong> a simple rule to beat.</li>
              <li><strong>Evaluate:</strong> choose metrics that match your goal (e.g., accuracy vs precision/recall).</li>
            </ul>
          </section>

          {/* Common mistakes */}
          <section id="mistakes" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">🚨 Common Mistake Prevention</h2>
            <Box tone="warn" title="Python">
              • Using <code>=</code> instead of <code>==</code> in comparisons. <br />
              • Forgetting the <code>f</code> in f-strings. <br />
              • Shadowing built-ins (e.g., naming a variable <code>list</code>).
            </Box>
            <Box tone="warn" title="Data splits">
              • Peeking at the test set early → over-optimistic results (leakage). Keep test hidden until the end.
            </Box>
            <Box tone="warn" title="Metrics">
              • Only accuracy on imbalanced data. Also check precision, recall, and F1.
            </Box>
            <Box tone="tip" title="Pro tips">
              Print values, change one thing, run again. Small steady steps win.
            </Box>
          </section>

          {/* Practice plan */}
          <section id="practice-plan" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Daily practice plan (20–30 mins)</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Warm-up (5 min): rewrite a tiny example from memory.</li>
              <li>New reps (10–15 min): one list/dict exercise + one boolean/string task.</li>
              <li>Mini-ML (5–10 min): split a tiny dataset and compute a mean baseline.</li>
            </ul>
            <Box tone="pro" title="Mindset">
              Consistency beats intensity. A little every day compounds fast.
            </Box>
          </section>

          {/* Final Check (Quiz) */}
          <section id="exam" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-green-700" />
                <h2 className="text-xl font-semibold">Final Check (10 questions)</h2>
              </div>
              {scorePct !== null && (
                <div
                  className={cx(
                    'px-2.5 py-1 rounded-md text-sm',
                    (scorePct ?? 0) >= PASS_THRESHOLD
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  )}
                >
                  Score: {scorePct}%
                </div>
              )}
            </div>

            <div className="space-y-5">
              {QUIZ.map((q, qi) => (
                <div key={q.id} className="rounded-xl border border-gray-200 p-3 sm:p-4">
                  <div className="font-medium mb-2">
                    {qi + 1}. {q.prompt}
                  </div>
                  <div className="grid gap-2">
                    {q.options.map((opt, oi) => {
                      const checked = answers[q.id] === oi;
                      return (
                        <label
                          key={oi}
                          className={cx(
                            'flex items-start gap-2 rounded-lg border p-2 cursor-pointer',
                            checked ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
                          )}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            className="mt-1"
                            checked={checked || false}
                            onChange={() => selectAnswer(q.id, oi)}
                          />
                          <span className="text-sm">
                            <span className="font-medium mr-1">{letter(oi)}.</span>
                            {opt}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                onClick={submitQuiz}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow disabled:opacity-60"
                disabled={saving || loadAttempting}
                title={!user ? 'Sign in to submit your score' : undefined}
              >
                {saving ? 'Saving…' : 'Submit answers'}
              </button>
              <button
                onClick={resetQuiz}
                className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                disabled={saving}
              >
                Reset
              </button>
              <span className="text-xs text-gray-600">Your best score is saved to your account.</span>
            </div>
          </section>

          {/* Result & Unlock */}
          <section id="result" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Result & Unlock</h2>
            {scorePct === null && !gateFromDb ? (
              <p className="text-gray-700">
                Take the final check to unlock Week 2. You need <b>{PASS_THRESHOLD}%+</b>.
              </p>
            ) : (
              <div className="text-gray-700">
                {canProceed ? (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-green-800">
                    <div className="font-medium mb-1">Nice work!</div>
                    <p>Requirement met. Week 2 is unlocked for your account.</p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800">
                    <div className="font-medium mb-1">Almost there</div>
                    <p>
                      Your current score is <b>{scorePct}%</b>. Aim for <b>{PASS_THRESHOLD}%+</b>, review the recap,
                      and try again.
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Runner */}
          <section id="try" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">🏃‍♂️ Try it now</h2>
            <p className="text-gray-700">
              Load a snippet, click <strong>Initialize Python</strong>, then <strong>Run</strong>. Tweak one line and run again.
            </p>
            <PythonRunnerWorker />
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              <QuickLoad
                label="Review: types"
                code={`age=18; name="Ada"; is_student=True\nprint(type(age), type(name), type(is_student))`}
              />
              <QuickLoad
                label="Review: list vs dict"
                code={`scores=[85,92,90]; scores.append(88)\nuser={"name":"Ada","city":"Lagos"}\nuser["age"]=18\nprint(scores)\nprint(user.get("email","missing"))`}
              />
              <QuickLoad
                label="Review: split & baseline"
                code={`import random, statistics as st\ndata=list(range(30))\nrandom.shuffle(data)\ntrain=data[:18]; val=data[18:24]; test=data[24:]\nmean_pred=st.mean(train)\nval_pred=[mean_pred]*len(val)\nMSE=lambda a,b: sum((x-y)**2 for x,y in zip(a,b))/len(a)\nprint('baseline MSE:', MSE(val, val_pred))`}
              />
              <QuickLoad
                label="Fix me (syntax)"
                code={`# fix: use ==, add colon, indent\nx=5\nif x = 5\nprint('ok')`}
              />
            </div>
          </section>


          {/* Save & Continue */}
          <section id="save" className="scroll-mt-[72px] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
            <Link
              href="/course/week-1/ml-workflow"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 w-full sm:w-auto"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </Link>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={markComplete}
                className={cx(
                  'px-4 py-2 rounded-lg border w-full sm:w-auto',
                  completed ? 'border-green-200 bg-green-50 text-green-800' : 'border-gray-200 hover:bg-gray-50'
                )}
                title={user ? 'Save progress for this page' : 'Sign in to save progress'}
              >
                {completed ? 'Progress saved ✓' : 'Save progress'}
              </button>

              {canProceed ? (
                <button
                  onClick={goNext}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow w-full sm:w-auto"
                >
                  Continue to Week 2 <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  disabled
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-500 w-full sm:w-auto cursor-not-allowed"
                  title={`Score ${PASS_THRESHOLD}%+ on the final check to unlock Week 2`}
                >
                  Locked • Score {PASS_THRESHOLD}%+ to continue
                </button>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

/* ---------------- Runner (Web Worker + friendly errors) ---------------- */
function PythonRunnerWorker() {
  const [initialized, setInitialized] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [code, setCode] = useState<string>(`# Welcome! Edit and Run.\nprint('Week 1 wrap-up sandbox')`);
  const workerRef = useRef<Worker | null>(null);
  const urlRef = useRef<string | null>(null);

  (globalThis as any).__setRunnerCode = (c: string) => setCode(c);

  const ensureWorker = () => {
    if (workerRef.current) return;
    // safer: build code line-by-line to avoid template literal escaping issues
    const workerLines = [
      "self.language='python';",
      "let pyodideReadyPromise;",
      "async function init(){",
      "  if(!pyodideReadyPromise){",
      "    importScripts('https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js');",
      "    pyodideReadyPromise = loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/' });",
      "  }",
      "  self.pyodide = await pyodideReadyPromise;",
      "  self.pyodide.setStdout({ batched: (s) => postMessage({ type: 'stdout', data: s }) });",
      "  self.pyodide.setStderr({ batched: (s) => postMessage({ type: 'stderr', data: s }) });",
      "}",
      "self.onmessage = async (e) => {",
      "  const { type, code } = e.data || {};",
      "  try {",
      "    if (type === 'init'){",
      "      await init();",
      "      postMessage({ type: 'ready' });",
      "    } else if (type === 'run'){",
      "      await init();",
      "      let result = await self.pyodide.runPythonAsync(code);",
      "      postMessage({ type: 'result', data: String(result ?? '') });",
      "    }",
      "  } catch (err){",
      "    postMessage({ type: 'error', data: String(err) });",
      "  }",
      "};",
    ];
    const workerCode = workerLines.join('\n');

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    urlRef.current = url;
    workerRef.current = new Worker(url);
    workerRef.current.onmessage = (e: MessageEvent) => {
      const { type, data } = (e as any).data || {};
      if (type === 'ready') {
        setInitialized(true);
        setInitializing(false);
        setOutput('[python] ready\nTip: Click Run to execute the code.');
      } else if (type === 'stdout') {
        setOutput((o) => o + String(data));
      } else if (type === 'stderr') {
        setOutput((o) => o + String(data));
      } else if (type === 'result') {
        setRunning(false);
        if (data) setOutput((o) => o + (o.endsWith('\n') ? '' : '\n') + String(data) + '\nNice! ✅');
        else setOutput((o) => o + (o.endsWith('\n') ? '' : '\n') + 'Done. ✅');
      } else if (type === 'error') {
        setRunning(false);
        const hint = hintForError(String(data));
        setOutput(
          (o) => o + (o.endsWith('\n') ? '' : '\n') + '⚠️ ' + String(data) + (hint ? `\n💡 Hint: ${hint}` : '')
        );
      }
    };
  };

  useEffect(() => {
    return () => {
      if (workerRef.current) workerRef.current.terminate();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const init = () => {
    ensureWorker();
    if (!initialized && workerRef.current && !initializing) {
      setInitializing(true);
      setOutput('Loading Python… this runs in your browser.');
      workerRef.current.postMessage({ type: 'init' });
    }
  };

  const run = () => {
    ensureWorker();
    if (!initialized || !workerRef.current) return;
    setRunning(true);
    setOutput('');
    workerRef.current.postMessage({ type: 'run', code });
  };

  const resetConsole = () => setOutput('');

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
        <div className="text-sm text-gray-600">
          Interactive Python (loads when you click Initialize)
        </div>
        <div className="flex gap-2">
          {!initialized ? (
            <button
              onClick={init}
              disabled={initializing}
              className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              {initializing ? 'Initializing…' : 'Initialize Python'}
            </button>
          ) : (
            <>
              <button onClick={run} disabled={running} className="px-3 py-2 rounded-lg bg-green-600 text-white hover:shadow">
                {running ? 'Running…' : 'Run'}
              </button>
              <button
                onClick={resetConsole}
                className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                Clear Console
              </button>
            </>
          )}
        </div>
      </div>
      <textarea
        className="w-full min-h-[220px] rounded-xl border border-gray-200 p-3 font-mono text-sm bg-white"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
      />
      <div className="mt-3">
        <div className="text-sm font-medium mb-1">Console</div>
        <pre className="w-full min-h-[160px] rounded-xl border border-gray-200 p-3 text-sm bg-gray-50 overflow-auto whitespace-pre-wrap">
          {output}
        </pre>
      </div>
    </div>
  );
}

function QuickLoad({ label, code }: { label: string; code: string }) {
  return (
    <button
      className="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
      onClick={() => (globalThis as any).__setRunnerCode?.(code)}
      title="Load example into the editor"
    >
      {label}
    </button>
  );
}

/* -------------- Beginner-friendly error hints for Python ---------------- */
function hintForError(msg: string) {
  const m = msg.toLowerCase();
  if (m.includes('syntaxerror')) {
    if (m.includes('invalid syntax') || m.includes('syntaxerror:')) {
      return 'Missing colon (:) after if/for/def? Use == (comparison) not = (assignment)? Balanced parentheses/quotes?';
    }
  }
  if (m.includes('nameerror')) return 'Likely a typo or using a variable before defining it.';
  if (m.includes('indentationerror')) return 'Python uses indentation to define blocks. Indent inside if/for/def (usually 4 spaces).';
  if (m.includes('typeerror')) return 'You might be mixing text and numbers. Convert with int(...), float(...), or str(...).';
  return '';
}
