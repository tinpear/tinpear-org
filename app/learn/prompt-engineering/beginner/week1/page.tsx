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
  User2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Home, // ⬅️ added for the home button
} from 'lucide-react';

// --- Config ------------------------------------------------------------------
const PROGRESS_KEY = 'pe-week-1:start';

const SECTIONS = [
  { id: 'welcome', label: 'Welcome & Goals' },
  { id: 'what-is-pe', label: 'What is Prompt Engineering?' },
  { id: 'why-it-matters', label: 'Why It Matters' },
  { id: 'clarity-techniques', label: 'Clarity Techniques' },
  { id: 'structure-patterns', label: 'Structure & Few-shot' },
  { id: 'evaluation', label: 'Quick Evaluation' },
  { id: 'mistakes', label: 'Common Mistakes' },
  { id: 'next', label: 'Next Steps' },
];

// --- Utilities ---------------------------------------------------------------
function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}

function Box({ tone, title, children }: { tone: 'tip' | 'warn' | 'pro'; title: string; children: any }) {
  const palette = {
    tip: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    warn: 'border-amber-200 bg-amber-50 text-amber-900',
    pro: 'border-sky-200 bg-sky-50 text-sky-900',
  }[tone];
  const icon =
    tone === 'tip' ? <Lightbulb className="h-4 w-4" /> :
    tone === 'warn' ? <AlertTriangle className="h-4 w-4" /> :
    <Sparkles className="h-4 w-4" />;
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
export default function PromptEngineeringWeek1Start() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [profile, setProfile] = useState<any>(null);
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

  const username = useMemo(() =>
    profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'Learner'
  , [profile, user]);

  const markComplete = async () => {
    if (!user) return alert('Please sign in to save your progress.');
    const { error } = await supabase
      .from('tracking')
      .upsert({
        user_id: user.id,
        key: PROGRESS_KEY,
        completed: true,
        completed_at: new Date().toISOString(),
      }, { onConflict: 'user_id,key' });
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
    const els = SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean) as Element[];
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

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
                Week 1 · Prompt Engineering
              </span>
            </div>

            {/* Right: Mobile contents toggle + auth state */}
            <div className="justify-self-end flex items-center gap-3">
              <button
                type="button"
                aria-label="Toggle contents"
                className="lg:hidden inline-flex h-10 items-center gap-2 px-3 rounded-xl border border-gray-200 text-gray-800 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2"
                onClick={() => setSidebarOpen(v => !v)}
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
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6">
        {/* Sidebar */}
        <aside className={cx(
          'lg:sticky lg:top-[72px] lg:h-[calc(100vh-88px)] lg:overflow-auto',
          'rounded-2xl border border-gray-200 bg-white p-4 shadow-sm',
          sidebarOpen ? '' : 'hidden lg:block'
        )}>
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">On this page</p>
          <nav className="space-y-1">
            {SECTIONS.map(s => (
              <a key={s.id} href={`#${s.id}`} className={cx(
                'block px-3 py-2 rounded-lg text-sm',
                activeId === s.id
                  ? 'bg-green-50 text-green-800'
                  : 'hover:bg-gray-50 text-gray-700'
              )}>{s.label}</a>
            ))}
          </nav>
          <div className="mt-6 p-3 rounded-xl bg-gray-50 text-xs text-gray-600">
            Clear prompts = confident results.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-8">
          <section id="welcome" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Hello{user ? `, ${username}` : ''}</h1>
            <p className="text-lg text-gray-700">
              This week you’ll learn how to translate intent into language that systems can consistently understand and execute. Think of prompt engineering as a set of muscles: clarity, structure, and iteration. We’ll strengthen each one so that by the end of this module you can move from a fuzzy idea to a reliable workflow, not just once, but repeatedly and with confidence.
            </p>
            <p className="text-gray-700">
              Prerequisites for this course include a basic understanding of AI concepts such as models, training data, inference, and evaluation. If you’re new to these ideas, start with our{' '}
              <Link href="/learn/ai-for-everyone" className="text-green-700 underline">AI for Everyone</Link>{' '}
              course, then return here ready to dive deeper. Some light familiarity with problem decomposition and basic testing will also help, but we’ll reinforce those skills along the way.
            </p>
            <Box tone="tip" title="Keep it repeatable">
              The best prompts aren’t lucky—they’re designed. As you learn patterns and quick evaluation habits, you’ll shift from experimenting blindly to building small, reusable components you can trust across tasks and domains.
            </Box>
          </section>

          <section id="what-is-pe" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">What is Prompt Engineering?</h2>
            <p className="text-gray-700">
              Prompt engineering is the practice of turning human intent into a precise set of instructions that guide a model toward useful, verifiable outputs. It is neither magic nor mere phrasing. Instead, it is a practical discipline that blends communication, product thinking, and lightweight evaluation. A good prompt clarifies the role the model should play, the goal it should pursue, the constraints it must respect, and the shape of the answer you expect to receive.
            </p>
            <p className="text-gray-700">
              At its core, prompt engineering reduces uncertainty. Natural language is rich but ambiguous; models respond best when your intent is framed as an unambiguous contract. Throughout this page you will see how contracts are formed with instructions, how examples reduce interpretation gaps, and how small tests allow you to iterate intelligently rather than guessing what might work.
            </p>
          </section>

          <section id="why-it-matters" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Why It Matters</h2>
            <p className="text-gray-700">
              Clear prompts measurably improve model performance because they reduce ambiguity, spotlight relevant context, and define success in advance. When your instructions are explicit, the model spends less capacity inferring what you meant and more capacity producing what you asked for. This translates to higher quality outputs, fewer retries, and faster iteration cycles.
            </p>
            <p className="text-gray-700">
              Structure also unlocks automation. Once your prompt produces predictable formats—checklists, JSON schemas, or step-by-step explanations—you can plug the results into downstream systems, run batch jobs, or evaluate outputs at scale. With structure and light evaluation, you can detect drift early, reduce hallucinations by anchoring answers to sources, and create feedback loops that keep quality stable over time.
            </p>
          </section>

          <section id="clarity-techniques" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Clarity Techniques</h2>
            <p className="text-gray-700">
              Begin by stating the role and objective plainly: tell the model who it is and what outcome matters. Add constraints that narrow the search space—word limits, tone guidelines, domain boundaries, or formatting rules. When a task has edge cases, surface them early so the model understands the boundaries of acceptable behavior. Finally, ask for structured output so you can verify the result quickly and feed it into other tools without manual cleanup.
            </p>
            <p className="text-gray-700">
              When you need consistency across many runs, define the response format explicitly and include any required fields. If an answer could be interpreted in multiple ways, offer a brief clarification of your preferred interpretation and a short example that illustrates it. A little specificity—dates in ISO format, currency codes, references to named sources—goes a long way toward repeatable results.
            </p>
            <Box tone="warn" title="Avoid ambiguity">
              Words like “optimize,” “improve,” or “best” are too open-ended on their own. Replace them with concrete targets—latency under 200ms, a reading level for a specific audience, or adherence to a documented style guide—and the model will align with far less trial and error.
            </Box>
          </section>

          <section id="structure-patterns" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Few-shot & Structure</h2>
            <p className="text-gray-700">
              Examples are the fastest way to compress your intent. A well-chosen few-shot set demonstrates the pattern you expect, the tone you prefer, and the boundaries of acceptable answers. One to three high-quality examples are usually enough; more can help, but only when they add new signal rather than repeating the same idea.
            </p>
            <p className="text-gray-700">
              Pair your examples with an instruction and a format. The instruction declares the goal; the format makes the result testable; the examples bridge any remaining gaps. If your task involves classification, include borderline cases so the model learns how to decide. If your task involves generation, include a short sample that reveals structure, not just style. As you iterate, refresh your examples with the toughest cases you’ve encountered so your prompt keeps getting sharper.
            </p>
            <Box tone="tip" title="Instruction + format + sample = clarity">
              Models excel when they can see the destination and the road to get there. Show the shape of the answer, provide a compact sample, and your results will become both faster to obtain and easier to evaluate.
            </Box>
          </section>

          <section id="evaluation" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Quick Evaluation</h2>
            <p className="text-gray-700">
              Treat every prompt like a small experiment. Start with a tiny set of known inputs and define what success looks like before you run anything. If your output is structured, you can validate fields automatically; if it’s prose, you can still check for criteria like presence of sources, required sections, or adherence to tone. These lightweight checks prevent you from shipping a prompt that “felt” good once but fails under pressure.
            </p>
            <p className="text-gray-700">
              As you harden the prompt, add a couple of deliberately tricky cases to your test set—the kinds of inputs that previously caused confusion. When the prompt handles both the sunny-day and edge-case scenarios, you can scale it with much more confidence. Over time, keep a small library of prompts and tests so you can reuse what works instead of reinventing from scratch.
            </p>
          </section>

          <section id="mistakes" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">🚨 Common Mistakes</h2>
            <p className="text-gray-700">
              Most issues trace back to either overloaded instructions or missing feedback. If you find yourself adding more and more clauses to a single prompt, pause and split the task into steps. If you aren’t measuring results in any way, even informally, you’ll struggle to know whether changes are helping or hurting.
            </p>
            <Box tone="warn" title="Overloading the prompt">
              A single prompt does not need to do everything. Break complex workflows into stages—gather requirements, transform data, then generate a final answer—and the model will perform each stage with far greater accuracy.
            </Box>
            <Box tone="warn" title="Skipping evals">
              Without even the simplest checks, quality drifts. A few repeatable tests save hours of manual review and make your improvements real instead of anecdotal.
            </Box>
          </section>

          <section id="next" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Ready to begin?</h2>
            <p className="text-gray-700 mb-4">
              In the next lesson you’ll craft robust instruction prompts that clearly define role, goal, and constraints, then you’ll shape the output so it can be trusted and reused. If you want additional context before advancing, review{' '}
              <Link href="/learn/ai-for-everyone" className="text-green-700 underline">AI for Everyone</Link>{' '}
              to reinforce foundational concepts, or explore your organization’s internal style guides and data policies so you can anchor your prompts to real-world standards.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* NEW: Previous button */}
              <Link
                href="/learn/prompt-engineering/beginner"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Link>

              <button
                onClick={markComplete}
                className={cx(
                  'px-4 py-2 rounded-lg border',
                  completed
                    ? 'border-green-200 bg-green-50 text-green-800'
                    : 'border-gray-200 hover:bg-gray-50'
                )}
              >
                {completed ? 'Progress saved ✓' : 'Mark page complete'}
              </button>

              <Link
                href="/learn/prompt-engineering/beginner/week1/instruction-prompts"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow"
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
