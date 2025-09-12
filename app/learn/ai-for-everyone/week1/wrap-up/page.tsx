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
const PROGRESS_KEY = 'ai-everyone-week1:wrap-up';
const QUIZ_KEY = 'ai-everyone-week1:final-quiz';
const PASS_KEY = 'ai-everyone-week1:passed';
const PASS_THRESHOLD = 70;

const SECTIONS = [
  { id: 'intro', label: 'Wrap‑Up' },
  { id: 'recap', label: 'Recap: What You Learned' },
  { id: 'skills', label: 'Skills Checklist' },
  { id: 'templates', label: 'Reusable Prompts' },
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

// --- Quiz (10 questions) -----------------------------------------------------
const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt:
      'Which description best fits how modern AI helps in everyday work?',
    options: [
      'It replaces judgment entirely so you can stop reviewing outputs.',
      'It is a fast assistant that turns intent into usable drafts you still review.',
      'It knows your company context automatically and never needs guidance.',
      'It’s only useful for coding tasks.',
    ],
    answer: 1,
  },
  {
    id: 'q2',
    prompt:
      'You ask an AI to “summarize this report.” What will most improve the result?',
    options: [
      'Add who the audience is, the word limit, and the tone you want.',
      'Ask it to “do its best” and keep trying randomly.',
      'Tell it to be “impactful and amazing.”',
      'Paste more unrelated documents for extra context.',
    ],
    answer: 0,
  },
  {
    id: 'q3',
    prompt:
      'What’s the simplest way to make outputs easier to reuse in other tools?',
    options: [
      'Ask for creative paragraphs every time.',
      'Specify a response format (e.g., bullets, steps, or a table with columns).',
      'Let the model pick any structure it prefers.',
      'Avoid constraints to keep the model “free.”',
    ],
    answer: 1,
  },
  {
    id: 'q4',
    prompt:
      'Which line demonstrates the Goal • Context • Example (G‑C‑E) habit?',
    options: [
      '“Make something good.”',
      '“Write a message.”',
      '“I need a 120‑word update for busy parents (friendly tone). Here’s a sample structure: intro → key update → next step.”',
      '“Be professional and inspiring and original all at once.”',
    ],
    answer: 2,
  },
  {
    id: 'q5',
    prompt:
      'Where does AI most often struggle in this course’s framing?',
    options: [
      'Tasks requiring exact calculations, up‑to‑the‑minute facts, or deep organizational context you haven’t provided.',
      'Short emails.',
      'Tone adjustments.',
      'Creating outlines.',
    ],
    answer: 0,
  },
  {
    id: 'q6',
    prompt:
      'You’re preparing an email to a concerned customer. Which guidance is best?',
    options: [
      '“Write me something nice.”',
      '“One‑paragraph reply with a brief apology, reassurance, and clear next step by Friday. Friendly and concise.”',
      '“Make it viral.”',
      '“Use lots of fancy words to impress them.”',
    ],
    answer: 1,
  },
  {
    id: 'q7',
    prompt:
      'What’s the safest approach when your prompt involves sensitive data?',
    options: [
      'Paste everything; the model will detect privacy issues automatically.',
      'Mask or remove personal details and follow your data policies.',
      'Ask the model to ignore privacy laws.',
      'Upload your entire customer database for context.',
    ],
    answer: 1,
  },
  {
    id: 'q8',
    prompt:
      'After the first draft, which follow‑up request best improves quality?',
    options: [
      '“Rewrite from scratch in a completely different style.”',
      '“Shorten by 25%, remove jargon, and keep the three key points.”',
      '“Make it more amazing.”',
      '“Add a lot more adjectives.”',
    ],
    answer: 1,
  },
  {
    id: 'q9',
    prompt:
      'Which option shows healthy skepticism before sharing externally?',
    options: [
      'Trust the model because it sounded confident.',
      'Ask for sources only if you remember.',
      'Verify important names, dates, and claims yourself.',
      'Skip review to save time.',
    ],
    answer: 2,
  },
  {
    id: 'q10',
    prompt:
      'You want consistent outputs across similar tasks next week. What should you do?',
    options: [
      'Reuse a good prompt with the same format and keep notes of improvements.',
      'Write prompts from scratch every time.',
      'Change many variables at once so you can’t tell what helped.',
      'Avoid examples or formats so it stays flexible.',
    ],
    answer: 0,
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
    tone === 'tip' ? (
      <Lightbulb className="h-4 w-4" />
    ) : tone === 'warn' ? (
      <AlertTriangle className="h-4 w-4" />
    ) : (
      <ShieldCheck className="h-4 w-4" />
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

// --- Page --------------------------------------------------------------------
export default function AIEveryoneWeek1WrapUp() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  // progress
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
    if (canProceed) router.push('/learn/ai-for-everyone/week2');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header (home icon, centered title, tidy mobile toggle) */}
      <header className="sticky top-0 z-30 border-b border-gray-100 backdrop-blur bg-white/70">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-14 grid grid-cols-[auto_1fr_auto] items-center gap-3">
            {/* Left: Home */}
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
                Week 1 · Wrap‑Up & Final Check
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
                Week 1 Wrap‑Up
              </h1>
            </div>
            <p className="text-gray-700">
              Great work{user ? `, ${username}` : ''}. You learned a practical way to collaborate with AI: start with a
              clear outcome, add a touch of context, and ask for a format you can reuse. You practiced
              everyday workflows and saw how small, precise prompts turn fuzzy intent into useful drafts.
              This page consolidates the essentials and checks you’re ready for Week 2.
            </p>
            <Box tone="tip" title="How to pass">
              Take the 10‑question final check below. Achieve <b>{PASS_THRESHOLD}% or higher</b> to unlock Week 2.
              Your best score is saved automatically to your account.
            </Box>
          </section>

          {/* Recap */}
          <section id="recap" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <BookOpenCheck className="h-5 w-5 text-green-700" />
              <h2 className="text-xl font-semibold">Recap: What You Learned</h2>
            </div>
            <p className="text-gray-700">
              You reframed AI as a capable assistant that excels with language, structure, and iteration.
              You saw where it shines—summaries, drafts, brainstorming, tone shifts—and where your judgment
              matters most—fact‑checking, privacy, and decisions with real‑world impact. Most importantly,
              you practiced small habits that make results consistent: describe the goal, clarify the
              audience and constraints, and show the expected shape of the answer before you ask.
            </p>
          </section>

          {/* Skills */}
          <section id="skills" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList className="h-5 w-5 text-green-700" />
              <h2 className="text-xl font-semibold">Skills Checklist</h2>
            </div>
            <p className="text-gray-700">
              You can shape a request with G‑C‑E, steer tone and length, ask for a reusable format, and make one
              targeted improvement after the first draft. You know when to verify facts and how to avoid sharing
              unnecessary sensitive data. These skills compound quickly as you reuse your best prompts.
            </p>
          </section>

          {/* Templates */}
          <section id="templates" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-700" />
              <h2 className="text-xl font-semibold">Reusable Prompts</h2>
            </div>

            <Box tone="tip" title="G‑C‑E scaffold">
              I need <em>[output]</em> for <em>[audience]</em>. Keep it <em>[length/tone]</em>. Include <em>[must‑haves]</em>,
              avoid <em>[don’ts]</em>. Return as <em>[format]</em>. Example structure: <em>[tiny sample]</em>.
            </Box>

            <Box tone="tip" title="Polite customer reply">
              One‑paragraph reply with a brief apology, reassurance, and a clear next step by <em>[date]</em>.
              Friendly, concise. Add 3 subject line options.
            </Box>

            <Box tone="pro" title="Planning checklist">
              Turn <em>[goal]</em> into 5–7 steps with owners and due dates. Then provide a copy‑paste checklist version.
            </Box>
          </section>

          {/* Pitfalls */}
          <section id="pitfalls" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Common Pitfalls</h2>
            <p className="text-gray-700">
              Vague requests produce guesswork; missing context forces the model to infer; and unstructured
              answers are harder to reuse or review. The fix is simple: specify the audience and outcome,
              add useful constraints, and request a format. Keep sensitive data out of prompts or mask it,
              and verify critical details before sharing externally.
            </p>
            <Box tone="warn" title="Antidote">
              State the goal, add context, demand a format, and ask for one improvement after the first draft.
            </Box>
          </section>

          {/* Reflection */}
          <section id="reflection" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Reflection</h2>
            <p className="text-gray-700">
              Which small instruction improved your outputs the most—length, tone, or format? What is one
              template you will reuse next week, and how will you adapt it for different audiences? Write
              down the answer; future‑you will thank you.
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

          {/* Save & Continue */}
          <section id="save" className="scroll-mt-[72px] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
            <Link
              href="/learn/ai-for-everyone/week1/prompting-basics"
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
