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
} from 'lucide-react';

// --- Config ------------------------------------------------------------------
const PROGRESS_KEY = 'pe-week-1:wrap-up';

const SECTIONS = [
  { id: 'intro', label: 'Wrap‑Up' },
  { id: 'recap', label: 'Recap: What You Learned' },
  { id: 'skills', label: 'Skills Checklist' },
  { id: 'cheatsheet', label: 'Cheat‑Sheet Templates' },
  { id: 'pitfalls', label: 'Common Pitfalls' },
  { id: 'project', label: 'Mini‑Project (Portfolio)' },
  { id: 'reflection', label: 'Reflection' },
  { id: 'artifacts', label: 'Your Artifacts' },
  { id: 'next', label: 'Next: Week 2 Preview' },
  { id: 'resources', label: 'Resources' },
  { id: 'save', label: 'Save & Continue' },
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
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as Element[];
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
            <span className="font-bold text-sm sm:text-base">Week 1 • Wrap‑Up</span>
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
              {loading ? 'Loading…' : user ? `Signed in as ${username}` : <Link href="/signin" className="underline">Sign in</Link>}
            </div>
          </div>
        </div>
      </header>

      {/* Content area */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-4 sm:gap-6">
        {/* Sidebar (mobile slide-over, desktop sticky) */}
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
            Wrap up your artifacts, then roll into Week 2 patterns.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-4 sm:space-y-6">
          {/* Intro */}
          <section id="intro" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-2 sm:space-y-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Week 1 Wrap‑Up</h1>
            <p className="text-base sm:text-lg text-gray-700">
              Incredible work. You built trustworthy prompts with roles, goals, constraints, structured formats, and lightweight evals. This page helps you consolidate everything into a portfolio‑ready artifact and get primed for Week 2.
            </p>
            <Box tone="pro" title="Keep it small. Keep it shippable.">
              Clear contracts + quick evals beat giant prompts every time.
            </Box>
          </section>

          {/* Recap */}
          <section id="recap" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <BookOpenCheck className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Recap: What You Learned</h2>
            </div>
            <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700 space-y-1">
              <li><b>Instruction prompts</b>: define <i>goal</i>, <i>role</i>, <i>constraints</i>, <i>format</i>.</li>
              <li><b>Clarity</b>: remove ambiguity, set boundaries, prevent leakage.</li>
              <li><b>Formatting</b>: JSON contracts, guardrails, fallbacks for missing info.</li>
              <li><b>Quick evals</b>: golden sets, assertions, tiny rubrics, regression checks.</li>
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
                <li>Write a role/goal/constraints prompt in under 2 minutes.</li>
                <li>Bound scope and sources; refuse when out‑of‑policy.</li>
                <li>Demand structured JSON with 3–5 stable keys.</li>
              </ul>
              <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700 space-y-1">
                <li>Build a 8–15 item golden set with assertions.</li>
                <li>Run a mini A/B on two prompt variants.</li>
                <li>Log changes and keep a regression set.</li>
              </ul>
            </div>
            <div className="mt-2 flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <p className="text-sm">If you can tick these off, you’re Week‑2 ready.</p>
            </div>
          </section>

          {/* Cheat‑Sheet Templates */}
          <section id="cheatsheet" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <FileCode2 className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Cheat‑Sheet Templates</h2>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 sm:p-4">
              <h3 className="font-medium mb-2">Instruction template</h3>
              <pre className="text-xs md:text-sm p-3 rounded bg-white border border-gray-200 overflow-auto whitespace-pre-wrap break-words">{`# Role
You are an expert {role}.

# Goal
{goal}. Audience: {audience}.

# Constraints
- {constraint_1}
- {constraint_2}

# Output format
Return JSON with keys: {keys}

# Quality checks
- Verify {check_1}
- If uncertain, say "Insufficient information" and request {missing_info}.`}</pre>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 sm:p-4">
              <h3 className="font-medium mb-2">Guardrailed response contract</h3>
              <pre className="text-xs md:text-sm p-3 rounded bg-white border border-gray-200 overflow-auto whitespace-pre-wrap break-words">{`Return JSON:
{
  "answer": string,
  "assumptions": string[],
  "confidence": "low" | "medium" | "high",
  "needs_followup": boolean
}

If insufficient information:
- answer: "Insufficient information"
- needs_followup: true
- assumptions: ["Missing: {x}"]`}</pre>
            </div>
          </section>

          {/* Common Pitfalls */}
          <section id="pitfalls" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <h2 className="text-lg sm:text-xl font-semibold">Common Pitfalls</h2>
            <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700 space-y-1">
              <li>Prompts with no audience or success criteria.</li>
              <li>Unstructured outputs → can’t assert or automate.</li>
              <li>Changing 3 things at once; no idea what helped.</li>
              <li>Letting leakage through (revealing internal context).</li>
            </ul>
            <Box tone="warn" title="Antidote">
              One‑change rule, small schemas, explicit refusal/fallbacks, and tiny golden sets.
            </Box>
          </section>

          {/* Mini‑Project */}
          <section id="project" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Mini‑Project (Portfolio‑ready)</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700">
              Build a prompt pack you could ship to a teammate in <b>support ops</b> or <b>marketing</b>.
            </p>
            <ol className="list-decimal pl-5 text-sm sm:text-base text-gray-700 space-y-2">
              <li><b>Instruction prompt:</b> role, goal, constraints, format.</li>
              <li><b>Contract:</b> JSON schema with 3–6 keys.</li>
              <li><b>Few‑shot examples:</b> 2 high‑quality, contract‑true samples.</li>
              <li><b>Golden set:</b> 10 inputs with assertions (word bounds, banned terms, must‑include).</li>
              <li><b>Notes:</b> 5‑line changelog explaining your best iteration.</li>
            </ol>
            <Box tone="tip" title="Keep everything in one folder">
              Prompts, schema, examples, golden set, and notes → easier to reuse and show off.
            </Box>
          </section>

          {/* Reflection */}
          <section id="reflection" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <h2 className="text-lg sm:text-xl font-semibold">Reflection</h2>
            <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700 space-y-1">
              <li>Which constraint had the biggest quality impact?</li>
              <li>Which golden item failed first — and why?</li>
              <li>What one rule will you carry into every prompt next week?</li>
            </ul>
            <Box tone="pro" title="Write a 3‑sentence takeaway">
              Summarize what changed in how you prompt. This cements the skill.
            </Box>
          </section>

          {/* Artifacts */}
          <section id="artifacts" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <FolderCheck className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Your Artifacts (Week 1)</h2>
            </div>
            <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700 space-y-1">
              <li>Instruction prompt (role, goal, constraints, format)</li>
              <li>JSON contract (guardrails + fallbacks)</li>
              <li>Few‑shot examples (aligned to contract)</li>
              <li>Golden set + assertions</li>
              <li>Changelog / notes</li>
            </ul>
            <Box tone="tip" title="Export idea">
              Save this set to your team’s repo or a shared drive — you’ll extend it in Week 2.
            </Box>
          </section>

          {/* Next steps */}
          <section id="next" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Next: Week 2 Preview</h2>
            </div>
            <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700 space-y-1">
              <li><b>Few‑shot patterns</b>: show, not tell (contrastive pairs, style locks).</li>
              <li><b>Chain‑of‑Thought vs Concise</b>: when to reason vs. when to be direct.</li>
              <li><b>Lightweight evals at scale</b>: keep the golden set fresh, add regressions.</li>
            </ul>
            <Box tone="pro" title="Bring your artifacts">
              You’ll reuse your Week‑1 contract and golden set to test patterns quickly.
            </Box>
          </section>

          {/* Resources */}
          <section id="resources" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <h2 className="text-lg sm:text-xl font-semibold">Resources</h2>
            <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700 space-y-1">
              <li>Prompt template & guardrail snippets (from earlier lessons).</li>
              <li>Golden‑set JSON examples & simple validator pseudo‑code.</li>
              <li>Team checklist: role, goal, constraints, format, fallbacks, evals.</li>
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
                {completed ? 'Progress saved ✓' : 'Mark Week 1 complete'}
              </button>
              <Link
                href="/learn/prompt-engineering/beginner/week2"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow w-full sm:w-auto"
                onClick={async () => { if (!completed) await markComplete(); }}
              >
                Continue to Week 2 <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
