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
            <span className="font-bold text-sm sm:text-base">Week 1 • Response Formatting & Guardrails</span>
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
        {/* Sidebar (slide-over on mobile, sticky on lg+) */}
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
              You’ll design output contracts (usually JSON) the model must follow, add guardrails for safety, and set fallbacks for missing info.
            </p>
            <Box tone="tip" title="Outcome">
              A reusable format you can parse, validate, and monitor across tasks and teams.
            </Box>
          </section>

          {/* Why Structure */}
          <section id="why-structure" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <h2 className="text-lg sm:text-xl font-semibold">Why Structured Output</h2>
            <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700 space-y-1">
              <li>Predictable shape → easy to automate downstream.</li>
              <li>Simple pass/fail checks → quick QA and regression tests.</li>
              <li>Better reuse → different inputs, same contract.</li>
            </ul>
            <Box tone="pro" title="Tip: keep the schema small">
              Use the <b>fewest keys</b> that still cover your needs. Smaller contracts reduce drift.
            </Box>
          </section>

          {/* Schema */}
          <section id="schema" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <h2 className="text-lg sm:text-xl font-semibold">Designing Your JSON Schema</h2>
            <div className="rounded-lg border border-gray-200 p-3 sm:p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-2"><Code2 className="h-4 w-4" /><h3 className="font-medium">Minimal generic schema</h3></div>
              <pre className="text-xs md:text-sm p-3 rounded bg-white border border-gray-200 overflow-auto whitespace-pre-wrap break-words">
{`Return JSON:
{
  "answer": string,
  "rationale": string,
  "assumptions": string[],
  "confidence": "low" | "medium" | "high"
}`}
              </pre>
            </div>
            <div className="rounded-lg border border-gray-200 p-3 sm:p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-2"><ClipboardCheck className="h-4 w-4" /><h3 className="font-medium">Task‑specific add‑ons</h3></div>
              <pre className="text-xs md:text-sm p-3 rounded bg-white border border-gray-200 overflow-auto whitespace-pre-wrap break-words">
{`For triage:
{
  "severity": "P0" | "P1" | "P2",
  "component": string,
  "steps": string[],
  "needs_followup": boolean
}`}
              </pre>
            </div>
          </section>

          {/* Examples & Contracts */}
          <section id="examples" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold">Examples & Contracts</h2>

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
              Add 1–3 short, high‑quality examples that follow your exact schema. Show the model the shape you expect.
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
              Your examples must adhere to the <b>same contract</b> (keys, types) you demand from the model.
            </Box>
          </section>

          {/* Guardrails & Fallbacks */}
          <section id="guardrails" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <h2 className="text-lg sm:text-xl font-semibold">Guardrails & Fallbacks</h2>
            <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700 space-y-1">
              <li>Explicit refusals (policy, safety, private info).</li>
              <li>Missing‑info fallback (mark and request what’s needed).</li>
              <li>Bounds (length, tone, banned terms).</li>
            </ul>
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
            <p className="text-sm sm:text-base text-gray-700">Basic checks you can automate:</p>
            <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700 space-y-1">
              <li>Is the output valid JSON? (try/catch parse)</li>
              <li>Do all required keys exist with correct types?</li>
              <li>Are bounds respected (e.g., word_count, banned terms)?</li>
            </ul>
            <Box tone="tip" title="Thin validator (pseudo‑code)">
              <pre className="text-xs md:text-sm p-3 rounded bg-white border border-gray-200 overflow-auto whitespace-pre-wrap break-words">
{`function validate(out) {
  try { JSON.parse(out) } catch { return 'Invalid JSON' }
  const o = JSON.parse(out)
  if (typeof o.answer !== 'string') return 'answer missing'
  if (!['low','medium','high'].includes(o.confidence)) return 'confidence bad'
  return 'ok'
}`}
              </pre>
            </Box>
          </section>

          {/* Pitfalls */}
          <section id="pitfalls" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <h2 className="text-lg sm:text-xl font-semibold">Common Pitfalls</h2>
            <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700 space-y-1">
              <li>Over‑large schemas (models drift more; validation harder).</li>
              <li>Examples that don’t match your schema (mixed signals).</li>
              <li>Forgetting fallbacks → brittle automations.</li>
            </ul>
          </section>

          {/* Exercise */}
          <section id="exercise" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <h2 className="text-lg sm:text-xl font-semibold">Practice: Your Turn</h2>
            <p className="text-sm sm:text-base text-gray-700">Design an output contract for:</p>
            <div className="rounded-lg border border-gray-200 p-3 sm:p-4 bg-gray-50">
              <pre className="text-xs md:text-sm p-3 rounded bg-white border border-gray-200 overflow-auto whitespace-pre-wrap break-words">
{`Task: "Extract 3 action items from meeting notes."`}
              </pre>
            </div>
            <ol className="list-decimal pl-5 text-sm sm:text-base text-gray-700 space-y-2">
              <li>Define required keys (e.g., <code>items: {`{ text, owner, due }[]`}</code>).</li>
              <li>Add guardrails (max 3, refuse if no clear actions).</li>
              <li>Provide 1 few‑shot example that <b>uses your schema</b>.</li>
            </ol>
            <Box tone="pro" title="Reuse it">
              Save your schema and examples — they become building blocks for Week 2 patterns.
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
