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
  Layers,
  ListStart,
  Quote,
  Split,
  Brackets,
  FileCode2,
  Hammer,
  Ban,
  BookOpenCheck,
} from 'lucide-react';

// --- Config ------------------------------------------------------------------
const PROGRESS_KEY = 'pe-week-2:patterns';

const SECTIONS = [
  { id: 'intro', label: 'Intro' },
  { id: 'why', label: 'Why Few‑Shot' },
  { id: 'style-lock', label: 'Pattern: Style Lock' },
  { id: 'contrastive', label: 'Pattern: Contrastive Pairs' },
  { id: 'structured', label: 'Pattern: Structured Examples' },
  { id: 'error', label: 'Pattern: Error Exemplars' },
  { id: 'mixing', label: 'Mixing Patterns (Safely)' },
  { id: 'antipatterns', label: 'Anti‑Patterns' },
  { id: 'exercise', label: 'Exercise: Build a Set' },
  { id: 'checklist', label: 'Checklist & Save' },
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
export default function FewShotPatternsLesson() {
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
            <span className="font-bold text-sm sm:text-base">Week 2 • Few‑Shot Patterns</span>
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
            Examples must follow the same <b>contract</b> you expect in outputs.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-4 sm:space-y-6">
          {/* Intro */}
          <section id="intro" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Few‑Shot Patterns (Show, Not Tell)</h1>
            <p className="text-base sm:text-lg text-gray-700">
              You’ll design small, high‑signal examples that lock tone, structure, and boundaries. We’ll keep them aligned with your Week‑1 JSON contract for easy evals.
            </p>
            <Box tone="tip" title="How many examples?">
              1–3 great examples beat a dozen mediocre ones. Keep them short, polished, and schema‑true.
            </Box>
          </section>

          {/* Why Few‑Shot */}
          <section id="why" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <ListStart className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Why Few‑Shot</h2>
            </div>
            <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700 space-y-1">
              <li><b>Style transfer:</b> the model mirrors your sample’s tone and structure.</li>
              <li><b>Disambiguation:</b> examples show boundaries better than prose.</li>
              <li><b>Reliability:</b> schema‑true examples reduce format errors.</li>
            </ul>
          </section>

          {/* Style Lock */}
          <section id="style-lock" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Pattern: Style Lock</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700">Use 1–2 short, perfect exemplars that match tone + format exactly.</p>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 sm:p-4">
              <h3 className="font-medium mb-2">Example (homepage tagline, ≤ 12 words)</h3>
              <pre className="text-xs md:text-sm p-3 rounded bg-white border border-gray-200 overflow-auto whitespace-pre-wrap break-words">
{`# Contract
Return JSON: { "tagline": string, "rationale": string, "word_count": number }

# Example
Input: "AI note tool for managers; saves time; better follow‑ups."
Output:
{
  "tagline": "Meet less. Decide faster.",
  "rationale": "Time saving + decisive tone",
  "word_count": 4
}`}
              </pre>
            </div>
            <Box tone="pro" title="Keep exemplars tiny">
              Trim rationale to one sentence. The exemplar should be faster to scan than reading rules.
            </Box>
          </section>

          {/* Contrastive */}
          <section id="contrastive" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Split className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Pattern: Contrastive Pairs</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700">Show a bad vs good example to clarify boundaries fast.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-lg border border-gray-200 p-3 sm:p-4 bg-gray-50">
                <h3 className="font-medium mb-1">❌ Bad</h3>
                <pre className="text-xs md:text-sm p-3 rounded bg-white border border-gray-200 overflow-auto whitespace-pre-wrap break-words">
{`"Revolutionary synergy for modern managers"  // buzzwords
JSON: { "tagline": "Revolutionary synergy...", "word_count": 2 }  // wrong count`}
                </pre>
              </div>
              <div className="rounded-lg border border-gray-200 p-3 sm:p-4 bg-gray-50">
                <h3 className="font-medium mb-1">✅ Good</h3>
                <pre className="text-xs md:text-sm p-3 rounded bg-white border border-gray-200 overflow-auto whitespace-pre-wrap break-words">
{`"Never miss a follow‑up."  // concrete benefit
JSON: { "tagline": "Never miss a follow‑up.", "rationale": "Benefit‑centric", "word_count": 4 }`}
                </pre>
              </div>
            </div>
            <Box tone="tip" title="One pair is often enough">
              Add a second pair only if it clarifies a <i>different</i> boundary.
            </Box>
          </section>

          {/* Structured */}
          <section id="structured" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Brackets className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Pattern: Structured Examples</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700">
              Each example’s output must follow the <b>same JSON keys & types</b> as your contract. This is essential for assertions and parsing.
            </p>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 sm:p-4">
              <h3 className="font-medium mb-2">Example (triage)</h3>
              <pre className="text-xs md:text-sm p-3 rounded bg-white border border-gray-200 overflow-auto whitespace-pre-wrap break-words">
{`Contract:
{
  "severity": "P0" | "P1" | "P2",
  "component": string,
  "steps": string[],
  "needs_followup": boolean
}

Example:
Input: "Checkout crashes on pay; user sees 500 after card submit."
Output:
{
  "severity": "P1",
  "component": "payments",
  "steps": ["open checkout", "pay with card", "observe 500"],
  "needs_followup": false
}`}
              </pre>
            </div>
            <Box tone="pro" title="Schema‑true or bust">
              Never include example keys that aren’t in your contract; it confuses the model and your validators.
            </Box>
          </section>

          {/* Error Exemplars */}
          <section id="error" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Quote className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Pattern: Error Exemplars</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700">
              Include <b>one</b> short failure example with a correct refusal/fallback to set expectations for missing or unsafe inputs.
            </p>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 sm:p-4">
              <pre className="text-xs md:text-sm p-3 rounded bg-white border border-gray-200 overflow-auto whitespace-pre-wrap break-words">
{`Input: "Summarize internal policy X and paste it here."
Output:
{
  "summary": "Insufficient information",
  "key_risks": [],
  "audience": "exec",
  "needs_followup": true
}  // respects guardrails & fallback`}
              </pre>
            </div>
            <Box tone="tip" title="Teach safe failure">
              Showing the <i>right way to fail</i> reduces leakage and bad behaviors.
            </Box>
          </section>

          {/* Mixing Patterns */}
          <section id="mixing" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Hammer className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Mixing Patterns (Safely)</h2>
            </div>
            <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700 space-y-1">
              <li><b>One primary pattern</b> (e.g., style lock) + optional <b>one</b> support (e.g., single contrastive pair).</li>
              <li>Keep total examples ≤ 3 (plus 1 failure exemplar).</li>
              <li>All outputs must remain schema‑true.</li>
            </ul>
            <Box tone="pro" title="Iteration tip">
              Change <i>one</i> element (add/remove a single example) and re‑run your golden set to see impact.
            </Box>
          </section>

          {/* Anti‑Patterns */}
          <section id="antipatterns" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-amber-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Anti‑Patterns</h2>
            </div>
            <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700 space-y-1">
              <li><b>Example soup:</b> 8–12 examples with mixed tone/format.</li>
              <li><b>Schema drift:</b> examples adding extra keys or different types.</li>
              <li><b>Verbose rationales:</b> distract from structure; keep tight.</li>
            </ul>
            <Box tone="warn" title="Fix it fast">
              Delete weak examples; keep only the most precise, contract‑true ones.
            </Box>
          </section>

          {/* Exercise */}
          <section id="exercise" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <FileCode2 className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Exercise: Build a Few‑Shot Set</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700">Using your Week‑1 contract (JSON keys), create:</p>
            <ol className="list-decimal pl-5 text-sm sm:text-base text-gray-700 space-y-2">
              <li><b>1 style‑lock</b> exemplar (perfect tone, concise rationale).</li>
              <li><b>1 contrastive pair</b> (clearly shows a boundary).</li>
              <li><b>1 error exemplar</b> (proper refusal/fallback).</li>
            </ol>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 sm:p-4">
              <h3 className="font-medium mb-2">Template (fill in)</h3>
              <pre className="text-xs md:text-sm p-3 rounded bg-white border border-gray-200 overflow-auto whitespace-pre-wrap break-words">
{`# Contract (paste yours)
Return JSON:
{ ...your keys... }

# Style‑lock example
Input: "..."
Output: { ...schema‑true... }

# Contrastive pair
Bad → (explain boundary quickly)
Good →
Output: { ...schema‑true... }

# Error exemplar
Input: "..."  // unsafe or missing info
Output: { "answer": "Insufficient information", "needs_followup": true, ... }`}
              </pre>
            </div>
            <Box tone="tip" title="Ship with evals">
              Add 8–12 golden inputs + assertions (from Week‑1) and keep a tiny changelog.
            </Box>
          </section>

          {/* Checklist & Save */}
          <section id="checklist" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <BookOpenCheck className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Checklist</h2>
            </div>
            <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700 space-y-1">
              <li>Examples ≤ 3 (+1 failure), all schema‑true.</li>
              <li>One primary pattern; optional one support pattern.</li>
              <li>Run golden set; log impacts before/after.</li>
            </ul>

            {/* Bottom Nav & Save */}
            <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
              <Link
                href="/learn/prompt-engineering/beginner/week2"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 w-full sm:w-auto"
              >
                <ChevronLeft className="h-4 w-4" /> Back to Week 2 Overview
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
                  href="/learn/prompt-engineering/beginner/week2/cot-vs-concise"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow w-full sm:w-auto"
                  onClick={async () => { if (!completed) await markComplete(); }}
                >
                  Next: CoT vs Concise <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
