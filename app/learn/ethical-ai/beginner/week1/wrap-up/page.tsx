'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Lightbulb,
  AlertTriangle,
  Trophy,
  FileText,
  Check,
  Copy,
} from 'lucide-react';

// --- Config ------------------------------------------------------------------
const PROGRESS_KEY = 'ethical-week-1:next-steps';

const SECTIONS = [
  { id: 'recap', label: 'Week 1 Recap' },
  { id: 'checklist', label: 'Ship-Ready Checklist' },
  { id: 'quiz', label: '2-Minute Quiz' },
  { id: 'templates', label: 'Copy-Paste Templates' },
  { id: 'share', label: 'Share & Track' },
  { id: 'next', label: 'What’s Next' },
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

function Pill({ children }: { children: any }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-xs text-gray-700">
      <Check className="h-3 w-3 text-green-600" />
      {children}
    </span>
  );
}

function CopyButton({
  text,
  onCopied,
  copiedLabel = 'Copied!',
}: {
  text: string;
  onCopied?: () => void;
  copiedLabel?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          onCopied?.();
          setTimeout(() => setCopied(false), 1200);
        } catch {}
      }}
      className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-gray-200 bg-white hover:bg-gray-50"
    >
      <Copy className="h-3.5 w-3.5" />
      {copied ? copiedLabel : 'Copy'}
    </button>
  );
}

// --- Template Snippets -------------------------------------------------------
const policySkeleton = `# policy.md (skeleton)
## Allowed
- Summaries of non-sensitive tickets
- Links to public docs
## Denied
- PII (emails, phone, card-like numbers)
- Credentials, tokens, secrets
## Refusal
- Polite, brief, offer a safe alternative
`;

const systemPrompt = `You are a helpful assistant.
Follow the policy (v1.0) below. If a user asks for denied content, refuse politely and suggest a safe alternative.
POLICY_ALLOW: summaries, public docs links
POLICY_DENY: PII (email/phone/card), credentials/secrets
REFUSAL_STYLE: brief + 1 helpful next step
`;

const ciCheck = `# .github/workflows/eval.yml
name: safety-evals
on: [push, pull_request]
jobs:
  eval:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npx ts-node eval-runner.ts
`;

// --- Page --------------------------------------------------------------------
export default function EthicalAIWeek1NextSteps() {
  const [user, setUser] = useState<any>(null);
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
              <Trophy className="h-4 w-4" />
            </span>
            <span className="font-bold">Week 1 • Wrap-up</span>
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
              {loading ? 'Loading…' : user ? 'Signed in' : <Link href="/signin" className="underline">Sign in</Link>}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6">
        {/* Sidebar (sticky, independent scroll) */}
        <aside
          className={cx(
            'lg:sticky lg:top-20 lg:max-h-[calc(100vh-96px)] lg:overflow-y-auto lg:self-start',
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
            Policy → System Prompt → Eval = Week 1 ✅
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-8 min-w-0">
          {/* Recap */}
          <section id="recap" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Week 1 Recap</h1>
            <p className="text-lg text-gray-700">
              You built the core safety loop: a clear policy, a system prompt that enforces it, and a tiny evaluation
              harness to catch regressions. That’s real, shippable safety.
            </p>
            <div className="flex flex-wrap gap-2">
              <Pill>Policy v1</Pill>
              <Pill>System Prompt</Pill>
              <Pill>10–20 Tests</Pill>
            </div>
          </section>

          {/* Checklist */}
          <section id="checklist" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Ship-Ready Checklist</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>✅ Policy written, versioned, and visible to the team</li>
              <li>✅ System prompt includes allow/deny + refusal style</li>
              <li>✅ Privacy seatbelts: minimize, redact, safe logs</li>
              <li>✅ 10–20 ALLOW/REFUSE tests that mirror your policy</li>
              <li>✅ Eval script runs locally and in CI</li>
            </ul>
            <Box tone="tip" title="Make it part of “done”">
              A feature isn’t “done” unless the safety tests pass. Treat it like unit tests.
            </Box>
          </section>

          {/* Quiz */}
          <section id="quiz" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">2-Minute Quiz</h2>
            <ol className="list-decimal pl-5 text-gray-700 space-y-2">
              <li>What are two things your system prompt must always include?</li>
              <li>When should a refusal be triggered?</li>
              <li>Name one way PII can leak silently.</li>
            </ol>
            <Box tone="pro" title="Suggested answers">
              <div className="text-sm">
                <div className="max-w-full overflow-x-auto">
                  <pre className="bg-gray-50 border border-gray-200 rounded-md p-2 whitespace-pre-wrap break-words">
{`1) Allow/Deny boundaries + refusal style. 
2) When the request hits a denied category (e.g., PII, secrets). 
3) Raw logs capturing prompts/responses, or RAG surfacing documents with PII.`}
                  </pre>
                </div>
              </div>
            </Box>
          </section>

          {/* Templates */}
          <section id="templates" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Copy-Paste Templates</h2>

            {/* Policy skeleton */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-gray-800 font-medium mb-2">
                <FileText className="h-4 w-4" />
                policy.md
              </div>
              <div className="relative">
                <div className="max-w-full overflow-x-auto">
                  <pre className="text-xs md:text-sm whitespace-pre-wrap break-words leading-relaxed">
{policySkeleton}
                  </pre>
                </div>
                <div className="absolute top-2 right-2">
                  <CopyButton text={policySkeleton} />
                </div>
              </div>
            </div>

            {/* System prompt */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-gray-800 font-medium mb-2">
                <FileText className="h-4 w-4" />
                system-prompt.txt
              </div>
              <div className="relative">
                <div className="max-w-full overflow-x-auto">
                  <pre className="text-xs md:text-sm whitespace-pre-wrap break-words leading-relaxed">
{systemPrompt}
                  </pre>
                </div>
                <div className="absolute top-2 right-2">
                  <CopyButton text={systemPrompt} />
                </div>
              </div>
            </div>

            {/* CI check */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-gray-800 font-medium mb-2">
                <FileText className="h-4 w-4" />
                .github/workflows/eval.yml
              </div>
              <div className="relative">
                <div className="max-w-full overflow-x-auto">
                  <pre className="text-xs md:text-sm whitespace-pre-wrap break-words leading-relaxed">
{ciCheck}
                  </pre>
                </div>
                <div className="absolute top-2 right-2">
                  <CopyButton text={ciCheck} />
                </div>
              </div>
            </div>
          </section>

          {/* Share & Track */}
          <section id="share" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Share & track wins</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Create a short Loom or doc showing the policy, prompt, and eval in action.</li>
              <li>Post your eval score in Slack after each change (“Safety: 18/20 ✅”).</li>
              <li>Log “saves” — times the system safely refused risky requests.</li>
            </ul>
            <Box tone="tip" title="Make it visible">
              When teammates see safety measured, they’ll help keep it green.
            </Box>
          </section>

          {/* Next */}
          <section id="next" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">What’s next?</h2>
            <p className="text-gray-700 mb-4">
              Week 2 goes deeper: content filtering, guardrails around tools, and leveling up your eval suite.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Previous */}
              <Link
                href="/learn/ethical-ai/beginner/week1/evaluation"
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
                href="/learn/ethical-ai"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow"
              >
                Finish Week 1 <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
