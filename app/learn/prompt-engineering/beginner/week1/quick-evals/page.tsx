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
  ClipboardCheck,
  Scale,
  GitCompare,
  FileText,
  Notebook,
  Hammer,
  Home,
} from 'lucide-react';

// --- Config ------------------------------------------------------------------
const PROGRESS_KEY = 'pe-week-1:quick-evals';

const SECTIONS = [
  { id: 'intro', label: 'Intro' },
  { id: 'why', label: 'Why Quick Evals' },
  { id: 'golden', label: 'Golden Set (Small & Strong)' },
  { id: 'assertions', label: 'Assertions & Pass/Fail' },
  { id: 'playground', label: 'Assertion Playground' },
  { id: 'rubrics', label: 'Rubrics (Score 1–5)' },
  { id: 'ab', label: 'A/B & Regression' },
  { id: 'logging', label: 'Logging & Notes' },
  { id: 'pitfalls', label: 'Common Pitfalls' },
  { id: 'exercise', label: 'Practice' },
  { id: 'next', label: 'Save & Next' },
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
    tone === 'tip' ? <Lightbulb className="h-4 w-4" /> :
    tone === 'warn' ? <AlertTriangle className="h-4 w-4" /> :
    <Sparkles className="h-4 w-4" />;
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
export default function QuickEvalsLesson() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  // Playground state (now plain text, not JSON)
  const [pgOutput, setPgOutput] = useState<string>('Meet less. Decide faster.');
  const [pgMaxWords, setPgMaxWords] = useState<string>('12');
  const [pgBanned, setPgBanned] = useState<string>('revolutionary, synergy');
  const [pgMustInclude, setPgMustInclude] = useState<string>('meet, decide');
  const [pgResult, setPgResult] = useState<string>('');

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

  // Playground checker (plain text)
  function runPlaygroundCheck() {
    const text = String(pgOutput || '').trim();
    if (!text) return setPgResult('❌ Please paste a response to check.');
    const maxWords = Number(pgMaxWords);
    const words = text.split(/\s+/).filter(Boolean);
    if (maxWords && words.length > maxWords) {
      return setPgResult(`❌ Too many words (${words.length} > ${maxWords})`);
    }
    const hay = text.toLowerCase();
    const banned = pgBanned.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    for (const w of banned) {
      if (w && hay.includes(w)) return setPgResult(`❌ Contains banned term: ${w}`);
    }
    const must = pgMustInclude.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    for (const w of must) {
      if (w && !hay.includes(w)) return setPgResult(`❌ Missing required idea: ${w}`);
    }
    setPgResult('✅ Looks good based on your rules.');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
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
                Week 1 · Quick Evaluations
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

      {/* Content area */}
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
            Evaluate small, iterate fast. Evals make prompts shippable.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-4 sm:space-y-6">
          {/* Intro */}
          <section id="intro" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-2 sm:space-y-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Quick Evaluations (Lightweight)</h1>
            <p className="text-base sm:text-lg text-gray-700">
              Quick evaluations are the pre-flight ritual that keeps your prompts aligned with your promise. In a short pass you confirm that the answer still has the right shape, speaks in the tone you chose, and respects the limits you set earlier. It is not heavy testing; it is a focused moment that says, “this still does what we said.”
            </p>
            <p className="text-sm sm:text-base text-gray-700">
              Imagine shipping a tagline generator for a marketing team. Yesterday it produced tight, eight-word lines. Today, after adding a cheerful example, the same prompt wanders into sixteen-word sentences. A two-minute evaluation would have caught that drift before users ever saw it.
            </p>
            <Box tone="tip" title="Outcome">
              By the end of this page you will have a simple, repeatable way to judge whether a prompt is safe to ship right now, and a habit you can reuse after every change.
            </Box>
          </section>

          {/* Why quick evals */}
          <section id="why" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <h2 className="text-lg sm:text-xl font-semibold">Why Quick Evals</h2>
            <p className="text-sm sm:text-base text-gray-700">
              Prompts drift for quiet reasons. One extra sentence in the instruction suggests a new tone. An inspiring example encourages longer outputs. A constraint meant to help collides with your format. Quick evals intercept those micro-shifts at the edge of your promise so the experience stays consistent.
            </p>
            <p className="text-sm sm:text-base text-gray-700">
              Consider an internal policy summarizer. You intend a one-sentence executive brief. A teammate edits the prompt to be “more explanatory,” and now the model often returns a paragraph. A quick evaluation anchored to a one-sentence contract would immediately flag the length issue, letting you adjust the instruction rather than change your product scope.
            </p>
            <Box tone="pro" title="Keep it tiny">
              Focus on the few checks you would defend in front of a user—shape, length, banned phrases, and one must-have idea. Add more only when repeated failures prove they deserve protection.
            </Box>
          </section>

          {/* Golden set */}
          <section id="golden" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Golden Set (Small & Strong)</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700">
              The golden set is your compass: a tiny collection of inputs that make “good” unmistakable, plus one or two that used to trip you up. Its job is to reveal direction, not cover the world. When the golden set passes, you can ship with confidence; when it fails, you immediately see where you drifted.
            </p>
            <p className="text-sm sm:text-base text-gray-700">
              For a tagline prompt, your set might include a straightforward product where the right answer is short and benefit-driven, a product with clunky jargon where clarity matters more than cleverness, and an input that intentionally omits the audience so the correct response is to say there is insufficient information. Those examples take seconds to run but they define your promise sharply.
            </p>
            <Box tone="tip" title="Balance the set">
              Blend everyday scenarios with a single edge case that once caused rework. The balance keeps you honest without slowing you down.
            </Box>
          </section>

          {/* Assertions */}
          <section id="assertions" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Assertions & Pass/Fail</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700">
              Assertions are the must-haves you refuse to compromise on. They convert “seems fine” into a clean yes or no. Instead of vaguely asking for a “short” line, you decide that a tagline must be twelve words or fewer. Instead of hoping for professionalism, you decide that clichés like “revolutionary” or “synergy” are not allowed. Instead of trusting the model to remember the point, you decide a concrete benefit must appear. These statements are small, but together they protect your product’s promise.
            </p>
            <p className="text-sm sm:text-base text-gray-700">
              Picture a help-center summarizer. Your assertion might be that every summary names the audience in the first clause, states the main action clearly, and explicitly marks when information is missing. With those rules in place, you do not debate taste; you check whether the response respects the contract you set.
            </p>
            <Box tone="pro" title="Contract first, checks second">
              Decide the shape of the answer before you verify it. A predictable structure makes assertions effortless and keeps attention on outcomes rather than parsing.
            </Box>
          </section>

          {/* Assertion Playground (plain text, no JSON) */}
          <section id="playground" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Hammer className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Assertion Playground</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700">
              Paste a normal response, not code. Set a maximum word count that matches your definition of “short.” List any phrases you never want to appear. Add one or two words or ideas the answer must include. Press “Check” to see whether this response respects your rules. If it fails, adjust the prompt—keep the rules steady—and try again with the same input. When it passes, repeat with the tricky edge case from your golden set to confirm stability.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <div className="text-xs text-gray-600 mb-1">Model response (paste text)</div>
                <textarea
                  className="w-full min-h-[180px] rounded-xl border border-gray-200 p-3 text-sm bg-white"
                  value={pgOutput}
                  onChange={(e) => setPgOutput(e.target.value)}
                />
                <div className="mt-2 text-xs text-gray-600">
                  Try pasting: <em>“Write less. Decide faster.”</em> or <em>“Our revolutionary AI saves time for synergy.”</em> to see how banned phrases trigger a failure.
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 p-3 sm:p-4 bg-gray-50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Max words</label>
                    <input
                      className="w-full rounded-lg border border-gray-200 p-2 text-sm bg-white"
                      value={pgMaxWords}
                      onChange={(e) => setPgMaxWords(e.target.value)}
                      placeholder="e.g., 12"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Banned phrases (comma-sep)</label>
                    <input
                      className="w-full rounded-lg border border-gray-200 p-2 text-sm bg-white"
                      value={pgBanned}
                      onChange={(e) => setPgBanned(e.target.value)}
                      placeholder="e.g., revolutionary, synergy"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-gray-600 mb-1">Must include (comma-sep)</label>
                    <input
                      className="w-full rounded-lg border border-gray-200 p-2 text-sm bg-white"
                      value={pgMustInclude}
                      onChange={(e) => setPgMustInclude(e.target.value)}
                      placeholder="e.g., meet, decide"
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={runPlaygroundCheck}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow"
                  >
                    Check
                  </button>
                  <span className={cx(
                    'text-sm',
                    pgResult.startsWith('✅') ? 'text-green-700' : pgResult ? 'text-amber-700' : 'text-gray-600'
                  )}>
                    {pgResult || 'Result will appear here'}
                  </span>
                </div>
                <div className="mt-3 text-xs text-gray-600">
                  Example flow: paste <em>“Meet less. Decide faster.”</em>, set the word limit to twelve, ban “revolutionary, synergy,” and require “meet, decide.” A pass means the response is short, avoids clichés, and mentions your key ideas.
                </div>
              </div>
            </div>
          </section>

          {/* Rubrics */}
          <section id="rubrics" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Rubrics (Score 1–5)</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700">
              Some qualities need nuance. When pass/fail feels too blunt, score just the essentials on a five-point scale. For a tagline, clarity asks, “would a busy manager grasp this instantly,” and tone asks, “does it energize without sounding cheesy.” A three is acceptable; a five is something you would proudly ship. Two variants may both pass your rules, yet the rubric will reveal which one communicates better.
            </p>
            <p className="text-sm sm:text-base text-gray-700">
              For instance, Variant A might read, “Capture meetings in minutes.” Variant B might read, “Never miss a follow-up.” Both are short and avoid banned phrases, but if B scores higher on clarity for your audience, that hint directs the team toward what to keep.
            </p>
            <Box tone="tip" title="Score what you’ll act on">
              If a dimension would not change your decision to ship, revise, or discard a variant, leave it out. A short rubric guides; a long one distracts.
            </Box>
          </section>

          {/* A/B & Regression */}
          <section id="ab" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <GitCompare className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">A/B & Regression</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700">
              Comparing variants becomes straightforward when your compass and rules are in place. Run Variant A and Variant B on the same inputs, tally how many pass your assertions, and note the average rubric score. Keep the version that performs better and archive the other for reference. As you fix failures, move those exact cases into a small regression set so they never sneak back.
            </p>
            <p className="text-sm sm:text-base text-gray-700">
              Imagine a support reply rewriter. Variant A merely asks for a “friendly” tone. Variant B names the audience, sets a length, and bans apologies unless a concrete mistake exists. On your golden set, both variants pass for structure, but B earns higher clarity and tone and avoids unnecessary apologies on the edge case. B wins, and the edge case becomes part of your permanent guardrails.
            </p>
            <Box tone="pro" title="Consistency over cleverness">
              Keep evaluation conditions steady so differences reflect the prompts themselves, not shifting contexts or inputs.
            </Box>
          </section>

          {/* Logging & Notes */}
          <section id="logging" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Notebook className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Logging & Notes</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700">
              A compact changelog turns iteration into learning. Write today’s date, state the specific tweak, record the golden set pass rate before and after, and add one sentence about why you think the change helped. These short notes give collaborators context without meetings and save you from repeating old experiments.
            </p>
            <p className="text-sm sm:text-base text-gray-700">
              For example: “Sept 3 — named the audience and banned ‘revolutionary.’ Golden pass moved from twelve to fourteen. Average clarity increased from 3.6 to 4.2. One case still omits the audience; strengthening that instruction next.”
            </p>
            <Box tone="tip" title="Make it a habit">
              Pair every prompt change with a dated note and fresh results. The ritual takes seconds and compounds over time.
            </Box>
          </section>

          {/* Pitfalls */}
          <section id="pitfalls" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <h2 className="text-lg sm:text-xl font-semibold">Common Pitfalls</h2>
            <p className="text-sm sm:text-base text-gray-700">
              The easiest way to lose momentum is to make evaluation heavy. Oversized golden sets blur the signal and slow iteration. Unstructured answers force subjective debates and tempt teams to skip checks entirely. Changing several things at once hides which tweak helped. Keep the kit small, insist on a predictable answer shape, and change one variable at a time so cause and effect stays visible.
            </p>
            <p className="text-sm sm:text-base text-gray-700">
              A practical example: a team added five dimensions to their rubric and doubled the golden set. Reviews became long, scores grew inconsistent, and iteration stalled. They returned to two dimensions, trimmed the set to ten examples, and progress resumed the same week.
            </p>
            <Box tone="warn" title="One-change rule">
              Alter a single element—role, constraint, example, or format—per iteration so you can attribute improvement with confidence.
            </Box>
          </section>

          {/* Practice */}
          <section id="exercise" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <h2 className="text-lg sm:text-xl font-semibold">Practice: Build a Tiny Eval Kit</h2>
            <p className="text-sm sm:text-base text-gray-700">
              Build your kit now. Choose a small set of inputs that define success for your task and include a single edge case that once failed. Write three plain-English assertions that match your promise, such as a word limit, a short list of phrases to avoid, and one idea that must appear. If you need nuance, add a two-dimension rubric like clarity and tone. Run two prompt variants against the same inputs, keep the winner, and record a short note about what changed and why it helped. Store the set, rules, and notes beside the prompt so they evolve together.
            </p>
            <Box tone="tip" title="Ship it">
              The goal is not perfect coverage. It is fast, reliable confidence that this prompt still delivers what you promised.
            </Box>
          </section>

          {/* Bottom Nav & Save */}
          <section id="next" className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
            <Link
              href="/learn/prompt-engineering/beginner/week1/formatting"
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
                {completed ? 'Progress saved ✓' : 'Mark complete'}
              </button>
              <Link
                href="/learn/prompt-engineering/beginner/week1/wrap-up"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow w-full sm:w-auto"
                onClick={async () => { if (!completed) await markComplete(); }}
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
