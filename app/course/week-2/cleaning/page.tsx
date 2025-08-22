'use client'

// ---------------------------------------------------------------------------
// Week 2 — Cleaning (types • missing • duplicates • dates • text • sanity checks)
// ---------------------------------------------------------------------------
// - Clear, step-by-step patterns with “Expected output” previews
// - Recharts mini-visuals for missing counts & duplicates
// - Optional Pyodide runner (auto-loads pandas; no matplotlib rendering here)
// - Supabase tracking preserved; Prev → Matplotlib, Next → EDA Patterns
// ---------------------------------------------------------------------------

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  Menu, X, ChevronLeft, ChevronRight, Sparkles, Lightbulb, AlertTriangle,
  Eraser, ListChecks, Type, CalendarClock, Replace, CheckCircle2, ClipboardCheck
} from 'lucide-react'

// Recharts (tiny visuals to “see” the cleaning effect)
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'

const PROGRESS_KEY = 'week-2:cleaning'

const SECTIONS = [
  { id: 'welcome',    label: 'Welcome' },
  { id: 'dataset',    label: 'Sample dataset' },
  { id: 'types',      label: '1) Fix types (numbers/dates)' },
  { id: 'missing',    label: '2) Missing values' },
  { id: 'duplicates', label: '3) Duplicates' },
  { id: 'text',       label: '4) Text normalization' },
  { id: 'cats',       label: '5) Categories (safe encoding basics)' },
  { id: 'scales',     label: '6) Scales (normalize when needed)' },
  { id: 'sanity',     label: '7) Sanity checks' },
  { id: 'runner',     label: '🏃 Optional: try pandas' },
  { id: 'practice',   label: 'Practice (micro-quests)' },
  { id: 'next',       label: 'Next steps' },
]

// ---------- UI helpers ----------
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

function CodeBlock({
  code, expected, label = 'Python (pandas)',
}: {
  code: string
  expected?: string
  label?: string
}) {
  return (
    <div className="space-y-2">
      <div className="px-3 py-1.5 bg-gray-50 text-xs text-gray-600 rounded-t-lg border border-b-0 border-gray-200">
        {label}
      </div>
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

function TinyTable({
  headers, rows,
}: {
  headers: string[]
  rows: (string | number | null)[][]
}) {
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
const SAMPLE_ROWS = [
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

// ---------- Page ----------
export default function Week2CleaningPage() {
  const [user, setUser] = useState<any>(null)
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeId, setActiveId] = useState(SECTIONS[0].id)

  // Recharts helpers (derive small visuals from the messy table)
  const messyData = useMemo(() => {
    // convert to objects
    return SAMPLE_ROWS.map(([city, month, temp_c, humidity, pm25, date]) => ({
      city: String(city),
      month: String(month),
      temp_c,
      humidity,
      pm25,
      date: String(date),
    }))
  }, [])

  const missingCounts = useMemo(() => {
    const keys = ['city', 'month', 'temp_c', 'humidity', 'pm25', 'date'] as const
    const counts: Record<string, number> = {}
    keys.forEach(k => counts[k] = 0)
    messyData.forEach(d => {
      keys.forEach(k => {
        const v: any = (d as any)[k]
        if (v === null || v === undefined || v === '') counts[k]++
      })
    })
    return keys.map(k => ({ column: k, missing: counts[k] }))
  }, [messyData])

  const duplicateCount = useMemo(() => {
    const seen = new Set<string>()
    let dup = 0
    messyData.forEach(d => {
      const key = JSON.stringify(d)
      if (seen.has(key)) dup++
      else seen.add(key)
    })
    return [{ kind: 'exact duplicates', count: dup }]
  }, [messyData])

  // Load user + progress
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
        {
          user_id: user.id,
          key: PROGRESS_KEY,
          completed: true,
          completed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,key' },
      )
    if (error) {
      console.error(error)
      alert('Could not save progress.')
    } else {
      setCompleted(true)
    }
  }

  // Scrollspy
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('main section[id]'))
    if (!sections.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setActiveId((visible[0].target as HTMLElement).id)
      },
      { root: null, rootMargin: '-112px 0px -55% 0px', threshold: [0.1, 0.25, 0.5, 0.75, 1] },
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-100 backdrop-blur bg-white/70">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-bold">Week 2 • Cleaning</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <button
              className="lg:hidden inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200"
              onClick={() => setSidebarOpen((v) => !v)}
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />} Contents
            </button>
            <span>{loading ? 'Loading…' : user ? 'Signed in' : <Link className="underline" href="/signin">Sign in</Link>}</span>
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
            sidebarOpen ? '' : 'hidden lg:block',
          )}
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
                  activeId === s.id ? 'bg-green-50 text-green-800' : 'hover:bg-gray-50 text-gray-700',
                )}
              >
                {s.label}
              </a>
            ))}
          </nav>
          <div className="mt-6 p-3 rounded-xl bg-gray-50 text-xs text-gray-600">
            Clean a little → look → clean a little. Document what you changed and why.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-10">
          {/* Welcome */}
          <section id="welcome" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Make the table trustworthy</h1>
            <p className="text-gray-700 mt-2">
              We’ll fix types, handle missing values, dedupe, normalize text, parse dates, then do quick sanity checks.
              Each pattern is tiny and repeatable. You’ll see “Expected output” after every snippet.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <span>Mark complete when these patterns feel comfy.</span>
            </div>
          </section>

          {/* Dataset */}
          <section id="dataset" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2"><ListChecks className="h-5 w-5" /> Sample dataset (intentionally messy)</h2>
            <TinyTable
              headers={['city','month','temp_c','humidity','pm25','date']}
              rows={SAMPLE_ROWS as any}
            />
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-200 bg-white p-3">
                <div className="text-sm font-medium mb-2">Missing values per column</div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={missingCounts} margin={{ top: 4, right: 12, bottom: 8, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="column" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="missing" name="Missing" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-3">
                <div className="text-sm font-medium mb-2">Duplicates overview</div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={duplicateCount} margin={{ top: 4, right: 12, bottom: 8, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="kind" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <Box tone="tip" title="Workflow">
              Confirm <strong>shape</strong>, <strong>columns</strong>, <strong>dtypes</strong>. Then fix types → missing → duplicates → text → dates.
            </Box>
          </section>

          {/* Types */}
          <section id="types" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Type className="h-5 w-5" /> 1) Fix types (numbers/dates)</h2>
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

# Coerce numerics
for col in ['temp_c','humidity','pm25']:
    df[col] = pd.to_numeric(df[col], errors='coerce')

# Parse dates with mixed formats
df['date'] = pd.to_datetime(df['date'], errors='coerce', dayfirst=True)

print(df.dtypes)`}
              expected={`city             object
month            object
temp_c          float64
humidity        float64
pm25            float64
date     datetime64[ns]`}
            />
            <Box tone="warn" title="Don’t fail on bad values">
              Use <code>errors='coerce'</code> so unexpected strings become <code>NaN</code> instead of crashing.
            </Box>
          </section>

          {/* Missing */}
          <section id="missing" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Eraser className="h-5 w-5" /> 2) Missing values</h2>
            <CodeBlock
              code={`# 1) Count missing per column
print(df.isna().sum())

# 2) Simple fill example (numeric): use median
df['pm25'] = df['pm25'].fillna(df['pm25'].median())

# 3) If missing still remain in critical columns, drop rows (demo)
before = df.shape[0]
df = df.dropna(subset=['temp_c','humidity','date'])
after = df.shape[0]
print('Dropped rows:', before - after)

print(df.head(3))`}
              expected={`Missing counts printed; pm25 filled with its median.
'Dropped rows: 0 or 1' depending on parsed dates.
Head shows complete rows.`}
            />
            <Box tone="pro" title="Choose per-column policy">
              Numeric: median/mean; Categorical: mode or “Unknown”; Dates: impute strategically or drop. Note your choice.
            </Box>
          </section>

          {/* Duplicates */}
          <section id="duplicates" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><ListChecks className="h-5 w-5" /> 3) Duplicates</h2>
            <CodeBlock
              code={`dups = df.duplicated().sum()
print('Exact duplicate rows:', dups)

# Remove exact duplicates
df = df.drop_duplicates().reset_index(drop=True)
print('Shape after dedupe:', df.shape)`}
              expected={`Exact duplicate rows: 1
Shape after dedupe: (9, 6)  # example`}
            />
            <Box tone="tip" title="Near-duplicates">
              Sometimes duplicates differ by whitespace/casing. Normalize text first, then dedupe again.
            </Box>
          </section>

          {/* Text normalization */}
          <section id="text" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Replace className="h-5 w-5" /> 4) Text normalization</h2>
            <CodeBlock
              code={`# Strip spaces, fix casing
df['city']  = df['city'].astype(str).str.strip().str.title()
df['month'] = df['month'].astype(str).str.strip().str.title()

# Validate allowed values
valid_months = ['Jan','Feb','Mar']
bad = df[~df['month'].isin(valid_months)]
print('Bad month rows:', len(bad))

print(df[['city','month']].drop_duplicates().sort_values(['city','month']).head())`}
              expected={`Bad month rows: 0
Distinct (city, month) pairs printed with consistent casing.`}
            />
            <Box tone="warn" title="Chained assignment">
              Use <code>df.loc[mask, 'col'] = ...</code> when conditional editing; avoid <code>df[mask]['col']=...</code>.
            </Box>
          </section>

          {/* Categories */}
          <section id="cats" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Type className="h-5 w-5" /> 5) Categories (safe encoding basics)</h2>
            <CodeBlock
              code={`# Make 'city' a category dtype (memory + clarity)
df['city'] = df['city'].astype('category')

# Safe one-hot (drop_first to avoid perfect collinearity)
dummies = pd.get_dummies(df['city'], prefix='city', drop_first=True)
clean = pd.concat([df.drop(columns=['city']), dummies], axis=1)
print(clean.head())`}
              expected={`Original columns plus city dummy columns (e.g., city_Kano, city_Lagos).`}
            />
            <Box tone="tip" title="When to encode">
              Only encode just before modeling. Keep a human-readable version for EDA.
            </Box>
          </section>

          {/* Scales */}
          <section id="scales" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Type className="h-5 w-5" /> 6) Scales (normalize when needed)</h2>
            <CodeBlock
              code={`# Min-max scale example (demo). In real pipelines, use sklearn scalers.
for col in ['temp_c','humidity','pm25']:
    col_min, col_max = clean[col].min(), clean[col].max()
    clean[col + '_01'] = (clean[col] - col_min) / (col_max - col_min)

print(clean[['temp_c_01','humidity_01','pm25_01']].head(3))`}
              expected={`Columns with values between 0 and 1 (per column).`}
            />
            <Box tone="pro" title="Do not leak">
              Fit scalers on train; apply to val/test. Keep the parameters (min/max or mean/std).
            </Box>
          </section>

          {/* Sanity checks */}
          <section id="sanity" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><CalendarClock className="h-5 w-5" /> 7) Sanity checks</h2>
            <CodeBlock
              code={`# Example sanity rules (adapt to domain)
assert clean['temp_c'].between(-50, 60).all()
assert clean['humidity'].between(0,100).all()
assert clean['pm25'].ge(0).all()

# Monotonic month order for each city (if needed)
order = {'Jan':1, 'Feb':2, 'Mar':3}
clean['month_idx'] = clean['month'].map(order)
print(clean.sort_values(['city_Kano','city_Lagos','month_idx']).head())`}
              expected={`No assertion errors if values are within bounds; data sorted with a month index.`}
            />
            <Box tone="warn" title="Investigate, don’t auto-delete">
              If a rule fails, print rows, confirm whether it’s a real rare case or a bad record.
            </Box>
          </section>

          {/* Runner */}
          <section id="runner" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">🏃 Optional: try pandas (Pyodide)</h2>
            <p className="text-gray-700">
              The sandbox auto-loads <em>pandas</em> if you import it. Keep snippets small; plotting belongs in your local notebook.
            </p>
            <PythonRunnerWorker defaultCode={`import pandas as pd, io
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
for col in ['temp_c','humidity','pm25']:
    df[col] = pd.to_numeric(df[col], errors='coerce')
df['date'] = pd.to_datetime(df['date'], errors='coerce', dayfirst=True)
print('shape:', df.shape); print(df.dtypes); print(df.head())`} />
          </section>

          {/* Practice */}
          <section id="practice" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold flex items-center gap-2"><ClipboardCheck className="h-5 w-5" /> Practice (micro-quests)</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Coerce <code>temp_c</code>, <code>humidity</code>, <code>pm25</code> to numeric; parse <code>date</code> safely.</li>
              <li>Fill missing <code>pm25</code> with median; justify why median makes sense here.</li>
              <li>Normalize city names (trim, title case), then remove duplicates.</li>
              <li>Create a month index (<code>Jan=1</code>, <code>Feb=2</code>, …) and sort by it.</li>
              <li>Write 3 sanity checks for your own domain (bounds, monotonicity, allowed sets).</li>
            </ul>
            <Box tone="tip" title="Notebook habit">
              Keep a “Cleaning Log” cell: what changed, how many rows affected, and why.
            </Box>
          </section>

          {/* Next */}
          <section id="next" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Next steps</h2>
            <p className="text-gray-700">
              Your table is trustworthy. Next: <strong>Wrap-up</strong>, a summary of your progress.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <Link
                href="/course/week-2/matplotlib"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" /> Back to Matplotlib
              </Link>
              <div className="flex items-center gap-3">
                <button
                  onClick={markComplete}
                  className={cx(
                    'px-4 py-2 rounded-lg border',
                    completed ? 'border-green-200 bg-green-50 text-green-800' : 'border-gray-200 hover:bg-gray-50',
                  )}
                >
                  {completed ? 'Completed ✓' : 'Mark Complete'}
                </button>
                <Link
                  href="/course/week-2/wrap-up"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow"
                >
                  Wrap-up <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

/* --------------------------- Pyodide Runner --------------------------- */
/* Auto-loads pandas if imported. Kept minimal and stable (no matplotlib render). */
function PythonRunnerWorker({ defaultCode }: { defaultCode?: string }) {
  const [initialized, setInitialized] = useState(false)
  const [initializing, setInitializing] = useState(false)
  const [running, setRunning] = useState(false)
  const [output, setOutput] = useState<string>('')
  const [code, setCode] = useState<string>(defaultCode || `# Edit and run.\nprint("Cleaning sandbox ready")`)
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
      if (typeof code === 'string' && /\\bimport\\s+pandas\\b/.test(code)) {
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
        setOutput('[python] ready\nTip: write a few lines and press Run.')
      } else if (type === 'status') {
        setOutput((o) => o + (o.endsWith('\n') ? '' : '\n') + String(data))
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

  useEffect(() => {
    return () => {
      if (workerRef.current) workerRef.current.terminate()
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    }
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
        <div className="text-sm text-gray-600">Interactive Python (auto-pandas)</div>
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
  )
}
