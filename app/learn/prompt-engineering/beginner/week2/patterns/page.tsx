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
  Workflow,
  Rocket,
  Target,
} from 'lucide-react';

// --- Config ------------------------------------------------------------------
const PROGRESS_KEY = 'pe-week-2:patterns';

const SECTIONS = [
  { id: 'intro', label: 'Intro' },
  { id: 'why', label: 'Why Few-Shot' },
  { id: 'style-lock', label: 'Style Locks' },
  { id: 'contrastive', label: 'Contrastive Pairs' },
  { id: 'schema-true', label: 'Stay Schema-True' },
  { id: 'minimal', label: 'Keep It Minimal' },
  { id: 'craft', label: 'Crafting High-Signal Examples' },
  { id: 'antipatterns', label: 'Anti-Patterns to Avoid' },
  { id: 'practice', label: 'Practice' },
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
export default function FewShotPatterns() {
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
            <span className="font-bold text-sm sm:text-base">Week 2 • Few-Shot Patterns</span>
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
            Keep your Week-1 contract handy; every example should honor it.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-4 sm:space-y-6">
          {/* Intro */}
          <section id="intro" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Welcome back! {user ? `, ${username}` : ''}</h1>
            <p className="text-base sm:text-lg text-gray-700">
              Few-shot prompting is the art of teaching by example. Instead of stacking more instructions, you show the model exactly what “good” looks like and let those examples carry the style, structure, and boundaries you care about. The shift is subtle but powerful: with one or two carefully chosen samples, your prompt becomes steadier, outputs grow more consistent, and small changes become easier to measure.
            </p>
            <Box tone="tip" title="Mindset">
              Think like a coach. Each example should demonstrate one thing you want repeated, not five. Precision beats variety at this stage.
            </Box>
          </section>

          {/* Why Few-Shot */}
          <section id="why" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Why Few-Shot</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700">
              Instructions describe the destination; examples draw the map. When examples echo your desired tone and format, the model stops guessing about voice or structure and starts imitating with confidence. This is especially useful when you need consistent phrasing, a specific rhythm, or a strict response shape. By grounding abstract rules in concrete samples, you also make evaluation simpler: if an output diverges from the pattern, you immediately see where and why.
            </p>
            <div className="rounded-lg border border-gray-200 p-3 sm:p-4 bg-gray-50">
              <p className="font-medium mb-1">Plain-text illustration</p>
              <pre className="text-xs md:text-sm p-3 rounded bg-white border border-gray-200 overflow-auto whitespace-pre-wrap">
Intent: Write a one-line, energetic tagline for a note app used by busy managers.
Example you show:
→ "Meet less. Decide faster."
Why it works: short, punchy, benefit-first; no fluff or buzzwords.
            </pre>
            </div>
          </section>

          {/* Style Locks */}
          <section id="style-lock" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Style Locks</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700">
              A style lock is a single, polished sample that the model can safely mimic. It sets the voice, the tempo, and the level of specificity. The trick is to choose one exemplar that is unmistakably on brand. When users or teammates look at your style-lock example, they should nod and say, “Yes — more like this.”
            </p>
            <p className="text-sm sm:text-base text-gray-700">
              Keep the sample short so the signal stays clean. If you need a little context, add a brief note that explains the audience or the constraint in natural language. Then let the line itself carry the style you want repeated.
            </p>
            <div className="rounded-lg border border-gray-200 p-3 sm:p-4 bg-gray-50">
              <p className="font-medium mb-1">Style-lock example</p>
              <pre className="text-xs md:text-sm p-3 rounded bg-white border border-gray-200 overflow-auto whitespace-pre-wrap">
Task: One-sentence homepage blurb for a B2B note app; audience is time-pressed managers.
Exemplar:
→ "Turn meetings into decisions — in minutes, not hours."
Signal carried: direct benefit, time contrast, no hype words.
              </pre>
            </div>
            <Box tone="pro" title="Make it repeatable">
              If you wouldn’t publish your example as-is on a landing page, it isn’t a style lock yet. Polish until you would.
            </Box>
          </section>

          {/* Contrastive Pairs */}
          <section id="contrastive" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Workflow className="h-5 w-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-semibold">Contrastive Pairs</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700">
              Sometimes it’s faster to teach by showing a miss. A contrastive pair places a weak example next to a strong one so the boundary becomes obvious. This is perfect for eliminating clichés, wordiness, or the wrong tone. The model doesn’t just learn what to do; it learns what to avoid.
            </p>
            <div className="rounded-lg border border-gray-200 p-3 sm:p-4 bg-gray-50">
              <p className="font-medium mb-1">Before → After</p>
              <pre className="text-xs md:text-sm p-3 rounded bg-white border border-gray-200 overflow-auto whitespace-pre-wrap">
Not this:
→ "Revolutionary AI note-taking to supercharge synergy across your workflows."

Do this:
→ "Notes that write themselves — so your team ships the work that matters."
Why it works: concrete benefit, plain language, no buzzwords.
              </pre>
            </div>
            <Box tone="tip" title="Use one clear mistake">
              Make the “before” deliberately wrong in a single way (e.g., buzzwords). Fix exactly that in the “after.” One contrast, one lesson.
            </Box>
          </section>

          {/* Stay Schema-True */}
          <section id="schema-true" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <h2 className="text-lg sm:text-xl font-semibold">Stay Schema-True</h2>
            <p className="text-sm sm:text-base text-gray-700">
              Examples work best when they mirror the response shape you expect in production. If your downstream tools rely on a particular set of fields or sections, express those as plain text headings and keep them identical across every sample. This keeps the model from drifting and makes quick checks painless.
            </p>
            <div className="rounded-lg border border-gray-200 p-3 sm:p-4 bg-gray-50">
              <p className="font-medium mb-1">Plain-text contract, mirrored by examples</p>
              <pre className="text-xs md:text-sm p-3 rounded bg-white border border-gray-200 overflow-auto whitespace-pre-wrap">
Answer: Meet less. Decide faster.
Rationale: Time saved + faster decisions are the core benefits for managers.
Assumptions: Audience values brevity; no jargon.
Confidence: high
              </pre>
            </div>
            <Box tone="pro" title="One shape, everywhere">
              If you add or rename a section, update every example to match before you test again.
            </Box>
          </section>

          {/* Keep It Minimal */}
          <section id="minimal" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <h2 className="text-lg sm:text-xl font-semibold">Keep It Minimal</h2>
            <p className="text-sm sm:text-base text-gray-700">
              More examples do not mean better learning. The model needs clarity, not coverage. One great style lock plus one contrastive pair is often enough to pin down tone and boundaries. If you feel tempted to add a fourth or fifth sample, ask yourself whether it teaches something genuinely new or merely repeats what the others already reveal.
            </p>
            <div className="rounded-lg border border-gray-200 p-3 sm:p-4 bg-gray-50">
              <p className="font-medium mb-1">Tiny, high-signal set</p>
              <pre className="text-xs md:text-sm p-3 rounded bg-white border border-gray-200 overflow-auto whitespace-pre-wrap">
Set A:
1) Style lock — "Meet less. Decide faster."
2) Contrastive bad — "Revolutionary synergy platform for notes."
3) Contrastive good — "Turn meetings into decisions — in minutes."
Result: tone stabilized; banned phrasing avoided without extra rules.
              </pre>
            </div>
          </section>

          {/* Crafting High-Signal Examples */}
          <section id="craft" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <h2 className="text-lg sm:text-xl font-semibold">Crafting High-Signal Examples</h2>
            <p className="text-sm sm:text-base text-gray-700">
              Begin by naming the audience and the success condition in a single sentence; this quiet context helps without bloating the prompt. Draft three short candidates and say them out loud — the one that lands cleanly is usually your style lock. If your task has must-avoid language, include a contrastive pair so the model learns the boundary by sight rather than by rule. Finally, rewrite your example to mirror your response sections exactly, then trim any filler until only the signal remains.
            </p>
            <div className="rounded-lg border border-gray-200 p-3 sm:p-4 bg-gray-50">
              <p className="font-medium mb-1">From raw idea to polished example</p>
              <pre className="text-xs md:text-sm p-3 rounded bg-white border border-gray-200 overflow-auto whitespace-pre-wrap">
Raw thought: "We save time after meetings."
Polished exemplar:
Answer: "Minutes to decisions, not hours of notes."
Rationale: Emphasizes time savings and outcome.
Assumptions: Manager audience; brevity valued.
Confidence: medium
              </pre>
            </div>
          </section>

          {/* Anti-Patterns */}
          <section id="antipatterns" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <h2 className="text-lg sm:text-xl font-semibold">Anti-Patterns to Avoid</h2>
            <p className="text-sm sm:text-base text-gray-700">
              Mixing formats across examples confuses the model, even if the samples look individually strong. Long, rambling exemplars bury the style signal under extra words and invite drift. Changing tone or audience mid-set teaches the model that inconsistency is allowed. Treat your examples like a small chorus: every voice should sing the same song, at the same tempo, in the same key.
            </p>
            <Box tone="warn" title="Simple safeguard">
              After you prepare your set, skim each example and check that the sections, tone, and length match. Consistency here prevents most surprises later.
            </Box>
          </section>

          {/* Practice */}
          <section id="practice" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <h2 className="text-lg sm:text-xl font-semibold">Practice</h2>
            <p className="text-sm sm:text-base text-gray-700">
              Pick a task you actually run at work — for example, a one-sentence summary for executives or a short product tagline. Create one style lock that you would be proud to publish. Add a contrastive pair that eliminates a single bad habit you often see. Mirror your response sections exactly, then run three very different inputs through your prompt and observe whether the outputs keep the tone and structure you set. If they wobble, refine the exemplar rather than adding more rules, and try again.
            </p>
            <div className="rounded-lg border border-gray-200 p-3 sm:p-4 bg-gray-50">
              <p className="font-medium mb-1">Starter template (plain text)</p>
              <pre className="text-xs md:text-sm p-3 rounded bg-white border border-gray-200 overflow-auto whitespace-pre-wrap">
Context: Audience = busy managers; goal = one-line benefit; avoid hype words.
Exemplar (style lock):
Answer: "Meet less. Decide faster."
Rationale: Concise, outcome-oriented, no buzzwords.
Assumptions: Managers value brevity and decision speed.
Confidence: high
              </pre>
            </div>
            <div className="mt-2 flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <p className="text-sm">When your three test inputs produce outputs that “sound like” your exemplar, you’ve locked the style.</p>
            </div>
          </section>

          {/* Bottom Nav & Save */}
          <section id="next" className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
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
                {completed ? 'Progress saved ✓' : 'Mark patterns lesson complete'}
              </button>
              <Link
                href="/learn/prompt-engineering/beginner/week2/cot-vs-concise"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow w-full sm:w-auto"
                onClick={async () => { if (!completed) await markComplete(); }}
              >
                Next: CoT vs Concise <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
