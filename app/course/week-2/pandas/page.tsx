'use client';

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
  CheckCircle2,
  BookOpen,
  BarChart3,
  Home,
} from 'lucide-react';

/**
 * Week 2 • Pandas (Notes-first, ultra-beginner friendly)
 * - Warm welcome + Week 1 bridge
 * - Why pandas exists + a tiny history
 * - Gentle mental model (no heavy tables)
 * - Minimal code, each with a tiny expected output
 * - Light-only UI; Supabase progress tracking; sticky sidebar; scrollspy
 * - Optional in-browser runner that preloads pandas, loads matplotlib on demand
 */

const PROGRESS_KEY = 'week-2:pandas:notes';

const SECTIONS = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'bridge', label: 'From Week 1 → Week 2' },
  { id: 'origins', label: 'Why pandas exists + its story' },
  { id: 'model', label: 'Mental model: tables with labels' },
  { id: 'df-series', label: 'DataFrame & Series (simple)' },
  { id: 'first-look', label: 'Your first tiny look' },
  { id: 'select-filter', label: 'Selecting & filtering (calmly)' },
  { id: 'clean', label: 'Cleaning basics (types & missing)' },
  { id: 'summarize', label: 'Summaries & simple groups' },
  { id: 'viz', label: 'From table → simple chart' },
  { id: 'pitfalls', label: '🚨 Common Mistakes to avoid' },
  { id: 'practice', label: 'Practice (soft prompts)' },
  { id: 'runner', label: '🏃‍♂️ Try it now (optional)' },
  { id: 'next', label: 'Next steps' },
];

// --------------------------------- UI helpers --------------------------------
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
      <div className="mt-0.5" aria-hidden>{icon}</div>
      <div>
        <div className="font-medium mb-1">{title}</div>
        <div className="text-sm md:text-[0.95rem] leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

function CodeBlock({ code, expected, label = 'Python' }: { code: string; expected?: string; label?: string }) {
  return (
    <div className="space-y-2">
      <div className="px-3 py-1.5 bg-gray-50 text-xs text-gray-600 rounded-t-lg border border-b-0 border-gray-200">{label}</div>
      <pre className="bg-white border border-gray-200 rounded-b-lg p-3 text-sm whitespace-pre-wrap">{code}</pre>
      {expected && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-900">
          <strong>Expected output (approx.):</strong>
          <pre className="whitespace-pre-wrap mt-1">{expected}</pre>
        </div>
      )}
    </div>
  );
}

// --------------------------------- Page --------------------------------------
export default function Week2PandasNotesPage() {
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
      ['theme','color-theme','ui-theme','next-theme','chakra-ui-color-mode','mantine-color-scheme'].forEach((k) => {
        if (localStorage.getItem(k) !== 'light') localStorage.setItem(k, 'light');
      });
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

  // Scrollspy (largest visible section wins)
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('main section[id]'));
    if (!sections.length) return;
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
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-14 grid grid-cols-[auto_1fr_auto] items-center gap-3">
            {/* Left: Home icon */}
            <Link
              href="/learn/beginner"
              aria-label="Go to beginner home"
              prefetch={false}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2"
            >
              <Home className="h-5 w-5" />
            </Link>

            {/* Center: Title */}
            <div className="flex items-center justify-center">
              <span className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                Week 2 · Pandas
              </span>
            </div>

            {/* Right: Contents toggle (mobile only) + status */}
            <div className="flex items-center gap-2 justify-self-end">
              <button
                className="lg:hidden inline-flex h-10 items-center gap-2 px-3 rounded-xl border border-gray-200 text-gray-800 hover:bg-gray-50"
                onClick={() => setSidebarOpen((v) => !v)}
                aria-label="Toggle contents"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                <span className="sr-only">Contents</span>
              </button>
              <div className="hidden sm:block text-sm text-gray-600">
                {loading ? 'Loading…' : user ? 'Signed in' : <Link href="/signin" className="underline">Sign in</Link>}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Shell */}
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
                aria-current={activeId === s.id ? 'page' : undefined}
                onClick={() => setSidebarOpen(false)}
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
            Tiny steps, clear outputs. Curiosity is your superpower. ✨
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-10">
          {/* Welcome */}
          <section id="welcome" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900"> Pandas</h1>
            <p className="text-gray-700 mt-2">
              This week is about reading real‑world tables, tidying them, and asking
              smart questions that lead to clear stories. We will keep the mood calm and the steps tiny.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <span>Mark complete when you’ve read through. Practice can come later.</span>
            </div>
          </section>

          {/* Bridge to Week 1 */}
          <section id="bridge" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2"><BookOpen className="h-5 w-5" /> From Week 1 to Week 2</h2>
            <p className="text-gray-700">
              Last week you learned Python’s building blocks—variables, strings and numbers, simple decisions and loops,
              and how to keep your logic neat with tiny functions. You also saw the big picture of an ML workflow: frame →
              split → prepare → train → evaluate. This week we live in the <em>prepare</em> part: cleaning and exploring data so
              insights don’t get buried under mess.
            </p>
          </section>

          {/* Origins */}
          <section id="origins" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Why pandas exists, and a tiny history</h2>
            <p className="text-gray-700">
              Real datasets rarely arrive tidy. Raw Python lists and dictionaries can express tables, but they become
              clumsy when you need to sort, group, join, or handle missing values. Spreadsheets feel familiar, but they’re
              fragile, hard to version, and awkward to automate. <strong>pandas</strong> was created to bridge this gap: a fast,
              Pythonic way to work with labeled, column‑oriented data. It grew from early work by Wes McKinney around 2008,
              built on top of NumPy, and matured into the go‑to library for data cleaning and exploration across science,
              business, and ML.
            </p>
            <Box tone="tip" title="One sentence definition">
              pandas lets you treat data like a smart, programmable spreadsheet where every step can be repeated and
              trusted.
            </Box>
          </section>

          {/* Mental model */}
          <section id="model" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2">
            <h2 className="text-xl font-semibold">Mental model: tables with labels</h2>
            <p className="text-gray-700">
              Picture a neat table on your desk. The whole table is a <strong>DataFrame</strong>. Each column—like “city” or
              “temperature”—is a <strong>Series</strong>. Rows are examples, columns are variables, and the labels let you select
              exactly what you need without guesswork.
            </p>
            <Box tone="pro" title="Golden loop">
              Look → Clean a little → Look again. Repeat. You will never be lost if you keep peeking.
            </Box>
          </section>

          {/* DataFrame vs Series */}
          <section id="df-series" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">DataFrame & Series (simple)</h2>
            <p className="text-gray-700">
              A <strong>DataFrame</strong> is the whole table. A <strong>Series</strong> is one of its columns. We’ll use the variable name
              <code>df</code> for our DataFrame because it’s short and common.
            </p>
            <CodeBlock
              code={`import pandas as pd\n\n# A DataFrame with two columns (city and temp_c)\ndf = pd.DataFrame({\n  'city': ['Lagos','Abuja','Kano'],\n  'temp_c': [33, 30, 28],\n})\nprint(type(df))\nprint(type(df['temp_c']))`}
              expected={`<class 'pandas.core.frame.DataFrame'>\n<class 'pandas.core.series.Series'>`}
            />
          </section>

          {/* First tiny look */}
          <section id="first-look" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Your first tiny look</h2>
            <p className="text-gray-700">
              Reading a CSV and peeking at the first few rows is the gentlest way to start. Keep it tiny so your brain
              stays fresh.
            </p>
            <CodeBlock
              code={`import pandas as pd, io\n\n# Pretend this string is a small CSV file\ncsv = io.StringIO("""city,month,temp_c,pm25\nLagos,Jan,33,32\nAbuja,Jan,30,22\nKano,Jan,28,14\n""")\n\ndf = pd.read_csv(csv)\nprint(df.head())`}
              expected={`    city month  temp_c  pm25\n0  Lagos   Jan      33    32\n1  Abuja   Jan      30    22\n2   Kano   Jan      28    14`}
            />
          </section>

          {/* Selecting & filtering */}
          <section id="select-filter" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Selecting & filtering (calmly)</h2>
            <p className="text-gray-700">
              Use square brackets to pick columns, and a simple condition to keep certain rows. Read what you write in
              plain English: “from df, give me rows where temp_c is at least 30, then only show city and temp_c.”
            </p>
            <CodeBlock
              code={`hot = df[df['temp_c'] >= 30]\nprint(hot[['city','temp_c']])`}
              expected={`    city  temp_c\n0  Lagos      33\n1  Abuja      30`}
            />
            <Box tone="tip" title="Labels vs positions">
              <code>df['col']</code> selects a column by its label. When you need row positions, <code>df.iloc</code> is there, but you can
              go far without it.
            </Box>
          </section>

          {/* Cleaning basics */}
          <section id="clean" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Cleaning basics: types & missing</h2>
            <p className="text-gray-700">
              Two simple moves carry you far: make sure numbers are numeric, and choose a gentle rule for missing values
              (drop, fill, or flag). Be consistent and write it down.
            </p>
            <CodeBlock
              code={`# Coerce to numbers (bad strings become NaN)\ndf['pm25'] = pd.to_numeric(df['pm25'], errors='coerce')\n\n# If you had missing values, a common demo rule is the median\ndf['pm25'] = df['pm25'].fillna(df['pm25'].median())\n\nprint(df.dtypes)`}
              expected={`city      object\nmonth     object\ntemp_c     int64\npm25       int64`}
            />
            <Box tone="warn" title="Don’t leak information">
              When you build ML models later, learn your cleaning rules from training data only, then apply them to
              validation/test.
            </Box>
          </section>

          {/* Summaries & groups */}
          <section id="summarize" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Summaries & simple groups</h2>
            <p className="text-gray-700">
              Ask “what is typical?” with <code>describe()</code>, “how many of each?” with <code>value_counts()</code>, and “how do groups
              differ?” with <code>groupby</code>.
            </p>
            <CodeBlock
              code={`print(df.describe(numeric_only=True))\nprint('\nAverage pm25 by city:')\nprint(df.groupby('city')['pm25'].mean())`}
              expected={`       temp_c   pm25\ncount     3.0   3.0\nmean     30.3  22.7\n...\n\nAverage pm25 by city:\ncity\nAbuja    22.0\nKano     14.0\nLagos    32.0\nName: pm25, dtype: float64`}
            />
            <Box tone="pro" title="Pair the number with a peek">
              After a summary, print a tiny slice of matching rows. Numbers + examples build trust fast.
            </Box>
          </section>

          {/* Visualization */}
          <section id="viz" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2"><BarChart3 className="h-5 w-5" /> From table → simple chart</h2>
            <p className="text-gray-700">
              Charts are just summaries you can see. Start with one story per chart. Bars compare categories, lines show
              trends, histograms show shapes. You’ll meet Matplotlib properly soon; here’s a tiny taste.
            </p>
            <CodeBlock
              code={`# Only if you imported matplotlib (runner loads it on demand)\nimport matplotlib.pyplot as plt\n\ncity_means = df.groupby('city')['pm25'].mean()\ncity_means.plot(kind='bar', title='Average PM2.5 by city')\nplt.tight_layout()\nplt.show()`}
              expected={`[A small bar chart: Abuja ~22, Kano ~14, Lagos ~32]`}
            />
          </section>

          {/* Pitfalls */}
          <section id="pitfalls" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">🚨 Common Mistakes to avoid</h2>
            <Box tone="warn" title="String numbers">
              If a numeric column arrives as text (e.g., '42'), math breaks. Use <code>pd.to_numeric(..., errors='coerce')</code>.
            </Box>
            <Box tone="warn" title="Chained assignment">
              Don’t write to a slice like <code>df[df.a &gt; 0]['b'] = ...</code>. Prefer <code>df.loc[df.a &gt; 0, 'b'] = ...</code>.
            </Box>
            <Box tone="tip" title="Sane defaults">
              Print <code>df.shape</code>, <code>df.head()</code>, and <code>df.dtypes</code> after each change. You’ll catch issues early.
            </Box>
          </section>

          {/* Practice */}
          <section id="practice" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Practice (soft prompts)</h2>
            <p className="text-gray-700">
              Load a tiny CSV, peek at the first rows, coerce a column to numbers, fill one missing value sensibly, and
              compute one grouped average. Write down in a sentence what changed and why. That sentence is your data
              diary.
            </p>
          </section>

          {/* Runner (optional) */}
          <section id="runner" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">🏃‍♂️ Try it now (optional)</h2>
            <p className="text-gray-700">You can just read, or you can run tiny experiments below. pandas preloads; Matplotlib loads on demand.</p>
            <PythonRunnerWorker />
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              <QuickLoad
                label="Read tiny CSV"
                code={`import pandas as pd, io\ncsv = io.StringIO("""city,month,temp_c,pm25\nLagos,Jan,33,32\nAbuja,Jan,30,22\nKano,Jan,28,14\n""")\ndf = pd.read_csv(csv)\nprint(df.head())`}
              />
              <QuickLoad
                label="Filter calmly"
                code={`hot = df[df['temp_c'] >= 30]\nprint(hot[['city','temp_c']])`}
              />
              <QuickLoad
                label="Group mean"
                code={`print(df.groupby('city')['pm25'].mean())`}
              />
            </div>
          </section>

          {/* Next steps */}
          <section id="next" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Next steps</h2>
            <p className="text-gray-700">Up next we’ll lean into charts with Matplotlib, then practice a tidy EDA rhythm end‑to‑end.</p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <Link
                href="/course/week-2"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" /> Back to Week 2 Intro
              </Link>
              <div className="flex items-center gap-3">
                <button
                  onClick={markComplete}
                  className={cx('px-4 py-2 rounded-lg border', completed ? 'border-green-200 bg-green-50 text-green-800' : 'border-gray-200 hover:bg-gray-50')}
                >
                  {completed ? 'Completed ✓' : 'Mark Complete'}
                </button>
                <Link
                  href="/course/week-2/matplotlib"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow"
                  onClick={async () => { if (!completed) await markComplete(); }}
                >
                  Go to Matplotlib <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

/* --------------------------- Runner (Web Worker) --------------------------- */
function PythonRunnerWorker() {
  const [initialized, setInitialized] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [code, setCode] = useState<string>(`# You can ignore this and just read the notes.\nprint('Pandas sandbox ready')`);
  const workerRef = useRef<Worker | null>(null);
  const urlRef = useRef<string | null>(null);

  (globalThis as any).__setRunnerCode = (c: string) => setCode(c);

  const ensureWorker = () => {
    if (workerRef.current) return;
    const workerCode = `self.language='python';\nlet pyodideReadyPromise;\nlet ready=false;\nasync function init(){\n  if(!pyodideReadyPromise){\n    importScripts('https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js');\n    pyodideReadyPromise = loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/' });\n  }\n  const py = await pyodideReadyPromise;\n  // Preload pandas so beginners never see ModuleNotFoundError\n  try {\n    postMessage({ type: 'status', data: '[pyodide] Loading pandas…' });\n    await py.loadPackage('pandas');\n    postMessage({ type: 'status', data: '[pyodide] pandas ready' });\n  } catch(e){\n    postMessage({ type: 'stderr', data: String(e) });\n  }\n  py.setStdout({ batched: (s) => postMessage({ type: 'stdout', data: s }) });\n  py.setStderr({ batched: (s) => postMessage({ type: 'stderr', data: s }) });\n  return py;\n}\nself.onmessage = async (e) => {\n  const { type, code } = e.data || {};\n  try {\n    if (type === 'init'){\n      await init();\n      ready=true;\n      postMessage({ type: 'ready' });\n    } else if (type === 'run'){\n      const py = await (ready ? pyodideReadyPromise : init());\n      ready=true;\n      if ((code||'').includes('matplotlib')){\n        try {\n          postMessage({ type: 'status', data: '[pyodide] Loading matplotlib…' });\n          await py.loadPackage('matplotlib');\n          postMessage({ type: 'status', data: '[pyodide] matplotlib ready' });\n        } catch(e){ postMessage({ type: 'stderr', data: String(e) }); }\n      }\n      let result = await py.runPythonAsync(code);\n      postMessage({ type: 'result', data: String(result ?? '') });\n    }\n  } catch (err){\n    postMessage({ type: 'error', data: String(err) });\n  }\n};`;
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    urlRef.current = url;
    workerRef.current = new Worker(url);
    workerRef.current.onmessage = (e: MessageEvent) => {
      const { type, data } = (e as any).data || {};
      if (type === 'ready') {
        setInitialized(true);
        setInitializing(false);
        setOutput('[python] ready\nTip: Click Run to execute the code.');
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
        <pre className="w-full min-h-[160px] rounded-xl border border-gray-200 p-3 text-sm bg-gray-50 overflow-auto whitespace-pre-wrap" aria-live="polite">{output}</pre>
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
