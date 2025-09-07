'use client';

import { useEffect, useMemo, useState } from 'react';
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
const PROGRESS_KEY = 'ai-everyone-week1:what-ai-is';

const SECTIONS = [
  { id: 'intro', label: 'What AI Can Do Today' },
  { id: 'limitations', label: 'Where AI Falls Short' },
  { id: 'mental-model', label: 'How to Think About AI' },
  { id: 'try-it', label: 'Try It Yourself' },
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
export default function WhatAIIsPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
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

    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      Boolean
    ) as Element[];
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
            <span className="font-bold">Week 1 • What AI Is</span>
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
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">
            On this page
          </p>
          <nav className="space-y-1">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={cx(
                  'block px-3 py-2 rounded-lg text-sm',
                  activeId === s.id
                    ? 'bg-green-50 text-green-800'
                    : 'hover:bg-gray-50 text-gray-700'
                )}
              >
                {s.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="space-y-8">
          <section id="intro" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">What AI Can Do Today</h2>
            <p className="text-gray-700">
              Modern AI tools—like ChatGPT, Claude, and Gemini—are really good at working with language.
              They can summarize, rephrase, brainstorm, translate, write, explain, and format text.
            </p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Rewrite an email to sound clearer or more polite</li>
              <li>Generate an outline for a report or blog post</li>
              <li>Summarize long content into short takeaways</li>
              <li>Translate content between languages</li>
              <li>Turn bullet points into paragraphs, or vice versa</li>
            </ul>
            <Box tone="tip" title="Think of it as a writing partner">
              AI works best when you’re already working with words—emails, plans, notes, or drafts. It helps you move faster.
            </Box>
          </section>

          <section id="limitations" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Where AI Falls Short</h2>
            <p className="text-gray-700">
              AI can sound confident even when it’s wrong. It’s not “thinking” like a person—it’s predicting what to say based on training data.
            </p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>It can make up facts or links (especially older AI models)</li>
              <li>It struggles with tasks that need exact answers (math, dates, logic)</li>
              <li>It doesn't know your specific work context unless you provide it</li>
              <li>It won’t stop you from sharing private or sensitive info—you have to be careful</li>
            </ul>
            <Box tone="warn" title="Double check important info">
              AI is great for drafts, ideas, and summaries. But if you're sending something important—fact-check it yourself.
            </Box>
          </section>

          <section id="mental-model" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">How to Think About AI</h2>
            <p className="text-gray-700">
              The best way to think about today’s AI is: <strong>a fast, tireless intern</strong>.
            </p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>It can help with drafts, formatting, options, summaries</li>
              <li>It doesn’t understand your goals unless you say them clearly</li>
              <li>It needs simple instructions and a bit of structure</li>
              <li>You’re still in charge—you check the output and make the final decision</li>
            </ul>
            <Box tone="pro" title="Prompt = clear instruction">
              You’ll get better results if you describe what you want, who it’s for, and give an example.
            </Box>
          </section>

          <section id="try-it" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Try It Yourself</h2>
            <p className="text-gray-700 mb-3">Open your favorite AI chat tool and paste this:</p>
            <Box tone="tip" title="Prompt to try">
              I'm writing an email to a customer who asked about delays. Make it clear, kind, and professional. Include: (1) a short apology, (2) reassurance, and (3) expected delivery date.
            </Box>
            <p className="text-gray-700">
              Then try changing the tone: “Make it more casual” or “Add a touch of humor.” See how it adapts.
            </p>
          </section>

          {/* Final section */}
          <section id="next" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Next: Everyday Workflows</h2>
            <p className="text-gray-700 mb-4">
              In the next page, we’ll show you 3 practical ways people use AI every day—to save time and reduce stress.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Back to Week 1 Overview */}
              <Link
                href="/learn/ai-for-everyone/week1"
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
                  completed
                    ? 'border-green-200 bg-green-50 text-green-800'
                    : 'border-gray-200 hover:bg-gray-50'
                )}
              >
                {completed ? 'Progress saved ✓' : 'Mark page complete'}
              </button>

              {/* Next */}
              <Link
                href="/learn/ai-for-everyone/week1/everyday-workflows"
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
