'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';

// --- Config ------------------------------------------------------------------
const PROGRESS_KEY = 'ai-everyone-week1:everyday-workflows';

const SECTIONS = [
  { id: 'intro', label: 'Overview' },
  { id: 'email', label: 'Email & Messages' },
  { id: 'docs', label: 'Docs & Reports' },
  { id: 'planning', label: 'Planning & To‑Dos' },
  { id: 'learning', label: 'Learning & Research' },
  { id: 'templates', label: 'Copy‑Paste Templates' },
  { id: 'practice', label: 'Mini Practice' },
  { id: 'next', label: 'Next Topic' },
];

// --- Helpers -----------------------------------------------------------------
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
  const palette = {
    tip: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    warn: 'border-amber-200 bg-amber-50 text-amber-900',
    pro: 'border-sky-200 bg-sky-50 text-sky-900',
  }[tone];
  const icon =
    tone === 'tip' ? (
      <Lightbulb className="h-4 w-4" />
    ) : tone === 'warn' ? (
      <AlertTriangle className="h-4 w-4" />
    ) : (
      <ShieldCheck className="h-4 w-4" />
    );

  return (
    <div className={cx('rounded-xl border p-4 flex gap-3 items-start', palette)}>
      <div className="mt-0.5">{icon}</div>
      <div>
        <div className="font-medium mb-1">{title}</div>
        <div className="text-sm md:text-[0.95rem] leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

// --- Page --------------------------------------------------------------------
export default function EverydayWorkflowsPage() {
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user ?? null);

      if (user) {
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

  const markComplete = async () => {
    if (!user) return alert('Please sign in to save your progress.');
    const { error } = await supabase.from('tracking').upsert(
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
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span className="font-bold">Week 1 • Everyday Workflows</span>
          </div>
          <button
            className="lg:hidden inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            Contents
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6">
        {/* Sidebar */}
        <aside
          className={cx(
            'lg:sticky lg:top-[72px] lg:h-[calc(100vh-88px)] lg:overflow-auto',
            'rounded-2xl border border-gray-200 bg-white p-4 shadow-sm',
            sidebarOpen ? '' : 'hidden lg:block'
          )}
        >
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">On this page</p>
          <nav className="space-y-1">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={cx(
                  'block px-3 py-2 rounded-lg text-sm',
                  activeId === s.id ? 'bg-green-50 text-green-800' : 'hover:bg-gray-50 text-gray-700'
                )}
              >
                {s.label}
              </a>
            ))}
          </nav>
          <div className="mt-6 p-3 rounded-xl bg-gray-50 text-xs text-gray-600">
            Reusable prompts • Real tasks • No code.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-8">
          {/* Intro */}
          <section id="intro" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Overview</h2>
            <p className="text-gray-700">
              This page shows four everyday ways to use AI: writing messages, building documents,
              planning your work, and learning faster. You’ll get simple prompts you can copy,
              plus a 10‑minute practice at the end.
            </p>
            <Box tone="tip" title="Rule of thumb">
              Start with something you already write weekly. Ask AI for 2–3 options, then pick and tweak.
            </Box>
          </section>

          {/* Email & Messages */}
          <section id="email" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Email & Messages</h2>
            <p className="text-gray-700">
              AI is great at turning your rough notes into clear, friendly messages for your audience.
            </p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Draft replies quickly; ask for a short, polite tone.</li>
              <li>Ask for a few subject line options.</li>
              <li>Keep the main point in the first two sentences.</li>
            </ul>
            <Box tone="tip" title="Prompt">
              I’m writing to <em>[customer/team/partner]</em> about <em>[topic]</em>. Make this concise, clear, and kind.
              Include: (1) one‑line context, (2) the key update or request, (3) next step with a date.
              Give me 3 subject lines.
            </Box>
          </section>

          {/* Docs & Reports */}
          <section id="docs" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Docs & Reports</h2>
            <p className="text-gray-700">
              Ask AI to outline first. Then expand section‑by‑section so you stay in control of the content.
            </p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Create an outline with 4–6 sections and bullet points.</li>
              <li>Generate a short executive summary last.</li>
              <li>Request a specific format (bullets, table, steps).</li>
            </ul>
            <Box tone="tip" title="Prompt">
              Create a clear outline for a <em>[report/blog post]</em> for <em>[audience]</em>.
              Include 5 sections with bullet points and a suggested title. Then wait for my edits before drafting.
            </Box>
            <Box tone="pro" title="Formatting boost">
              Ask the model to return a table (e.g., “columns: Task, Owner, Due date”) to make content easier to reuse.
            </Box>
          </section>

          {/* Planning & To-Dos */}
          <section id="planning" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Planning & To‑Dos</h2>
            <p className="text-gray-700">
              Turn a goal into a short, ordered plan. Keep it simple and time‑bound.
            </p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Ask for 5–7 steps with owners and dates.</li>
              <li>Request a checklist version you can copy to your task app.</li>
              <li>Iterate once: “Shorter steps, clearer owners, realistic dates.”</li>
            </ul>
            <Box tone="tip" title="Prompt">
              I need a simple plan to <em>[goal]</em> by <em>[date]</em>. Make an ordered list with 5–7 steps,
              each with an owner, due date, and success criteria. Provide a second version as a checklist.
            </Box>
          </section>

          {/* Learning & Research */}
          <section id="learning" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Learning & Research</h2>
            <p className="text-gray-700">
              Use AI to understand new topics faster. Ask for simple explanations and examples first.
            </p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Explain like I’m new to this—avoid jargon.</li>
              <li>Give two concrete examples and a quick analogy.</li>
              <li>List 3 key terms I should know with one‑line definitions.</li>
            </ul>
            <Box tone="tip" title="Prompt">
              Explain <em>[topic]</em> in plain language. Give (1) a 5‑sentence overview, (2) 2 real‑life examples,
              (3) an analogy, and (4) 3 key terms with one‑line definitions.
            </Box>
            <Box tone="warn" title="When accuracy matters">
              For important facts or decisions, ask the model to state uncertainties—or verify with trusted sources yourself.
            </Box>
          </section>

          {/* Templates */}
          <section id="templates" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Copy‑Paste Templates</h2>
            <div className="space-y-3">
              <Box tone="tip" title="Rewrite my draft">
                Here’s my rough draft for <em>[audience]</em> about <em>[topic]</em>. Make it clear, friendly, and concise.
                Keep it under <em>[N]</em> words. Offer 2 versions with different tones: (A) professional, (B) casual.
              </Box>
              <Box tone="tip" title="Outline first, then draft">
                Create a 6‑section outline for <em>[doc]</em> aimed at <em>[audience]</em>. After I approve, draft section 1 only.
              </Box>
              <Box tone="tip" title="Turn bullets → email">
                Turn these bullet points into a short email with a subject line and clear next step: <em>[paste bullets]</em>.
              </Box>
              <Box tone="pro" title="G‑C‑E habit (preview of next page)">
                Goal • Context • Example. Say what you want, who it’s for, and show a tiny sample or format.
              </Box>
            </div>
          </section>

          {/* Practice */}
          <section id="practice" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Mini Practice (10 minutes)</h2>
            <ol className="list-decimal pl-5 text-gray-700 space-y-2">
              <li>Pick one real task (email, outline, plan, or learning).</li>
              <li>Paste the matching template and fill in the brackets.</li>
              <li>Ask for 2 options. Choose the best and tweak it.</li>
              <li>Save your favorite prompt in your notes for reuse.</li>
            </ol>
            <Box tone="pro" title="Tiny improvement">
              Ask one follow‑up: “Shorter / clearer / more specific / add a checklist.” Small edits = big gains.
            </Box>
          </section>

          {/* Next */}
          <section id="next" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Next: Prompting Basics</h2>
            <p className="text-gray-700 mb-4">
              Learn the simple “Goal • Context • Example” habit to get better results—from any AI tool.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Back */}
              <Link
                href="/learn/ai-for-everyone/week1/what-ai-is"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Link>

              {/* Mark complete */}
              <button
                onClick={markComplete}
                className={cx(
                  'px-4 py-2 rounded-lg border',
                  completed ? 'border-green-200 bg-green-50 text-green-800' : 'border-gray-200 hover:bg-gray-50'
                )}
              >
                {completed ? 'Progress saved ✓' : 'Mark page complete'}
              </button>

              {/* Next */}
              <Link
                href="/learn/ai-for-everyone/week1/prompting-basics"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow"
                onClick={async () => {
                  if (!completed) await markComplete();
                }}
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
