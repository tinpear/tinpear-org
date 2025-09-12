'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
const PROGRESS_KEY = 'ai-everyone-week1:what-ai-is';

const SECTIONS = [
  { id: 'intro', label: 'What AI Can Do Today' },
  { id: 'spark', label: 'Why Now (and Why You)' },
  { id: 'mental-model', label: 'A Clear Mental Model' },
  { id: 'how-it-works', label: 'How It Works (Plain English)' },
  { id: 'capabilities', label: 'Beyond Text' },
  { id: 'limitations', label: 'Where AI Falls Short' },
  { id: 'safety', label: 'Safety & Judgment' },
  { id: 'habit', label: 'The Habit You’ll Learn' },
  { id: 'try-it', label: 'Try It Yourself' },
  { id: 'reflection', label: 'Quick Reflection' },
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
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        const { data: { user }, error: userErr } = await supabase.auth.getUser();
        if (userErr) console.error(userErr);
        if (cancelled) return;
        setUser(user ?? null);

        if (user) {
          const { data: profile, error: pErr } = await supabase
            .from('profiles')
            .select('username, full_name')
            .eq('id', user.id)
            .maybeSingle();
          if (pErr) console.error(pErr);
          if (!cancelled) setProfile(profile ?? null);

          const { data: track, error: tErr } = await supabase
            .from('tracking')
            .select('completed')
            .eq('user_id', user.id)
            .eq('key', PROGRESS_KEY)
            .maybeSingle();
          if (tErr) console.error(tErr);
          if (!cancelled) setCompleted(Boolean(track?.completed));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, []);

  const username = useMemo(
    () =>
      profile?.full_name ||
      profile?.username ||
      user?.email?.split('@')[0] ||
      'Learner',
    [profile, user]
  );

  const markComplete = async () => {
    if (!user) {
      alert('Please sign in to save your progress.');
      return;
    }
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

  const handleNext = async () => {
    if (!completed) await markComplete();
    router.push('/learn/ai-for-everyone/week1/everyday-workflows');
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
      {/* Header (icon home, centered title, tidy toggle) */}
      <header className="sticky top-0 z-30 border-b border-gray-100 backdrop-blur bg-white/70">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-14 grid grid-cols-[auto_1fr_auto] items-center gap-3">
            {/* Left: Home icon */}
            <Link
              href="/learn/ai-for-everyone"
              aria-label="Go to course home"
              prefetch={false}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2"
            >
              <Home className="h-5 w-5" />
            </Link>

            {/* Center: Title */}
            <div className="flex items-center justify-center">
              <span className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                Week 1 · What AI Is
              </span>
            </div>

            {/* Right: Contents toggle (mobile only) */}
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
          <nav role="navigation" aria-label="On this page" className="space-y-1">
            {SECTIONS.map((s) => {
              const isActive = activeId === s.id;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  aria-current={isActive ? 'true' : undefined}
                  className={cx(
                    'block px-3 py-2 rounded-lg text-sm',
                    isActive ? 'bg-green-50 text-green-800' : 'hover:bg-gray-50 text-gray-700'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  {s.label}
                </a>
              );
            })}
          </nav>
          <div className="mt-6 p-3 rounded-xl bg-gray-50 text-xs text-gray-600">
            Clear ideas in, useful results out.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-8">
          {/* Intro: What AI Can Do Today */}
          <section
            id="intro"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
          >
            <h2 className="text-xl font-semibold">What AI Can Do Today</h2>
            <p className="text-gray-700">
              Imagine a teammate who never sleeps, drafts in seconds, and can switch styles on command. That teammate already exists—today’s AI. It specializes in language: turning scattered thoughts into crisp messages, transforming outlines into readable drafts, and distilling long materials into clear, trustworthy takeaways you can use. When you bring a real task—an email, a plan, a note to a stakeholder—AI collapses the distance between intent and output, giving you a useful first version so you can spend energy on judgment instead of wrestling with the blank page.
            </p>
            <Box tone="tip" title="Think of it as a writing partner">
              Use AI where words carry the work: messages, briefs, updates, and plans. It accelerates you to a solid draft, then you apply context and taste.
            </Box>
          </section>

          {/* Spark: Why Now (and Why You) */}
          <section
            id="spark"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
          >
            <h2 className="text-xl font-semibold">Why Now (and Why You)</h2>
            <p className="text-gray-700">
              We are living through a shift from “search and stitch” to “state and shape.” A few years ago, work meant hunting for information and hand‑assembling it into something coherent. Now you can state the goal, add a bit of context, and shape the result with quick instructions. That shift doesn’t just save time; it changes who gets to build, explain, and persuade. You do not need to be technical to get leverage. You only need clarity, curiosity, and a simple habit for guiding the model. That’s what this course gives you—practical leverage you can use today.
            </p>
          </section>

          {/* Mental Model */}
          <section
            id="mental-model"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
          >
            <h2 className="text-xl font-semibold">A Clear Mental Model</h2>
            <p className="text-gray-700">
              Treat AI like a fast, tireless intern. It is brilliant at patterning language but not at reading your mind. When your request is precise, with guardrails and a picture of what “good” looks like, it performs. When your request is vague, it guesses. This isn’t a limitation to fear—it’s a design feature to harness. The best results come from a short contract: your goal, the context that matters, and a small sample that shows the shape of the answer.
            </p>
            <Box tone="pro" title="Instruction → Context → Example">
              This three‑part contract keeps results consistent and easy to evaluate. You’ll practice it across the course until it feels natural.
            </Box>
          </section>

          {/* How It Works (Plain English) */}
          <section
            id="how-it-works"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
          >
            <h2 className="text-xl font-semibold">How It Works (Plain English)</h2>
            <p className="text-gray-700">
              Under the hood, today’s AI models predict the next piece of text by learning patterns from vast examples. They don’t store a perfect database of facts; they build a sense of how ideas connect and how language is typically used. That’s why they’re stunning at fluency and structure, and why they sometimes sound confident while being wrong. Think of it as an ultra‑capable autocomplete that can plan, explain, and adapt style—so long as you frame the task with clarity and provide the right constraints.
            </p>
          </section>

          {/* Beyond Text */}
          <section
            id="capabilities"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
          >
            <h2 className="text-xl font-semibold">Beyond Text</h2>
            <p className="text-gray-700">
              While language is the doorway, the room is bigger than you might expect. Many assistants can reason over tables, extract structure from documents, and generate content in consistent formats you can plug into downstream tools. Increasingly, models can also describe images, reason about charts, and help you plan small workflows that chain steps together. The practical takeaway is simple: once your output is predictable—like a checklist, a template, or a JSON blob—you can automate parts of your work with less effort than you’d think.
            </p>
          </section>

          {/* Limitations */}
          <section
            id="limitations"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
          >
            <h2 className="text-xl font-semibold">Where AI Falls Short</h2>
            <p className="text-gray-700">
              AI can be wrong with style. It may invent details, miss edge cases, or stumble on strict logic and exact arithmetic. It does not know your internal processes, your clients, or your constraints unless you tell it. And it will not protect sensitive information on your behalf—you set the rules. None of this is a dealbreaker. It simply means you should use AI as a force multiplier for drafting and exploration, while keeping human oversight for accuracy, judgment, and anything reputationally important.
            </p>
            <Box tone="warn" title="Trust, but verify">
              Before sharing externally, check names, numbers, dates, and claims. Add sources when appropriate, and keep private details out of prompts unless policy allows.
            </Box>
          </section>

          {/* Safety & Judgment */}
          <section
            id="safety"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
          >
            <h2 className="text-xl font-semibold">Safety & Judgment</h2>
            <p className="text-gray-700">
              Good AI use is disciplined, not reckless. You will develop a lightweight review loop: specify constraints up front, skim outputs for red flags, and make small corrections that the model can learn from in the next iteration. If your work involves sensitive data, rely on redaction, synthetic examples, or mock inputs during practice. When stakes are high, ask the model to explain its reasoning or output in a structured way so you can audit the result quickly.
            </p>
          </section>

          {/* The Habit You’ll Learn */}
          <section
            id="habit"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
          >
            <h2 className="text-xl font-semibold">The Habit You’ll Learn</h2>
            <p className="text-gray-700">
              Throughout this course you will practice a repeatable habit: frame the goal in one sentence, provide only the context that matters, and include a tiny example that shows the shape of success. Then you will run a quick micro‑evaluation against a couple of real cases to confirm the prompt behaves the way you expect. With this rhythm, you won’t rely on luck or long, fragile prompts—you will build small, reliable components you can reuse across tasks.
            </p>
          </section>

          {/* Try It Yourself */}
          <section
            id="try-it"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
          >
            <h2 className="text-xl font-semibold">Try It Yourself</h2>
            <p className="text-gray-700">
              Take a real, low‑stakes task from your day and give the model a tight brief. Ask it to produce a concise, calm reply to a customer worried about a delay. Specify that you want a brief apology, reassurance about next steps, and a clear expected delivery date under 120 words. When you receive the draft, nudge the tone slightly—warmer, more formal, or more straightforward—and watch how the message adapts while preserving intent. That small loop—ask, inspect, adjust—shows you how quickly the assistant aligns when you give concrete direction.
            </p>
            <Box tone="tip" title="A starter you can adapt">
              I’m writing an email to a customer who asked about delays. Please make it clear, kind, and professional. Include a short apology, a reassuring line about next steps, and the expected delivery date. Keep it under 120 words.
            </Box>
          </section>

          {/* Reflection */}
          <section
            id="reflection"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
          >
            <h2 className="text-xl font-semibold">Quick Reflection</h2>
            <p className="text-gray-700">
              Where did the assistant immediately help, and where did you still need to guide it? If the output missed context only you know, add one more sentence to your prompt next time. If it drifted in tone, provide a short sample of how you prefer to sound. Your goal isn’t perfection on the first try; it’s a reliable, short path from raw idea to shareable draft.
            </p>
          </section>

          {/* Final section */}
          <section
            id="next"
            className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold mb-3">Next: Everyday Workflows</h2>
            <p className="text-gray-700 mb-4">
              Now that you have a grounded sense of what AI is—and a habit to guide it—the next page shows how people apply it to real work: drafting faster, outlining with clarity, and turning scattered notes into something you can act on. We’ll keep it practical and repeatable.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Back to Week 1 Overview */}
              <Link
                href="/learn/ai-for-everyone/week1"
                prefetch={false}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Link>

              {/* Mark complete */}
              <button
                type="button"
                onClick={markComplete}
                disabled={completed}
                aria-disabled={completed}
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
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
