'use client'

// ---------------------------------------------------------------------------
// Week 2 Wrap-Up
// ---------------------------------------------------------------------------
// - Light-only UI, sticky sidebar, Supabase tracking
// - Summarises Pandas, Cleaning, Matplotlib
// - Emphasises "Why": EDA mindset
// - Tiny self-check quiz
// - Link to Week 3
// ---------------------------------------------------------------------------

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  Sparkles, Menu, X, ChevronLeft, ChevronRight,
  CheckCircle2, ListChecks, BarChart3, Eraser, ScatterChart,
  ClipboardCheck
} from 'lucide-react'

const PROGRESS_KEY = 'week-2:wrapup'

const SECTIONS = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'summary', label: 'Week 2 Summary' },
  { id: 'eda', label: 'The EDA Mindset' },
  { id: 'quiz', label: 'Quick Test' },
  { id: 'next', label: 'Next: Week 3' },
]

function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ')
}

export default function Week2WrapUpPage() {
  const [user, setUser] = useState<any>(null)
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeId, setActiveId] = useState(SECTIONS[0].id)

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
      { root: null, rootMargin: '-112px 0px -55% 0px', threshold: [0.1,0.25,0.5,0.75,1] }
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
            <span className="font-bold">Week 2 • Wrap-Up</span>
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
        </aside>

        {/* Main */}
        <main className="space-y-10">
          <section id="welcome" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Week 2 Complete!</h1>
            <p className="text-gray-700 mt-2">
              You survived Pandas, made your tables clean, and even plotted with Matplotlib.
              Let’s reflect, then set you up for Week 3.
            </p>
          </section>

          <section id="summary" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2"><ListChecks className="h-5 w-5" /> Week 2 Summary</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li><strong>Pandas:</strong> made, reshaped, and summarized DataFrames.</li>
              <li><strong>Cleaning:</strong> fixed types, filled/drop NAs, deduped, normalized text.</li>
              <li><strong>Matplotlib:</strong> drew bar, line, hist, and scatter charts with clear labels.</li>
            </ul>
          </section>

          <section id="eda" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2"><BarChart3 className="h-5 w-5" /> The EDA Mindset</h2>
            <p className="text-gray-700">
              Exploratory Data Analysis is not just code — it’s asking questions:
              <em> How many? What’s typical? Who’s different? Which goes with which?</em>
              Week 2 gave you the tools; Week 3 is about practice, practice, practice.
            </p>
          </section>

          <section id="quiz" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold flex items-center gap-2"><ClipboardCheck className="h-5 w-5" /> Quick Test</h2>
            <ol className="list-decimal pl-5 text-gray-700 space-y-2">
              <li>Which chart best shows a trend across months?  
                <ul className="list-disc pl-5"><li>Bar</li><li>Line</li><li>Histogram</li></ul>
              </li>
              <li>True or False: <code>df.dropna()</code> permanently deletes missing values from disk.</li>
              <li>What function counts duplicates? <code>df.______()</code></li>
              <li>Why use <code>errors='coerce'</code> when parsing types?</li>
            </ol>
          </section>

          <section id="next" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Next: Week 3</h2>
            <p className="text-gray-700">
              You’ve built the muscles. Week 3 will be <strong>AI/ML Indepth</strong>
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <Link
                href="/course/week-2/cleaning"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" /> Back to Cleaning
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
                  href="/course/week-3/intro"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow"
                >
                  Start Week 3 <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
