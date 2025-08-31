'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Menu,
  X,
  Sparkles,
  Trophy,
  PartyPopper,
  CheckCircle2,
  FolderCheck,
  Share2,
  BookOpenCheck,
  GraduationCap,
  Rocket,
  ChevronLeft,
  ChevronRight,
  MessageSquareMore,
  Stars,
} from 'lucide-react';

// --- Config ------------------------------------------------------------------
const PROGRESS_KEY = 'pe-beginner:complete';

const SECTIONS = [
  { id: 'congrats', label: 'Congratulations' },
  { id: 'what-you-built', label: 'What You Built' },
  { id: 'portfolio', label: 'Portfolio & Handoff' },
  { id: 'certificate', label: 'Certificate (Optional)' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'next-steps', label: 'Next Steps' },
  { id: 'nav', label: 'Save & Close' },
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

// --- Page --------------------------------------------------------------------
export default function PromptEngineeringComplete() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user ?? null);

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, full_name')
          .eq('id', user.id)
          .single();
        setProfile(profile ?? null);

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
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      Boolean
    ) as Element[];
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-100 backdrop-blur bg-white/70">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-bold text-sm sm:text-base">
              Prompt Engineering • Completion
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              className="lg:hidden inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-expanded={sidebarOpen}
              aria-controls="mobile-sidebar"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              Contents
            </button>
            <div className="text-xs sm:text-sm text-gray-600">
              {loading ? (
                'Loading…'
              ) : user ? (
                `Signed in as ${username}`
              ) : (
                <Link href="/signin" className="underline">
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-4 sm:gap-6">
        {/* Sidebar */}
        <aside
          id="mobile-sidebar"
          className={cx(
            'rounded-2xl border border-gray-200 bg-white p-3 sm:p-4 shadow-sm',
            'lg:sticky lg:top-[72px] lg:h-[calc(100vh-88px)] lg:overflow-auto',
            sidebarOpen ? 'block' : 'hidden lg:block'
          )}
        >
          <p className="text-[11px] sm:text-xs uppercase tracking-wide text-gray-500 mb-2 sm:mb-3">
            On this page
          </p>
          <nav className="space-y-1">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setSidebarOpen(false)}
                className={cx(
                  'block rounded-lg text-xs sm:text-sm px-3 py-2',
                  activeId === s.id
                    ? 'bg-green-50 text-green-800'
                    : 'hover:bg-gray-50 text-gray-700'
                )}
              >
                {s.label}
              </a>
            ))}
          </nav>

          <div className="mt-4 sm:mt-6 p-3 rounded-xl bg-gray-50 text-[11px] sm:text-xs text-gray-600">
            Save your completion to keep your transcript up to date.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-4 sm:space-y-6">
          {/* Congrats */}
          <section
            id="congrats"
            className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3"
          >
            <div className="flex items-center gap-3">
              <PartyPopper className="h-6 w-6 text-green-700" />
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                Congratulations{user ? `, ${username}` : ''}! 🎉
              </h1>
            </div>
            <p className="text-base sm:text-lg text-gray-700">
              You’ve completed <b>Prompt Engineering · Beginner</b>. You can
              now design clear instruction prompts, use few‑shot patterns
              confidently, decide when to use CoT vs concise outputs, and ship
              reliable prompts with lightweight evaluations.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <Stat icon={<Trophy className="h-5 w-5" />} label="Weeks finished" value="2 / 2" />
              <Stat icon={<BookOpenCheck className="h-5 w-5" />} label="Lessons completed" value="6+" />
              <Stat icon={<Stars className="h-5 w-5" />} label="Artifacts created" value="Prompt pack + evals" />
            </div>
          </section>

          {/* What You Built */}
          <section
            id="what-you-built"
            className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">What You Built</h2>
            </div>
            <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700 space-y-1">
              <li>
                <b>Instruction prompt</b> with role, goal, constraints, format, and safe
                fallbacks.
              </li>
              <li>
                <b>Few‑shot examples</b> (style‑lock, contrastive pair, error exemplar)
                aligned to a strict JSON contract.
              </li>
              <li>
                <b>Quick evals</b>: golden set (incl. red‑team), assertions, tiny rubric,
                and a regression set.
              </li>
              <li>
                <b>Capstone pack</b> ready for teammates: prompt, examples, schema,
                golden set, and eval notes.
              </li>
            </ul>
          </section>

          {/* Portfolio & Handoff */}
          <section
            id="portfolio"
            className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3"
          >
            <div className="flex items-center gap-2">
              <FolderCheck className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Portfolio & Handoff</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700">
              Keep your artifacts together so you can reuse or show them quickly:
            </p>
            <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700 space-y-1">
              <li><b>prompt.md</b> — the final contract.</li>
              <li><b>examples.jsonl</b> — 1–3 schema‑true samples + 1 failure.</li>
              <li><b>schema.json</b> — strict keys, types, bounds.</li>
              <li><b>golden.json</b> — 8–15 canonical inputs + assertions.</li>
              <li><b>eval-notes.md</b> — A/B results, rubric averages, changelog.</li>
            </ul>
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-700">
              <Share2 className="inline h-4 w-4 mr-2 text-gray-600" />
              Tip: store everything in a single repo/folder so teammates can run
              evaluations in one command.
            </div>
          </section>

          {/* Certificate */}
          <section
            id="certificate"
            className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3"
          >
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Certificate (Optional)</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700">
              Want a completion certificate? Add your certificate route later and link it
              here. For now, this is a placeholder CTA.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Link
                href="/beginner/certificate"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow w-full sm:w-auto"
              >
                <GraduationCap className="h-4 w-4" />
                View Certificate
              </Link>
              <Link
                href="/learn/prompt-engineering/beginner/week2/capstone"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 w-full sm:w-auto"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Capstone
              </Link>
            </div>
          </section>

          {/* Feedback */}
          <section
            id="feedback"
            className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3"
          >
            <div className="flex items-center gap-2">
              <MessageSquareMore className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Feedback</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700">
              What worked? What should we improve? A single sentence helps us upgrade the
              course for everyone.
            </p>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
              Add your feedback form route (e.g. <code className="px-1 rounded bg-white border">/feedback</code>) and link it here.
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Link
                href="/feedback"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow w-full sm:w-auto"
              >
                Send Feedback
              </Link>
              <Link
                href="/learn/prompt-engineering/beginner/week2"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 w-full sm:w-auto"
              >
                Review Week 2
              </Link>
            </div>
          </section>

          {/* Next Steps */}
          <section
            id="next-steps"
            className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">What’s Next?</h2>
            </div>
            <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700 space-y-1">
              <li>
                Enroll in <b>Prompt Engineering · Intermediate</b> (advanced patterns,
                retrieval, eval harnesses).
              </li>
              <li>
                Revisit your <b>golden set</b> monthly; add real‑world failures and keep a
                regression file.
              </li>
              <li>
                Pair with a teammate and run an <b>A/B</b> on your production task.
              </li>
            </ul>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <Link
                href="/learn"
                className="rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 px-4 py-3 text-sm text-gray-800"
              >
                Browse More Courses
              </Link>
              <Link
                href="/learn/prompt-engineering/beginner"
                className="rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 px-4 py-3 text-sm text-gray-800"
              >
                Back to Prompt Engineering Home
              </Link>
            </div>
          </section>

          {/* Save & Close */}
          <section
            id="nav"
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3"
          >
            <Link
              href="/learn/prompt-engineering/beginner/week2/capstone"
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
                  completed
                    ? 'border-green-200 bg-green-50 text-green-800'
                    : 'border-gray-200 hover:bg-gray-50'
                )}
                title={user ? 'Save progress for this page' : 'Sign in to save progress'}
              >
                {completed ? 'Completion saved ✓' : 'Mark course complete'}
              </button>
              <Link
                href="/learn"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow w-full sm:w-auto"
                onClick={async () => {
                  if (!completed) await markComplete();
                }}
              >
                Explore More <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
