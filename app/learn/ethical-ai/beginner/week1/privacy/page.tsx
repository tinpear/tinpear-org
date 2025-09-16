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
  Home,
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
  const email = /\b([a-zA-Z0-9._%+-]{1,3})[a-zA-Z0-9._%+-]*@([a-zA-Z0-9.-]+\.[A-Za-z]{2,})\b/g;
  const phone = /\b(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  const card = /\b(?:\d[ -]*?){13,19}\b/g;
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
      {/* Header (link to /learn/ethical-ai) */}
      <header className="sticky top-0 z-30 border-b border-gray-100 backdrop-blur bg-white/70">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-14 grid grid-cols-[auto_1fr_auto] items-center gap-3">
            <Link
              href="/learn/ethical-ai"
              aria-label="Go to Ethical AI home"
              prefetch={false}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2"
            >
              <Home className="h-5 w-5" />
            </Link>
            <div className="flex items-center justify-center">
              <span className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                Week 1 · Privacy & PII
              </span>
            </div>
            <button
              type="button"
              aria-label="Toggle contents"
              className="lg:hidden inline-flex h-10 items-center gap-2 px-3 rounded-xl border border-gray-200 text-gray-800 hover:bg-gray-50 justify-self-end"
              onClick={() => setSidebarOpen(v => !v)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Contents</span>
            </button>
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
              A prompt is a chat window into your company. Treat it with the same care you would a public API: assume
              anything that goes in might come back out somewhere else. In this lesson you’ll add simple seatbelts so
              helpful features don’t accidentally surface emails, phone numbers, card details, or internal identifiers.
              Our approach is practical and layered—first reduce what you collect, then mask what must be sent, and
              finally make sure your logs don’t quietly undo all that good work.
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
              Personally Identifiable Information is any data that identifies someone directly—like a name, email,
              phone number, physical address, or government ID—or indirectly when combined with other details, such as
              device fingerprints, precise locations, or unique account attributes. Financial data like card numbers and
              bank details sit firmly in this category, and so do sensitive records around health or biometrics. When
              you’re unsure, assume it’s PII and handle it as such; the small cost of masking is almost always cheaper
              than the impact of an accidental disclosure.
            </p>
            <Box tone="warn" title="When in doubt, treat it as PII">
              If a piece of information could embarrass, harm, or expose a user, mask it before it leaves your system.
            </Box>
          </section>

          {/* How it leaks */}
          <section id="how-it-leaks" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">How PII leaks (the usual ways)</h2>
            <p className="text-gray-700">
              Most privacy incidents trace back to three ordinary places. First, prompts often include far more detail
              than the model actually needs, so identifiers ride along by accident. Second, server and platform logs
              quietly capture request and response bodies “for debugging,” preserving raw PII long after it’s useful.
              Third, retrieval pipelines surface documents that were never meant for generation, and the model simply
              repeats what it sees. Understanding these paths makes the fix straightforward: send less, redact what you
              must send, and make sure your observability setup respects those choices.
            </p>
            <Box tone="tip" title="A simple rule of thumb">
              Don’t send, store, or show information that doesn’t materially change the quality of the output.
            </Box>
          </section>

          {/* Minimize */}
          <section id="minimize" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Minimize collection</h2>
            <p className="text-gray-700">
              Minimization means collecting only the fields that improve the answer and dropping the rest. If a model
              can produce a great reply knowing a user’s tenure—“customer since 2019”—you don’t need their full address
              or the final four digits of a card. Prefer aggregated or derived attributes, expire transient fields as
              soon as they’ve served their purpose, and keep a short, explicit allow-list for your prompt builder so
              anything outside that list never makes it into a request.
            </p>
            <Box tone="pro" title="Quick win">
              Add an allow-list of fields your prompt builder may include; everything else is ignored by default.
            </Box>
          </section>

          {/* Redact */}
          <section id="redact" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Redact before model calls</h2>
            <p className="text-gray-700">
              Even with careful minimization some identifiers will slip through, so introduce a redaction step that
              masks emails, phone numbers, card numbers, and simple IDs before calling the model. Replace sensitive
              tokens with placeholders (for example, <em>***@domain.com</em> or <em>***-***-****</em>) and keep the
              original values server-side so your application can still personalize the final UI without exposing raw
              data to the model.
            </p>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-gray-800 font-medium mb-2">
                <FileText className="h-4 w-4" />
                Copy-paste redaction utility (TypeScript)
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
            <p className="text-gray-700">
              Paste any text on the left and watch common identifiers get masked instantly in your browser. This is the
              exact behavior you’ll want as a pre-flight step in your server pipeline, just implemented here client-side
              for clarity.
            </p>

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
                <div className="max-w-full overflow-x-auto">
                  <pre className="bg-gray-50 border border-gray-200 rounded-md p-2 whitespace-pre-wrap break-words">
{`“Email Jane at jane.doe@example.com and call (415) 555-2671. Card: 4242 4242 4242 4242.”`}
                  </pre>
                </div>

                <div className="font-medium mt-2">After</div>
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
            <p className="text-gray-700">
              Observability is vital, but full prompt and response bodies are rarely necessary outside of targeted
              debugging. Prefer recording the shape of events—time, action, status, latency—and only capture content
              after redaction, under explicit sampling, and with short retention windows. Make sure your cloud consoles
              and vendors aren’t silently storing raw payloads; most platforms let you mask or disable these fields once
              you look for the settings.
            </p>
            <Box tone="warn" title="Watch your cloud console">
              Many providers default to storing complete request/response bodies. Turn that off, or enforce masking in a gateway.
            </Box>
          </section>

          {/* Pitfalls */}
          <section id="pitfalls" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Common pitfalls</h2>
            <p className="text-gray-700">
              Teams often ship quickly and later discover that analytics kept raw chat history, that their prompt
              builder forwarded entire user profiles when only two fields affected quality, or that their retrieval
              index quietly ingested PDFs full of addresses and phone numbers. A small guardrail prevents all three:
              add a pre-flight PII scrubber to your pipeline, write a couple of tests to prove it works, and wire those
              tests into CI so regressions never slip past code review.
            </p>
            <Box tone="pro" title="A quick guardrail">
              Treat redaction like input validation—automatic, testable, and enforced in CI.
            </Box>
          </section>

          {/* Next */}
          <section id="next" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Nice work! Next: Policies & System Prompts</h2>
            <p className="text-gray-700 mb-4">
              You’ve reduced what you send, masked what remains, and ensured your logs won’t leak it back out. Next we
              will encode clear boundaries and refusal style into your system prompts so safety becomes consistent and
              visible across your product.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
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
