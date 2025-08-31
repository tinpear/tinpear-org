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
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-100 backdrop-blur bg-white/70">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white"><Sparkles className="h-4 w-4"/></span>
            <span className="font-bold">Week 1 • Prompt Engineering</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="lg:hidden inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200"
              onClick={() => setSidebarOpen(v => !v)}>
              {sidebarOpen ? <X className="h-4 w-4"/> : <Menu className="h-4 w-4"/>}
              Contents
            </button>
            <div className="text-sm text-gray-600">
              {loading ? 'Loading…' : user ? `Signed in as ${username}` : <Link href="/signin" className="underline">Sign in</Link>}
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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Welcome{user ? `, ${username}` : ''} </h1>
            <p className="text-lg text-gray-700">This week, you’ll learn to design prompts that are clear, testable, and useful — from simple tasks to advanced workflows.</p>
            <Box tone="tip" title="Keep it repeatable">
              The best prompts work again and again. We’ll show you how to think in patterns and run quick evaluations.
            </Box>
          </section>

          <section id="what-is-pe" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">What is Prompt Engineering?</h2>
            <p className="text-gray-700">Prompt engineering is the craft of turning intent into structured input for language models. It bridges ideas with execution.</p>
          </section>

          <section id="why-it-matters" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Why It Matters</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Clear prompts = better model performance</li>
              <li>Structure allows automation + eval</li>
              <li>Helps reduce hallucinations and errors</li>
            </ul>
          </section>

          <section id="clarity-techniques" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Clarity Techniques</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Specify role, goal, constraints</li>
              <li>Ask for structured output</li>
              <li>Pre-define edge cases to avoid confusion</li>
            </ul>
            <Box tone="warn" title="Avoid ambiguity">
              Words like “optimize” or “best” are vague. Add context or examples to make your intent clear.
            </Box>
          </section>

          <section id="structure-patterns" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Few-shot & Structure</h2>
            <p className="text-gray-700">Show what you expect. Use 1–3 high-quality examples to train the model mid-prompt.</p>
            <Box tone="tip" title="Instruction + format + sample = clarity">
              Models perform better when they know what the answer should look like. Add samples inline.
            </Box>
          </section>

          <section id="evaluation" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Quick Evaluation</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Sanity check with known inputs</li>
              <li>Define pass/fail rules or outputs</li>
              <li>Use dummy data to test formatting</li>
            </ul>
          </section>

          <section id="mistakes" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">🚨 Common Mistakes</h2>
            <Box tone="warn" title="Overloading the prompt">
              Don’t cram too many instructions. Models have limited attention — prioritize clarity.
            </Box>
            <Box tone="warn" title="Skipping evals">
              Without feedback, prompts drift. Always test before shipping.
            </Box>
          </section>

          <section id="next" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Ready to begin?</h2>
            <p className="text-gray-700 mb-4">Let’s dive into instruction prompts next — where you’ll define role, goal, and constraints.</p>
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
