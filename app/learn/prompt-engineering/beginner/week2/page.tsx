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
  Waypoints,
  Workflow,
  Layers,
  Rocket,
  Target,
  Home,
  FlaskConical,
} from 'lucide-react';

// --- Config ------------------------------------------------------------------
const PROGRESS_KEY = 'pe-week-2:intro';

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'goals', label: 'Goals for Week 2' },
  { id: 'map', label: 'Lesson Map' },
  { id: 'patterns', label: 'Few-Shot Patterns' },
  { id: 'cot', label: 'Chain-of-Thought vs Concise' },
  { id: 'capstone', label: 'Capstone: Ship It' },
  { id: 'tips', label: 'Tips & Pitfalls' },
  { id: 'next', label: 'Save & Start' },
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
    <div className={`rounded-xl border p-3 md:p-4 flex gap-3 items-start ${palette}`}>
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="font-medium mb-1">{title}</div>
        <div className="text-sm md:text-[0.95rem] leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

// --- Page --------------------------------------------------------------------
export default function Week2Overview() {
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
      {/* ── Refactored Header (home left, centered title, right controls) ── */}
      <header className="sticky top-0 z-30 border-b border-gray-100 backdrop-blur bg-white/70">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-14 grid grid-cols-[auto_1fr_auto] items-center gap-3">
            {/* Left: Home */}
            <Link
              href="/prompt-engineering/beginner"
              aria-label="Go to Prompt Engineering home"
              prefetch={false}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2"
            >
              <Home className="h-5 w-5" />
            </Link>

            {/* Center: Title */}
            <div className="flex items-center justify-center">
              <span className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                Week 2 · Prompt Engineering
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
            Bring your Week-1 artifacts (contract + golden set). We’ll build on them.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-4 sm:space-y-6">
          {/* Overview */}
          <section id="overview" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Hello{user ? `, ${username}` : ''}</h1>
            <p className="text-base sm:text-lg text-gray-700">
              This second week moves you from careful prompt authorship into the world of reusable patterns and deliberate reasoning. You will learn to steer a model not only with instructions but with a handful of high-signal examples that quietly teach tone, format, and boundaries. As you do, you’ll also decide when to let the model reason step-by-step and when to keep it focused and fast, so you can ship outputs that are both reliable and efficient.
            </p>
            <p className="text-base sm:text-lg text-gray-700">
              Before you dive in, make sure the foundations are in place. The ideal prerequisite is a working understanding of how modern AI systems generate text and why structure improves reliability. If that feels new or you want a refresher, start with our
              {' '}
              <Link href="/learn/ai-for-everyone" className="underline decoration-dotted underline-offset-4">AI for Everyone</Link>
              {' '}primer; it will give you the mental model to move quickly here. You will also get more from this week if you bring your Week-1 artifacts — your instruction prompt, your compact output contract, and your small golden set — because each lesson will extend and pressure-test them rather than start from scratch.
            </p>
            <Box tone="tip" title="Bring your contract">
              Keep using structured outputs when you practice these patterns. Treat them as a safety net: they make style locks measurable, keep examples consistent, and turn subjective quality into something you can quickly check.
            </Box>
          </section>

          {/* Goals */}
          <section id="goals" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Goals for Week 2</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700">
              By the end of this week you will be able to craft tiny sets of examples that do far more than decorate a prompt — they will lock tone and structure so tightly that outputs feel consistent even as tasks vary. You will know when to switch between step-by-step reasoning and a concise, schema-first response, based on the stakes, the latency budget, and the need for transparency. Most importantly, you will combine these habits with the quick evaluations you built last week so that each change is measurable, each improvement is repeatable, and each prompt you ship is easier to trust.
            </p>
          </section>

          {/* Lesson Map */}
          <section id="map" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Waypoints className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Lesson Map</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <Link
                href="/beginner/week2/patterns"
                className="rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 p-4 block"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="h-4 w-4 text-green-700" />
                  <h3 className="font-medium">Few-Shot Patterns</h3>
                </div>
                <p className="text-sm text-gray-700">Contrastive pairs, style locks, and schema-true examples that “show, not tell.”</p>
              </Link>

              <Link
                href="/beginner/week2/cot-vs-concise"
                className="rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 p-4 block"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Workflow className="h-4 w-4 text-green-700" />
                  <h3 className="font-medium">Chain-of-Thought vs Concise</h3>
                </div>
                <p className="text-sm text-gray-700">When to reason step-by-step and when to keep outputs tight and fast.</p>
              </Link>

              <Link
                href="/beginner/week2/capstone"
                className="rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 p-4 block"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Rocket className="h-4 w-4 text-green-700" />
                  <h3 className="font-medium">Capstone: Ship It</h3>
                </div>
                <p className="text-sm text-gray-700">Bundle prompt + examples + contract + golden set, then A/B and regress.</p>
              </Link>
            </div>
          </section>

          {/* Focus: Patterns */}
          <section id="patterns" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Few-Shot Patterns (Show, Not Tell)</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700">
              Think of examples as the tone-setters and alignment anchors of your prompt. A single, crisp example can communicate more than a paragraph of instructions: it reveals voice, pacing, and the exact shape of an acceptable answer. When those examples echo your output contract, the model learns the boundary of what is “in” and what is “out,” and you get fewer surprises. The best sets are tiny — often one to three samples — selected not for variety but for clarity, so the signal stays sharp and the model’s attention is never diluted.
            </p>
            <p className="text-sm sm:text-base text-gray-700">
              Two styles are especially effective. The first is the style lock: a polished, on-brand sample that the model can imitate without drifting, perfect for copy, summaries, or structured extractions. The second is the contrastive pair: one example that is deliberately wrong beside one that is right, a side-by-side that teaches boundaries in a way text alone rarely can. As you add these, keep every example “schema-true” — if your contract expects particular fields or sections, your examples must honor them exactly, so the model never receives mixed signals.
            </p>
            <Box tone="pro" title="Golden rule">
              Treat each example like a unit test for style and structure. If your example breaks your own format or tone, the model will too — polish it until it becomes the standard you want repeated.
            </Box>
          </section>

          {/* Focus: CoT vs Concise */}
          <section id="cot" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Workflow className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Chain-of-Thought vs Concise</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700">
              Reasoning is a tool, not a default. When a task benefits from checking assumptions, comparing options, or walking through rules, it helps to invite the model to reason step-by-step and show its work. This can raise accuracy on multi-step problems and creates a transparent record of how the answer was formed. Yet not every task needs that level of narration. For well-scoped, format-heavy outputs — think standardized summaries, extractions, and transformations — concise instructions paired with a strict response contract are faster, cheaper, and easier to validate.
            </p>
            <p className="text-sm sm:text-base text-gray-700">
              Many teams settle on a hybrid: allow the model to think privately and then return only the final, structured answer with a short rationale. You get the benefit of careful internal reasoning without paying for long public explanations on every call. Use the slow path when the stakes or ambiguity are high; stay concise when your schema and assertions already make quality obvious at a glance.
            </p>
            <Box tone="tip" title="Latency matters">
              Chain-of-Thought can add tokens and time. Prefer concise outputs for routine tasks, and reserve explicit reasoning for moments where it clearly improves reliability.
            </Box>
          </section>

          {/* Capstone */}
          <section id="capstone" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Capstone: Ship a Reliable Prompt</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700">
              Your capstone this week is a small, shippable bundle that a teammate could drop into production with confidence. Start from the prompt and output contract you finalized in Week 1, then add a handful of impeccably chosen examples that lock voice and structure. Decide whether this task merits explicit reasoning or if a concise response is sufficient; if in doubt, include a one-sentence rationale field so reviewers see the “why” without wading through long explanations.
            </p>
            <p className="text-sm sm:text-base text-gray-700">
              When the bundle is ready, run your golden set and note what passes, what fails, and why. If you see quick wins, try a lightweight A/B between two prompt variants and keep the one that demonstrably improves results. Capture what changed and the effect it had in a short note. By the end, you will have a self-contained folder that includes your prompt, examples, contract, golden items, and a tiny eval record — the kind of artifact that makes future maintenance easy.
            </p>
            <Box tone="tip" title="Deliverable">
              Aim for a single folder you can hand to anyone on your team. If they can run it and understand how success is measured in under five minutes, you’ve done it right.
            </Box>
          </section>

          {/* Tips & Pitfalls */}
          <section id="tips" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Tips & Pitfalls</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700">
              Keep your example set small enough that every item earns its place; long blocks dilute the signal and invite drift. Hold the line on format: if one example breaks the schema or switches voice, the model will follow it off course. And as you iterate, change one thing at a time — a role tweak, a constraint adjustment, or a single new example — so you always know what produced the improvement you see.
            </p>
            <Box tone="warn" title="Common trap">
              Mixing formats across examples is the fastest way to confuse the model. If the contract changes, update every example to match before you test again.
            </Box>
          </section>

          {/* Bottom Nav & Save */}
          <section id="next" className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
            <Link
              href="/learn/prompt-engineering/beginner/week1/wrap-up"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 w-full sm:w-auto"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Week 1 Wrap-Up
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
                {completed ? 'Progress saved ✓' : 'Mark overview complete'}
              </button>
              <Link
                href="/learn/prompt-engineering/beginner/week2/patterns"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow w-full sm:w-auto"
                onClick={async () => { if (!completed) await markComplete(); }}
              >
                Start: Few-Shot Patterns <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
