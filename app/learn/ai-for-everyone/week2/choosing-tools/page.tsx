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
const PROGRESS_KEY = 'ai-everyone-week2:choosing-tools';

const SECTIONS = [
  { id: 'intro', label: 'Why Tool Choice Matters' },
  { id: 'categories', label: 'Tool Categories (Plain English)' },
  { id: 'examples', label: 'Popular Examples by Category' },
  { id: 'decision', label: 'Quick Decision Guide' },
  { id: 'compare', label: 'When to Use Which' },
  { id: 'bundles', label: 'Starter Picks & Bundles' },
  { id: 'templates', label: 'Copy‑Paste Prompts' },
  { id: 'practice', label: 'Mini Practice' },
  { id: 'next', label: 'Next (Wrap‑Up)' },
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
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-100 backdrop-blur bg-white/70">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span className="font-bold">Week 2 • Choosing the Right AI Tool</span>
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
            Start with the outcome → pick the tool.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-8">
          {/* Intro */}
          <section id="intro" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Why Tool Choice Matters</h2>
            <p className="text-gray-700">
              The fastest path is to match the tool to your goal. Do you need <span className="font-medium">text</span>, an <span className="font-medium">image</span>, or an <span className="font-medium">automation</span>?
              Pick the tool that reduces manual steps and returns a format you can reuse immediately.
            </p>
            <Box tone="tip" title="1‑line workflow">
              Outcome → Add a bit of context → Ask for the right format → Paste into your app.
            </Box>
          </section>

          {/* Categories */}
          <section id="categories" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Tool Categories</h2>

            <div className="space-y-3">
              <Box tone="pro" title="Chat assistants (generalists)">
                Flexible helpers for writing, Q&A, brainstorming, planning, and formatting. Great “first stop” for most text tasks.
              </Box>
              <Box tone="pro" title="Writers & slide tools (specialists)">
                Focused on clean structure, tone, and presentation. Useful when polish, headings, and slide flow matter.
              </Box>
              <Box tone="pro" title="Image tools">
                Create or edit visuals—thumbnails, illustrations, simple mockups—based on a short description (a “prompt”).
              </Box>
              <Box tone="pro" title="Agents & integrations (light automations)">
                Chain repeatable steps: draft → summarize → format → send/store. Ideal for routine weekly workflows.
              </Box>
            </div>

            <Box tone="warn" title="Privacy reminder">
              Avoid uploading sensitive files or real customer data to public tools. Use masked examples or sample rows.
            </Box>
          </section>

          {/* Popular Examples */}
          <section id="examples" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
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
                  <li>Canva (easy, templates + AI)</li>
                  <li>DALL·E / Stable Diffusion (image generation)</li>
                  <li>Runway (video & image edits)</li>
                  <li>Figma (design; plug‑ins for mockups)</li>
                </ul>
              </div>

              <div className="rounded-xl border p-4">
                <div className="font-medium mb-2">Agents & integrations</div>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  <li>Zapier (connects apps, triggers)</li>
                  <li>Make (scenario‑based automations)</li>
                  <li>IFTTT (simple rules)</li>
                  <li>Airtable Automations (database + flows)</li>
                </ul>
              </div>
            </div>

            <Box tone="tip" title="Org‑safe picks">
              If you’re at work or school, prefer tools approved by your organization’s IT/policy team.
            </Box>
          </section>

          {/* Decision Guide */}
          <section id="decision" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Quick Decision Guide</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              <li><span className="font-medium">Need clean text now?</span> → Chat assistant.</li>
              <li><span className="font-medium">Need polished article/slides?</span> → Writer/slide tool.</li>
              <li><span className="font-medium">Need visuals?</span> → Image tool.</li>
              <li><span className="font-medium">Repeat the same steps weekly?</span> → Agent/integration.</li>
            </ul>
            <Box tone="tip" title="Fit‑for‑purpose check">
              Tell the tool the <em>format</em> you need (bullets, steps, table, slide outline). You’ll reuse it immediately.
            </Box>
          </section>

          {/* Compare */}
          <section id="compare" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">When to Use Which</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <Box tone="tip" title="Chat assistant → draft & decide">
                Best for: summaries, emails, plans, learning. <br />
                Ask for: 2–3 options; then pick/tweak.
              </Box>
              <Box tone="tip" title="Writer/slide tools → polish & design">
                Best for: reports, blogs, slide decks. <br />
                Ask for: outline first, then draft, then design notes.
              </Box>
              <Box tone="tip" title="Image tools → visuals">
                Best for: headers, thumbnails, simple diagrams. <br />
                Ask for: style (“minimal, clean”), size/aspect ratio, 2–3 variations.
              </Box>
              <Box tone="tip" title="Agents/integrations → repeatable steps">
                Best for: weekly updates, meeting notes, pipelines. <br />
                Ask for: step‑by‑step flow and confirmations before sending.
              </Box>
            </div>
          </section>

          {/* Starter Picks & Bundles */}
          <section id="bundles" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
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
                <div className="font-medium mb-2">Team (collab‑friendly)</div>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  <li>Chat: Microsoft Copilot or Google Gemini (enterprise)</li>
                  <li>Docs/Slides: Google Workspace or Microsoft 365 + AI</li>
                  <li>Automation: Zapier basic flows</li>
                </ul>
              </div>
              <div className="rounded-xl border p-4">
                <div className="font-medium mb-2">Content‑heavy (marketing)</div>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  <li>Writer: Jasper / Notion AI</li>
                  <li>Slides/Design: Canva, Gamma/Tome</li>
                  <li>Images: Canva + stock integrations</li>
                </ul>
              </div>
            </div>
            <Box tone="warn" title="Check access & cost">
              Some tools have free tiers; others are paid. Start free, prove value, then upgrade if it saves time consistently.
            </Box>
          </section>

          {/* Templates */}
          <section id="templates" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Copy‑Paste Prompts</h2>

            <Box tone="tip" title="Chat → tidy email">
              I’m emailing <em>[audience]</em> about <em>[topic]</em>. Make it clear, friendly, and concise. Include:
              (1) one‑line context, (2) key update/request, (3) next step with date. Return 3 subject lines.
            </Box>

            <Box tone="tip" title="Writer/Slides → outline then draft">
              Create a 6‑section outline for a <em>[report/presentation]</em> for <em>[audience]</em>. Include bullet points per section and a short title. Wait for my edits before drafting section 1.
            </Box>

            <Box tone="tip" title="Image → thumbnail request">
              Generate a simple, modern thumbnail about <em>[topic]</em>. Style: minimal, high contrast, readable text. Provide 3 variations and keep the text under 5 words.
            </Box>

            <Box tone="tip" title="Agent/Integration → multi‑step">
              Given this draft update, create: (1) a 5‑bullet summary, (2) a tasks table (Task, Owner, Due), and (3) a short email to <em>[team]</em>. Ask me to confirm before finalizing each step.
            </Box>

            <Box tone="pro" title="Safety add‑on">
              “Avoid sensitive data. If info is uncertain or time‑sensitive, list uncertainties and what sources would confirm it.”
            </Box>
          </section>

          {/* Practice */}
          <section id="practice" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Mini Practice (10 minutes)</h2>
            <ol className="list-decimal pl-5 text-gray-700 space-y-2">
              <li>Pick a real task this week (email/report/slide/image/automation).</li>
              <li>Choose the matching tool category using the decision guide.</li>
              <li>Paste the template above and fill the brackets.</li>
              <li>Request 2–3 options; pick the best; make one improvement (shorter/clearer/table).</li>
              <li>Save your prompt + best output in your notes.</li>
            </ol>
            <Box tone="pro" title="Build your tool picker">
              Create a note with “If goal is X → use Y tool” so you don’t rethink this every time.
            </Box>
          </section>

          {/* Next */}
          <section id="next" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Next: Week 2 Wrap‑Up</h2>
            <p className="text-gray-700 mb-4">
              A short recap + quiz and a reusable toolkit (Safety Checklist + Tool Picker).
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Back */}
              <Link
                href="/learn/ai-for-everyone/week2/ethics-safety-privacy"
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
                href="/learn/ai-for-everyone/week2/wrap-up"
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
