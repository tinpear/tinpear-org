'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  Home,
  BookOpen,
  BarChart3,
} from 'lucide-react';

/**
 * Week 2 • Clean, Analyze & Visualize Data (Notes-first)
 * - Beginner-friendly prose; minimal bullets
 * - Explains how Pandas, Data Cleaning, EDA, and Matplotlib flow together
 * - Mentions EDA = Exploratory Data Analysis
 * - A few tiny code glimpses only (non-interactive)
 * - Light-only UI, sticky sidebar, Supabase progress tracking
 */

// --- Config ------------------------------------------------------------------
const PROGRESS_KEY = 'week-2:notes-clean-analyze-visualize';

const SECTIONS = [
  { id: 'welcome', label: 'Welcome to Week 2' },
  { id: 'lookback', label: 'A quick look back (Week 1)' },
  { id: 'how-it-fits', label: 'How everything fits together' },
  { id: 'pandas-words', label: 'Pandas in plain words' },
  { id: 'cleaning', label: 'Cleaning: make data trustworthy' },
  { id: 'eda', label: 'EDA: Exploratory Data Analysis' },
  { id: 'viz', label: 'Matplotlib: simple visuals, clear stories' },
  { id: 'tiny-code', label: 'Tiny code glimpses' },
  { id: 'pitfalls', label: 'Common pitfalls & habits' },
  { id: 'story', label: 'From numbers to a story' },

  { id: 'next', label: 'Next steps' },
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
    tone === 'tip' ? (
      <Lightbulb className="h-4 w-4" />
    ) : tone === 'warn' ? (
      <AlertTriangle className="h-4 w-4" />
    ) : (
      <Sparkles className="h-4 w-4" />
    );
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

function Code({ children }: { children: string }) {
  return (
    <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded border border-gray-200">{children}</pre>
  );
}

// --- Page --------------------------------------------------------------------
export default function Week2NotesPage() {
  const [user, setUser] = useState<any>(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  // Force light theme for readability
  useEffect(() => {
    try {
      const el = document.documentElement;
      el.classList.remove('dark');
      el.style.colorScheme = 'light';
      ;['theme','color-theme','ui-theme','next-theme','chakra-ui-color-mode','mantine-color-scheme']
        .forEach((k) => localStorage.setItem(k, 'light'));
      if (localStorage.getItem('darkMode') === 'true') localStorage.setItem('darkMode', 'false');
    } catch {}
  }, []);

  // Load user + progress
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

  // Save completion
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
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-14 grid grid-cols-[auto_1fr_auto] items-center gap-3">
            {/* Left: Home */}
            <Link
              href="/learn/beginner"
              aria-label="Go to course home"
              prefetch={false}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2"
            >
              <Home className="h-5 w-5" />
            </Link>

            {/* Center: Title */}
            <div className="flex items-center justify-center">
              <span className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                Week 2 · Clean/Analyse
              </span>
            </div>

            {/* Right: Contents toggle (mobile) */}
            <button
              type="button"
              aria-label="Toggle contents"
              className="lg:hidden inline-flex h-10 items-center gap-2 px-3 rounded-xl border border-gray-200 text-gray-800 hover:bg-gray-50 justify-self-end"
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
          <nav className="space-y-1" aria-label="On this page">
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
            This week’s superpower: turn messy data into clear answers and a single clean chart. ✨
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-10">
          {/* Welcome */}
          <section id="welcome" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome to Week 2</h1>
            <p className="text-gray-700 mt-2">
              You made it. Last week you learned how to talk to the computer with Python and how small, clear steps build
              real skills. This week is where data starts to feel alive. We will clean it so it can be trusted, analyze it so
              it makes sense, and visualize it so anyone can understand the story in a glance. The tools are
              straightforward: <strong>Pandas</strong> for working with tables, simple <strong>data cleaning</strong> habits to fix what’s messy,
              <strong>EDA</strong> — Exploratory Data Analysis — to ask and answer basic questions, and <strong>Matplotlib</strong> for simple charts
              that tell one clear story at a time.
            </p>
            <Box tone="tip" title="The vibe for Week 2">
              Think like a careful chef: bring ingredients to the counter, tidy them one by one, taste as you go, and
              serve a small tasting plate that captures the whole flavor.
            </Box>
          </section>

          {/* Look back */}
          <section id="lookback" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold flex items-center gap-2"><BookOpen className="h-5 w-5 text-green-700" /> A quick look back</h2>
            <p className="text-gray-700 mt-1">
              In Week 1 you picked up Python basics, saw core types like strings and booleans, and used control flow to
              guide programs. You also met the machine‑learning recipe at a high level: frame the problem, split data,
              prepare features, create a baseline, train, and evaluate. That mindset carries forward. This week focuses on
              the middle of that recipe: getting comfortable with data itself before any modeling.
            </p>
          </section>

          {/* How it fits */}
          <section id="how-it-fits" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2">
            <h2 className="text-xl font-semibold">How everything fits together</h2>
            <p className="text-gray-700">
              The flow is gentle and reliable. You <em>load</em> a table into Pandas so you can see it clearly. You <em>clean</em> a few
              obvious issues like wrong types or missing entries so math won’t break. You do <strong>Exploratory Data Analysis</strong>
              (EDA) to measure what’s typical and how groups differ. Then you pick one chart in <strong>Matplotlib</strong> that shows the
              main finding simply. If a new question appears, you loop: peek, tidy a little, measure again, and only then
              draw.
            </p>
            <Box tone="pro" title="One step → one insight">
              After each change, take a tiny look — a few rows, a quick summary, a single number. That rhythm builds
              confidence and prevents confusion.
            </Box>
          </section>

          {/* Pandas in words */}
          <section id="pandas-words" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Pandas in plain words</h2>
            <p className="text-gray-700">
              Pandas gives you a <em>DataFrame</em>, which is just a tidy spreadsheet in code: rows are examples, columns are
              variables, and each column has a name and a type. You can select a column like you would a tab in a
              notebook, filter rows that match a condition, and group rows to ask the same question per category. A <em>Series</em>
              is one column with a name; a DataFrame is several Series kept side by side. Pandas is popular because these
              operations read almost like English and because small commands reveal a lot with very little effort.
            </p>
          </section>

          {/* Cleaning */}
          <section id="cleaning" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2">
            <h2 className="text-xl font-semibold">Cleaning: make data trustworthy</h2>
            <p className="text-gray-700">
              Cleaning means removing the easy sources of confusion. Sometimes a numeric column is stored as text and
              silently breaks calculations. Sometimes values are missing, and you should either fill them with a sensible
              number or mark the row as incomplete. Sometimes duplicate rows sneak in. And sometimes a value is so far
              from the rest that it deserves a second look before you accept or discard it. You don’t need fancy tools to
              start: you only need a calm checklist and the courage to change one thing at a time.
            </p>
            <Box tone="tip" title="A simple cleaning checklist">
              Confirm column names and types, scan for missing values, handle duplicates, and note any strange values you
              want to investigate later. Keep a short log of what you changed and why.
            </Box>
          </section>

          {/* EDA */}
          <section id="eda" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2">
            <h2 className="text-xl font-semibold">EDA: Exploratory Data Analysis</h2>
            <p className="text-gray-700">
              Exploratory Data Analysis is the habit of letting the data answer small, practical questions before any
              modeling. What is typical for each column? How many rows are there for each category? Which groups look
              higher or lower on a metric that matters to you? You might start with a quick numeric summary, then count
              categories, and finally compare averages by group. The point is to see the shape of the data and to catch
              surprises early. EDA is not a one‑time step; it is a conversation you keep having as you learn more.
            </p>
            <Box tone="pro" title="Small prompts that work">
              “Show me a five‑number summary for the numeric columns.” “How many rows per city?” “Which product line has
              the highest average order value?” Ask one question at a time and write down the answer.
            </Box>
          </section>

          {/* Visualization */}
          <section id="viz" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Matplotlib: simple visuals, clear stories</h2>
            <p className="text-gray-700">
              A good chart is a sentence without words. Use a bar chart to compare categories, a line chart to show change
              over time, and a histogram to show the shape of a single number. Label axes plainly, avoid decoration, and
              keep each chart to one idea. If you find yourself explaining two or three different points, you probably need
              two or three small charts instead of one busy figure. The best visuals feel obvious once you’ve seen them.
            </p>
            <Box tone="tip" title="Design before you draw">
              Decide the question and the audience first. Then choose the simplest chart that answers it. Only after that do
              you write the code to render it.
            </Box>
          </section>

          {/* Tiny code glimpses */}
          <section id="tiny-code" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><BarChart3 className="h-5 w-5 text-green-700" /> Tiny code glimpses (for context only)</h2>
            <p className="text-gray-700">You don’t need to run these now. They are here so you can picture the tools in action.</p>
            <Code>{`# 1) Load & peek (Pandas)
import pandas as pd
df = pd.read_csv('air_quality.csv')
print(df.head())     # first rows
print(df.dtypes)     # column types`}</Code>
            <Code>{`# 2) Clean a little (types, missing, duplicates)
df['pm25'] = pd.to_numeric(df['pm25'], errors='coerce')
df['pm25'] = df['pm25'].fillna(df['pm25'].median())
df = df.drop_duplicates()`}</Code>
            <Code>{`# 3) EDA (Exploratory Data Analysis)
print(df.describe(numeric_only=True))
print(df['city'].value_counts())
print(df.groupby('city')['pm25'].mean())`}</Code>
            <Code>{`# 4) Visualize (Matplotlib)
import matplotlib.pyplot as plt
(
    df.groupby('city')['pm25']
      .mean()
      .sort_values(ascending=False)
      .plot(kind='bar')
)
plt.ylabel('PM2.5 (µg/m³)')
plt.title('Average PM2.5 by City')
plt.tight_layout()
plt.show()`}</Code>
          </section>

          {/* Pitfalls */}
          <section id="pitfalls" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2">
            <h2 className="text-xl font-semibold">Common pitfalls & steady habits</h2>
            <p className="text-gray-700">
              The biggest early mistake is to jump into plotting before you truly understand the table. Resist that urge.
              Another is to treat cleaning as a one‑click task; it is better done as a sequence of tiny, documented choices.
              A third is to use a single metric for everything; often you need two or three views to see the full picture. If
              you keep your steps small and your notes simple, you will avoid most headaches.
            </p>
            <Box tone="warn" title="A word on outliers & leakage">
              Outliers deserve curiosity, not automatic deletion. And when you later build models, never let information from
              the test set leak into your decisions. For now, keep your cleaning rules simple and your EDA honest.
            </Box>
          </section>

          {/* Story */}
          <section id="story" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">From numbers to a story</h2>
            <p className="text-gray-700">
              Analysis becomes useful the moment a non‑technical teammate can act on it. After you run a summary or draw a
              quick bar chart, try to express the finding in one sentence that a busy person can use: “Across the first
              quarter, Lagos shows the highest average PM2.5; our air‑quality alerts should prioritize Lagos mornings.” If
              you cannot write that sentence, the analysis is not finished yet — peek again, tidy again, and simplify the
              visual.
            </p>
          </section>

          {/* Reflection */}
        

          {/* Next steps */}
          <section id="next" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Next steps</h2>
            <p className="text-gray-700">
              The following pages go hands‑on: a short Pandas crash course, practical cleaning patterns you can repeat,
              and a gentle introduction to Matplotlib with just enough options to stay clear. When you are ready, mark this
              page complete and continue.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <Link
                href="/course/week-1/wrap-up"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" /> Back to Week 1 Wrap‑Up
              </Link>
              <div className="flex items-center gap-3">
                <button
                  onClick={markComplete}
                  className={cx(
                    'px-4 py-2 rounded-lg border',
                    completed ? 'border-green-200 bg-green-50 text-green-800' : 'border-gray-200 hover:bg-gray-50'
                  )}
                >
                  {completed ? 'Completed ✓' : 'Mark Complete'}
                </button>
                <Link
                  href="/course/week-2/pandas"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow"
                  onClick={async () => { if (!completed) await markComplete(); }}
                >
                  Start Pandas <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
