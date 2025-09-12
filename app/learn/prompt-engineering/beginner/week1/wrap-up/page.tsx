'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  BookOpenCheck,
  Trophy,
  FileCode2,
  ClipboardList,
  FolderCheck,
  Rocket,
  ShieldCheck,
  Home,
} from 'lucide-react';

// --- Config ------------------------------------------------------------------
const PROGRESS_KEY = 'pe-week-1:wrap-up';
const QUIZ_KEY = 'pe-week-1:final-quiz';
const PASS_KEY = 'pe-week-1:passed';
const PASS_THRESHOLD = 70;

const SECTIONS = [
  { id: 'intro', label: 'Wrap-Up' },
  { id: 'recap', label: 'Recap: What You Learned' },
  { id: 'skills', label: 'Skills Checklist' },
  { id: 'cheatsheet', label: 'Cheat-Sheet Templates' },
  { id: 'pitfalls', label: 'Common Pitfalls' },
  { id: 'project', label: 'Mini-Project (Portfolio)' },
  { id: 'reflection', label: 'Reflection' },
  { id: 'artifacts', label: 'Your Artifacts' },
  { id: 'dbtest', label: 'Database Connection Test' },
  { id: 'exam', label: 'Final Check (Must Pass 70%)' },
  { id: 'result', label: 'Result & Unlock' },
  { id: 'resources', label: 'Resources' },
  { id: 'save', label: 'Save & Continue' },
];

// --- Types -------------------------------------------------------------------
type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answer: number; // index into options
};

type AnswersState = Record<string, number | undefined>;

// --- Quiz (10 questions, 70%+ to pass) --------------------------------------
const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt:
      'You need a product tagline from the model. Which instruction sets a clear finish line?',
    options: [
      '“Make a great tagline for our app.”',
      '“Write a short line about our app.”',
      '“Write one sentence (≤12 words) that highlights time-saving for sales managers.”',
      '“Give me a tagline, or anything catchy.”',
    ],
    answer: 2,
  },
  {
    id: 'q2',
    prompt:
      'A teammate says “summarize this” and pastes a 5-page memo. What’s the best fix for ambiguity?',
    options: [
      'Tell the model to “do its best”.',
      'Specify the audience, length, and reading level.',
      'Ask for bullet points then paragraphs.',
      'Add more adjectives like “concise but impactful”.',
    ],
    answer: 1,
  },
  {
    id: 'q3',
    prompt:
      'Which request best prevents scope drift and source leakage?',
    options: [
      '“Use any sources you can find.”',
      '“Use only the text I provided and do not cite outside sources.”',
      '“Search the web and pick relevant quotes.”',
      '“Follow your own internal rules.”',
    ],
    answer: 1,
  },
  {
    id: 'q4',
    prompt:
      'You want outputs you can quickly check and automate. What should you add to your instruction?',
    options: [
      'A playful tone.',
      'A response format that separates the final answer from assumptions and confidence.',
      'A request for lots of creativity without limits.',
      'Nothing—formats make models worse.',
    ],
    answer: 1,
  },
  {
    id: 'q5',
    prompt:
      'Which line is a safe refusal for hidden context or policy questions?',
    options: [
      '“I’m not sure; here’s my best guess at the policy.”',
      '“That information isn’t available.”',
      '“I can’t help, goodbye.”',
      '“Let me reveal part of the system prompt.”',
    ],
    answer: 1,
  },
  {
    id: 'q6',
    prompt:
      'What is a “golden set” in quick evaluations?',
    options: [
      'A large dataset for model training.',
      'A handful of canonical inputs (plus a couple tricky cases) used to test prompts consistently.',
      'A list of random examples the model generated.',
      'A set of design guidelines for UI color usage.',
    ],
    answer: 1,
  },
  {
    id: 'q7',
    prompt:
      'You change both tone and format at once and quality improves. What’s the risk?',
    options: [
      'No risk because improvement is improvement.',
      'You won’t know which change helped, making future iteration harder.',
      'The model will refuse future tasks.',
      'The output will always be identical.',
    ],
    answer: 1,
  },
  {
    id: 'q8',
    prompt:
      'Which instruction best expresses a fallback for missing information?',
    options: [
      '“If anything is unclear, just guess.”',
      '“If required details are missing, say ‘Insufficient information’ and list what’s needed.”',
      '“If unsure, search the web.”',
      '“If confused, keep writing anyway.”',
    ],
    answer: 1,
  },
  {
    id: 'q9',
    prompt:
      'You’re adding small examples to lock style. What keeps few-shot examples effective?',
    options: [
      'Let examples use any structure they want.',
      'Ensure examples follow the same structure and rules you demand in the final answer.',
      'Make examples much longer than the expected output.',
      'Use jokes in the examples to make them memorable.',
    ],
    answer: 1,
  },
  {
    id: 'q10',
    prompt:
      'Which fast assertion is most helpful before shipping a tagline prompt?',
    options: [
      '“Sounds cool.”',
      '“Count the words and ensure banned phrases are absent.”',
      '“Ask a colleague if they like it.”',
      '“Check it looks bold in the website hero.”',
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
  const palette =
    tone === 'tip'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
      : tone === 'warn'
      ? 'border-amber-200 bg-amber-50 text-amber-900'
      : 'border-sky-200 bg-sky-50 text-sky-900';
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
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="font-medium mb-1">{title}</div>
        <div className="text-sm md:text-[0.95rem] leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

// --- Page --------------------------------------------------------------------
export default function Week1WrapUp() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  // Gate & quiz state
  const [answers, setAnswers] = useState<AnswersState>({});
  const [scorePct, setScorePct] = useState<number | null>(null);
  const [passed, setPassed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadAttempting, setLoadAttempting] = useState(true);
  const [dbPing, setDbPing] = useState<'idle' | 'ok' | 'error' | 'testing'>('idle');
  const [dbError, setDbError] = useState<string | null>(null);
  const [gateFromDb, setGateFromDb] = useState<boolean>(false);
  const canProceed = passed || gateFromDb;

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user ?? null);

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, full_name')
          .eq('id', user.id)
          .single();
        setProfile(profile ?? null);

        // Existing completion
        const { data: wrap } = await supabase
          .from('tracking')
          .select('completed')
          .eq('user_id', user.id)
          .eq('key', PROGRESS_KEY)
          .maybeSingle();
        setCompleted(Boolean(wrap?.completed));

        // Gate status
        const { data: gate } = await supabase
          .from('tracking')
          .select('completed')
          .eq('user_id', user.id)
          .eq('key', PASS_KEY)
          .maybeSingle();
        setGateFromDb(Boolean(gate?.completed));

        // Load last attempt if exists
        const { data: attempt } = await supabase
          .from('assessments')
          .select('score, passed, answers')
          .eq('user_id', user.id)
          .eq('key', QUIZ_KEY)
          .maybeSingle();

        if (attempt) {
          setScorePct(attempt.score ?? null);
          setPassed(Boolean(attempt.passed));
          if (attempt.answers && typeof attempt.answers === 'object') {
            setAnswers(attempt.answers as AnswersState);
          }
        }
      }
      setLoadAttempting(false);
      setLoading(false);
    };
    run();
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
    if (!user) return alert('Please sign in to save your progress.');
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

  // --- DB Test ---------------------------------------------------------------
  async function testDbConnection() {
    if (!user) {
      alert('Please sign in first.');
      return;
    }
    setDbError(null);
    setDbPing('testing');
    try {
      // light read—works even with empty table
      const { error } = await supabase.from('tracking').select('key').eq('user_id', user.id).limit(1);
      if (error) {
        setDbPing('error');
        setDbError(`${error.code || ''} ${error.message}`);
      } else {
        setDbPing('ok');
      }
    } catch (e: any) {
      setDbPing('error');
      setDbError(String(e?.message || e));
    }
  }

  // --- Quiz helpers ----------------------------------------------------------
  function selectAnswer(qid: string, optIndex: number) {
    setAnswers((prev) => ({ ...prev, [qid]: optIndex }));
  }

  function countCorrect(a: AnswersState): number {
    return QUIZ.reduce((acc, q) => (a[q.id] === q.answer ? acc + 1 : acc), 0);
  }

  async function submitQuiz() {
    if (!user) {
      alert('Please sign in to take the test.');
      return;
    }
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < QUIZ.length) {
      const missing = QUIZ.length - answeredCount;
      if (!confirm(`You have ${missing} unanswered question${missing > 1 ? 's' : ''}. Submit anyway?`)) {
        return;
      }
    }

    const correct = countCorrect(answers);
    const pct = Math.round((correct / QUIZ.length) * 100);
    const didPass = pct >= PASS_THRESHOLD;
    setScorePct(pct);
    setPassed(didPass);

    setSaving(true);
    try {
      // 1) Save attempt
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

      // 2) If passed, set PASS gate and mark wrap-up complete
      if (didPass) {
        const { error: terr } = await supabase.from('tracking').upsert(
          {
            user_id: user.id,
            key: PASS_KEY,
            completed: true,
            completed_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,key' }
        );
        if (terr) throw terr;

        const { error: cerr } = await supabase.from('tracking').upsert(
          {
            user_id: user.id,
            key: PROGRESS_KEY,
            completed: true,
            completed_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,key' }
        );
        if (cerr) throw cerr;

        setGateFromDb(true);
        setCompleted(true);
      }
    } catch (e: any) {
      console.error(e);
      alert(
        'Your attempt was calculated locally, but saving to the database failed. Please try again.\n\n' +
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ── Refactored Header (home left, centered title, right controls) ── */}
      <header className="sticky top-0 z-30 border-b border-gray-100 backdrop-blur bg-white/70">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-14 grid grid-cols-[auto_1fr_auto] items-center gap-3">
            {/* Left: Home */}
            <Link
              href="/learn/prompt-engineering/beginner"
              aria-label="Go to Prompt Engineering home"
              prefetch={false}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2"
            >
              <Home className="h-5 w-5" />
            </Link>

            {/* Center: Title */}
            <div className="flex items-center justify-center">
              <span className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                Week 1 · Wrap-up
              </span>
            </div>

            {/* Right: Mobile contents toggle + auth state */}
            <div className="justify-self-end flex items-center gap-3">
              <button
                type="button"
                aria-label="Toggle contents"
                className="lg:hidden inline-flex h-10 items-center gap-2 px-3 rounded-xl border border-gray-200 text-gray-800 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2"
                onClick={() => setSidebarOpen((v) => !v)}
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                <span className="sr-only">Contents</span>
              </button>

              <div className="hidden sm:block text-sm text-gray-600">
                {loading
                  ? 'Loading…'
                  : user
                  ? `Signed in as ${username}`
                  : <Link href="/signin" className="underline">Sign in</Link>}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-4 sm:gap-6">
        {/* Sidebar */}
        <aside
          id="mobile-sidebar"
          className={cx(
            'rounded-2xl border border-gray-200 bg-white p-3 sm:p-4 shadow-sm',
            'lg:sticky lg:top-[72px] lg:h-[calc(100vh-88px)] lg:overflow-auto',
            sidebarOpen ? 'block' : 'hidden lg:block'
          )}
        >
          <p className="text-[11px] sm:text-xs uppercase tracking-wide text-gray-500 mb-2 sm:mb-3">On this page</p>
          <nav className="space-y-1">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setSidebarOpen(false)}
                className={cx(
                  'block rounded-lg text-xs sm:text-sm px-3 py-2',
                  activeId === s.id ? 'bg-green-50 text-green-800' : 'hover:bg-gray-50 text-gray-700'
                )}
              >
                {s.label}
              </a>
            ))}
          </nav>

          <div className="mt-4 sm:mt-6 p-3 rounded-xl bg-gray-50 text-[11px] sm:text-xs text-gray-600">
            Pass the final check with <b>{PASS_THRESHOLD}%+</b> to unlock Week 2.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-4 sm:space-y-6">
          {/* Intro */}
          <section id="intro" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-2 sm:space-y-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Week 1 Wrap-Up</h1>
            <p className="text-base sm:text-lg text-gray-700">
              Amazing progress. You learned to set crisp goals and roles, bound scope, format for reliability, and validate with quick evals. This page consolidates your learning and verifies mastery with a short final check.
            </p>
            <Box tone="pro" title="How you pass">
              Score <b>{PASS_THRESHOLD}% or higher</b> on the final check below. Your best score is saved, and Week 2 unlocks automatically when you pass.
            </Box>
          </section>

          {/* Recap */}
          <section id="recap" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <BookOpenCheck className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Recap: What You Learned</h2>
            </div>
            <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700 space-y-1">
              <li><b>Instruction prompts:</b> define <i>goal</i>, <i>role</i>, <i>constraints</i>, and a clear <i>response format</i>.</li>
              <li><b>Clarity:</b> remove vague wording, bound sources/length, add refusal and fallback language.</li>
              <li><b>Formatting:</b> separate the final answer from assumptions and confidence so you can audit and automate.</li>
              <li><b>Quick evals:</b> tiny golden sets, simple assertions, and lightweight rubrics to catch regressions fast.</li>
            </ul>
          </section>

          {/* Skills Checklist */}
          <section id="skills" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Skills Checklist</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700 space-y-1">
                <li>Write a role/goal/constraints instruction in under 2 minutes.</li>
                <li>Bound scope and sources; include refusal and fallback language.</li>
                <li>Separate answer vs. assumptions vs. confidence for review.</li>
              </ul>
              <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700 space-y-1">
                <li>Create a golden set of 8–15 items with simple assertions.</li>
                <li>Run A/B on two prompt variants and keep the winner.</li>
                <li>Log changes and turn failures into regression tests.</li>
              </ul>
            </div>
            <div className="mt-2 flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <p className="text-sm">If these feel natural, you’re ready to pass.</p>
            </div>
          </section>

          {/* Cheat-Sheet Templates */}
          <section id="cheatsheet" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <FileCode2 className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Cheat-Sheet Templates</h2>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 sm:p-4">
              <h3 className="font-medium mb-2">Instruction template (plain text)</h3>
              <pre className="text-xs md:text-sm p-3 rounded bg-white border border-gray-200 overflow-auto whitespace-pre-wrap break-words">{`Role: you are an expert {role}.
Goal: {what should be produced} for {audience}. Success looks like {criteria}.
Constraints: {time/length/tone/banned terms/source limits}.
Format: explain what sections you want (e.g., "Answer:", "Assumptions:", "Confidence: low/medium/high").
Checks: say what to verify (e.g., "≤12 words", "no buzzwords").
Fallback: if info is missing, say "Insufficient information" and list what is needed.`}</pre>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 sm:p-4">
              <h3 className="font-medium mb-2">Guardrailed response contract (plain text)</h3>
              <pre className="text-xs md:text-sm p-3 rounded bg-white border border-gray-200 overflow-auto whitespace-pre-wrap break-words">{`Answer: …
Assumptions: …
Confidence: low / medium / high
If insufficient information: write "Insufficient information" and list what is missing.`}</pre>
            </div>
          </section>

          {/* Common Pitfalls */}
          <section id="pitfalls" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <h2 className="text-lg sm:text-xl font-semibold">Common Pitfalls</h2>
            <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700 space-y-1">
              <li>No audience or success criteria → model guesses tone/length.</li>
              <li>Unbounded sources/length → drift and inconsistent outputs.</li>
              <li>Unstructured answers → hard to review and automate.</li>
              <li>Changing many variables at once → unclear what helped.</li>
            </ul>
            <Box tone="warn" title="Antidote">
              One-change rule, tight formats, refusal/fallback language, and a tiny golden set.
            </Box>
          </section>

          {/* Mini-Project */}
          <section id="project" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Mini-Project (Portfolio-ready)</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700">
              Package a prompt for <b>support ops</b> or <b>marketing</b>: instruction, format, two examples, golden set, and a short changelog.
            </p>
          </section>

          {/* Reflection */}
          <section id="reflection" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <h2 className="text-lg sm:text-xl font-semibold">Reflection</h2>
            <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700 space-y-1">
              <li>Which constraint improved quality most?</li>
              <li>Which golden item failed first—and why?</li>
              <li>What rule will you carry into every prompt next week?</li>
            </ul>
          </section>

          {/* Artifacts */}
          <section id="artifacts" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <FolderCheck className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Your Artifacts (Week 1)</h2>
            </div>
            <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700 space-y-1">
              <li>Instruction (role, goal, constraints, format)</li>
              <li>Guardrailed format with fallback language</li>
              <li>Two few-shot examples that follow the format</li>
              <li>Golden set + simple checks</li>
              <li>Changelog / notes</li>
            </ul>
          </section>

          {/* DB Connection Test */}
          <section id="dbtest" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Database Connection Test</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700 mb-3">
              Click the button to verify we can read/write your progress. If something is misconfigured, you’ll get a helpful error.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={testDbConnection}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow disabled:opacity-60"
                disabled={dbPing === 'testing'}
              >
                {dbPing === 'testing' ? 'Testing…' : 'Test database connection'}
              </button>
              {dbPing === 'ok' && (
                <span className="inline-flex items-center gap-1 text-green-700 text-sm">
                  <CheckCircle2 className="h-4 w-4" /> Connected
                </span>
              )}
              {dbPing === 'error' && (
                <span className="inline-flex items-center gap-1 text-amber-700 text-sm">
                  <AlertTriangle className="h-4 w-4" /> Check configuration
                </span>
              )}
            </div>
            {dbPing === 'error' && dbError && (
              <div className="mt-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="font-medium mb-1">Error</div>
                <div className="mb-2">{dbError}</div>
                <details className="mt-2">
                  <summary className="cursor-pointer text-amber-900 underline">If “assessments” table is missing, use this SQL</summary>
                  <pre className="mt-2 whitespace-pre-wrap break-words">
{`create table if not exists public.assessments (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  score integer,
  passed boolean default false,
  answers jsonb,
  submitted_at timestamptz default now(),
  primary key (user_id, key)
);`}
                  </pre>
                </details>
              </div>
            )}
          </section>

          {/* Final Exam */}
          <section id="exam" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-green-700" />
                <h2 className="text-lg sm:text-xl font-semibold">Final Check (10 questions)</h2>
              </div>
              {scorePct !== null && (
                <div
                  className={cx(
                    'px-2.5 py-1 rounded-md text-sm',
                    (scorePct ?? 0) >= PASS_THRESHOLD ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
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
              <span className="text-xs text-gray-600">
                Your best score is saved under your account.
              </span>
            </div>
          </section>

          {/* Result & Unlock */}
          <section id="result" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Result & Unlock</h2>
            </div>
            {scorePct === null && !gateFromDb ? (
              <p className="text-sm sm:text-base text-gray-700">
                Take the final check above. You need <b>{PASS_THRESHOLD}%+</b> to unlock Week 2.
              </p>
            ) : (
              <div className="text-sm sm:text-base text-gray-700">
                {canProceed ? (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-green-800">
                    <div className="font-medium mb-1">Great job!</div>
                    <p>
                      You’ve met the threshold to continue. Your pass is stored, and Week 2 is unlocked.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800">
                    <div className="font-medium mb-1">Not yet</div>
                    <p>
                      Your current score is <b>{scorePct}%</b>. Aim for <b>{PASS_THRESHOLD}%+</b>.
                      Review the recap and try again.
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Resources */}
          <section id="resources" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <h2 className="text-lg sm:text-xl font-semibold">Resources</h2>
            <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700 space-y-1">
              <li>Week-1 instruction/clarity/formatting lessons</li>
              <li>Golden-set examples and lightweight evaluation tips</li>
              <li>Team checklist for role, goal, constraints, format, fallbacks, evals</li>
            </ul>
          </section>

          {/* Save & Continue */}
          <section id="save" className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
            <Link
              href="/learn/prompt-engineering/beginner/week1/quick-evals"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 w-full sm:w-auto"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </Link>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={markComplete}
                className={cx(
                  'px-4 py-2 rounded-lg border w-full sm:w-auto',
                  completed
                    ? 'border-green-200 bg-green-50 text-green-800'
                    : 'border-gray-200 hover:bg-gray-50'
                )}
                title={user ? 'Save progress for this page' : 'Sign in to save progress'}
              >
                {completed ? 'Progress saved ✓' : 'Save progress'}
              </button>

              {canProceed ? (
                <Link
                  href="/learn/prompt-engineering/beginner/week2"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow w-full sm:w-auto"
                >
                  Continue to Week 2 <ChevronRight className="h-4 w-4" />
                </Link>
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
