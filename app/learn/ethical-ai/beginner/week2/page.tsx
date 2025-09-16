'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Bug,
  Lock,
  Target,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Home,
} from 'lucide-react';

// --- Config ------------------------------------------------------------------
const PROGRESS_KEY = 'ethical-week-2:start';

const SECTIONS = [
  { id: 'welcome', label: 'Welcome & Orientation' },
  { id: 'prompt-injection', label: 'Prompt Injection & Exfiltration' },
  { id: 'pii', label: 'PII, Redaction & Logging' },
  { id: 'evals', label: 'Red-teaming & Quick Evals' },
  { id: 'next', label: 'Next Steps' },
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
  const palette = {
    tip: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    warn: 'border-amber-200 bg-amber-50 text-amber-900',
    pro: 'border-sky-200 bg-sky-50 text-sky-900',
  }[tone];
  const icon =
    tone === 'tip' ? <Lightbulb className="h-4 w-4" /> :
    tone === 'warn' ? <AlertTriangle className="h-4 w-4" /> :
    <CheckCircle2 className="h-4 w-4" />;

  return (
    <div className={cx('rounded-xl border p-3 md:p-4 flex gap-3 items-start', palette)}>
      <div className="mt-0.5">{icon}</div>
      <div className="min-w-0 break-words">
        <div className="font-medium mb-1">{title}</div>
        <div className="text-sm md:text-[0.95rem] leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

// --- Page --------------------------------------------------------------------
export default function EthicalAIWeek2Page() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [completed, setCompleted] = useState(false);
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
        { user_id: user.id, key: PROGRESS_KEY, completed: true, completed_at: new Date().toISOString() },
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
    const els = SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean) as Element[];
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header (match AI-for-Everyone pattern) */}
      <header className="sticky top-0 z-30 border-b border-gray-100 backdrop-blur bg-white/70">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-14 grid grid-cols-[auto_1fr_auto] items-center gap-3">
            {/* Home */}
            <Link
              href="/learn/ethical-ai"
              aria-label="Go to course home"
              prefetch={false}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2"
            >
              <Home className="h-5 w-5" />
            </Link>
            {/* Title */}
            <div className="flex items-center justify-center">
              <span className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                Week 2 · Ethical AI in Practice
              </span>
            </div>
            {/* Contents toggle */}
            <button
              type="button"
              aria-label="Toggle contents"
              className="lg:hidden inline-flex h-10 items-center gap-2 px-3 rounded-xl border border-gray-200 text-gray-800 hover:bg-gray-50 justify-self-end focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2"
              onClick={() => setSidebarOpen((v) => !v)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Contents</span>
            </button>
          </div>
        </div>
      </header>

      {/* Layout */}
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
            {SECTIONS.map(s => (
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
            Injection • PII • Evals — practical safeguards you’ll actually ship.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-8">
          {/* Welcome & Orientation */}
          <section id="welcome" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Welcome{user ? `, ${username}` : ''}</h1>
            <p className="text-lg text-gray-700">
              Week 1 gave you the core loop: a concise safety policy with clear allow and deny lines, a system prompt that encodes tone and refusal style, privacy seatbelts that minimize and redact data before anything reaches the model or your logs, and a small evaluation set to keep behavior honest as prompts and models change. This week we put those foundations to work against the failure modes you’ll meet in the wild. You’ll learn to recognize and resist prompt-level attacks, carry privacy protections across your stack, and keep a lightweight evaluation habit so regressions are caught long before users feel them.
            </p>
            <Box tone="tip" title="What you’ll take away">
              By the end of Week 2 you’ll have a repeatable pattern for defusing injection and exfiltration attempts, a server-side redaction and logging approach you can keep as you scale, and a tiny red-team routine that turns safety from a one-off task into an ongoing practice.
            </Box>
          </section>

          {/* Prompt Injection & Exfiltration */}
          <section id="prompt-injection" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Bug className="h-5 w-5 text-green-600" /> Prompt Injection & Data Exfiltration
            </h2>
            <p className="text-gray-700">
              Prompt injection is any attempt to make the model ignore your rules; exfiltration is about coaxing out secrets or private data. The practical defense is separation and verification: keep the policy and capabilities outside the reach of user-supplied text, treat retrieved content as untrusted, and require the server to validate every tool call. Concretely, store and inject your system policy separately from user prompts so content cannot rewrite your boundaries; require arguments for tools to pass basic checks like type, range, and authorization before execution; and mark RAG snippets as data, not instructions, so the assistant can quote them without following hidden commands embedded inside. These small patterns make refusals predictable and give you auditable reasons when a risky action was blocked.
            </p>
            <Box tone="pro" title="Outcome">
              You’ll ship a refusal path that feels consistent and humane while keeping a clear record of why actions were allowed or denied, which simplifies review and improves user trust.
            </Box>
          </section>

          {/* PII, Redaction & Logging */}
          <section id="pii" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Lock className="h-5 w-5 text-green-600" /> PII Handling, Redaction & Logging Hygiene
            </h2>
            <p className="text-gray-700">
              Privacy holds up when you handle the smallest possible amount of personal data and remove identifiers before they can spread. Keep inputs lean by collecting only what changes model quality, then apply redaction on the server boundary so emails, phone numbers, card-like digits, and simple IDs are masked before calls and before any analytics or logs capture them. Prefer compact, structured logs—timestamps, event type, and success status—over raw conversations, and rotate access with short retention windows. Client-side masking is helpful for UX but never sufficient on its own; the server must enforce these rules so a misconfigured browser or console setting doesn’t quietly capture sensitive content.
            </p>
            <Box tone="warn" title="Easy mistake to avoid">
              Relying on client-only redaction or default cloud logging often leads to silent leaks. Move redaction into your backend middleware and verify it with a test.
            </Box>
          </section>

          {/* Red-teaming & Quick Evals */}
          <section id="evals" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" /> Red-teaming & Quick Safety Evals
            </h2>
            <p className="text-gray-700">
              Safety improves when testing is small and frequent. Start with a dozen prompts that mirror your policy edges—some that must be refused and some that should be answered—and define simple pass rules that flag PII exposure, missing refusals, or needless denials. Track a single score so trends are obvious, run the checks locally and in CI whenever prompts, models, or tools change, and post the result where your team already looks for build health. Because the suite is tiny, it’s cheap to run and hard to ignore, which keeps behavior aligned over time.
            </p>
            <Box tone="tip" title="Keep it lightweight">
              Short, repeatable evaluations encourage iteration. If it runs fast, you’ll run it often—and that’s what prevents drift.
            </Box>
          </section>

          {/* Next Steps */}
          <section id="next" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Next Steps</h2>
            <p className="text-gray-700 mb-4">
              Work through the topics in order and keep each change small and testable. Start by hardening against prompt injection and exfiltration, extend your privacy seatbelts with server-side redaction and safer logs, and wire your quick evals into the same places you already check build status. The habits from Week 1 continue here: write it down, version it, and measure it.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="/learn/ethical-ai/beginner/week1/next-steps"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Link>

              <button
                onClick={markComplete}
                className={cx(
                  'px-4 py-2 rounded-lg border',
                  completed ? 'border-green-200 bg-green-50 text-green-800' : 'border-gray-200 hover:bg-gray-50'
                )}
              >
                {completed ? 'Progress saved ✓' : 'Mark page complete'}
              </button>

              <Link
                href="/learn/ethical-ai/beginner/week2/prompt-injection"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow"
                onClick={async () => { if (!completed) await markComplete(); }}
              >
                Begin Topic 1 <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
