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
  ShieldCheck,
  ClipboardCheck,
  Code2,
  ListChecks,
  Home,
} from 'lucide-react';

// --- Config ------------------------------------------------------------------
const PROGRESS_KEY = 'pe-week-1:formatting';

const SECTIONS = [
  { id: 'intro', label: 'Intro' },
  { id: 'why-structure', label: 'Why Structured Output' },
  { id: 'schema', label: 'Designing Your JSON Schema' },
  { id: 'examples', label: 'Examples & Contracts' },
  { id: 'fewshot', label: 'Few-shot: Keep It Aligned' },
  { id: 'guardrails', label: 'Guardrails & Fallbacks' },
  { id: 'validation', label: 'Validation & Testing' },
  { id: 'pitfalls', label: 'Common Pitfalls' },
  { id: 'exercise', label: 'Practice: Your Turn' },
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
export default function FormattingLesson() {
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
    () => profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'Learner',
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
                Week 1 · Formatting
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
            Structure = reliability. Contracts make prompts testable and shippable.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-4 sm:space-y-6">
          {/* Intro */}
          <section id="intro" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-2 sm:space-y-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Response Formatting & Guardrails</h1>
            <p className="text-base sm:text-lg text-gray-700">
              This lesson turns good prompts into dependable components by defining the exact shape of the answer you expect. You will learn to write output contracts—usually compact JSON schemas—that the model must follow, to add guardrails that keep results safe and on‑policy, and to specify fallbacks that handle missing information gracefully. When the response is predictable, everything else becomes easier: you can automate, you can monitor, and you can improve without breaking downstream steps.
            </p>
            <Box tone="tip" title="Outcome">
              By the end, you will have a reusable format you can parse, validate, and monitor across teams and tasks, giving you a foundation for scalable workflows.
            </Box>
          </section>

          {/* Why Structure */}
          <section id="why-structure" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <h2 className="text-lg sm:text-xl font-semibold">Why Structured Output</h2>
            <p className="text-sm sm:text-base text-gray-700">
              Structured output removes guesswork. When the model returns the same fields in the same way every time, you can wire results straight into scripts, dashboards, or APIs without manual cleanup. Consistency also enables simple pass‑fail checks, which means you can catch regressions early instead of discovering them in production. Most importantly, a shared contract lets many different inputs flow through a single prompt without constant retuning; the work shifts from managing exceptions to improving the core behavior.
            </p>
            <Box tone="pro" title="Tip: keep the schema small">
              Favor the fewest fields that still cover your needs. Smaller contracts drift less, parse faster, and are easier for teammates to understand at a glance.
            </Box>
          </section>

          {/* Schema — REWRITTEN WITH EXPLANATIONS/ANALOGIES ONLY */}
          <section id="schema" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <h2 className="text-lg sm:text-xl font-semibold">Designing Your JSON Schema</h2>
            <p className="text-sm sm:text-base text-gray-700">
              Think of your schema like a standardized shipping label on a package. No matter what’s inside, the label always shows the destination, the return address, and a brief description. In the same way, every model response should carry a small set of fields that are always present and always mean the same thing. A reliable “answer” field is the contents you care about. A brief “rationale” is the packing slip that explains how the contents were assembled. A short list of “assumptions” is the notes section that reveals any guesses made along the way. A simple “confidence” level is the fragile sticker that tells you how carefully to handle the parcel.
            </p>
            <p className="text-sm sm:text-base text-gray-700">
              Start with this minimal label on every task, then add just what the job requires. For a support‑ticket triage task, you might include a priority marker and the component affected, much like adding a rush sticker and aisle number to help a warehouse process the box quickly. For an executive summary, you might include an audience tag so the tone fits the reader, which is like choosing the correct shipping service for international versus local delivery. Keep additions meaningful and sparse; a crowded label slows the process and makes mistakes more likely.
            </p>
            <p className="text-sm sm:text-base text-gray-700">
              A good schema also prevents confusion when things are missing. If the address is incomplete, a package comes back with a clear notice rather than wandering the system. Your contract should behave the same way: when critical information is absent, the response should say so explicitly, indicate what’s missing, and ask for what it needs next. This is not failure; it is how professional systems stay honest and efficient.
            </p>
            <Box tone="tip" title="Design heuristics without code">
              Aim for a core set of always‑present fields, add only a handful of task‑specific ones, and define what happens when information is unclear or incomplete. If you can explain the “label” on your response in one breath to a teammate, you’ve probably designed it well.
            </Box>
          </section>

          {/* Examples & Contracts (kept as before; still demonstrates contracts) */}
          <section id="examples" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold">Examples & Contracts</h2>
            <p className="text-sm sm:text-base text-gray-700">
              Contracts become powerful when you pair them with short, realistic examples. Each example should demonstrate the exact structure you require so the model learns the pattern, not just the vibe. Keep the prose compact, emphasize the fields you will verify, and include small, telling details that communicate style without bloating the prompt.
            </p>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2"><ListChecks className="h-4 w-4" /><h3 className="font-medium">Copy brief (filled)</h3></div>
              <pre className="text-xs md:text-sm p-3 rounded bg-white border border-gray-200 overflow-auto whitespace-pre-wrap break-words">
{`# Role
You are a concise copywriter.

# Goal
Write a 1-sentence tagline for an AI meeting notes app for busy managers.

# Constraints
- ≤ 12 words
- Mention time-saving
- Avoid "revolutionary", "synergy"

# Output format
Return JSON:
{ "tagline": string, "rationale": string, "word_count": number }

# Quality checks
- word_count <= 12
- banned terms absent`}
              </pre>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2"><ShieldCheck className="h-4 w-4" /><h3 className="font-medium">Guardrailed contract (policy summary)</h3></div>
              <pre className="text-xs md:text-sm p-3 rounded bg-white border border-gray-200 overflow-auto whitespace-pre-wrap break-words">
{`Policy:
- Use only provided context. Do not include external sources.
- If context is insufficient, set needs_followup: true and explain why.

Return JSON:
{
  "summary": string,
  "key_risks": string[],
  "audience": "exec" | "staff",
  "needs_followup": boolean
}`}
              </pre>
            </div>
          </section>

          {/* Few-shot alignment */}
          <section id="fewshot" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <h2 className="text-lg sm:text-xl font-semibold">Few‑shot: Keep It Aligned</h2>
            <p className="text-sm sm:text-base text-gray-700">
              Few‑shot examples are your fastest way to teach the model the pattern. Use one to three compact cases that strictly follow your schema so the output shape becomes instinctive. The examples should vary just enough to cover edge behavior while still reinforcing the same contract, which keeps the model from improvising fields or drifting into free‑form prose.
            </p>
            <div className="rounded-lg border border-gray-200 p-3 sm:p-4 bg-gray-50">
              <pre className="text-xs md:text-sm p-3 rounded bg-white border border-gray-200 overflow-auto whitespace-pre-wrap break-words">
{`Example (1):
Input: "New CRM reduces meeting time by 30%."
Output:
{ "tagline": "Meet less. Close more.", "rationale": "Time saving + sales outcome", "word_count": 4 }

Example (2):
Input: "Auto-notes improve follow-ups."
Output:
{ "tagline": "Never miss a follow-up.", "rationale": "Benefit-centric", "word_count": 4 }`}
              </pre>
            </div>
            <Box tone="pro" title="Golden rule">
              Your examples must adhere to the same contract—fields and meanings included—so every run reinforces the behavior you want.
            </Box>
          </section>

          {/* Guardrails & Fallbacks */}
          <section id="guardrails" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <h2 className="text-lg sm:text-xl font-semibold">Guardrails & Fallbacks</h2>
            <p className="text-sm sm:text-base text-gray-700">
              Guardrails protect both users and workflows. State explicit refusal conditions for policy, safety, or private information and give the model short, respectful language to decline when needed. Plan for incomplete inputs as well; a predictable fallback—one that marks uncertainty and names what is missing—prevents confident‑sounding errors and makes human review straightforward. Finally, bound length, tone, and banned terms so your outputs stay consistent even as inputs vary.
            </p>
            <div className="rounded-lg border border-gray-200 p-3 sm:p-4 bg-gray-50">
              <pre className="text-xs md:text-sm p-3 rounded bg-white border border-gray-200 overflow-auto whitespace-pre-wrap break-words">
{`If uncertain, return:
{
  "answer": "Insufficient information",
  "assumptions": ["Missing: target audience"],
  "confidence": "low"
}`}
              </pre>
            </div>
          </section>

          {/* Validation & Testing */}
          <section id="validation" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <h2 className="text-lg sm:text-xl font-semibold">Validation & Testing</h2>
            <p className="text-sm sm:text-base text-gray-700">
              Treat the contract like any other interface and validate it automatically. Begin by parsing the output to ensure it is structured correctly; if it fails, stop there and adjust the prompt. Next, verify that required fields are present and that their contents make sense for your use case. Finally, enforce bounds that matter, such as maximum word counts or the absence of banned terms. These thin checks are quick to write and catch the issues that would otherwise consume hours of manual review.
            </p>
            <Box tone="tip" title="Thin validator mindset">
              Keep your checks boring and consistent. Confirm the structure, confirm the essentials, and confirm the boundaries. If a check isn’t actionable, it’s not worth automating.
            </Box>
          </section>

          {/* Pitfalls */}
          <section id="pitfalls" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <h2 className="text-lg sm:text-xl font-semibold">Common Pitfalls</h2>
            <p className="text-sm sm:text-base text-gray-700">
              Overly large schemas are tempting because they feel thorough, but each extra field increases drift and complicates quality checks. Examples that don’t match your own contract send mixed signals and degrade reliability. Skipping fallbacks makes automations brittle; it is far better to surface uncertainty than to guess confidently. Keep the contract lean, make every example conform, and always define what should happen when key information is missing.
            </p>
          </section>

          {/* Exercise */}
          <section id="exercise" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <h2 className="text-lg sm:text-xl font-semibold">Practice: Your Turn</h2>
            <p className="text-sm sm:text-base text-gray-700">
              Design an output contract for the task: <i>“Extract three action items from meeting notes.”</i> Begin by choosing the exact fields you will consume downstream, such as an array of items where each entry includes the action text, an owner, and a due date. Add the guardrails that keep results practical: cap the list at three, and instruct the model to refuse gracefully when no clear actions are present. Close with a single example that uses your contract precisely so the pattern is unmistakable. Once your contract is drafted, imagine plugging it into a script—if processing would be awkward, simplify until it feels effortless.
            </p>
            <div className="rounded-lg border border-gray-200 p-3 sm:p-4 bg-gray-50">
              <pre className="text-xs md:text-sm p-3 rounded bg-white border border-gray-200 overflow-auto whitespace-pre-wrap break-words">
{`Task: "Extract 3 action items from meeting notes."`}
              </pre>
            </div>
            <Box tone="pro" title="Reuse it">
              Save your contract and example. They become sturdy building blocks for the patterns you will develop in Week 2, and they make collaboration smoother because everyone can rely on the same structure.
            </Box>
          </section>

          {/* Bottom Nav & Save */}
          <section id="next" className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
            <Link
              href="/learn/prompt-engineering/beginner/week1/clarity"
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
                href="/learn/prompt-engineering/beginner/week1/quick-evals"
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
