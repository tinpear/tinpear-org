'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Lock,
  AlertTriangle,
  ShieldCheck,
  Lightbulb,
  CheckCircle2,
  FileText,
  Search,
  Database,
} from 'lucide-react';

// --- Config ------------------------------------------------------------------
const PROGRESS_KEY = 'ethical-week-2:pii-redaction';

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'identify', label: 'What Counts as PII?' },
  { id: 'redact', label: 'Redact Before Model Call' },
  { id: 'log', label: 'Safe Logging Hygiene' },
  { id: 'hands-on', label: 'Hands‑on Practice' },
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
    tone === 'tip' ? <Lightbulb className="h-4 w-4" /> :
    tone === 'warn' ? <AlertTriangle className="h-4 w-4" /> :
    <CheckCircle2 className="h-4 w-4" />;

  return (
    <div className={cx('rounded-xl border p-4 flex gap-3 items-start', palette)}>
      <div className="mt-0.5">{icon}</div>
      <div className="min-w-0 break-words">
        <div className="font-medium mb-1">{title}</div>
        <div className="text-sm md:text-[0.95rem] leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

// --- Snippets ----------------------------------------------------------------
const redactorSnippet = `// server/redact.ts
export function redactPII(text: string) {
  return text
    .replace(/\\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b/gi, '[REDACTED_EMAIL]')
    .replace(/\\b\\d{3}[-.\\s]?\\d{2}[-.\\s]?\\d{4}\\b/g, '[REDACTED_SSN]')
    .replace(/\\b\\d{4}[-.\\s]?\\d{4}[-.\\s]?\\d{4}[-.\\s]?\\d{4}\\b/g, '[REDACTED_CARD]');
}
`;

const loggingSnippet = `// server/logger.ts
export function safeLog(message: string, payload: object) {
  const sanitized = JSON.stringify(payload, (_, val) =>
    typeof val === 'string' && val.length > 80 ? '[TRUNCATED]' : val
  );
  console.log(\`[log] \${message}:\`, sanitized);
}
`;

// --- Page --------------------------------------------------------------------
export default function PiiRedactionPage() {
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
          .select('username')
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
      entries => {
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
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white">
              <Lock className="h-4 w-4" />
            </span>
            <span className="font-bold">Week 2 • PII & Logging Hygiene</span>
          </div>
          <button
            className="lg:hidden inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200"
            onClick={() => setSidebarOpen(v => !v)}
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
            Minimize PII → Redact → Log safely.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-8">
          <section id="overview" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h1 className="text-3xl font-bold text-gray-900">Redact before you send. Log safely after you do.</h1>
            <p className="text-lg text-gray-700">
              LLMs don’t forget. And logs don’t either. You’ll learn how to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Recognize what counts as sensitive info</li>
              <li>Redact common patterns before model calls</li>
              <li>Structure logs to avoid accidental PII leaks</li>
            </ul>
          </section>

          <section id="identify" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Search className="h-5 w-5 text-green-600" />
              What Counts as PII?
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Email addresses, phone numbers</li>
              <li>Full names tied to other data</li>
              <li>Government IDs (SSNs, NINs)</li>
              <li>Credit card or account numbers</li>
            </ul>
            <Box tone="warn" title="Less obvious PII">
              Internal ticket IDs, file paths, document names, or usernames that could identify someone count too—
              especially if logged with other fields.
            </Box>
          </section>

          <section id="redact" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              Redact Before Model Call
            </h2>
            <p className="text-gray-700">
              Run a lightweight pre-processor on input text before calling the model. Strip or replace known PII types.
            </p>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-gray-800 font-medium mb-2">
                <FileText className="h-4 w-4" />
                redact.ts
              </div>
              <pre className="text-xs md:text-sm whitespace-pre-wrap break-words leading-relaxed">
{redactorSnippet}
              </pre>
            </div>
            <Box tone="tip" title="Redact, then warn (if needed)">
              If the redactor finds PII, you can notify the user or refuse model use for extra-sensitive flows.
            </Box>
          </section>

          <section id="log" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Database className="h-5 w-5 text-green-600" />
              Safe Logging Hygiene
            </h2>
            <p className="text-gray-700">
              Avoid logging raw input/output that includes PII. Truncate long fields. Mask known secrets.
            </p>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-gray-800 font-medium mb-2">
                <FileText className="h-4 w-4" />
                logger.ts
              </div>
              <pre className="text-xs md:text-sm whitespace-pre-wrap break-words leading-relaxed">
{loggingSnippet}
              </pre>
            </div>
            <Box tone="warn" title="Checklist for logs">
              <ul className="list-disc pl-5 space-y-1">
                <li>✅ Don’t log full prompts or completions unless redacted</li>
                <li>✅ Add TTL (time-to-live) for logs with sensitive data</li>
                <li>✅ Tokenize user IDs or use internal session IDs</li>
              </ul>
            </Box>
          </section>

          <section id="hands-on" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Hands‑on Practice</h2>
            <ol className="list-decimal pl-5 space-y-2 text-gray-700">
              <li>Add <code>redactPII()</code> before any model call that touches user input.</li>
              <li>Update your logger to use <code>safeLog()</code> and test with fake data.</li>
              <li>Check your logs: no email, card, or identifiers should leak in plaintext.</li>
            </ol>
            <Box tone="pro" title="Bonus: add tests">
              Write a test that fails if PII is found in logs. Redact first → test later → sleep better.
            </Box>
          </section>

          <section id="next" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Next Topic: Red‑teaming & Quick Safety Evals</h2>
            <p className="text-gray-700 mb-4">
              Now that your system is safer by design, let’s see how to test and stress it.
              Red‑teaming and tiny eval suites will help you catch regressions early.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="/learn/ethical-ai/beginner/week2/prompt-injection"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
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
                href="/learn/ethical-ai/beginner/week2/redteaming-evals"
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
