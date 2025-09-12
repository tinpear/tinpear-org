'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Menu,
  X,
  Home,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Trophy,
  FolderCheck,
  BookOpenCheck,
  GraduationCap,
  AlertTriangle,
} from 'lucide-react';
import CertificatePDFActions from '@/components/CertificatePDF';

// --- Config ------------------------------------------------------------------
const PROGRESS_KEY   = 'ai-everyone-week2:wrap-up';
const WEEK1_PASS_KEY = 'ai-everyone-week1:passed';
const WEEK2_QUIZ_KEY = 'ai-everyone-week2:final-quiz';
const WEEK2_PASS_KEY = 'ai-everyone-week2:passed';
const PASS_THRESHOLD = 70;

const SECTIONS = [
  { id: 'intro',       label: 'Wrap-Up' },
  { id: 'recap',       label: 'Recap: What You Learned' },
  { id: 'toolkit',     label: 'Your Toolkit (Copy-Paste)' },
  { id: 'practice',    label: 'Mini Practice' },
  { id: 'exam',        label: 'Final Check (10 Qs)' },
  { id: 'result',      label: 'Result' },
  { id: 'certificate', label: 'Certificate (Optional)' },
  { id: 'save',        label: 'Save & Finish' },
];

// --- Types -------------------------------------------------------------------
type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answer: number; // index
};
type AnswersState = Record<string, number | undefined>;

// --- Quiz (10 Qs): Safety + Tool Choice -------------------------------------
const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: 'Which is the best first step before sharing real text with an AI tool?',
    options: [
      'Paste everything and hope for the best.',
      'Redact PII like names, phones, and IDs with placeholders.',
      'Replace only company names but keep customer emails.',
      'Skip redaction if the tool seems trustworthy.',
    ],
    answer: 1,
  },
  {
    id: 'q2',
    prompt: 'You’re writing a short client update. Which tool is the quickest fit?',
    options: ['Image generator.', 'Slide-deck tool.', 'General chat assistant.', 'Automation platform.'],
    answer: 2,
  },
  {
    id: 'q3',
    prompt: 'When facts matter (dates, prices, policy), what should you ask the model to provide?',
    options: [
      'A longer answer, nothing else.',
      'A list of uncertainties and 2–3 sources to verify.',
      'An apology in case it’s wrong.',
      'A funny anecdote to keep readers engaged.',
    ],
    answer: 1,
  },
  {
    id: 'q4',
    prompt: 'You need polished slides with clean structure. Which category fits best?',
    options: ['Chat assistant only.', 'Writer/slide tool.', 'Image generator.', 'Automation platform.'],
    answer: 1,
  },
  {
    id: 'q5',
    prompt: 'What’s a sensible “boundary” instruction for safety?',
    options: [
      '“Use any info you can find, internal or external.”',
      '“Do not use outside sources; stick to the text provided.”',
      '“Share internal policies even if confidential.”',
      '“Ignore safety if I say so later.”',
    ],
    answer: 1,
  },
  {
    id: 'q6',
    prompt:
      'You repeat a weekly workflow: summarize notes → tasks table → email. Which tool helps most?',
    options: ['Image tool.', 'Writer/slide tool.', 'General chat assistant (one-off).', 'Light automation (integrations/agents).'],
    answer: 3,
  },
  {
    id: 'q7',
    prompt: 'Which quick prompt makes risk visible in answers?',
    options: [
      '“Hide any uncertainty so it looks confident.”',
      '“If unsure, say ‘Insufficient information’ and list what’s missing.”',
      '“Guess if needed and keep going.”',
      '“Use private data to be certain.”',
    ],
    answer: 1,
  },
  {
    id: 'q8',
    prompt: 'You need a simple diagram/thumbnail for a post. Best starting tool?',
    options: ['Image tool.', 'Automation platform.', 'Writer/slide tool only.', 'Spreadsheet.'],
    answer: 0,
  },
  {
    id: 'q9',
    prompt: 'Which line helps avoid stereotypes and bias in examples?',
    options: [
      '“Use typical names from one region only.”',
      '“Avoid stereotypes; show diverse examples and neutral language.”',
      '“Ignore fairness; speed is more important.”',
      '“Exclude differences; keep all examples identical.”',
    ],
    answer: 1,
  },
  {
    id: 'q10',
    prompt: 'What keeps outputs easy to reuse across your tools?',
    options: [
      'Ask for a specific format (bullets, steps, or table).',
      'Let the tool choose any style each time.',
      'Use long paragraphs only.',
      'Avoid structure to stay flexible.',
    ],
    answer: 0,
  },
];

// --- Utilities ---------------------------------------------------------------
function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-green-600 text-white flex items-center justify-center">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm text-gray-600">{label}</div>
        <div className="text-lg font-semibold text-gray-900">{value}</div>
      </div>
    </div>
  );
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
      <Sparkles className="h-4 w-4" />
    ) : tone === 'warn' ? (
      <AlertTriangle className="h-4 w-4" />
    ) : (
      <CheckCircle2 className="h-4 w-4" />
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
export default function AIEveryoneWeek2WrapUp() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  // Quiz/gates
  const [answers, setAnswers] = useState<AnswersState>({});
  const [scorePct, setScorePct] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadAttempting, setLoadAttempting] = useState(true);

  const [week1Passed, setWeek1Passed] = useState(false);
  const [week2Passed, setWeek2Passed] = useState(false);

  const username = useMemo(
    () =>
      profile?.full_name ||
      profile?.username ||
      user?.email?.split('@')[0] ||
      'Learner',
    [profile, user]
  );

  const certEligible = week1Passed && week2Passed;

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user ?? null);

      if (user) {
        // profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, full_name')
          .eq('id', user.id)
          .maybeSingle();
        setProfile(profile ?? null);

        // page completion
        const { data: progress } = await supabase
          .from('tracking')
          .select('completed')
          .eq('user_id', user.id)
          .eq('key', PROGRESS_KEY)
          .maybeSingle();
        setCompleted(Boolean(progress?.completed));

        // gates
        const { data: w1 } = await supabase
          .from('tracking')
          .select('completed')
          .eq('user_id', user.id)
          .eq('key', WEEK1_PASS_KEY)
          .maybeSingle();
        setWeek1Passed(Boolean(w1?.completed));

        const { data: w2 } = await supabase
          .from('tracking')
          .select('completed')
          .eq('user_id', user.id)
          .eq('key', WEEK2_PASS_KEY)
          .maybeSingle();
        setWeek2Passed(Boolean(w2?.completed));

        // last attempt
        const { data: attempt } = await supabase
          .from('assessments')
          .select('score, passed, answers')
          .eq('user_id', user.id)
          .eq('key', WEEK2_QUIZ_KEY)
          .maybeSingle();

        if (attempt) {
          setScorePct(attempt.score ?? null);
          setWeek2Passed(Boolean(attempt.passed));
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
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      Boolean
    ) as Element[];
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Quiz helpers
  const letter = (i: number) => String.fromCharCode(65 + i);
  function selectAnswer(qid: string, idx: number) {
    setAnswers((prev) => ({ ...prev, [qid]: idx }));
  }
  function countCorrect(a: AnswersState): number {
    return QUIZ.reduce((acc, q) => (a[q.id] === q.answer ? acc + 1 : acc), 0);
  }
  async function submitQuiz() {
    if (!user) {
      alert('Please sign in to take the quiz.');
      return;
    }
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < QUIZ.length) {
      const missing = QUIZ.length - answeredCount;
      const ok = confirm(
        `You have ${missing} unanswered question${missing > 1 ? 's' : ''}. Submit anyway?`
      );
      if (!ok) return;
    }

    const correct = countCorrect(answers);
    const pct = Math.round((correct / QUIZ.length) * 100);
    const didPass = pct >= PASS_THRESHOLD;

    setScorePct(pct);
    setSaving(true);
    try {
      // Save attempt
      const { error: aerr } = await supabase.from('assessments').upsert(
        {
          user_id: user.id,
          key: WEEK2_QUIZ_KEY,
          score: pct,
          passed: didPass,
          answers,
          submitted_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,key' }
      );
      if (aerr) throw aerr;

      // Gate on pass + also mark wrap-up complete
      if (didPass) {
        const { error: gerr } = await supabase.from('tracking').upsert(
          {
            user_id: user.id,
            key: WEEK2_PASS_KEY,
            completed: true,
            completed_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,key' }
        );
        if (gerr) throw gerr;

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

        setWeek2Passed(true);
        setCompleted(true);
      }
    } catch (e: any) {
      console.error(e);
      alert(
        'Your score was calculated locally, but saving to the database failed. Please try again.\n\n' +
          (e?.message || '')
      );
    } finally {
      setSaving(false);
    }
  }
  function resetQuiz() {
    setAnswers({});
    setScorePct(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header: home icon + centered title + tidy mobile toggle */}
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
                Week 2 · Wrap-Up & Final Check
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
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-6">
        {/* Sidebar */}
        <aside
          className={cx(
            'rounded-2xl border border-gray-200 bg-white p-4 shadow-sm',
            'lg:sticky lg:top-[72px] lg:h-[calc(100vh-88px)] lg:overflow-auto',
            sidebarOpen ? 'block' : 'hidden lg:block'
          )}
        >
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">On this page</p>
          <nav className="space-y-1">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={cx(
                  'block rounded-lg text-sm px-3 py-2',
                  activeId === s.id ? 'bg-green-50 text-green-800' : 'hover:bg-gray-50 text-gray-700'
                )}
              >
                {s.label}
              </a>
            ))}
          </nav>
          <div className="mt-6 p-3 rounded-xl bg-gray-50 text-xs text-gray-600">
            Score <b>{PASS_THRESHOLD}%+</b> on the final check to <b>complete Week 2</b> and <b>unlock your certificate</b>.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-6">
          {/* Intro */}
          <section id="intro" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-700" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Nice work{user ? `, ${username}` : ''}!
              </h1>
            </div>
            <p className="text-gray-700">
              You learned two habits that make everyday AI use dependable: <b>stay safe with information</b> and
              <b> pick the right tool</b> for the job. This page bundles the key prompts, gives you a quick practice,
              and finishes with a short check.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Stat icon={<BookOpenCheck className="h-5 w-5" />} label="Safety habit" value="Redact • Verify • Bound" />
              <Stat icon={<FolderCheck className="h-5 w-5" />} label="Tool picker" value="Text • Slides • Images • Flows" />
              <Stat icon={<Trophy className="h-5 w-5" />} label="Pass mark" value={`${PASS_THRESHOLD}%+`} />
            </div>
          </section>

          {/* Recap */}
          <section id="recap" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <BookOpenCheck className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Recap: What You Learned</h2>
            </div>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li><b>Privacy first:</b> mask names, phones, IDs with placeholders before sharing.</li>
              <li><b>Visibility:</b> when facts matter, ask for uncertainties + 2–3 sources.</li>
              <li><b>Boundaries:</b> say what’s allowed and what should be refused.</li>
              <li><b>Tool choice:</b> chat for quick text, writer/slide tools for polish, image tools for visuals, light automations for repeatable steps.</li>
              <li><b>Paste-ready:</b> request bullets, steps, or a table so output drops straight into your app.</li>
            </ul>
          </section>

          {/* Toolkit */}
          <section id="toolkit" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold">Your Toolkit (copy-paste)</h2>

            <Box tone="tip" title="Safety checklist">
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li>🔒 Redact PII → <em>[Name]</em>, <em>[Phone]</em>, <em>[Email]</em>, <em>[ID]</em>.</li>
                <li>🔎 If factual/time-sensitive: “List uncertainties and 2–3 sources I can check.”</li>
                <li>🧭 Boundaries: add allowed/refuse examples for risky requests.</li>
                <li>🧪 Human review before anything public/high-stakes.</li>
              </ul>
            </Box>

            <Box tone="pro" title="Tool picker (fit-for-purpose)">
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li><b>Clean text now</b> → Chat assistant.</li>
                <li><b>Polished report/slides</b> → Writer/slide tool.</li>
                <li><b>Visuals/thumbnail</b> → Image tool.</li>
                <li><b>Repeat weekly steps</b> → Light automation (integrations/agents).</li>
              </ul>
            </Box>

            <Box tone="tip" title="Format request (paste-ready)">
              “Return the answer as (1) 5 bullets, (2) a tasks table (Task, Owner, Due), and (3) a 3-sentence email draft.”
            </Box>
          </section>

          {/* Mini Practice */}
          <section id="practice" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2">
            <h2 className="text-lg sm:text-xl font-semibold">Mini Practice (10 minutes)</h2>
            <ol className="list-decimal pl-5 text-gray-700 space-y-1">
              <li>Pick a real task (email/report/slide/image/automation).</li>
              <li>Redact PII. Add “If unsure, list uncertainties.”</li>
              <li>Choose the tool via the picker. Ask for a paste-ready format.</li>
              <li>Save your best prompt + output to your notes.</li>
            </ol>
          </section>

          {/* Final Check */}
          <section id="exam" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-green-700" />
                <h2 className="text-lg sm:text-xl font-semibold">Final Check (10 questions)</h2>
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

          {/* Result */}
          <section id="result" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Result</h2>
            </div>
            {scorePct === null && !week2Passed ? (
              <p className="text-sm sm:text-base text-gray-700">
                Take the final check above. You need <b>{PASS_THRESHOLD}%+</b> to complete Week 2.
              </p>
            ) : week2Passed ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-green-800">
                <div className="font-medium mb-1">Well done!</div>
                <p>Week 2 is complete. If you also passed Week 1, your certificate is unlocked below.</p>
              </div>
            ) : (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800">
                <div className="font-medium mb-1">Not yet</div>
                <p>Your current score is <b>{scorePct}%</b>. Aim for <b>{PASS_THRESHOLD}%+</b> and try again.</p>
              </div>
            )}
          </section>

          {/* Certificate (Optional) */}
          <section id="certificate" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Certificate (Optional)</h2>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800">
              <div className="font-medium mb-1">Eligibility</div>
              <p>
                Earn a downloadable certificate by scoring <b>{PASS_THRESHOLD}%+</b> in the Week-1 and Week-2 final checks.
                Your best scores are saved to your account.
              </p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div
                  className={cx(
                    'rounded-md px-3 py-2 border text-sm',
                    week1Passed ? 'bg-green-50 border-green-200 text-green-800' : 'bg-amber-50 border-amber-200 text-amber-800'
                  )}
                >
                  Week-1 final check: {week1Passed ? 'Passed' : 'Not yet'}
                </div>
                <div
                  className={cx(
                    'rounded-md px-3 py-2 border text-sm',
                    week2Passed ? 'bg-green-50 border-green-200 text-green-800' : 'bg-amber-50 border-amber-200 text-amber-800'
                  )}
                >
                  Week-2 final check: {week2Passed ? 'Passed' : 'Not yet'}
                </div>
                <div
                  className={cx(
                    'rounded-md px-3 py-2 border text-sm',
                    week1Passed && week2Passed ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 border-gray-200 text-gray-700'
                  )}
                >
                  Certificate eligibility: {week1Passed && week2Passed ? 'Eligible' : 'Locked'}
                </div>
              </div>
            </div>

            {/* Certificate actions */}
            <div className="rounded-xl border border-gray-200 p-3 sm:p-4">
              <div className="font-medium mb-1">Download your certificate</div>
              <p className="text-sm text-gray-700 mb-3">Celebrate your progress and save a copy for your records.</p>
              <div className={week1Passed && week2Passed ? '' : 'opacity-60 pointer-events-none'}>
                <CertificatePDFActions
                  fullName={username}
                  logoUrl="/logo.png"
                  courseKey="ai-everyone"
                  certPrefix="ai-everyone"
                  recordOnDownload={true}
                  showSaveToSupabase={true}
                  courseTitle="AI for Everyone"
                />
              </div>
              {!week1Passed || !week2Passed ? (
                <p className="text-xs text-amber-700 mt-2">
                  Pass both final checks (70%+) to enable certificate download.
                </p>
              ) : null}
            </div>
          </section>

          {/* Save & Finish */}
          <section
            id="save"
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3"
          >
            <Link
              href="/learn/ai-for-everyone/week2/choosing-tools"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 w-full sm:w-auto"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
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

              {/* No Week-3 — finish links instead */}
              <Link
                href="/learn/ai-for-everyone"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow w-full sm:w-auto"
              >
                Course Home <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/learn"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 w-full sm:w-auto"
              >
                Explore More Courses
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
