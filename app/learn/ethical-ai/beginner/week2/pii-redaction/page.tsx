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
  Lightbulb,
  CheckCircle2,
  FileText,
  Search,
  Database,
  Home,
} from 'lucide-react';

// --- Config ------------------------------------------------------------------
const PROGRESS_KEY = 'ethical-week-2:pii-redaction';

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'identify', label: 'What Counts as PII?' },
  { id: 'redact', label: 'Redact Before Model Call' },
  { id: 'log', label: 'Safe Logging Hygiene' },
  { id: 'hands-on', label: 'Hands-on Practice' },
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
      {/* Header (match course pattern) */}
      <header className="sticky top-0 z-30 border-b border-gray-100 backdrop-blur bg-white/70">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-14 grid grid-cols-[auto_1fr_auto] items-center gap-3">
            <Link
              href="/learn/ethical-ai"
              aria-label="Go to course home"
              prefetch={false}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2"
            >
              <Home className="h-5 w-5" />
            </Link>

            <div className="flex items-center justify-center">
              <span className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                Week 2 · PII & Logging Hygiene
              </span>
            </div>

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
          {/* Overview */}
          <section id="overview" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h1 className="text-3xl font-bold text-gray-900">Redact before you send. Log safely after you do.</h1>
            <p className="text-lg text-gray-700">
              Week&nbsp;1 gave you guardrails—policy, refusal style, and tiny evals—so today we focus on the quiet
              places leaks happen: raw prompts and server logs. Think of this lesson as a short pipeline you can reuse
              everywhere: first recognize what counts as personal data, then strip or mask it <em>before</em> any model call,
              and finally record only the minimal, sanitized trace you need for debugging. By keeping that flow tight,
              you protect users, avoid costly surprises in analytics or observability tools, and set yourself up to
              scale without rewriting everything later.
            </p>
          </section>

          {/* Identify PII */}
          <section id="identify" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Search className="h-5 w-5 text-green-600" />
              What Counts as PII?
            </h2>
            <p className="text-gray-700">
              Treat anything that can single out a person—or make them easy to link—as PII. That obviously includes
              emails, phone numbers, card or account numbers, SSNs and national IDs, and full names tied to other data,
              but the less obvious bits matter too: internal ticket or employee IDs, file paths and document names,
              support usernames, and location breadcrumbs. On their own they may look harmless; combined in logs or
              prompts they can point directly to a person. When in doubt, mask it.
            </p>
            <Box tone="warn" title="Hidden identifiers show up in odd places">
              A filename like <code>/users/jane.doe/payments.csv</code> or a ticket like <code>HR-92833</code> can be
              enough to identify someone once it lands in analytics. If it helps the model, keep a neutral placeholder;
              if it doesn’t, drop it.
            </Box>
          </section>

          {/* Redaction */}
          <section id="redact" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Lock className="h-5 w-5 text-green-600" />
              Redact Before Model Call
            </h2>
            <p className="text-gray-700">
              Run a tiny server-side pre-processor that swaps obvious patterns for placeholders before any model call.
              This isn’t about perfect detection; it’s about catching 80% of common cases cheaply and consistently.
              Keep the mapping lightweight—emails to <code>[REDACTED_EMAIL]</code>, SSNs to <code>[REDACTED_SSN]</code>,
              and card-like sequences to <code>[REDACTED_CARD]</code>—and expand tests as you see real traffic. If you
              detect sensitive fields in high-risk flows, consider refusing the request or asking the user to confirm a
              masked summary instead of sending the raw text.
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
            <Box tone="tip" title="Small and dependable beats perfect">
              Start simple, add unit tests, and iterate. You can layer smarter detectors later without changing the
              calling code.
            </Box>
          </section>

          {/* Logging hygiene */}
          <section id="log" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Database className="h-5 w-5 text-green-600" />
              Safe Logging Hygiene
            </h2>
            <p className="text-gray-700">
              Treat logs as a liability unless proven otherwise. Log <em>events</em> and outcomes—timestamps, action
              names, status, latency, and coarse counts—rather than raw prompts or completions. If you must include
              snippets, log them only <em>after</em> redaction, truncate aggressively, mask known secrets, and apply a
              short retention policy. Prefer stable internal IDs or tokenized user references over emails or names, and
              restrict who can read verbose logs; most teammates only need the summary stream.
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
            <Box tone="warn" title="Quick gut-check for every log line">
              Ask, “Would I be comfortable pasting this to a public channel?” If not, mask or drop it—and set a TTL so
              sensitive traces don’t linger.
            </Box>
          </section>

          {/* Hands-on */}
          <section id="hands-on" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Hands-on Practice</h2>
            <p className="text-gray-700">
              Wire <code>redactPII()</code> into your server’s prompt pipeline, then route all logging through
              <code> safeLog()</code> so anything long or suspicious is truncated before it ever hits your console or
              observability tools. Run a quick end-to-end test with fake data—drop in an email, a card-like number, and
              a ticket ID—and confirm the request that reaches the model is masked and the logs show only sanitized,
              minimal context. When that’s working, add a small unit test that fails if your logs contain an
              <code> @</code> sign next to a domain or a 16-digit sequence, so regressions get caught automatically.
            </p>
            <Box tone="pro" title="Make it the default path">
              Redaction and safe logs shouldn’t be optional; build them into the shared utilities every feature uses so
              new code is safe by default.
            </Box>
          </section>

          {/* Next */}
          <section id="next" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Next Topic: Red-teaming & Quick Safety Evals</h2>
            <p className="text-gray-700 mb-4">
              With PII minimized and logs under control, you’re ready to pressure-test behavior. We’ll build a small
              red-team set and a fast evaluation loop so safety stays green as you ship changes.
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
