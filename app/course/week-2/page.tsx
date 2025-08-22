'use client';

// ---------------------------------------------------------------------------
// Week 2 • Data Wrangling & EDA (Intro, ultra-beginner friendly)
// ---------------------------------------------------------------------------
// This page keeps ALL original integrations intact (Supabase tracking +
// in-browser Python runner) and focuses on teaching fundamentals so clearly
// that even absolute beginners can follow. We add step-by-step explanations,
// expected outputs after prints, and safer Pyodide behavior that auto‑loads
// pandas to prevent import errors. The runner is OPTIONAL — learning works by
// reading alone.
// ---------------------------------------------------------------------------

import { useEffect, useRef, useState } from 'react';
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
  Database,
  BarChart3,
  Table,
  CheckCircle2,
  BookOpen,
  NotebookPen,
  ClipboardCheck,
} from 'lucide-react';

/**
 * 🟢 Overview
 * - Light-only UI for readability
 * - Progress is saved with Supabase (table: tracking)
 * - Sticky sidebar + scrollspy
 * - Optional in-browser Python runner (Pyodide) with auto‑pandas loading
 *
 * This intro is written for beginners. We break down every idea step by step,
 * and after each code snippet, we show an “Expected output” preview so you can
 * compare what you see with what’s typical.
 */

const PROGRESS_KEY = 'week-2:intro';

const SECTIONS = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'recap', label: 'Week 1 refresher (tiny)' },
  { id: 'why', label: 'Why this matters' },
  { id: 'roadmap', label: 'This week at a glance' },
  { id: 'mental-model', label: 'Mental model: “kitchen of data”' },
  { id: 'glossary', label: 'Mini glossary (beginner)' },
  { id: 'pandas', label: 'Pandas in 5 minutes' },
  { id: 'load', label: 'Load data (CSV → DataFrame)' },
  { id: 'clean', label: 'Cleaning (missing, types, dupes, outliers)' },
  { id: 'eda', label: 'EDA (describe, group, slice)' },
  { id: 'viz', label: 'Visual thinking (pick a chart)' },
  { id: 'pitfalls', label: '🚨 Common Mistake Prevention' },
  { id: 'practice', label: 'Practice (micro-quests)' },
  { id: 'runner', label: '🏃‍♂️ Try it now (optional)' },
  { id: 'next', label: 'What’s next' },
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
    <Sparkles className="h-4 w-4" />;
  return (
    <div className={cx('rounded-xl border p-3 md:p-4 flex gap-3 items-start', palette)}>
      <div className="mt-0.5 shrink-0" aria-hidden>{icon}</div>
      <div>
        <div className="font-medium mb-1">{title}</div>
        <div className="text-sm md:text-[0.95rem] leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

function CsvPreview({ csv }: { csv: string }) {
  const rows = csv.trim().split(/\r?\n/).map((r) => r.split(','));
  const headers = rows[0] || [];
  const data = rows.slice(1);
  return (
    <div className="overflow-auto rounded-xl border border-gray-200" role="region" aria-label="CSV preview table">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2 text-left font-semibold text-gray-700">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((r, i) => (
            <tr key={i} className="odd:bg-white even:bg-gray-50">
              {r.map((c, j) => (
                <td key={j} className="px-3 py-2 text-gray-700 whitespace-nowrap">{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 📦 Tiny sample dataset (fits on one screen, easy to reason about).
const SAMPLE_CSV = `city,month,temp_c,humidity,pm25
Lagos,Jan,33,78,32
Lagos,Feb,34,76,30
Lagos,Mar,33,80,41
Abuja,Jan,30,40,22
Abuja,Feb,31,45,24
Abuja,Mar,32,42,19
Kano,Jan,28,25,14
Kano,Feb,29,27,17
Kano,Mar,31,30,18`;

// --- Page --------------------------------------------------------------------
export default function Week2IntroPage() {
  const [user, setUser] = useState<any>(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  // 🌞 Force light theme for readability
  useEffect(() => {
    try {
      const el = document.documentElement;
      el.classList.remove('dark');
      el.style.colorScheme = 'light';
      ['theme', 'color-theme', 'ui-theme', 'next-theme', 'chakra-ui-color-mode', 'mantine-color-scheme'].forEach((k) => {
        if (localStorage.getItem(k) !== 'light') localStorage.setItem(k, 'light');
      });
      if (localStorage.getItem('darkMode') === 'true') localStorage.setItem('darkMode', 'false');
    } catch {}
  }, []);

  // 🔐 Load user + progress
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

  // ✅ Save completion
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

  // 👀 Scrollspy
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('main section[id]'));
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId((visible[0].target as HTMLElement).id);
      },
      { root: null, rootMargin: '-112px 0px -55% 0px', threshold: [0.1, 0.25, 0.5, 0.75, 1] }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-100 backdrop-blur bg-white/70">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white" aria-hidden>
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-bold">Week 2 • Data Wrangling & EDA</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <button
              className="lg:hidden inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-expanded={sidebarOpen}
              aria-controls="course-sidebar"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              Contents
            </button>
            <span>{loading ? 'Loading…' : user ? 'Signed in' : <Link href="/signin" className="underline">Sign in</Link>}</span>
          </div>
        </div>
      </header>

      {/* Shell */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6">
        {/* Sidebar */}
        <aside
          id="course-sidebar"
          className={cx(
            'lg:sticky lg:top-[72px] lg:h-[calc(100vh-88px)] lg:overflow-auto',
            'rounded-2xl border border-gray-200 bg-white p-4 shadow-sm',
            sidebarOpen ? '' : 'hidden lg:block'
          )}
          aria-label="On this page navigation"
        >
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">On this page</p>
          <nav className="space-y-1">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setSidebarOpen(false)}
                aria-current={activeId === s.id ? 'page' : undefined}
                className={cx(
                  'block px-3 py-2 rounded-lg text-sm transition-colors',
                  activeId === s.id ? 'bg-green-50 text-green-800' : 'hover:bg-gray-50 text-gray-700'
                )}
              >
                {s.label}
              </a>
            ))}
          </nav>
          <div className="mt-6 p-3 rounded-xl bg-gray-50 text-xs text-gray-700">
            This week’s superpower: turning messy tables into clear answers. ✨
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-10">
          {/* Welcome */}
          <section id="welcome" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome to Week 2 — Data Wrangling & EDA</h1>
            <p className="text-gray-700 mt-2">
              Imagine you’re a detective 🕵🏽‍♀️. The dataset is your case file. Our job this week:
              tidy clues (cleaning) → ask smart questions (EDA) → see stories (simple charts).
              No tricks, no rush. We’ll go one tiny step at a time.
            </p>
            <ul className="list-disc pl-5 text-gray-700 mt-3 space-y-1">
              <li><strong>Data wrangling</strong>: make the table usable (fix types, fill missing, remove exact duplicates).</li>
              <li><strong>EDA</strong> (Exploratory Data Analysis): summaries, counts, compare groups.</li>
              <li><strong>Visualization</strong>: one clear story per chart (bar, line, or histogram).</li>
            </ul>
            <div className="mt-4 inline-flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <span>After reading, click “Mark Complete” below to save progress.</span>
            </div>
          </section>

          {/* Week 1 refresher */}
          <section id="recap" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2"><BookOpen className="h-5 w-5" /> Week 1 refresher (tiny)</h2>
            <p className="text-gray-700">Only the basics you’ll reuse:</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li><strong>Variables</strong> = labeled boxes for values. Example: <code>x = 3</code>.</li>
              <li>Core types: <strong>int</strong> (34), <strong>float</strong> (34.5), <strong>str</strong> ('Lagos'), <strong>bool</strong> (True/False).</li>
              <li><strong>if/elif/else</strong> choose a path; <strong>for</strong> repeats steps for each item.</li>
              <li>Handy containers: <strong>list</strong> <code>[1,2,3]</code> & <strong>dict</strong> <code>{`{city: 'Lagos'}`}</code>.</li>
            </ul>
            <Box tone="tip" title="Mindset">
              Errors are clues. Print often. Tiny steps win. 🌱
            </Box>
          </section>

          {/* Why this matters */}
          <section id="why" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Why this matters</h2>
            <Box tone="tip" title="Real data is messy">
              Most datasets have missing values, weird types, and duplicates. Cleaning isn’t flashy, but it’s where wins happen. EDA shows what’s
              <em>actually</em> there before modeling.
            </Box>
            <div className="grid md:grid-cols-3 gap-3" aria-label="Three core steps: load, clean, explore">
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50 flex items-center gap-3">
                <Database className="h-5 w-5 text-gray-700" /><div><strong>Load</strong><div className="text-sm text-gray-600">CSV → DataFrame</div></div>
              </div>
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50 flex items-center gap-3">
                <Table className="h-5 w-5 text-gray-700" /><div><strong>Clean</strong><div className="text-sm text-gray-600">types, NA, dupes</div></div>
              </div>
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50 flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-gray-700" /><div><strong>Explore</strong><div className="text-sm text-gray-600">group, slice, summarize</div></div>
              </div>
            </div>
          </section>

          {/* Roadmap */}
          <section id="roadmap" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">This week at a glance</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li><strong>Pandas basics:</strong> DataFrame, Series, indexing, selection, filtering.</li>
              <li><strong>Cleaning:</strong> missing values, types, duplicates, basic outlier checks.</li>
              <li><strong>EDA:</strong> <code>describe()</code>, <code>value_counts()</code>, <code>groupby()</code>, aggregations.</li>
              <li><strong>Visual thinking:</strong> choose a chart before plotting (bar/hist/line).</li>
            </ul>
            <Box tone="tip" title="Pace yourself">
              One tiny action → look → next tiny action. Example: load → <code>head()</code> → fix one column → look again.
            </Box>
          </section>

          {/* Mental model */}
          <section id="mental-model" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2">
            <h2 className="text-xl font-semibold">Mental model: the “kitchen of data” 🍳</h2>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded" aria-label="Kitchen analogy for data">{`Pantry (CSV files)
 └─ Counter (DataFrame)
     ├─ Ingredients (columns)
     ├─ Each row = one example
     └─ Recipes (cleaning steps): measure, chop, combine
Serve a tasting plate (EDA): summaries & small samples to see the flavor`}</pre>
            <Box tone="pro" title="Rule of thumb">
              Look → Clean a little → Look again. Repeat. Patterns will emerge.
            </Box>
          </section>

          {/* Glossary */}
          <section id="glossary" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold flex items-center gap-2"><NotebookPen className="h-5 w-5" /> Mini glossary (beginner)</h2>
            <div className="grid md:grid-cols-2 gap-4 text-gray-700">
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <strong>DataFrame</strong>: a table (rows & columns). Think spreadsheet.
              </div>
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <strong>Series</strong>: a single column with a name.
              </div>
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <strong>NA / NaN</strong>: missing values (empty cell).
              </div>
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <strong>GroupBy</strong>: ask the same question per group (e.g., average by city).
              </div>
            </div>
          </section>

          {/* Pandas quick intro */}
          <section id="pandas" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Pandas in 5 minutes</h2>
            <p className="text-gray-700">Treat this like a cooking recipe: add one line, peek, continue.</p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded" aria-label="Pandas crash code with comments">{`import pandas as pd

# 1) Build a tiny table (DataFrame) from scratch
#    A DataFrame is rows (examples) x columns (variables)
df = pd.DataFrame({
  'city': ['Lagos','Abuja','Kano'],
  'temp_c': [33, 30, 28],
  'pm25':  [32, 22, 14],
})

print(df.head())       # quick peek at the first rows
print(df.dtypes)       # see column types
print(df.describe())   # numeric summary (count, mean, etc.)`}</pre>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              <div className="font-medium mb-1">Expected output (approx.)</div>
              <pre className="whitespace-pre-wrap text-xs">
 {`   city  temp_c  pm25
  0  Lagos      33    32
  1  Abuja      30    22
  2   Kano      28    14

city      object
temp_c     int64
pm25       int64
dtype: object
       temp_c       pm25
count     3.00      3.00
mean     30.33     22.67
std       2.52      9.02
min      28.00     14.00
25%      29.00     18.00
50%      30.00     22.00
75%      31.50     27.00
max      33.00     32.00`}</pre>
            </div>
            <Box tone="tip" title="Think in questions">
              “What is typical?” (<code>describe()</code>) • “How many of each?” (<code>value_counts()</code>) • “How do groups differ?” (<code>groupby</code>)
            </Box>
          </section>

          {/* Load data */}
          <section id="load" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Load data (CSV → DataFrame)</h2>
            <p className="text-gray-700">We’ll use a tiny environmental dataset (city / month / weather / PM2.5).</p>
            <CsvPreview csv={SAMPLE_CSV} />
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded mt-3" aria-label="Read CSV example">{`import pandas as pd, io

# Pretend this CSV string is a file on disk
file_like = io.StringIO("""${SAMPLE_CSV.replace(/"/g, '\\"')}""")

# Read the CSV into a DataFrame
df = pd.read_csv(file_like)

print('shape (rows, cols):', df.shape)
print('first rows:\n', df.head())
print('column types:\n', df.dtypes)`}</pre>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              <div className="font-medium mb-1">Expected output</div>
              <pre className="whitespace-pre-wrap text-xs">{`shape (rows, cols): (9, 5)
first rows:
    city month  temp_c  humidity  pm25
0  Lagos   Jan      33        78    32
1  Lagos   Feb      34        76    30
2  Lagos   Mar      33        80    41
3  Abuja   Jan      30        40    22
4  Abuja   Feb      31        45    24
column types:
 city        object
month       object
temp_c       int64
humidity     int64
pm25         int64
dtype: object`}</pre>
            </div>
            <Box tone="tip" title="Checklist">
              Confirm in order: <strong>shape</strong> → <strong>column names</strong> → <strong>dtypes</strong> → a quick peek (<code>head()</code>).
            </Box>
          </section>

          {/* Cleaning */}
          <section id="clean" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Cleaning (missing, types, duplicates, outliers)</h2>
            <p className="text-gray-700">Cleaning means making the table trustworthy. Start small; note what you change and why.</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <h3 className="font-medium mb-1">Missing values</h3>
                <pre className="text-sm whitespace-pre-wrap" aria-label="Missing values example">{`# Count missing values per column
print(df.isna().sum())

# If pm25 had missing values, we could fill with the median:
# df['pm25'] = df['pm25'].fillna(df['pm25'].median())`}</pre>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-900">
                  <div className="font-medium mb-1">Expected output (for this dataset)</div>
                  <pre className="whitespace-pre-wrap text-[11px]">{`city        0
month       0
temp_c      0
humidity    0
pm25        0
dtype: int64`}</pre>
                </div>
                <p className="text-sm text-gray-600 mt-2">Pick a rule (drop, fill, or flag) and be consistent.</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <h3 className="font-medium mb-1">Types & Duplicates</h3>
                <pre className="text-sm whitespace-pre-wrap" aria-label="Types and duplicates example">{`# Ensure numbers are numeric (not strings). If a bad value appears, coerce to NaN.
df['temp_c'] = pd.to_numeric(df['temp_c'], errors='coerce')

# Count and remove exact duplicate rows
print('duplicates before:', df.duplicated().sum())
df = df.drop_duplicates()
print('duplicates after:', df.duplicated().sum())`}</pre>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-900">
                  <div className="font-medium mb-1">Expected output (for this dataset)</div>
                  <pre className="whitespace-pre-wrap text-[11px]">{`duplicates before: 0
duplicates after: 0`}</pre>
                </div>
              </div>
            </div>
            <Box tone="warn" title="Outlier sanity check">
              Don’t auto-delete outliers. Investigate first: is it a rare real event or a data entry issue?
            </Box>
          </section>

          {/* EDA */}
          <section id="eda" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">EDA (describe, group, slice)</h2>
            <p className="text-gray-700">Summaries first, then show tiny slices (actual rows) that match the summary.</p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded" aria-label="EDA examples">{`# 1) Numeric overview
print(df.describe(numeric_only=True))

# 2) How many rows per city?
print(df['city'].value_counts())

# 3) Which city has the highest average PM2.5?
means = df.groupby('city')['pm25'].mean().sort_values(ascending=False)
print(means)

# 4) Show the rows from the top city
top_city = means.index[0]
print('Rows from top city (first 3):\n', df[df['city'] == top_city].head(3))`}</pre>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              <div className="font-medium mb-1">Expected output (key parts)</div>
              <pre className="whitespace-pre-wrap text-xs">{`# value_counts()
Lagos    3
Abuja    3
Kano     3
Name: city, dtype: int64

# groupby mean of pm25 (sorted desc)
city
Lagos    34.333333
Abuja    21.666667
Kano     16.333333
Name: pm25, dtype: float64

# rows from top city (Lagos)
   city month  temp_c  humidity  pm25
0  Lagos   Jan      33        78    32
1  Lagos   Feb      34        76    30
2  Lagos   Mar      33        80    41`}</pre>
            </div>
            <Box tone="pro" title="Pair summary with rows">
              After a summary, print a tiny slice that illustrates it. This builds intuition fast.
            </Box>
          </section>

          {/* Visualization thinking */}
          <section id="viz" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Visual thinking (pick a chart before plotting)</h2>
            <p className="text-gray-700">
              Decide the right chart first: <strong>bar</strong> (compare categories), <strong>hist</strong> (shape), <strong>line</strong> (trend over time).
            </p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded" aria-label="Chart decision notes">{`# Design first (paper or notes):
# - Average pm25 by city -> BAR (categories on x-axis)
# - Distribution of temp_c -> HIST (bins of values)
# - pm25 over months       -> LINE (time on x-axis)`}</pre>
            <Box tone="tip" title="When you do plot later (Matplotlib)">
              Clear axis labels & units, minimal colors, one story per chart.
            </Box>
          </section>

          {/* Pitfalls */}
          <section id="pitfalls" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">🚨 Common Mistake Prevention</h2>
            <Box tone="warn" title="String-numbers">
              Numbers stored as strings break math. Use <code>pd.to_numeric(..., errors='coerce')</code>.
            </Box>
            <Box tone="warn" title="Data leakage">
              Don’t compute statistics using the test set. Fit rules on train; apply to val/test.
            </Box>
            <Box tone="tip" title="Document your rules">
              Keep a simple checklist: what you dropped/filled/coerced and why.
            </Box>
          </section>

          {/* Practice */}
          <section id="practice" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold flex items-center gap-2"><ClipboardCheck className="h-5 w-5" /> Practice (micro-quests)</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Load the sample CSV and print <code>shape</code>, <code>head()</code>, and <code>dtypes</code>.</li>
              <li>Coerce <code>pm25</code> to numeric and (if needed) fill missing with the median.</li>
              <li>Find and remove duplicates; show the count before/after.</li>
              <li>Group by <code>city</code> and compute average <code>pm25</code>. Which city is highest?</li>
              <li>Sketch which chart best shows: (a) average pm25 by city (b) temp distribution.</li>
            </ul>
            <Box tone="tip" title="Micro-habit">
              After each step, print a tiny preview (<code>head()</code>) so you can trust your next step.
            </Box>
          </section>

          {/* Runner (Optional) */}
          <section id="runner" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">🏃‍♂️ Try it now (optional)</h2>
            <p className="text-gray-700">You can ignore this for now and just read. If you do run code, we’ll auto‑load pandas to avoid errors.</p>
            <PythonRunnerWorker />
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              
              
              <QuickLoad
                label="EDA: groupby mean"
                code={`import pandas as pd, io
csv = io.StringIO("""${SAMPLE_CSV.replace(/"/g, '\\"')}""")
df = pd.read_csv(csv)
print(df.groupby('city')['pm25'].mean().sort_values(ascending=False))`}
              />
              <QuickLoad
                label="ASCII bar chart"
                code={`import pandas as pd, io, math
csv = io.StringIO("""${SAMPLE_CSV.replace(/"/g, '\\"')}""")
df = pd.read_csv(csv)
for city, val in df.groupby('city')['pm25'].mean().items():
    bars = '#' * math.ceil(val/2)
    print(f"{city:>6}: {bars} {val:.1f}")`}
              />
              
            </div>
          </section>

          {/* Next steps */}
          <section id="next" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">What’s next</h2>
            <p className="text-gray-700">
              Upcoming pages dive deeper into: a focused Pandas crash course, hands‑on cleaning patterns, EDA patterns, and simple Matplotlib plots.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <Link
                href="/course/week-1/wrap-up"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" /> Back to Week 1 Wrap-Up
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

// --------------------------- Runner (Web Worker) ------------------------------
// Optional sandbox: runs tiny Python snippets in your browser. We auto‑load
// pandas here to prevent the “ModuleNotFoundError: pandas”.
function PythonRunnerWorker() {
  const [initialized, setInitialized] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [code, setCode] = useState<string>(`# Edit and run here. You can also just read the page.\nprint("Week 2 sandbox ready")`);
  const workerRef = useRef<Worker | null>(null);
  const urlRef = useRef<string | null>(null);

  (globalThis as any).__setRunnerCode = (c: string) => setCode(c);

  const ensureWorker = () => {
    if (workerRef.current) return;
    const workerCode = `self.language='python';
let pyodideReadyPromise;
async function init(){
  if(!pyodideReadyPromise){
    importScripts('https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js');
    pyodideReadyPromise = loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/' });
  }
  self.pyodide = await pyodideReadyPromise;
  self.pyodide.setStdout({ batched: (s) => postMessage({ type: 'stdout', data: s }) });
  self.pyodide.setStderr({ batched: (s) => postMessage({ type: 'stderr', data: s }) });
}
self.onmessage = async (e) => {
  const { type, code } = e.data || {};
  try {
    if (type === 'init'){
      await init();
      postMessage({ type: 'ready' });
    } else if (type === 'run'){
      await init();
      // 🔽 Auto‑load pandas only if user code references it
      if (typeof code === 'string' && /import\\s+pandas/.test(code)) {
        postMessage({ type: 'status', data: '[pyodide] loading pandas…' });
        try {
          await self.pyodide.loadPackage('pandas');
          postMessage({ type: 'status', data: '[pyodide] pandas ready' });
        } catch (e){
          postMessage({ type: 'stderr', data: String(e) });
        }
      }
      let result = await self.pyodide.runPythonAsync(code);
      postMessage({ type: 'result', data: String(result ?? '') });
    }
  } catch (err){
    postMessage({ type: 'error', data: String(err) });
  }
};`;
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    urlRef.current = url;
    workerRef.current = new Worker(url);
    workerRef.current.onmessage = (e: MessageEvent) => {
      const { type, data } = (e as any).data || {};
      if (type === 'ready') {
        setInitialized(true);
        setInitializing(false);
        setOutput('[python] ready\nTip: Click Run to execute the code, or ignore this area.');
      } else if (type === 'status') {
        setOutput((o) => o + (o.endsWith('\n') ? '' : '\n') + String(data));
      } else if (type === 'stdout') {
        setOutput((o) => o + String(data));
      } else if (type === 'stderr') {
        setOutput((o) => o + String(data));
      } else if (type === 'result') {
        setRunning(false);
        if (data) setOutput((o) => o + (o.endsWith('\n') ? '' : '\n') + String(data) + '\nNice! ✅');
        else setOutput((o) => o + (o.endsWith('\n') ? '' : '\n') + 'Done. ✅');
      } else if (type === 'error') {
        setRunning(false);
        setOutput((o) => o + (o.endsWith('\n') ? '' : '\n') + '⚠️ ' + String(data));
      }
    };
  };

  useEffect(() => {
    return () => {
      if (workerRef.current) workerRef.current.terminate();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const init = () => {
    ensureWorker();
    if (!initialized && workerRef.current && !initializing) {
      setInitializing(true);
      setOutput('Loading Python… this runs in your browser.');
      workerRef.current.postMessage({ type: 'init' });
    }
  };

  const run = () => {
    ensureWorker();
    if (!initialized || !workerRef.current) return;
    setRunning(true);
    setOutput('');
    workerRef.current.postMessage({ type: 'run', code });
  };

  const resetConsole = () => setOutput('');

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
        <div className="text-sm text-gray-600">Interactive Python (isolated; loads on demand)</div>
        <div className="flex gap-2">
          {!initialized ? (
            <button onClick={init} disabled={initializing} className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">
              {initializing ? 'Initializing…' : 'Initialize Python'}
            </button>
          ) : (
            <>
              <button onClick={run} disabled={running} className="px-3 py-2 rounded-lg bg-green-600 text-white hover:shadow">
                {running ? 'Running…' : 'Run'}
              </button>
              <button onClick={resetConsole} className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                Clear Console
              </button>
            </>
          )}
        </div>
      </div>
      <textarea
        className="w-full min-h-[220px] rounded-xl border border-gray-200 p-3 font-mono text-sm bg-white"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        aria-label="Python code editor"
      />
      <div className="mt-3">
        <div className="text-sm font-medium mb-1">Console</div>
        <pre className="w-full min-h-[160px] rounded-xl border border-gray-200 p-3 text-sm bg-gray-50 overflow-auto whitespace-pre-wrap" aria-live="polite">
          {output}
        </pre>
      </div>
    </div>
  );
}

function QuickLoad({ label, code }: { label: string; code: string }) {
  return (
    <button
      className="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
      onClick={() => (globalThis as any).__setRunnerCode?.(code)}
      title="Load example into the editor"
    >
      {label}
    </button>
  );
}
