'use client'

// ---------------------------------------------------------------------------
// Week 2 — Matplotlib (visuals via Recharts + Matplotlib code samples)
// ---------------------------------------------------------------------------
// - Recharts gives live, interactive visuals on the page (no Python needed).
// - Matplotlib code is shown with “Expected output” so learners can mirror it
//   in notebooks later.
// - Optional Pyodide runner auto-loads *pandas* and runs safely in-browser.
// - Supabase progress tracking preserved. Next → Cleaning.
// ---------------------------------------------------------------------------

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  Menu, X, ChevronLeft, ChevronRight, Sparkles, Lightbulb, AlertTriangle,
  BarChart3, LineChart as LcIcon, ScatterChart as ScIcon, LayoutGrid, Ruler,
  CheckCircle2
} from 'lucide-react'

// 🟢 Recharts (for on-page visuals)
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'

const PROGRESS_KEY = 'week-2:matplotlib'

const SECTIONS = [
  { id: 'welcome',    label: 'Welcome' },
  { id: 'setup',      label: 'Setup & tiny data' },
  { id: 'thinking',   label: 'Chart thinking (pick first)' },
  { id: 'bar',        label: 'Bar (compare categories)' },
  { id: 'line',       label: 'Line (time/trend)' },
  { id: 'hist',       label: 'Histogram (distribution)' },
  { id: 'scatter',    label: 'Scatter (relationship)' },
  { id: 'layout',     label: 'Figure size, titles, labels' },
  { id: 'style',      label: 'Styling (labels, ticks, grid)' },
  { id: 'runner',     label: '🏃 Optional: try pandas' },
  { id: 'pitfalls',   label: '🚨 Mistake prevention' },
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
  code, expected, label = 'Python (Matplotlib)',
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
          <strong>Expected output (what you should see):</strong>
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
  rows: (string | number)[][]
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
                <td key={j} className="px-3 py-2 text-gray-700 whitespace-nowrap">{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Same tiny dataset as your Pandas page (familiarity helps)
const SAMPLE_ROWS = [
  ['Lagos', 'Jan', 33, 78, 32],
  ['Lagos', 'Feb', 34, 76, 30],
  ['Lagos', 'Mar', 33, 80, 41],
  ['Abuja', 'Jan', 30, 40, 22],
  ['Abuja', 'Feb', 31, 45, 24],
  ['Abuja', 'Mar', 32, 42, 19],
  ['Kano',  'Jan', 28, 25, 14],
  ['Kano',  'Feb', 29, 27, 17],
  ['Kano',  'Mar', 31, 30, 18],
]

// ---------- Page ----------
export default function Week2MatplotlibPage() {
  const [user, setUser] = useState<any>(null)
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeId, setActiveId] = useState(SECTIONS[0].id)

  // Transform sample rows for Recharts
  const data = useMemo(() => {
    return SAMPLE_ROWS.map(([city, month, temp_c, humidity, pm25]) => ({
      city: city as string,
      month: month as string,
      temp_c: temp_c as number,
      humidity: humidity as number,
      pm25: pm25 as number,
      city_month: `${city}-${month}`,
    }))
  }, [])

  const monthOrder = ['Jan', 'Feb', 'Mar']

  // Aggregates for visuals
  const pm25AvgByCity = useMemo(() => {
    const by: Record<string, { sum: number, n: number }> = {}
    data.forEach(d => {
      by[d.city] ||= { sum: 0, n: 0 }
      by[d.city].sum += d.pm25
      by[d.city].n += 1
    })
    return Object.entries(by).map(([city, { sum, n }]) => ({ city, pm25: +(sum / n).toFixed(2) }))
  }, [data])

  const pm25ByMonthForCity = useMemo(() => {
    const by: Record<string, { month: string, pm25: number }[]> = {}
    data.forEach(d => {
      by[d.city] ||= []
      by[d.city].push({ month: d.month, pm25: d.pm25 })
    })
    // order months
    Object.keys(by).forEach(c => {
      by[c].sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month))
    })
    return by
  }, [data])

  // Histogram bins for temp_c
  const histBins = useMemo(() => {
    const values = data.map(d => d.temp_c)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const bins = 5
    const width = (max - min) / bins
    const counts = Array.from({ length: bins }, (_, i) => {
      const start = min + i * width
      const end = i === bins - 1 ? max : start + width
      const label = `${Math.round(start)}–${Math.round(end)}`
      const count = values.filter(v => (i === bins - 1 ? v >= start && v <= end : v >= start && v < end)).length
      return { bin: label, count }
    })
    return counts
  }, [data])

  // Scatter data
  const scatterData = useMemo(() => data.map(d => ({ x: d.temp_c, y: d.pm25, city: d.city })), [data])

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
            <span className="font-bold">Week 2 • Matplotlib (visuals powered by Recharts)</span>
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
            One story per chart. Clear labels. Short titles. That’s 80% of the win.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-10">
          {/* Welcome */}
          <section id="welcome" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Matplotlib without fear</h1>
            <p className="text-gray-700 mt-2">
              We’ll learn the 4 charts you’ll use all the time: <strong>bar</strong>, <strong>line</strong>,
              <strong> histogram</strong>, and <strong>scatter</strong>. You’ll see the pattern: figure → plot → label → show.
              Live visuals below are rendered with <strong>Recharts</strong> for instant feedback, and each has matching
              <strong> Matplotlib</strong> code with “Expected output”.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <span>Mark complete once these basics feel comfy.</span>
            </div>
          </section>

          {/* Setup */}
          <section id="setup" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Setup & tiny data</h2>
            <p className="text-gray-700">We reuse the tiny CSV you know from Pandas so your brain can focus on plotting.</p>
            <TinyTable headers={['city', 'month', 'temp_c', 'humidity', 'pm25']} rows={SAMPLE_ROWS} />
            <CodeBlock
              code={`import pandas as pd, io
import matplotlib.pyplot as plt

csv = "city,month,temp_c,humidity,pm25\\n" + "\\n".join([
  "Lagos,Jan,33,78,32",
  "Lagos,Feb,34,76,30",
  "Lagos,Mar,33,80,41",
  "Abuja,Jan,30,40,22",
  "Abuja,Feb,31,45,24",
  "Abuja,Mar,32,42,19",
  "Kano,Jan,28,25,14",
  "Kano,Feb,29,27,17",
  "Kano,Mar,31,30,18",
])
df = pd.read_csv(io.StringIO(csv))
print(df.head())`}
              expected={`First 5 rows printed. We'll use df for all Matplotlib examples below.`}
            />
          </section>

          {/* Thinking */}
          <section id="thinking" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Ruler className="h-5 w-5" /> Chart thinking (pick before coding)
            </h2>
            <Box tone="tip" title="Match question → chart">
              <ul className="list-disc pl-5 text-gray-700">
                <li><strong>Compare categories?</strong> Bar (e.g., average PM2.5 by city).</li>
                <li><strong>Trend over time?</strong> Line (e.g., PM2.5 across months).</li>
                <li><strong>Distribution/shape?</strong> Histogram (e.g., temperatures).</li>
                <li><strong>Relationship between two numbers?</strong> Scatter (e.g., temp vs PM2.5).</li>
              </ul>
            </Box>
          </section>

          {/* Bar */}
          <section id="bar" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
            <h2 className="text-xl font-semibold flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Bar chart (compare categories)</h2>

            {/* Live visual (Recharts) */}
            <div className="h-64 rounded-xl border border-gray-200 bg-white p-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pm25AvgByCity} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="city" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="pm25" name="Avg PM2.5" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Matplotlib teaching snippet */}
            <CodeBlock
              code={`import matplotlib.pyplot as plt

m = df.groupby('city')['pm25'].mean()
plt.figure(figsize=(5,3))
m.plot(kind='bar')  # same as: plt.bar(m.index, m.values)
plt.title('Average PM2.5 by City')
plt.xlabel('City')
plt.ylabel('PM2.5 (µg/m³)')
plt.tight_layout()
plt.show()`}
              expected={`A simple bar chart with 3 bars: Lagos (highest), Abuja, Kano. Clear title and axis labels.`}
            />
          </section>

          {/* Line */}
          <section id="line" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
            <h2 className="text-xl font-semibold flex items-center gap-2"><LcIcon className="h-5 w-5" /> Line chart (time/trend)</h2>

            {/* Live visual (Recharts) — Lagos line across months */}
            <div className="h-64 rounded-xl border border-gray-200 bg-white p-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={pm25ByMonthForCity['Lagos']?.map(p => ({ month: p.month, pm25: p.pm25 })) ?? []}
                  margin={{ top: 10, right: 20, bottom: 20, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="pm25" name="PM2.5 (Lagos)" dot />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <CodeBlock
              code={`import matplotlib.pyplot as plt
order = ['Jan','Feb','Mar']
s = (df[df['city']=='Lagos']
      .set_index('month')
      .loc[order]['pm25'])

plt.figure(figsize=(5,3))
plt.plot(order, s.values, marker='o')
plt.title('Lagos PM2.5 over Months')
plt.xlabel('Month')
plt.ylabel('PM2.5 (µg/m³)')
plt.tight_layout()
plt.show()`}
              expected={`A 3-point line (Jan→Feb→Mar) for Lagos PM2.5. Dots connected, clear labels.`}
            />
            <Box tone="pro" title="Multiple lines">
              Loop cities with a shared month order so comparisons are fair (same x positions).
            </Box>
          </section>

          {/* Histogram */}
          <section id="hist" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
            <h2 className="text-xl font-semibold flex items-center gap-2"><LayoutGrid className="h-5 w-5" /> Histogram (distribution)</h2>

            {/* Live “histogram” feel using binned bars */}
            <div className="h-64 rounded-xl border border-gray-200 bg-white p-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histBins} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bin" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Count of rows" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <CodeBlock
              code={`import matplotlib.pyplot as plt

plt.figure(figsize=(5,3))
plt.hist(df['temp_c'], bins=5)  # try bins=4,10
plt.title('Temperature Distribution (°C)')
plt.xlabel('Temp (°C)')
plt.ylabel('Count of rows')
plt.tight_layout()
plt.show()`}
              expected={`A histogram showing how many rows fall into temperature ranges. Bins control the chunk size.`}
            />
          </section>

          {/* Scatter */}
          <section id="scatter" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
            <h2 className="text-xl font-semibold flex items-center gap-2"><ScIcon className="h-5 w-5" /> Scatter (relationship)</h2>

            {/* Live visual (Recharts) */}
            <div className="h-64 rounded-xl border border-gray-200 bg-white p-3">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="x" name="Temp (°C)" />
                  <YAxis type="number" dataKey="y" name="PM2.5" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Legend />
                  <Scatter name="Rows" data={scatterData} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            <CodeBlock
              code={`import matplotlib.pyplot as plt

plt.figure(figsize=(5,3))
plt.scatter(df['temp_c'], df['pm25'])
plt.title('PM2.5 vs Temperature')
plt.xlabel('Temp (°C)')
plt.ylabel('PM2.5 (µg/m³)')
plt.tight_layout()
plt.show()`}
              expected={`Dots on a plane: each point is one row (x=temp_c, y=pm25). Look for an upward/downward cloud.`}
            />
          </section>

          {/* Layout & style */}
          <section id="layout" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><LayoutGrid className="h-5 w-5" /> Figure size, titles, labels</h2>
            <CodeBlock
              code={`import matplotlib.pyplot as plt

plt.figure(figsize=(6,3))        # width, height in inches
m = df.groupby('city')['humidity'].mean()
plt.bar(m.index, m.values)
plt.title('Average Humidity by City')
plt.xlabel('City')
plt.ylabel('Humidity (%)')
plt.grid(axis='y', alpha=0.3)     # light horizontal gridlines
plt.tight_layout()
plt.show()`}
              expected={`A slightly wider chart with light horizontal gridlines. Clear axis labels; no clutter.`}
            />
            <Box tone="tip" title="Tight layout">
              <code>plt.tight_layout()</code> prevents labels being cut off. Use it often.
            </Box>
          </section>

          <section id="style" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Ruler className="h-5 w-5" /> Styling (labels, ticks, grid)</h2>
            <CodeBlock
              code={`import matplotlib.pyplot as plt

m = df.groupby('city')['pm25'].mean()
plt.figure(figsize=(5,3))
plt.bar(m.index, m.values)
plt.title('Average PM2.5 by City')
plt.xlabel('City'); plt.ylabel('PM2.5 (µg/m³)')

# Rotate x-labels if crowded
plt.xticks(rotation=0)

# Add value labels on bars
for x, y in zip(m.index, m.values):
    plt.text(x, y + 0.5, f"{y:.1f}", ha='center', va='bottom', fontsize=9)

plt.tight_layout()
plt.show()`}
              expected={`Same bar chart but each bar shows its value on top. Labels remain readable.`}
            />
          </section>

          {/* Optional Runner */}
          <section id="runner" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">🏃 Optional: try pandas (Pyodide)</h2>
            <p className="text-gray-700">
              This in-browser sandbox <em>auto-loads pandas</em> when needed and is safe for quick peeks/aggregations.
              For actual Matplotlib plotting, use your local notebook. (Browser workers don’t render Matplotlib nicely.)
            </p>
            <PythonRunnerWorker />
          </section>

          {/* Pitfalls */}
          <section id="pitfalls" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">🚨 Common Mistake Prevention</h2>
            <Box tone="warn" title="Wrong chart for the question">
              Trend ≠ bar. Distribution ≠ line. Relationship ≠ histogram. Match the question first.
            </Box>
            <Box tone="warn" title="Unlabeled axes">
              Every chart needs units and labels. <em>Every</em> time.
            </Box>
            <Box tone="tip" title="Small multiples">
              If lines overlap and confuse, use small separate charts (one per city). Clarity beats cramming.
            </Box>
          </section>

          {/* Practice */}
          <section id="practice" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Practice (micro-quests)</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Bar: average <code>pm25</code> by <code>city</code>. Add value labels on bars.</li>
              <li>Line: plot <code>pm25</code> across months for <em>each</em> city. Keep the same month order.</li>
              <li>Histogram: distribution of <code>temp_c</code>. Try <code>bins=4</code> vs <code>bins=10</code>.</li>
              <li>Scatter: <code>temp_c</code> vs <code>humidity</code>. What cloud shape do you see?</li>
              <li>Make a tidy figure with short <strong>title</strong>, precise <strong>labels</strong>, and a light <strong>grid</strong>.</li>
            </ul>
          </section>

          {/* Next */}
          <section id="next" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Next steps</h2>
            <p className="text-gray-700">
              Great! You’ve seen the four core charts and how to label them. Next up: <strong>Cleaning</strong> — messy strings,
              types, duplicates, dates, and gentle outlier checks.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <Link
                href="/course/week-2/pandas"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" /> Back to Pandas
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
                  href="/course/week-2/cleaning"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow"
                >
                  Cleaning <ChevronRight className="h-4 w-4" />
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
/* Safe, tiny, pandas-only runner. It auto-loads pandas when code imports it.
   We avoid Matplotlib rendering here (do plotting locally). */
function PythonRunnerWorker() {
  const [initialized, setInitialized] = useState(false)
  const [initializing, setInitializing] = useState(false)
  const [running, setRunning] = useState(false)
  const [output, setOutput] = useState<string>('')
  const [code, setCode] = useState<string>(`# Edit and run. pandas will auto-load if you import it.
print("Sandbox ready")`)
  const workerRef = useRef<Worker | null>(null)
  const urlRef = useRef<string | null>(null)

  // expose a setter for quick loaders (if you add later)
  ;(globalThis as any).__setRunnerCode = (c: string) => setCode(c)

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
      // Auto-load pandas if user imports it
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
        setOutput('[python] ready\nTip: Write small code and press Run.')
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
        <div className="text-sm text-gray-600">Interactive Python (pandas-only comfort zone)</div>
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
      {/* Quick examples that won’t require matplotlib */}
      <div className="flex flex-wrap gap-2 text-xs text-gray-600 mt-2">
        <button
          className="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
          onClick={() => setCode(
`import pandas as pd, io
csv = """city,month,temp_c,humidity,pm25
Lagos,Jan,33,78,32
Lagos,Feb,34,76,30
Lagos,Mar,33,80,41
Abuja,Jan,30,40,22
Abuja,Feb,31,45,24
Abuja,Mar,32,42,19
Kano,Jan,28,25,14
Kano,Feb,29,27,17
Kano,Mar,31,30,18"""
df = pd.read_csv(io.StringIO(csv))
print('shape:', df.shape)
print(df.head())
print(df.dtypes)`)
          }
        >
          Peek DataFrame
        </button>
        <button
          className="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
          onClick={() => setCode(
`import pandas as pd, io
csv = """city,month,temp_c,humidity,pm25
Lagos,Jan,33,78,32
Lagos,Feb,34,76,30
Lagos,Mar,33,80,41
Abuja,Jan,30,40,22
Abuja,Feb,31,45,24
Abuja,Mar,32,42,19
Kano,Jan,28,25,14
Kano,Feb,29,27,17
Kano,Mar,31,30,18"""
df = pd.read_csv(io.StringIO(csv))
print('Avg PM2.5 by city (desc):')
print(df.groupby('city')['pm25'].mean().sort_values(ascending=False))`)
          }
        >
          Groupby mean
        </button>
      </div>
    </div>
  )
}
