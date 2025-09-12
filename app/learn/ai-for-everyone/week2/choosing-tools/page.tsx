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
const PROGRESS_KEY = 'ai-everyone-week2:choosing-tools';

const SECTIONS = [
  { id: 'intro', label: 'Why Tool Choice Matters' },
  { id: 'categories', label: 'Tool Categories (Plain English)' },
  { id: 'examples', label: 'Popular Examples by Category' },
  { id: 'decision', label: 'Quick Decision Guide' },
  { id: 'compare', label: 'When to Use Which' },
  { id: 'bundles', label: 'Starter Picks & Bundles' },
  { id: 'templates', label: 'Copy-Paste Prompts' },
  { id: 'practice', label: 'Mini Practice' },
  { id: 'next', label: 'Next (Wrap-Up)' },
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
export default function ChoosingToolsPage() {
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
      {/* Header (home icon, centered title, tidy mobile toggle) */}
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
                Week 2 · Choosing the Right AI Tool
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
            Start with the outcome → pick the tool.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-8">
          {/* Intro */}
          <section id="intro" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Why Tool Choice Matters</h2>
            <p className="text-gray-700">
              Choosing the right tool is like picking the right screwdriver—everything goes faster and the result fits better.
              Ask yourself one question first: do you need <span className="font-medium">text</span>, an <span className="font-medium">image</span>, or an <span className="font-medium">automation</span>?
              Once you know the outcome, pick the tool that gets you there with the fewest steps and in a format you can reuse.
            </p>
            <Box tone="tip" title="One-line workflow">
              Outcome → add a little context → ask for the format you need → paste into your app.
            </Box>
          </section>

          {/* Categories */}
          <section id="categories" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Tool Categories (Plain English)</h2>

            <div className="space-y-3">
              <Box tone="pro" title="Chat assistants (generalists)">
                Your all-purpose helper for writing, explaining, brainstorming, planning, and formatting. This is the “first stop” for most text tasks.
              </Box>
              <Box tone="pro" title="Writers & slide tools (specialists)">
                Built for structure and polish. Great when you care about headings, tone, slide flow, and clean exports.
              </Box>
              <Box tone="pro" title="Image tools">
                Turn short descriptions into visuals or edit existing images—thumbnails, illustrations, simple mockups.
              </Box>
              <Box tone="pro" title="Agents & integrations (light automations)">
                Chain repeatable steps (draft → summarize → format → send/store). Perfect for weekly routines.
              </Box>
            </div>

            <Box tone="warn" title="Privacy nudge">
              Avoid sending sensitive files or real customer data to public tools. Use masked samples when you practice.
            </Box>
          </section>

          {/* Examples */}
          <section id="examples" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Popular Examples by Category</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border p-4">
                <div className="font-medium mb-2">Chat assistants</div>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  <li>ChatGPT</li>
                  <li>Claude</li>
                  <li>Microsoft Copilot</li>
                  <li>Google Gemini</li>
                </ul>
              </div>

              <div className="rounded-xl border p-4">
                <div className="font-medium mb-2">Writers & slide tools</div>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  <li>Notion AI (notes/docs)</li>
                  <li>Jasper (marketing copy)</li>
                  <li>Canva Docs / Magic Design (docs & slides)</li>
                  <li>Gamma / Tome (AI slide decks)</li>
                </ul>
              </div>

              <div className="rounded-xl border p-4">
                <div className="font-medium mb-2">Image tools</div>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  <li>Canva (easy templates + AI)</li>
                  <li>DALL·E / Stable Diffusion (generation)</li>
                  <li>Runway (image/video edits)</li>
                  <li>Figma (design; mockup plug-ins)</li>
                </ul>
              </div>

              <div className="rounded-xl border p-4">
                <div className="font-medium mb-2">Agents & integrations</div>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  <li>Zapier (connect apps, triggers)</li>
                  <li>Make (scenario automations)</li>
                  <li>IFTTT (simple rules)</li>
                  <li>Airtable Automations (database + flows)</li>
                </ul>
              </div>
            </div>

            <Box tone="tip" title="Org-approved first">
              If you’re at work or school, choose tools approved by your IT or policy team.
            </Box>
          </section>

          {/* Decision Guide */}
          <section id="decision" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Quick Decision Guide</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              <li><span className="font-medium">Need clean text now?</span> → Chat assistant.</li>
              <li><span className="font-medium">Need polished article/slides?</span> → Writer or slide tool.</li>
              <li><span className="font-medium">Need visuals?</span> → Image tool.</li>
              <li><span className="font-medium">Repeat the same steps weekly?</span> → Agent/integration.</li>
            </ul>
            <Box tone="tip" title="Fit-for-purpose trick">
              Tell the tool the exact <em>format</em> (bullets, steps, table, slide outline). Reuse it immediately without extra edits.
            </Box>
          </section>

          {/* Compare */}
          <section id="compare" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">When to Use Which</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <Box tone="tip" title="Chat assistant → draft & decide">
                Best for: summaries, emails, plans, learning. <br />
                Ask for: 2–3 options, then pick and tweak.
              </Box>
              <Box tone="tip" title="Writer/slide tools → polish & design">
                Best for: reports, blogs, decks. <br />
                Ask for: outline → review → draft → design notes.
              </Box>
              <Box tone="tip" title="Image tools → visuals">
                Best for: headers, thumbnails, diagrams. <br />
                Ask for: style, size/aspect ratio, 2–3 variations.
              </Box>
              <Box tone="tip" title="Agents/integrations → repeatable steps">
                Best for: weekly updates and pipelines. <br />
                Ask for: step-by-step flow with confirmations.
              </Box>
            </div>
          </section>

          {/* Bundles */}
          <section id="bundles" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Starter Picks & Bundles</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-xl border p-4">
                <div className="font-medium mb-2">Individual (simple)</div>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  <li>Chat: ChatGPT or Claude</li>
                  <li>Docs/Slides: Canva Docs or Notion AI</li>
                  <li>Images: Canva or DALL·E</li>
                </ul>
              </div>
              <div className="rounded-xl border p-4">
                <div className="font-medium mb-2">Team (collab-friendly)</div>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  <li>Chat: Microsoft Copilot or Google Gemini (enterprise)</li>
                  <li>Docs/Slides: Google Workspace or Microsoft 365 + AI</li>
                  <li>Automation: Zapier basic flows</li>
                </ul>
              </div>
              <div className="rounded-xl border p-4">
                <div className="font-medium mb-2">Content-heavy (marketing)</div>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  <li>Writer: Jasper / Notion AI</li>
                  <li>Slides/Design: Canva, Gamma/Tome</li>
                  <li>Images: Canva + stock integrations</li>
                </ul>
              </div>
            </div>
            <Box tone="warn" title="Access & cost check">
              Start free where you can. If it saves you time week after week, then upgrade.
            </Box>
          </section>

          {/* Templates */}
          <section id="templates" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Copy-Paste Prompts</h2>

            <Box tone="tip" title="Chat → tidy email">
              I’m emailing <em>[audience]</em> about <em>[topic]</em>. Make it clear, friendly, and concise. Include:
              (1) one-line context, (2) key update or request, (3) next step with date. Return 3 subject lines.
            </Box>

            <Box tone="tip" title="Writer/Slides → outline then draft">
              Create a 6-section outline for a <em>[report/presentation]</em> for <em>[audience]</em>. Include bullet points per section and a short title. Wait for my edits before drafting section 1.
            </Box>

            <Box tone="tip" title="Image → thumbnail request">
              Generate a simple, modern thumbnail about <em>[topic]</em>. Style: minimal, high contrast, readable text. Provide 3 variations and keep the text under 5 words.
            </Box>

            <Box tone="tip" title="Agent/Integration → multi-step">
              Given this draft update, create: (1) a 5-bullet summary, (2) a tasks table (Task, Owner, Due), and (3) a short email to <em>[team]</em>. Ask me to confirm before finalizing each step.
            </Box>

            <Box tone="pro" title="Safety add-on">
              Avoid sensitive data. If info is uncertain or time-sensitive, list uncertainties and what sources would confirm it.
            </Box>
          </section>

          {/* Practice */}
          <section id="practice" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Mini Practice (10 minutes)</h2>
            <ol className="list-decimal pl-5 text-gray-700 space-y-2">
              <li>Pick a real task this week (email/report/slide/image/automation).</li>
              <li>Choose the matching tool category using the decision guide.</li>
              <li>Paste the template above and fill the brackets.</li>
              <li>Ask for 2–3 options; pick the best; make one improvement (shorter/clearer/table).</li>
              <li>Save your prompt + best output in your notes.</li>
            </ol>
            <Box tone="pro" title="Build your tool picker">
              Make a small note: “If goal is X → use Y tool.” Reuse it so you don’t rethink this every time.
            </Box>
          </section>

          {/* Next */}
          <section id="next" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Next: Week 2 Wrap-Up</h2>
            <p className="text-gray-700 mb-4">
              A short recap + quiz and your reusable toolkit (Safety Checklist + Tool Picker).
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="/learn/ai-for-everyone/week2/ethics-safety-privacy"
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
                href="/learn/ai-for-everyone/week2/wrap-up"
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
