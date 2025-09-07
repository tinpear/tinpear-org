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
const PROGRESS_KEY = 'ai-everyone-week2:ethics-safety-privacy';

const SECTIONS = [
  { id: 'intro', label: 'Why Safety Matters' },
  { id: 'simple-rules', label: 'Simple Rules (Plain English)' },
  { id: 'privacy-pii', label: 'Privacy & PII Basics' },
  { id: 'redaction', label: 'Redaction Habit (Copy‑Paste)' },
  { id: 'fact-checks', label: 'When to Double‑Check' },
  { id: 'bias-fairness', label: 'Bias & Fairness' },
  { id: 'boundaries', label: 'Boundaries & Refusals' },
  { id: 'checklist', label: 'Safety Checklist' },
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
export default function EthicsSafetyPrivacyPage() {
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
            <span className="font-bold">Week 2 • Ethics, Safety & Privacy</span>
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
            Practical habits • No legal jargon • No code.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-8">
          {/* Intro */}
          <section id="intro" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Why Safety Matters</h2>
            <p className="text-gray-700">
              AI is powerful and fast—but it can be confidently wrong and doesn’t know what is private or sensitive.
              These simple habits keep you safe while still getting the benefits.
            </p>
            <Box tone="tip" title="Beginner mindset">
              Treat AI like a fast intern: helpful, but you set boundaries and review important work.
            </Box>
          </section>

          {/* Simple rules */}
          <section id="simple-rules" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Simple Rules</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li><span className="font-medium">Check important facts.</span> Ask for sources or uncertainties.</li>
              <li><span className="font-medium">Protect privacy.</span> Remove names, IDs, and secrets before sharing.</li>
              <li><span className="font-medium">Be fair & respectful.</span> Don’t target people unfairly or spread harm.</li>
              <li><span className="font-medium">Know the limits.</span> When it’s high‑stakes, verify with trusted sources.</li>
            </ul>
            <Box tone="pro" title="One‑line request">
              “If you’re unsure, say so and list what would make the answer more reliable.”
            </Box>
          </section>

          {/* Privacy & PII */}
          <section id="privacy-pii" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Privacy & PII Basics</h2>
            <p className="text-gray-700">
              <span className="font-medium">PII (Personally Identifiable Information)</span> includes names, emails, phone numbers, addresses, ID numbers, and any detail that can identify someone.
            </p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li><span className="font-medium">Minimize:</span> share only what’s needed.</li>
              <li><span className="font-medium">Mask:</span> replace with placeholders like <em>[Name]</em>, <em>[Order #]</em>.</li>
              <li><span className="font-medium">Store safely:</span> don’t paste secrets into public tools; avoid logging sensitive data.</li>
            </ul>
            <Box tone="warn" title="Common pitfall">
              Don’t upload spreadsheets of real customers. Use sample rows or masked data instead.
            </Box>
          </section>

          {/* Redaction habit */}
          <section id="redaction" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Redaction Habit (Copy‑Paste)</h2>
            <Box tone="tip" title="Template you can reuse">
              Before sharing, quickly replace personal info:<br />
              <em>
                Replace names → [Name], phone → [Phone], email → [Email], IDs → [ID], company → [Company].
              </em>
            </Box>
            <Box tone="pro" title="Ask AI to help redact">
              “Redact any personal identifiers in the text below. Return the redacted version only.”
            </Box>
            <p className="text-gray-700">
              Redaction is a 20‑second habit that drastically reduces risk.
            </p>
          </section>

          {/* Fact checks */}
          <section id="fact-checks" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">When to Double‑Check</h2>
            <p className="text-gray-700">Double‑check when the content is:</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li><span className="font-medium">Important or public</span> (emails to clients, reports, policies).</li>
              <li><span className="font-medium">Factual or time‑sensitive</span> (dates, prices, legal/medical info).</li>
              <li><span className="font-medium">High risk</span> if wrong (money, safety, reputation).</li>
            </ul>
            <Box tone="tip" title="Copy‑paste prompts">
              “List assumptions or uncertainties in your answer.”<br />
              “Provide 3 reputable sources I can check.”
            </Box>
          </section>

          {/* Bias & fairness */}
          <section id="bias-fairness" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Bias & Fairness</h2>
            <p className="text-gray-700">
              AI can reflect patterns from its training data. Avoid prompts that stereotype groups or treat people unfairly.
            </p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Use neutral, inclusive language in prompts.</li>
              <li>Ask for diverse examples (e.g., roles, names, regions).</li>
              <li>Remove protected attributes when they’re irrelevant.</li>
            </ul>
            <Box tone="pro" title="Fairness nudge">
              “Avoid stereotypes. Provide examples that represent different backgrounds.”
            </Box>
          </section>

          {/* Boundaries & Refusals */}
          <section id="boundaries" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Boundaries & Refusals</h2>
            <p className="text-gray-700">
              Tell AI what’s allowed and what’s not. If a request is risky, it should politely refuse and suggest a safer path.
            </p>
            <Box tone="tip" title="Policy prompt skeleton (you can adapt)">
              <span className="block">1) Scope & Intent — what the assistant helps with.</span>
              <span className="block">2) Allowed Examples — safe use cases.</span>
              <span className="block">3) Disallowed Examples — what to refuse and how (polite, concise).</span>
              <span className="block">4) When to escalate — suggest human review when needed.</span>
            </Box>
            <Box tone="warn" title="If you see risky output">
              Stop, don’t share it. Ask for a safer alternative or rewrite with clearer constraints.
            </Box>
          </section>

          {/* Checklist */}
          <section id="checklist" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Safety Checklist (copy this to your notes)</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>🔒 Redact names/IDs before sharing (use placeholders).</li>
              <li>🔎 Ask for sources/uncertainties on important facts.</li>
              <li>⚖️ Request inclusive, stereotype‑free examples.</li>
              <li>🧭 Define what’s allowed/denied for your task.</li>
              <li>🧪 If it matters, verify with trusted sources.</li>
            </ul>
            <Box tone="pro" title="One‑liner">
              “Follow my safety checklist. If something looks risky, say why and offer a safer alternative.”
            </Box>
          </section>

          {/* Practice */}
          <section id="practice" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Mini Practice (10 minutes)</h2>
            <ol className="list-decimal pl-5 text-gray-700 space-y-2">
              <li>Take a real piece of text (email/notes). Redact PII → <em>[Name]</em>, <em>[Email]</em>, <em>[Order #]</em>.</li>
              <li>Ask AI to improve it. Add: “If unsure, state uncertainties. Avoid stereotypes. Keep it respectful.”</li>
              <li>If it contains facts, ask for 2–3 sources or a short “assumptions” list.</li>
              <li>Save your edited prompt as part of your Safety Checklist.</li>
            </ol>
            <Box tone="tip" title="Small upgrade">
              Create a text snippet or keyboard shortcut for your redaction placeholders.
            </Box>
          </section>

          {/* Next */}
          <section id="next" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Next: Choosing the Right AI Tool</h2>
            <p className="text-gray-700 mb-4">
              Learn a quick decision guide to pick the best tool for text, images, or light automations.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Back */}
              <Link
                href="/learn/ai-for-everyone/week2"
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
                href="/learn/ai-for-everyone/week2/choosing-tools"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow"
                onClick={async () => {
                  if (!completed && user) await markComplete();
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
