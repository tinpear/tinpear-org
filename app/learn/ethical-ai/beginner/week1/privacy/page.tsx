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
  AlertTriangle,
  Lightbulb,
  EyeOff,
  FileText,
  Check,
  Copy,
} from 'lucide-react';

// --- Config ------------------------------------------------------------------
const PROGRESS_KEY = 'ethical-week-1:privacy';
const DRAFT_KEY = 'ethical-week-1:privacy:draft';

const SECTIONS = [
  { id: 'welcome', label: 'Welcome & Why Privacy' },
  { id: 'what-is-pii', label: 'What counts as PII?' },
  { id: 'how-it-leaks', label: 'How PII leaks (common)' },
  { id: 'minimize', label: 'Minimize Collection' },
  { id: 'redact', label: 'Redact Before Model' },
  { id: 'demo', label: 'Live Redaction Demo' },
  { id: 'logging', label: 'Safe Logging' },
  { id: 'pitfalls', label: 'Common Pitfalls' },
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
    <ShieldCheck className="h-4 w-4" />;
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

function Pill({ children }: { children: any }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-xs text-gray-700">
      <Check className="h-3 w-3 text-green-600" />
      {children}
    </span>
  );
}

// Simple, beginner-friendly redactor (client-side demo)
function redactPII(input: string): string {
  // email
  const email = /\b([a-zA-Z0-9._%+-]{1,3})[a-zA-Z0-9._%+-]*@([a-zA-Z0-9.-]+\.[A-Za-z]{2,})\b/g;
  // phone (very rough)
  const phone = /\b(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  // credit card (very rough, 13–19 digits with separators)
  const card = /\b(?:\d[ -]*?){13,19}\b/g;
  // simple id patterns (e.g., AB-12345)
  const simpleId = /\b([A-Z]{2,3}-?\d{3,6})\b/g;

  return input
    .replace(email, (_, user, domain) => `***@${domain}`)
    .replace(phone, '***-***-****')
    .replace(card, '**** **** **** ****')
    .replace(simpleId, '***-*****');
}

// --- Page --------------------------------------------------------------------
export default function EthicalAIWeek1Privacy() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  // Demo state
  const [raw, setRaw] = useState<string>(
    `Hi, I'm Jane Doe. My email is jane.doe@example.com and my phone is (415) 555-2671.
We use card 4242 4242 4242 4242 to pay, and my employee id is HR-92833.
Please schedule with me next week.`
  );
  const redacted = useMemo(() => redactPII(raw), [raw]);
  const [copied, setCopied] = useState(false);

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

      // Load draft (if any)
      try {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.raw) setRaw(parsed.raw);
        }
      } catch {}
      setLoading(false);
    };
    run();
  }, []);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ raw }));
  }, [raw]);

  const username = useMemo(
    () => profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'Learner',
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

  const copyRedacted = async () => {
    try {
      await navigator.clipboard.writeText(redacted);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-100 backdrop-blur bg-white/70">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white">
              <EyeOff className="h-4 w-4" />
            </span>
            <span className="font-bold">Week 1 • Privacy & PII</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200"
              onClick={() => setSidebarOpen(v => !v)}
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
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
            Hide sensitive bits before they ever reach the model.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-8">
          {/* Welcome */}
          <section id="welcome" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Privacy first, confidence always{user ? `, ${username}` : ''}
            </h1>
            <p className="text-lg text-gray-700">
              A prompt is a chat window to your company. Today you’ll add simple seatbelts—so helpful features don’t
              leak emails, phone numbers, or card info.
            </p>
            <div className="flex flex-wrap gap-2">
              <Pill>Minimize</Pill>
              <Pill>Redact</Pill>
              <Pill>Safe Logs</Pill>
            </div>
          </section>

          {/* What is PII */}
          <section id="what-is-pii" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">What counts as PII?</h2>
            <p className="text-gray-700">
              Personally Identifiable Information can single out a person—or make it easy to. Examples:
            </p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Direct: name, email, phone, address, ID numbers</li>
              <li>Financial: card numbers, bank details</li>
              <li>Sensitive: health, biometrics, GPS traces</li>
            </ul>
            <Box tone="warn" title="When in doubt, treat it as PII">
              If it could embarrass, harm, or expose a user—mask it.
            </Box>
          </section>

          {/* How it leaks */}
          <section id="how-it-leaks" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">How PII leaks (the usual ways)</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Raw prompts include emails or numbers you don’t actually need.</li>
              <li>Server logs capture full prompt/response by default.</li>
              <li>RAG pulls documents with PII; the model repeats them back.</li>
            </ul>
            <Box tone="tip" title="The rule of thumb">
              Don’t send, store, or show what you don’t need.
            </Box>
          </section>

          {/* Minimize */}
          <section id="minimize" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Minimize collection</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Only collect fields that change output quality.</li>
              <li>Prefer aggregates (“customer since 2019”) over raw (“card ends with 4242”).</li>
              <li>Expire or drop fields after use.</li>
            </ul>
            <Box tone="pro" title="Quick win">
              Add an allowlist of fields your prompt builder can include, everything else is dropped.
            </Box>
          </section>

          {/* Redact */}
          <section id="redact" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Redact before model calls</h2>
            <p className="text-gray-700">
              Scrub emails, phone numbers, card numbers, and simple IDs before sending to the model. Replace with
              placeholders.
            </p>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-gray-800 font-medium mb-2">
                <FileText className="h-4 w-4" />
                Copy‑paste redaction utility (TypeScript)
              </div>
              <pre className="text-xs md:text-sm whitespace-pre-wrap leading-relaxed">
{`export function redactPII(input: string): string {
  const email = /\\b([a-zA-Z0-9._%+-]{1,3})[a-zA-Z0-9._%+-]*@([a-zA-Z0-9.-]+\\.[A-Za-z]{2,})\\b/g;
  const phone = /\\b(?:\\+?\\d{1,3}[-.\\s]?)?(?:\\(?\\d{3}\\)?|\\d{3})[-.\\s]?\\d{3}[-.\\s]?\\d{4}\\b/g;
  const card  = /\\b(?:\\d[ -]*?){13,19}\\b/g;
  const simpleId = /\\b([A-Z]{2,3}-?\\d{3,6})\\b/g;

  return input
    .replace(email, (_, user, domain) => \`***@\${domain}\`)
    .replace(phone, '***-***-****')
    .replace(card, '**** **** **** ****')
    .replace(simpleId, '***-*****');
}`}
              </pre>
              <p className="text-xs text-gray-600 mt-2">
                These patterns are intentionally simple for teaching. In production, expand tests and handle locales.
              </p>
            </div>
          </section>

          {/* Live Demo */}
          <section id="demo" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Live redaction demo</h2>
            <p className="text-gray-700">Paste any text below. We’ll mask common PII right in the browser.</p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-2">Original</label>
                <textarea
                  value={raw}
                  onChange={(e) => setRaw(e.target.value)}
                  rows={8}
                  className="w-full rounded-lg border border-gray-300 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-green-200"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                  Redacted (client-side) <EyeOff className="h-4 w-4" />
                </label>
                <div className="relative">
                  <pre className="w-full rounded-lg border border-gray-300 text-sm p-3 bg-gray-50 min-h-[175px] whitespace-pre-wrap">
{redacted}
                  </pre>
                  <button
                    onClick={copyRedacted}
                    className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-gray-200 bg-white hover:bg-gray-50"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            <Box tone="tip" title="Before → After">
  <div className="text-sm">
    <div className="font-medium">Before</div>
    {/* Wrapper ensures it never spills on mobile */}
    <div className="max-w-full overflow-x-auto">
      <pre className="bg-gray-50 border border-gray-200 rounded-md p-2 whitespace-pre-wrap break-words">
{`“Email Jane at jane.doe@example.com and call (415) 555-2671. Card: 4242 4242 4242 4242.”`}
      </pre>
    </div>

    <div className="font-medium mt-2">After</div>
    {/* Same wrapper + wrapping to keep inside container */}
    <div className="max-w-full overflow-x-auto">
      <pre className="bg-gray-50 border border-gray-200 rounded-md p-2 whitespace-pre-wrap break-words">
{`“Email Jane at ***@example.com and call ***-***-****. Card: **** **** **** ****.”`}
      </pre>
    </div>
  </div>
</Box>

          </section>

          {/* Safe Logging */}
          <section id="logging" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Safe logging</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Don’t log full prompts or responses by default.</li>
              <li>Log event shape (timestamp, action, status), not raw content.</li>
              <li>If you must log, log <em>after</em> redaction; set short retention windows.</li>
            </ul>
            <Box tone="warn" title="Watch your cloud console">
              Managed platforms often capture request/response bodies for “debugging.” Turn that off or mask first.
            </Box>
          </section>

          {/* Pitfalls */}
          <section id="pitfalls" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Common pitfalls</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Storing raw chat history in analytics or product logs.</li>
              <li>Sending entire user records to the model when you only need two fields.</li>
              <li>Letting RAG index documents with PII without filters or tags.</li>
            </ul>
            <Box tone="pro" title="A quick guardrail">
              Add a pre‑flight “PII scrubber” step to your prompt pipeline and require tests for it in CI.
            </Box>
          </section>

          {/* Next */}
          <section id="next" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Nice work! Next: Policies & System Prompts</h2>
            <p className="text-gray-700 mb-4">
              You now prevent the most common leaks. Next we’ll encode safety boundaries into your system prompt and
              refusal style—making safety visible and consistent.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Previous */}
              <Link
                href="/learn/ethical-ai/beginner/week1/threat-modeling"
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
                href="/learn/ethical-ai/beginner/week1/policies-prompts"
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
