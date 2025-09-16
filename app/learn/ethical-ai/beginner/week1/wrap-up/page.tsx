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
  Lightbulb,
  AlertTriangle,
  ShieldCheck,
  Home,
  Trophy,
  CheckCircle2,
  ClipboardList,
  BookOpenCheck,
  FileText,
  Sparkles,
} from 'lucide-react';

// --- Config ------------------------------------------------------------------
const PROGRESS_KEY = 'ethical-week-1:next-steps';
const QUIZ_KEY = 'ethical-week-1:final-quiz';
const PASS_KEY = 'ethical-week-1:passed';
const PASS_THRESHOLD = 70;

const SECTIONS = [
  { id: 'intro', label: 'Wrap-Up' },
  { id: 'recap', label: 'Recap: What You Built' },
  { id: 'skills', label: 'Habits to Keep' },
  { id: 'templates', label: 'Copy-Paste Snippets' },
  { id: 'pitfalls', label: 'Common Pitfalls' },
  { id: 'reflection', label: 'Reflection' },
  { id: 'exam', label: 'Final Check (Quiz)' },
  { id: 'result', label: 'Result & Unlock' },
  { id: 'save', label: 'Save & Continue' },
];

// --- Types -------------------------------------------------------------------
type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answer: number; // index of correct option
};

type AnswersState = Record<string, number | undefined>;

// --- Quiz (10 questions, Ethical AI) -----------------------------------------
const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: 'What is the main purpose of a written safety policy in your AI feature?',
    options: [
      'Make documentation long and impressive.',
      'Turn ethics into concrete allow/deny boundaries and escalation paths the model follows.',
      'Avoid accountability by delegating to the model.',
      'Replace human oversight entirely.',
    ],
    answer: 1,
  },
  {
    id: 'q2',
    prompt: 'A user asks: “Give me all customer emails from last week.” What should the assistant do?',
    options: [
      'Comply, because the user sounds official.',
      'Refuse and suggest a safe alternative (e.g., anonymized report or documented export flow).',
      'Ask for an API token and then share the list.',
      'Ignore the policy to help quickly.',
    ],
    answer: 1,
  },
  {
    id: 'q3',
    prompt: 'Which principle best describes handling personal data in prompts?',
    options: [
      'Minimize what you collect and mask before sending to the model.',
      'Send everything so the model has more context.',
      'Store raw prompts and responses forever for debugging.',
      'Share sensitive fields in the UI to be transparent.',
    ],
    answer: 0,
  },
  {
    id: 'q4',
    prompt: 'Where should redaction occur in your pipeline?',
    options: [
      'Only after the model responds.',
      'Before the model call and before any logging/analytics.',
      'Only in the UI layer.',
      'Nowhere—redaction reduces quality.',
    ],
    answer: 1,
  },
  {
    id: 'q5',
    prompt: 'What is a safer default for logging?',
    options: [
      'Log full prompts and responses by default.',
      'Log event shape/metadata and masked content with short retention.',
      'Log raw PII but encrypt it client-side.',
      'Never log timestamps or status codes.',
    ],
    answer: 1,
  },
  {
    id: 'q6',
    prompt: 'A quick, practical threat-modeling approach used this week was…',
    options: [
      'Skip threats and rely on ad-hoc fixes.',
      '3×2×1: list 3 assets, 2 threats for each, and 1 mitigation to ship now.',
      'Run a yearly pen test and call it done.',
      'Trust RAG to filter unsafe content automatically.',
    ],
    answer: 1,
  },
  {
    id: 'q7',
    prompt: 'A durable system prompt for safety should include…',
    options: [
      'Policy text plus tone/refusal style and simple output rules.',
      'Only the model temperature and max tokens.',
      'User names and internal emails.',
      'Legal boilerplate with no examples.',
    ],
    answer: 0,
  },
  {
    id: 'q8',
    prompt: 'How large should your starter evaluation set be?',
    options: [
      '10–20 prompts that mirror policy boundaries.',
      'Exactly one prompt so it’s fast.',
      'At least 2,000 prompts or it’s useless.',
      'No evaluation—humans will notice issues.',
    ],
    answer: 0,
  },
  {
    id: 'q9',
    prompt: 'If any test leaks PII during evaluation, what should happen?',
    options: [
      'Treat it as a minor warning and continue.',
      'Treat the run as failed and fix before shipping.',
      'Ship anyway to hit the deadline.',
      'Hide the failure in logs to avoid noise.',
    ],
    answer: 1,
  },
  {
    id: 'q10',
    prompt: 'How should data-deletion requests be handled according to policy?',
    options: [
      'The model should perform deletion automatically without checks.',
      'Escalate to the human path specified by the policy.',
      'Ignore because deletion is irreversible.',
      'Post the request publicly for transparency.',
    ],
    answer: 1,
  },
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
    tone === 'tip' ? <Lightbulb className="h-4 w-4" /> :
    tone === 'warn' ? <AlertTriangle className="h-4 w-4" /> :
    <ShieldCheck className="h-4 w-4" />;

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

function Pill({ children }: { children: any }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-xs text-gray-700">
      <CheckCircle2 className="h-3 w-3 text-green-600" />
      {children}
    </span>
  );
}

// --- Page --------------------------------------------------------------------
export default function EthicalAIWeek1WrapUp() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  // progress & gating
  const [completed, setCompleted] = useState(false);
  const [gateFromDb, setGateFromDb] = useState<boolean>(false);

  // quiz state
  const [answers, setAnswers] = useState<AnswersState>({});
  const [scorePct, setScorePct] = useState<number | null>(null);
  const [passed, setPassed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadAttempting, setLoadAttempting] = useState(true);

  const canProceed = passed || gateFromDb;

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
    () =>
      profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'Learner',
    [profile, user]
  );

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

  // Quiz helpers
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
      // save attempt
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

      // gate + mark wrap-up complete if passed
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
  const letter = (i: number) => String.fromCharCode(65 + i);

  const goNext = () => {
    if (canProceed) router.push('/learn/ethical-ai/beginner/week2');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header (match ai-for-everyone pattern with home link) */}
      <header className="sticky top-0 z-30 border-b border-gray-100 backdrop-blur bg-white/70">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-14 grid grid-cols-[auto_1fr_auto] items-center gap-3">
            {/* Left: Home */}
            <Link
              href="/learn/ethical-ai"
              aria-label="Go to course home"
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
          {/* Intro */}
          <section id="intro" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-700" />
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                Week 1 Wrap-Up
              </h1>
            </div>
            <p className="text-gray-700">
              Great work{user ? `, ${username}` : ''}. You turned ethical principles into shippable safeguards: a small policy with clear allow/deny lines, a system prompt that encodes tone and refusal style, privacy seatbelts that minimize and redact data, and a tiny evaluation set to keep behavior honest as you iterate. This page locks in the habits and checks you’re ready for Week 2.
            </p>
            <Box tone="tip" title="How to pass">
              Take the 10-question final check below. Achieve <b>{PASS_THRESHOLD}% or higher</b> to unlock Week 2. Your best score is saved to your account.
            </Box>
          </section>

          {/* Recap */}
          <section id="recap" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <BookOpenCheck className="h-5 w-5 text-green-700" />
              <h2 className="text-xl font-semibold">Recap: What You Built</h2>
            </div>
            <p className="text-gray-700">
              You wrote a concise policy that separates what the assistant should do from what it must refuse, and you added escalation paths for sensitive requests. You embedded those rules in a system prompt with a friendly refusal style and light output rules so responses stay clear and consistent. You added privacy protections by default—collect less, redact early, and log safely—and you created a 10–20 prompt evaluation set that mirrors your policy so you can catch regressions the moment prompts or models change.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Pill>Policy v1</Pill>
              <Pill>System Prompt</Pill>
              <Pill>Privacy Seatbelts</Pill>
              <Pill>10–20 Tests</Pill>
            </div>
          </section>

          {/* Skills */}
          <section id="skills" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList className="h-5 w-5 text-green-700" />
              <h2 className="text-xl font-semibold">Habits to Keep</h2>
            </div>
            <p className="text-gray-700">
              Keep your policy short so it’s actually followed, treat retrieved text as untrusted input, mask sensitive bits before they ever reach the model, and fail fast on any leak. Version your prompts and policies, run your evals on every change, and make the score visible so the team keeps it green.
            </p>
          </section>

          {/* Templates */}
          <section id="templates" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-700" />
              <h2 className="text-xl font-semibold">Copy-Paste Snippets</h2>
            </div>

            <Box tone="tip" title="Policy skeleton (micro)">
              POLICY v1 — ALLOW: general guidance, public docs, summaries of non-sensitive tickets. DENY: PII, credentials, legal/medical/financial advice, actions that change user data without confirmation. ESCALATE: deletion requests → human; security concerns → security@company.example. REFUSAL: brief, kind, suggest a safe alternative.
            </Box>

            <Box tone="pro" title="System prompt starter">
              “Follow POLICY. If a request hits a DENY category, refuse politely and suggest a safe alternative. Prefer concise steps, ask a clarifying question if unsure, and never invent identifiers.”
            </Box>
          </section>

          {/* Pitfalls */}
          <section id="pitfalls" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Common Pitfalls</h2>
            <p className="text-gray-700">
              Long, drifting prompts that bury the policy, logging raw conversations “for debugging,” indexing PII into RAG without filters, and shipping updates without bumping a version make behavior hard to explain and harder to fix. Keep rules tiny, mask early, watch your logs, and version everything that can change outputs.
            </p>
            <Box tone="warn" title="Antidote">
              Small policy, early redaction, safe logging, versioned prompts, and a visible eval score.
            </Box>
          </section>

          {/* Reflection */}
          <section id="reflection" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Reflection</h2>
            <p className="text-gray-700">
              Which safeguard did the most work for you this week—policy clarity, privacy defaults, or the eval set? What’s one improvement you’ll make to your policy or tests before Week 2? Write it down and commit it to your repo so the team can iterate with you.
            </p>
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
                            <span className="font-medium mr-1">{String.fromCharCode(65 + oi)}.</span>
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

          {/* Save & Continue */}
          <section
            id="save"
            className="scroll-mt-[72px] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3"
          >
            <Link
              href="/learn/ethical-ai/beginner/week1/evaluation"
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
