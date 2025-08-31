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

  // Playground state
  const [pgOutput, setPgOutput] = useState<string>(
    `{"tagline":"Meet less. Decide faster.","word_count":4}`
  );
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

  // Playground checker (mirrors the simple JS from the lesson)
  function runPlaygroundCheck() {
    try {
      const o = JSON.parse(pgOutput);
      const maxWords = Number(pgMaxWords);
      const banned = pgBanned.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      const must = pgMustInclude.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

      const asText = JSON.stringify(o).toLowerCase();
      const mainText = String(o.tagline || o.summary || o.answer || '').trim();
      const wc = mainText ? mainText.split(/\s+/).filter(Boolean).length : 0;

      if (maxWords && wc > maxWords) return setPgResult(`❌ Too many words (${wc} > ${maxWords})`);
      for (const w of banned) { if (w && asText.includes(w)) return setPgResult(`❌ Contains banned term: ${w}`); }
      for (const w of must) { if (w && !asText.includes(w)) return setPgResult(`❌ Missing keyword: ${w}`); }

      setPgResult('✅ ok');
    } catch {
      setPgResult('❌ Invalid JSON');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-100 backdrop-blur bg-white/70">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-bold text-sm sm:text-base">Week 1 • Quick Evaluations</span>
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
            Evaluate small, iterate fast. Evals make prompts shippable.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-4 sm:space-y-6">
          {/* Intro */}
          <section id="intro" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-2 sm:space-y-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Quick Evaluations (Lightweight)</h1>
            <p className="text-base sm:text-lg text-gray-700">
              Think of quick evals like a <b>pre‑flight checklist</b>. In a few minutes, you confirm your prompt still flies: correct format, right tone, within limits.
            </p>
            <Box tone="tip" title="Outcome">
              A tiny eval kit you can run before shipping a prompt — and rerun after any change.
            </Box>
          </section>

          {/* Why quick evals */}
          <section id="why" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <h2 className="text-lg sm:text-xl font-semibold">Why Quick Evals</h2>
            <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700 space-y-1">
              <li>Catch regressions early (format, tone, accuracy).</li>
              <li>Give stakeholders confidence without heavy infra.</li>
              <li>Guide iteration with fast feedback loops.</li>
            </ul>
            <Box tone="pro" title="Keep it tiny">
              Start with 5–20 examples; increase only when the prompt stabilizes.
            </Box>
          </section>

          {/* Golden set */}
          <section id="golden" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Golden Set (Small & Strong)</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700">
              A <b>golden set</b> is a handful of <i>canonical</i> inputs that represent what success looks like (plus 1–2 tricky edge cases).
            </p>
            <div className="rounded-lg border border-gray-200 p-3 sm:p-4 bg-gray-50">
              <div className="font-medium mb-2">Example golden items</div>
              <pre className="text-xs md:text-sm p-3 rounded bg-white border border-gray-200 overflow-auto whitespace-pre-wrap break-words">
{`[
  {
    "input": "Draft a 1-sentence summary for 6th graders about recycling.",
    "must_include": ["recycling", "benefit"],
    "max_words": 20
  },
  {
    "input": "Create a tagline for an AI note tool (≤ 12 words).",
    "banned": ["revolutionary", "synergy"],
    "max_words": 12
  },
  {
    "input": "Explain what to do if info is missing.",
    "must_include": ["insufficient information"],
    "max_words": 18
  }
]`}
              </pre>
            </div>
            <Box tone="tip" title="Balance the set">
              Include edge cases: short/long inputs, tricky tone, missing info. Keep it <b>small</b> but <b>representative</b>.
            </Box>
          </section>

          {/* Assertions */}
          <section id="assertions" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Assertions & Pass/Fail</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700">
              Assertions are simple rules that outputs must obey. They turn fuzzy “looks good” into <b>yes/no checks</b>.
            </p>
            <div className="rounded-lg border border-gray-200 p-3 sm:p-4 bg-gray-50">
              <pre className="text-xs md:text-sm p-3 rounded bg-white border border-gray-200 overflow-auto whitespace-pre-wrap break-words">
{`function check(output, rules) {
  let o; try { o = JSON.parse(output); } catch { return 'Invalid JSON'; }

  if (rules.max_words) {
    const txt = String(o.tagline || o.summary || o.answer || '').trim();
    const wc = txt ? txt.split(/\\s+/).filter(Boolean).length : 0;
    if (wc > rules.max_words) return 'Too many words';
  }
  if (rules.banned) {
    const hay = JSON.stringify(o).toLowerCase();
    for (const w of rules.banned) {
      if (hay.includes(w)) return 'Contains banned term: ' + w;
    }
  }
  if (rules.must_include) {
    const hay = JSON.stringify(o).toLowerCase();
    for (const w of rules.must_include) {
      if (!hay.includes(w)) return 'Missing: ' + w;
    }
  }
  return 'ok';
}`}
              </pre>
            </div>
            <Box tone="pro" title="Tip">
              Assertions are easiest when your prompt returns <b>structured JSON</b>.
            </Box>
          </section>

          {/* Assertion Playground */}
          <section id="playground" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Hammer className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Assertion Playground</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700 mb-3">
              Paste a JSON output and run quick checks locally. No backend required.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <div className="text-xs text-gray-600 mb-1">Output JSON</div>
                <textarea
                  className="w-full min-h-[180px] rounded-xl border border-gray-200 p-3 font-mono text-xs sm:text-sm bg-white"
                  value={pgOutput}
                  onChange={(e) => setPgOutput(e.target.value)}
                  spellCheck={false}
                />
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
                    <label className="block text-xs text-gray-600 mb-1">Banned terms (comma‑sep)</label>
                    <input
                      className="w-full rounded-lg border border-gray-200 p-2 text-sm bg-white"
                      value={pgBanned}
                      onChange={(e) => setPgBanned(e.target.value)}
                      placeholder="e.g., revolutionary, synergy"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-gray-600 mb-1">Must include (comma‑sep)</label>
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
              When pass/fail is too strict, add a tiny rubric. Score 2–4 things that matter most.
            </p>
            <div className="rounded-lg border border-gray-200 p-3 sm:p-4 bg-gray-50">
              <div className="font-medium mb-2">Sample rubric (tagline)</div>
              <pre className="text-xs md:text-sm p-3 rounded bg-white border border-gray-200 overflow-auto whitespace-pre-wrap break-words">
{`{
  "clarity": 1..5,     // understandable for target audience
  "specificity": 1..5, // avoids vague claims
  "tone": 1..5,        // matches instructions (e.g., energetic)
  "format": 1..5       // respects length/JSON contract
}`}
              </pre>
            </div>
            <Box tone="tip" title="Keep rubric tiny">
              Two or three dimensions often suffice — too many slows you down.
            </Box>
          </section>

          {/* A/B & Regression */}
          <section id="ab" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <GitCompare className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">A/B & Regression</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700">Compare prompt variants and guard against backslides.</p>
            <div className="rounded-lg border border-gray-200 p-3 sm:p-4 bg-gray-50">
              <div className="font-medium mb-2">Mini A/B plan</div>
              <pre className="text-xs md:text-sm p-3 rounded bg-white border border-gray-200 overflow-auto whitespace-pre-wrap break-words">
{`Variants:
- A: Current prompt
- B: Add explicit audience + banned term list

Procedure:
- Run both on the golden set
- Tally pass/fail + average rubric score
- Keep the variant with higher pass rate and score`}
              </pre>
            </div>
            <Box tone="pro" title="Regression set">
              Save failing cases. When fixed, they become permanent tests to prevent future regressions.
            </Box>
          </section>

          {/* Logging & Notes */}
          <section id="logging" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Notebook className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Logging & Notes</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700">
              Keep a lightweight log so you know what actually helped.
            </p>
            <div className="rounded-lg border border-gray-200 p-3 sm:p-4 bg-gray-50">
              <div className="font-medium mb-2">Changelog template</div>
              <pre className="text-xs md:text-sm p-3 rounded bg-white border border-gray-200 overflow-auto whitespace-pre-wrap break-words">
{`# Date: 2025-08-31
Change: Added audience, banned terms.
Golden pass: 12/15 → 14/15
Rubric avg: 3.6 → 4.2
Notes: Fewer verbose outputs; one edge case still fails (missing audience).`}
              </pre>
            </div>
          </section>

          {/* Pitfalls */}
          <section id="pitfalls" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <h2 className="text-lg sm:text-xl font-semibold">Common Pitfalls</h2>
            <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700 space-y-1">
              <li>Oversized golden sets → slow iteration, little benefit.</li>
              <li>Unstructured outputs → can’t assert pass/fail easily.</li>
              <li>Changing multiple things at once → unclear what helped.</li>
            </ul>
            <Box tone="warn" title="One‑change rule">
              Adjust one variable per iteration (role, constraint, format) to isolate impact.
            </Box>
          </section>

          {/* Practice */}
          <section id="exercise" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <h2 className="text-lg sm:text-xl font-semibold">Practice: Build a Tiny Eval Kit</h2>
            <ol className="list-decimal pl-5 text-sm sm:text-base text-gray-700 space-y-2">
              <li>Create a <b>golden set</b> of 8–10 inputs for your current prompt.</li>
              <li>Write 3–5 <b>assertions</b> (format, word count, banned terms).</li>
              <li>Add a <b>rubric</b> with 2 dimensions (clarity, tone).</li>
              <li>Test Variant A vs B; keep the winner and log the result.</li>
            </ol>
            <Box tone="tip" title="Ship it">
              Store your golden set and checks alongside the prompt so they evolve together.
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
