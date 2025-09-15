'use client'

// ---------------------------------------------------------------------------
// Week 2 — Cleaning (types • missing • duplicates • dates • text • sanity checks)
// Simplified for beginners: fewer moving parts, clearer words, tiny code only.
// ---------------------------------------------------------------------------

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  Menu, X, ChevronLeft, ChevronRight, Sparkles, Lightbulb, AlertTriangle,
  Eraser, ListChecks, Type, CalendarClock, Replace, CheckCircle2, ClipboardCheck,
  Home
} from 'lucide-react'

const PROGRESS_KEY = 'week-2:cleaning'

const SECTIONS = [
  { id: 'welcome',    label: 'Welcome' },
  { id: 'dataset',    label: 'Sample dataset' },
  { id: 'types',      label: '1) Fix types (numbers & dates)' },
  { id: 'missing',    label: '2) Missing values' },
  { id: 'duplicates', label: '3) Duplicates' },
  { id: 'text',       label: '4) Text normalization' },
  { id: 'cats',       label: '5) Categories (optional)' },
  { id: 'sanity',     label: '6) Sanity checks' },
  { id: 'practice',   label: 'Practice (micro‑quests)' },
  { id: 'next',       label: 'Next steps' },
]

// ---------- Tiny UI helpers ----------
function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ')
}

function Box({
  tone, title, children,
}: {
  tone: 'tip' | 'warn' | 'pro'
  title: string
  children: any
}) {
  const palette = {
    tip:  'border-emerald-200 bg-emerald-50 text-emerald-900',
    warn: 'border-amber-200 bg-amber-50 text-amber-900',
    pro:  'border-sky-200 bg-sky-50 text-sky-900',
  }[tone]
  const icon =
    tone === 'tip'  ? <Lightbulb className="h-4 w-4" /> :
    tone === 'warn' ? <AlertTriangle className="h-4 w-4" /> :
                      <Sparkles className="h-4 w-4" />
  return (
    <div className={cx('rounded-xl border p-3 md:p-4 flex gap-3 items-start', palette)}>
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <div className="font-medium mb-1">{title}</div>
        <div className="text-sm md:text-[0.95rem] leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

function CodeBlock({ code, expected, label = 'Python (pandas)' }: { code: string; expected?: string; label?: string }) {
  return (
    <div className="space-y-2">
      <div className="px-3 py-1.5 bg-gray-50 text-xs text-gray-600 rounded-t-lg border border-b-0 border-gray-200">{label}</div>
      <pre className="bg-white border border-gray-200 rounded-b-lg p-3 text-sm whitespace-pre-wrap">{code}</pre>
      {expected && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-900">
          <strong>Expected output (approx):</strong>
          <pre className="whitespace-pre-wrap mt-1">{expected}</pre>
        </div>
      )}
    </div>
  )
}

function TinyTable({ headers, rows }: { headers: string[]; rows: (string | number | null)[][] }) {
  return (
    <div className="overflow-auto rounded-xl border border-gray-200">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2 text-left font-semibold text-gray-700">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="odd:bg-white even:bg-gray-50">
              {r.map((c, j) => (
                <td key={j} className="px-3 py-2 text-gray-700 whitespace-nowrap">{String(c)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ---------- Sample dataset (intentionally a bit messy) ----------
const SAMPLE_ROWS: (string | number | null)[][] = [
  // city,  month, temp_c, humidity, pm25,   date
  ['lagos', 'Jan', '33',   '78',     32,     '2024-01-15'],
  ['Lagos', 'Feb', '34',   '76',     '30',   '2024/02/15'],
  ['Lagos', 'Mar', '33',   '80',     '41',   '15-03-2024'],
  ['abuja', 'Jan',  30,    '40',     22,     '2024-01-10'],
  ['Abuja', 'Feb', '31',   45,       '24',   '2024-02-10'],
  ['Abuja', 'Mar',  32,    42,       19,     '2024-03-10'],
  ['Kano',  'Jan', '28',   25,       14,     '2024-01-08'],
  ['Kano',  'Feb',  29,    '27',     null,   '2024-02-08'], // NA pm25
  ['Kano',  'Feb',  29,    '27',     null,   '2024-02-08'], // duplicate row
  ['Kano',  'Mar',  '31',  30,       18,     '03/15/2024'],
]

export default function Week2CleaningPage() {
  const [user, setUser] = useState<any>(null)
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeId, setActiveId] = useState(SECTIONS[0].id)

  // Force light theme (same as other pages)
  useEffect(() => {
    try {
      const el = document.documentElement
      el.classList.remove('dark')
      el.style.colorScheme = 'light'
      ;['theme','color-theme','ui-theme','next-theme','chakra-ui-color-mode','mantine-color-scheme'].forEach(k => {
        if (localStorage.getItem(k) !== 'light') localStorage.setItem(k, 'light')
      })
      if (localStorage.getItem('darkMode') === 'true') localStorage.setItem('darkMode', 'false')
    } catch {}
  }, [])

  // Load user + progress (kept minimal)
  useEffect(() => {
    const run = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user ?? null)
      if (user) {
        const { data } = await supabase
          .from('tracking')
          .select('completed')
          .eq('user_id', user.id)
          .eq('key', PROGRESS_KEY)
          .maybeSingle()
        setCompleted(Boolean(data?.completed))
      }
      setLoading(false)
    }
    run()
  }, [])

  const markComplete = async () => {
    if (!user) return alert('Please sign in to save your progress.')
    const { error } = await supabase
      .from('tracking')
      .upsert(
        { user_id: user.id, key: PROGRESS_KEY, completed: true, completed_at: new Date().toISOString() },
        { onConflict: 'user_id,key' },
      )
    if (error) alert('Could not save progress.')
    else setCompleted(true)
  }

  // Scrollspy (simple)
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('main section[id]'))
    if (!sections.length) return
    const observer = new IntersectionObserver((entries) => {
      const top = entries.find((e) => e.isIntersecting)
      if (top) setActiveId((top.target as HTMLElement).id)
    }, { root: null, rootMargin: '-112px 0px -55% 0px' })
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

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
                Week 2 · Cleaning
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
        <aside className={cx('lg:sticky lg:top-[72px] lg:h-[calc(100vh-88px)] lg:overflow-auto','rounded-2xl border border-gray-200 bg-white p-4 shadow-sm', sidebarOpen ? '' : 'hidden lg:block')}>
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">On this page</p>
          <nav className="space-y-1">
            {SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`} onClick={() => setSidebarOpen(false)} aria-current={activeId === s.id ? 'page' : undefined}
                 className={cx('block px-3 py-2 rounded-lg text-sm transition-colors', activeId === s.id ? 'bg-green-50 text-green-800' : 'hover:bg-gray-50 text-gray-700')}>
                {s.label}
              </a>
            ))}
          </nav>
          <div className="mt-6 p-3 rounded-xl bg-gray-50 text-xs text-gray-600">
            Clean a little → look → clean a little. Write down what changed and why.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-10">
          {/* Welcome */}
          <section id="welcome" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Make the table trustworthy</h1>
            <p className="text-gray-700 mt-2">
              Cleaning is turning a messy table into a reliable one. We’ll do six tiny, repeatable steps: fix types, handle
              missing values, remove duplicates, normalize text, (optionally) make categories, and run sanity checks.
              Each snippet shows a small change and the expected result.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <span>Mark complete when these patterns feel comfy.</span>
            </div>
          </section>

          {/* Dataset */}
          <section id="dataset" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2"><ListChecks className="h-5 w-5" /> Sample dataset (intentionally messy)</h2>
            <TinyTable headers={['city','month','temp_c','humidity','pm25','date']} rows={SAMPLE_ROWS as any} />
            <Box tone="tip" title="Workflow in one glance">
              1) Confirm <strong>shape</strong>, <strong>columns</strong>, <strong>dtypes</strong>. 2) Types → Missing → Duplicates → Text → (Optional) Categories → Sanity checks.
            </Box>
          </section>

          {/* Types */}
          <section id="types" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Type className="h-5 w-5" /> 1) Fix types (numbers & dates)</h2>
            <p className="text-gray-700">Numbers should be numeric, dates should be real timestamps. If parsing fails, coerce bad values to <code>NaN</code> so the code doesn’t crash.</p>
            <CodeBlock
              code={`import pandas as pd, io
csv = """city,month,temp_c,humidity,pm25,date
lagos,Jan,33,78,32,2024-01-15
Lagos,Feb,34,76,30,2024/02/15
Lagos,Mar,33,80,41,15-03-2024
abuja,Jan,30,40,22,2024-01-10
Abuja,Feb,31,45,24,2024-02-10
Abuja,Mar,32,42,19,2024-03-10
Kano,Jan,28,25,14,2024-01-08
Kano,Feb,29,27,,2024-02-08
Kano,Feb,29,27,,2024-02-08
Kano,Mar,31,30,18,03/15/2024"""
df = pd.read_csv(io.StringIO(csv))

# Make numeric columns actually numeric
for col in ['temp_c','humidity','pm25']:
    df[col] = pd.to_numeric(df[col], errors='coerce')

# Parse mixed date formats safely
df['date'] = pd.to_datetime(df['date'], errors='coerce', dayfirst=True)

print(df.dtypes)`}
              expected={`city             object
month            object
temp_c          float64
humidity        float64
pm25            float64
date     datetime64[ns]`}
            />
            <Box tone="warn" title="Why 'coerce'?">
              It converts bad strings to <code>NaN</code> instead of throwing an error. You can handle <code>NaN</code> on the next step.
            </Box>
          </section>

          {/* Missing */}
          <section id="missing" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Eraser className="h-5 w-5" /> 2) Missing values</h2>
            <p className="text-gray-700">Count first. Then choose a simple, per‑column policy. Don’t overthink it on day one.</p>
            <CodeBlock
              code={`# 1) Count missing per column
print(df.isna().sum())

# 2) Fill numeric example: median
pm25_median = df['pm25'].median()
df['pm25'] = df['pm25'].fillna(pm25_median)

# 3) Drop rows if critical columns are still missing (demo)
before = len(df)
df = df.dropna(subset=['temp_c','humidity','date'])
print('Dropped rows:', before - len(df))`}
              expected={`Column-by-column missing counts, then 'Dropped rows: 0' or '1' depending on date parsing.`}
            />
            <Box tone="pro" title="Guidelines">
              Numeric → median/mean. Categorical → most frequent or "Unknown". Dates → impute carefully or drop.
            </Box>
          </section>

          {/* Duplicates */}
          <section id="duplicates" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><ListChecks className="h-5 w-5" /> 3) Duplicates</h2>
            <p className="text-gray-700">Remove exact duplicates; for near‑duplicates, normalize text first (next step) and dedupe again.</p>
            <CodeBlock
              code={`print('Exact duplicate rows:', df.duplicated().sum())
df = df.drop_duplicates().reset_index(drop=True)
print('Shape after dedupe:', df.shape)`}
              expected={`Exact duplicate rows: 1\nShape after dedupe: (9, 6)`}
            />
          </section>

          {/* Text normalization */}
          <section id="text" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Replace className="h-5 w-5" /> 4) Text normalization</h2>
            <p className="text-gray-700">Small, consistent strings beat messy, inconsistent ones. Trim spaces and standardize casing.</p>
            <CodeBlock
              code={`df['city']  = df['city'].astype(str).str.strip().str.title()
df['month'] = df['month'].astype(str).str.strip().str.title()

valid_months = ['Jan','Feb','Mar']
print('Bad month rows:', (~df['month'].isin(valid_months)).sum())
print(df[['city','month']].drop_duplicates().sort_values(['city','month']).head())`}
              expected={`Bad month rows: 0\nA tidy list of distinct (city, month) pairs.`}
            />
            <Box tone="warn" title="Avoid chained assignment">
              Prefer <code>df.loc[mask, 'col'] = ...</code> over <code>df[mask]['col'] = ...</code> to prevent surprises.
            </Box>
          </section>

          {/* Categories (optional) */}
          <section id="cats" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Type className="h-5 w-5" /> 5) Categories (optional)</h2>
            <p className="text-gray-700">Turn text columns with a small set of values into categories. Keep the human‑readable table for EDA; encode only before modeling.</p>
            <CodeBlock
              code={`df['city'] = df['city'].astype('category')
print(df['city'].cat.categories)`}
              expected={`Index(['Abuja', 'Kano', 'Lagos'], dtype='object') (or similar)`}
            />
          </section>

          {/* Sanity checks */}
          <section id="sanity" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><CalendarClock className="h-5 w-5" /> 6) Sanity checks</h2>
            <p className="text-gray-700">Quick rules catch obvious errors. If a rule fails, print those rows and investigate—don’t auto‑delete blindly.</p>
            <CodeBlock
              code={`assert df['temp_c'].between(-50, 60).all()
assert df['humidity'].between(0,100).all()
assert df['pm25'].ge(0).all()
print('All sanity checks passed.')`}
              expected={`All sanity checks passed.`}
            />
          </section>

          
          {/* Practice */}
          <section id="practice" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold flex items-center gap-2"><ClipboardCheck className="h-5 w-5" /> Practice (micro‑quests)</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Coerce <code>temp_c</code>, <code>humidity</code>, <code>pm25</code> to numeric; parse <code>date</code> with mixed formats.</li>
              <li>Fill missing <code>pm25</code> with the median and state your reason in a comment.</li>
              <li>Normalize city names (trim + title case), then remove duplicates again.</li>
              <li>Write three sanity checks that make sense for your domain.</li>
            </ul>
            <Box tone="tip" title="Cleaning log">
              Keep a short note of what you changed, how many rows were affected, and why. Future‑you will cheer.
            </Box>
          </section>

          {/* Next */}
          <section id="next" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Next steps</h2>
            <p className="text-gray-700">Great! Your table is trustworthy. Next up: <strong>Test your</strong> understanding.</p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <Link href="/course/week-2/matplotlib" className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                <ChevronLeft className="h-4 w-4" /> Back to Matplotlib
              </Link>
              <div className="flex items-center gap-3">
                <button onClick={markComplete} className={cx('px-4 py-2 rounded-lg border', completed ? 'border-green-200 bg-green-50 text-green-800' : 'border-gray-200 hover:bg-gray-50')}>
                  {completed ? 'Completed ✓' : 'Mark Complete'}
                </button>
                <Link href="/course/week-2/wrap-up" className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow">
                  Wrap‑up <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

// --------------------------- Pyodide Runner (minimal) ---------------------------
function PythonRunnerWorker() {
  const [initialized, setInitialized] = useState(false)
  const [initializing, setInitializing] = useState(false)
  const [running, setRunning] = useState(false)
  const [output, setOutput] = useState<string>('')
  const [code, setCode] = useState<string>(`# Paste a snippet from this page and press Run.\nprint('Sandbox ready')`)
  const workerRef = useRef<Worker | null>(null)
  const urlRef = useRef<string | null>(null)

  const ensureWorker = () => {
    if (workerRef.current) return
    const workerCode = `
self.language='python';
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
      // Light auto-load: if user imports pandas, make it available
      if (typeof code === 'string' && /\\bimport\\s+pandas\\b/.test(code)) {
        try { await self.pyodide.loadPackage('pandas'); } catch(e) {}
      }
      let result = await self.pyodide.runPythonAsync(code);
      postMessage({ type: 'result', data: String(result ?? '') });
    }
  } catch (err){
    postMessage({ type: 'error', data: String(err) });
  }
};`
    const blob = new Blob([workerCode], { type: 'application/javascript' })
    const url = URL.createObjectURL(blob)
    urlRef.current = url
    workerRef.current = new Worker(url)
    workerRef.current.onmessage = (e: MessageEvent) => {
      const { type, data } = (e as any).data || {}
      if (type === 'ready') {
        setInitialized(true)
        setInitializing(false)
        setOutput('[python] ready\nTip: paste a snippet from above and press Run.')
      } else if (type === 'stdout') {
        setOutput((o) => o + String(data))
      } else if (type === 'stderr') {
        setOutput((o) => o + String(data))
      } else if (type === 'result') {
        setRunning(false)
        if (data) setOutput((o) => o + (o.endsWith('\n') ? '' : '\n') + String(data) + '\nDone. ✅')
        else setOutput((o) => o + (o.endsWith('\n') ? '' : '\n') + 'Done. ✅')
      } else if (type === 'error') {
        setRunning(false)
        setOutput((o) => o + (o.endsWith('\n') ? '' : '\n') + '⚠️ ' + String(data))
      }
    }
  }

  useEffect(() => () => {
    if (workerRef.current) workerRef.current.terminate()
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
  }, [])

  const init = () => {
    ensureWorker()
    if (!initialized && workerRef.current && !initializing) {
      setInitializing(true)
      setOutput('Loading Python… this runs in your browser.')
      workerRef.current.postMessage({ type: 'init' })
    }
  }

  const run = () => {
    ensureWorker()
    if (!initialized || !workerRef.current) return
    setRunning(true)
    setOutput('')
    workerRef.current.postMessage({ type: 'run', code })
  }

  const resetConsole = () => setOutput('')

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
        <div className="text-sm text-gray-600">Interactive Python (pandas‑friendly)</div>
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
      />
      <div className="mt-3">
        <div className="text-sm font-medium mb-1">Console</div>
        <pre className="w-full min-h-[160px] rounded-xl border border-gray-200 p-3 text-sm bg-gray-50 overflow-auto whitespace-pre-wrap">
          {output}
        </pre>
      </div>
    </div>
  )
}
