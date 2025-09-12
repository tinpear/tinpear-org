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
  Home,
} from 'lucide-react';

// --- Config ------------------------------------------------------------------
const PROGRESS_KEY = 'ai-everyone-week2:ethics-safety-privacy';

const SECTIONS = [
  { id: 'intro', label: 'Why Safety Matters' },
  { id: 'simple-rules', label: 'Simple Rules (Plain English)' },
  { id: 'privacy-pii', label: 'Privacy & PII Basics' },
  { id: 'redaction', label: 'Redaction Habit (Copy-Paste)' },
  { id: 'fact-checks', label: 'When to Double-Check' },
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
      {/* Header (home icon, centered title, tidy toggle) */}
      <header className="sticky top-0 z-30 border-b border-gray-100 backdrop-blur bg-white/70">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-14 grid grid-cols-[auto_1fr_auto] items-center gap-3">
            <Link
              href="/learn/ai-for-everyone"
              aria-label="Go to course home"
              prefetch={false}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2"
            >
              <Home className="h-5 w-5" />
            </Link>

            <div className="flex items-center justify-center">
              <span className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                Week 2 · Ethics, Safety & Privacy
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
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={cx(
                  'block px-3 py-2 rounded-lg text-sm',
                  activeId === s.id ? 'bg-green-50 text-green-800' : 'hover:bg-gray-50 text-gray-700'
                )}
                onClick={() => setSidebarOpen(false)}
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
          <section id="intro" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Why Safety Matters</h2>
            <p className="text-gray-700">
              AI is a great helper because it writes quickly and adapts to your style. It’s also imperfect: it does not “know” what is private, and it can speak with confidence even when something is off. Safety is simply the habit of slowing down in the moments that count—protecting personal details, spotting places where a quick check is wise, and keeping a human in the loop before anything important leaves your screen. These small habits keep your work trustworthy without taking away the speed you came here for.
            </p>
            <Box tone="tip" title="A helpful way to think about it">
              Imagine a fast, well-meaning intern. You give the goal and the guardrails, it drafts quickly, and you decide what’s ready to share.
            </Box>
          </section>

          {/* Simple rules */}
          <section id="simple-rules" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Simple Rules (Plain English)</h2>
            <p className="text-gray-700">
              Four ideas cover most situations. First, ask the model to show uncertainty rather than hide it; an honest “not sure” is useful because it tells you where to look next. Second, share only what the task needs and replace real names or IDs with placeholders. Third, aim for kindness and fairness—avoid stereotypes and ask for a mix of examples so more people see themselves in the result. Finally, when the stakes are high or the details change often, don’t guess; check the important parts with a source you trust.
            </p>
            <Box tone="pro" title="One line you can add to any prompt">
              If you’re unsure, say so and list what would make your answer more reliable. Separate assumptions from the final answer.
            </Box>
          </section>

          {/* Privacy & PII */}
          <section id="privacy-pii" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Privacy & PII Basics</h2>
            <p className="text-gray-700">
              PII means details that can identify a person—names, emails, phone numbers, addresses, or ID numbers. Sensitive business details like unreleased plans or access keys deserve the same care. A simple rule keeps you safe: keep it minimal and masked. If the model only needs the shape of the problem, use made-up examples or replace real details with brackets like <em>[Name]</em> or <em>[Order #]</em>. If you’re unsure whether to include something, leave it out or rewrite it in a more general way.
            </p>
            <Box tone="warn" title="Watch out for easy mistakes">
              Avoid pasting full spreadsheets or long logs that contain real customers or staff. Create a tiny, masked sample and work from that instead.
            </Box>
          </section>

          {/* Redaction habit */}
          <section id="redaction" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Redaction Habit (Copy-Paste)</h2>
            <p className="text-gray-700">
              Redaction is a twenty-second sweep you do before sharing text. You skim once for names, emails, phone numbers, account IDs, or anything that could reveal a person or a private detail. You swap those for placeholders so the story stays clear but the people stay private. This habit cuts risk dramatically and makes your prompts reusable; next time, you just replace the placeholders and go.
            </p>
            <Box tone="tip" title="Quick pattern you can memorize">
              Replace names → <em>[Name]</em>, phone → <em>[Phone]</em>, email → <em>[Email]</em>, IDs → <em>[ID]</em>, company → <em>[Company]</em>. Add others like <em>[Address]</em> or <em>[Ticket #]</em> if needed.
            </Box>
            <Box tone="pro" title="Let the model help you redact">
              Redact any personal identifiers in the text below. Return only the redacted version, keeping the meaning and structure intact.
            </Box>
          </section>

          {/* Fact checks */}
          <section id="fact-checks" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">When to Double-Check</h2>
            <p className="text-gray-700">
              Use a quick trigger: impact, novelty, and specificity. If the message affects customers or will be public, it has impact. If the details are new to you or likely to change, that’s novelty. If it contains exact numbers, dates, quotes, or claims, that’s specificity. Any one of these is a signal to pause and verify the key parts. Ask the model to list assumptions and confidence, then confirm the essentials with your system of record or a source you trust.
            </p>
            <Box tone="tip" title="Copy-paste line for careful work">
              List any assumptions or uncertainties, then suggest two concrete ways I can verify the key claims.
            </Box>
          </section>

          {/* Bias & fairness */}
          <section id="bias-fairness" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Bias & Fairness</h2>
            <p className="text-gray-700">
              Because models learn from human text, they can repeat old patterns. You don’t need deep theory to steer them well. Use neutral language, remove personal attributes that aren’t relevant, and ask for a range of examples—different backgrounds, regions, and experience levels. As you read the output, notice who is represented and who is missing, then ask for a broader spread if it feels narrow.
            </p>
            <Box tone="pro" title="Simple fairness nudge">
              Avoid stereotypes. Provide examples that reflect different backgrounds and experience levels without assuming traits.
            </Box>
          </section>

          {/* Boundaries & Refusals */}
          <section id="boundaries" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Boundaries & Refusals</h2>
            <p className="text-gray-700">
              Clear boundaries make the assistant easier to trust. You can set them right in your prompt: explain what the assistant may do (rewrite, summarize, organize) and what it must not do (include private identifiers, give legal/medical advice, or produce harmful content). If a request crosses a line, ask the model to refuse briefly and offer a safer alternative. That way, the default behavior matches your standards even when you are moving quickly.
            </p>
            <Box tone="tip" title="Tiny policy preface you can reuse">
              You may help with rewriting, summarizing, and organizing general information. Do not include private identifiers or give legal/medical advice. If a request needs restricted data or expert review, say “Insufficient information for a safe answer,” explain why, and suggest a safer next step.
            </Box>
            <Box tone="warn" title="If something looks risky">
              Stop and don’t forward it. Ask for a safer rewrite or remove sensitive details, then do the quick check on the parts that matter most.
            </Box>
          </section>

          {/* Checklist */}
          <section id="checklist" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Safety Checklist</h2>
            <p className="text-gray-700">
              Before you hit send, do one smooth pass: redact names and identifiers, ask the model to surface uncertainties, scan for fairness and tone, restate what’s in-scope and out-of-scope if needed, and verify any numbers, dates, or claims that could cause trouble if they’re wrong. This takes a minute, and it pays you back in trust.
            </p>
            <Box tone="pro" title="One-liner to pin in your notes">
              Follow my safety checklist. If something looks risky, explain why and offer a safer alternative before proceeding.
            </Box>
          </section>

          {/* Practice */}
          <section id="practice" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Mini Practice (10 minutes)</h2>
            <p className="text-gray-700">
              Grab a short paragraph from your real work—a note, an email, or a tiny update. Do a quick redaction sweep and replace anything identifying with placeholders. Paste it into your AI tool along with your policy preface and ask for a clearer, kinder version. Request a separate “Assumptions / Uncertainties” section so you know what might need checking. If the text contains facts, ask for two specific ways to confirm them. Save the prompt and the improved version in your notes so you can reuse the pattern next time.
            </p>
            <Box tone="tip" title="Starter prompt you can adapt">
              Redact private identifiers in the text below if any remain. Then rewrite for clarity and kindness. Separate the final answer from “Assumptions/Uncertainties.” If a safer alternative makes sense, offer it briefly.
            </Box>
          </section>

          {/* Next */}
          <section id="next" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Next: Choosing the Right AI Tool</h2>
            <p className="text-gray-700 mb-4">
              With a simple safety net in place, you’re ready to pick the right tool for each job—text, visuals, or small automations. A good pick turns careful habits into faster results.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="/learn/ai-for-everyone/week2"
                prefetch={false}
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
                disabled={completed || loading}
              >
                {completed ? 'Progress saved ✓' : 'Mark page complete'}
              </button>

              <Link
                href="/learn/ai-for-everyone/week2/choosing-tools"
                prefetch={false}
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
