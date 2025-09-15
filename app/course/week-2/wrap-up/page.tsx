'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  Trophy,
  Home,
  CheckCircle2,
} from 'lucide-react'

/**
 * Week 2 • Wrap-Up & Final Check (Quiz + Gating)
 * - Friendly header with name from `public.profiles`
 * - Tracks progress/gate in `tracking` (PROGRESS_KEY, PASS_KEY)
 * - Saves quiz attempts to `assessments` (QUIZ_KEY)
 * - Unlocks Week 3 when PASS_THRESHOLD met or gate flag present
 * - Sticky, mobile-friendly sidebar with scrollspy
 * - No in-page Python runner (kept lean on purpose)
 */

// ---- Config -----------------------------------------------------------------
const PROGRESS_KEY = 'week-2:wrap-up'
const QUIZ_KEY = 'week-2:final-quiz'
const PASS_KEY = 'week-2:passed'
const PASS_THRESHOLD = 70

const SECTIONS = [
  { id: 'congrats', label: '🎉 Congrats!' },
  { id: 'what', label: 'What you mastered' },
  { id: 'pandas', label: 'Pandas recap' },
  { id: 'cleaning', label: 'Cleaning recap' },
  { id: 'plots', label: 'Matplotlib recap' },
  { id: 'mistakes', label: '🚨 Common mistakes' },
  { id: 'practice', label: 'Daily practice' },
  { id: 'exam', label: 'Final Check (Quiz)' },
  { id: 'result', label: 'Result & Unlock' },
  { id: 'save', label: 'Save & Continue' },
]

type QuizQuestion = {
  id: string
  prompt: string
  options: string[]
  answer: number // index of correct option
}

type AnswersState = Record<string, number | undefined>

const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: 'In Pandas, which prints the first few rows?',
    options: ['df.show()', 'df.peek()', 'df.head()', 'df.top()'],
    answer: 2,
  },
  {
    id: 'q2',
    prompt: 'Safest way to coerce a numeric column with bad strings is…',
    options: [
      "pd.to_numeric(df['col'])",
      "pd.to_numeric(df['col'], errors='coerce')",
      "float(df['col'])",
      "df['col'].astype(int)",
    ],
    answer: 1,
  },
  {
    id: 'q3',
    prompt: 'Which call drops rows with missing values in specific columns only?',
    options: [
      'df.dropna() (no args)',
      "df.dropna(subset=['col1','col2'])",
      'df.fillna(0)',
      'df.isna()',
    ],
    answer: 1,
  },
  {
    id: 'q4',
    prompt: 'What does df.duplicated().sum() return?',
    options: [
      'Number of exact duplicate rows',
      'Number of unique rows',
      'A DataFrame of duplicates',
      'The memory usage of df',
    ],
    answer: 0,
  },
  {
    id: 'q5',
    prompt: 'Best chart for a trend across months?',
    options: ['Histogram', 'Line', 'Bar', 'Scatter'],
    answer: 1,
  },
  {
    id: 'q6',
    prompt: 'To label axes and add a title in Matplotlib, which sequence is right?',
    options: [
      'plt.xlabel → plt.ylabel → plt.title → plt.show()',
      'plt.title → plt.show() → plt.xlabel → plt.ylabel',
      'plt.grid → plt.title → plt.xlabel → plt.ylabel → plt.show()',
      'plt.show() → plt.title → plt.xlabel → plt.ylabel',
    ],
    answer: 0,
  },
  {
    id: 'q7',
    prompt: 'Why use dayfirst=True when parsing dates?',
    options: [
      'It speeds up parsing',
      'It handles formats like 15-03-2024 safely',
      'It converts to strings',
      'It removes timezone info',
    ],
    answer: 1,
  },
  {
    id: 'q8',
    prompt: 'Text normalization often includes…',
    options: [
      'str.strip() and str.title()',
      'df.astype(int) for strings',
      'Dropping all strings',
      'Multiplying strings by 2',
    ],
    answer: 0,
  },
  {
    id: 'q9',
    prompt: 'Which snippet adds values on top of bars?',
    options: [
      "for x,y in zip(m.index, m.values): plt.text(x, y, y)",
      'plt.annotate_all()',
      'plt.value_labels()',
      'plt.plot_texts()',
    ],
    answer: 0,
  },
  {
    id: 'q10',
    prompt: 'After cleaning, which habit keeps analysis honest?',
    options: [
      'Never write down what changed',
      'A short “Cleaning Log”: what, how many rows, and why',
      'Randomly delete outliers',
      'Skip inspecting results',
    ],
    answer: 1,
  },
]

// ---- UI helpers -------------------------------------------------------------
function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ')
}

function Box({
  tone,
  title,
  children,
}: {
  tone: 'tip' | 'warn' | 'pro'
  title: string
  children: any
}) {
  const palette = {
    tip: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    warn: 'border-amber-200 bg-amber-50 text-amber-900',
    pro: 'border-sky-200 bg-sky-50 text-sky-900',
  }[tone]
  const icon =
    tone === 'tip' ? <Lightbulb className="h-4 w-4" /> :
    tone === 'warn' ? <AlertTriangle className="h-4 w-4" /> :
    <Sparkles className="h-4 w-4" />
  return (
    <div className={cx('rounded-xl border p-3 md:p-4 flex gap-3 items-start', palette)}>
      <div className="mt-0.5">{icon}</div>
      <div>
        <div className="font-medium mb-1">{title}</div>
        <div className="text-sm md:text-[0.95rem] leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

export default function Week2WrapUpPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeId, setActiveId] = useState(SECTIONS[0].id)

  // gating / quiz state
  const [gateFromDb, setGateFromDb] = useState(false)
  const [answers, setAnswers] = useState<AnswersState>({})
  const [scorePct, setScorePct] = useState<number | null>(null)
  const [passed, setPassed] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadAttempting, setLoadAttempting] = useState(true)

  const canProceed = passed || gateFromDb

  // Load user, profile, progress, gate, last attempt
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        setLoading(true)
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) console.error(error)
        if (cancelled) return
        setUser(user ?? null)

        if (user) {
          const { data: prof, error: pErr } = await supabase
            .from('profiles')
            .select('username, full_name')
            .eq('id', user.id)
            .maybeSingle()
          if (pErr) console.error(pErr)
          if (!cancelled) setProfile(prof ?? null)

          const { data: wrap } = await supabase
            .from('tracking')
            .select('completed')
            .eq('user_id', user.id)
            .eq('key', PROGRESS_KEY)
            .maybeSingle()
          if (!cancelled) setCompleted(Boolean(wrap?.completed))

          const { data: gate } = await supabase
            .from('tracking')
            .select('completed')
            .eq('user_id', user.id)
            .eq('key', PASS_KEY)
            .maybeSingle()
          if (!cancelled) setGateFromDb(Boolean(gate?.completed))

          const { data: attempt } = await supabase
            .from('assessments')
            .select('score, passed, answers')
            .eq('user_id', user.id)
            .eq('key', QUIZ_KEY)
            .maybeSingle()
          if (!cancelled && attempt) {
            setScorePct(attempt.score ?? null)
            setPassed(Boolean(attempt.passed))
            if (attempt.answers && typeof attempt.answers === 'object') {
              setAnswers(attempt.answers as AnswersState)
            }
          }
        }
      } finally {
        if (!cancelled) { setLoadAttempting(false); setLoading(false) }
      }
    }
    run()
    return () => { cancelled = true }
  }, [])

  const username = useMemo(
    () => profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'Learner',
    [profile, user]
  )

  const markComplete = async () => {
    if (!user) return alert('Please sign in to save progress.')
    const { error } = await supabase
      .from('tracking')
      .upsert(
        { user_id: user.id, key: PROGRESS_KEY, completed: true, completed_at: new Date().toISOString() },
        { onConflict: 'user_id,key' }
      )
    if (error) { console.error(error); alert('Could not save progress.') } else { setCompleted(true) }
  }

  // Scrollspy
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('main section[id]'))
    if (sections.length === 0) return
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setActiveId((visible[0].target as HTMLElement).id)
      },
      { root: null, rootMargin: '-112px 0px -55% 0px', threshold: [0.1,0.25,0.5,0.75,1] }
    )
    sections.forEach(s => obs.observe(s))
    return () => obs.disconnect()
  }, [])

  // Quiz helpers
  const letter = (i: number) => String.fromCharCode(65 + i)
  function selectAnswer(qid: string, optIndex: number) {
    setAnswers(prev => ({ ...prev, [qid]: optIndex }))
  }
  function countCorrect(a: AnswersState): number {
    return QUIZ.reduce((acc, q) => (a[q.id] === q.answer ? acc + 1 : acc), 0)
  }
  async function submitQuiz() {
    if (!user) { alert('Please sign in to submit your quiz.'); return }
    const answered = Object.keys(answers).length
    if (answered < QUIZ.length) {
      const missing = QUIZ.length - answered
      const ok = confirm(`You have ${missing} unanswered question${missing>1?'s':''}. Submit anyway?`)
      if (!ok) return
    }
    const correct = countCorrect(answers)
    const pct = Math.round((correct / QUIZ.length) * 100)
    const didPass = pct >= PASS_THRESHOLD

    setScorePct(pct)
    setPassed(didPass)
    setSaving(true)
    try {
      const { error: aerr } = await supabase.from('assessments').upsert(
        { user_id: user.id, key: QUIZ_KEY, score: pct, passed: didPass, answers, submitted_at: new Date().toISOString() },
        { onConflict: 'user_id,key' }
      )
      if (aerr) throw aerr

      if (didPass) {
        const { error: gateErr } = await supabase.from('tracking').upsert(
          { user_id: user.id, key: PASS_KEY, completed: true, completed_at: new Date().toISOString() },
          { onConflict: 'user_id,key' }
        )
        if (gateErr) throw gateErr

        const { error: wrapErr } = await supabase.from('tracking').upsert(
          { user_id: user.id, key: PROGRESS_KEY, completed: true, completed_at: new Date().toISOString() },
          { onConflict: 'user_id,key' }
        )
        if (wrapErr) throw wrapErr

        setGateFromDb(true)
        setCompleted(true)
      }
    } catch (e: any) {
      console.error(e)
      alert('Score computed, but saving failed. Please try again.\n\n' + (e?.message || ''))
    } finally {
      setSaving(false)
    }
  }
  function resetQuiz(){ setAnswers({}); setScorePct(null); setPassed(false) }
  const goNext = () => { if (canProceed) router.push('/course/week-3/intro') }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-100 backdrop-blur bg-white/70">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-14 grid grid-cols-[auto_1fr_auto] items-center gap-3">
            <Link
              href="/learn/beginner"
              aria-label="Go to beginner home"
              prefetch={false}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2"
            >
              <Home className="h-5 w-5" />
            </Link>
            <div className="flex items-center justify-center">
              <span className="text-base sm:text-lg font-semibold text-gray-900 truncate">Week 2 · Wrap-Up & Final Check</span>
            </div>
            <button
              type="button"
              aria-label="Toggle contents"
              className="lg:hidden inline-flex h-10 items-center gap-2 px-3 rounded-xl border border-gray-200 text-gray-800 hover:bg-gray-50 justify-self-end"
              onClick={() => setSidebarOpen(v => !v)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Contents</span>
            </button>
          </div>
        </div>
      </header>

      {/* Shell */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6">
        {/* Sidebar */}
        <aside className={cx(
          'lg:sticky lg:top-[72px] lg:h-[calc(100vh-88px)] lg:overflow-auto',
          'rounded-2xl border border-gray-200 bg-white p-4 shadow-sm',
          sidebarOpen ? '' : 'hidden lg:block'
        )}>
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">On this page</p>
          <nav className="space-y-1" aria-label="On this page">
            {SECTIONS.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={cx('block px-3 py-2 rounded-lg text-sm', activeId === s.id ? 'bg-green-50 text-green-800' : 'hover:bg-gray-50 text-gray-700')}
                onClick={() => setSidebarOpen(false)}
              >
                {s.label}
              </a>
            ))}
          </nav>
          <div className="mt-6 p-3 rounded-xl bg-gray-50 text-xs text-gray-600">
            Score <b>{PASS_THRESHOLD}%+</b> on the quiz to unlock Week 3.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-8">
          {/* Congrats */}
          <section id="congrats" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-700" />
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                Week 2 Wrap-Up{user ? ` — great job, ${username}!` : ''}
              </h1>
            </div>
            <p className="text-gray-700">
              From raw CSVs to trustworthy tables and clear visuals — solid work. Lock in your wins below and pass the
              final check to unlock Week 3.
            </p>
            <div className="mt-2 inline-flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <span>Tip: Mark this page complete to save progress.</span>
            </div>
          </section>

          {/* What you mastered */}
          <section id="what" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">This week, you mastered</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Pandas basics: building DataFrames, selecting, grouping, and summarizing.</li>
              <li>Cleaning: types, missing values, duplicates, text normalization, and safe date parsing.</li>
              <li>Matplotlib: bar, line, histogram, and scatter — with titles, labels, and tidy layouts.</li>
            </ul>
          </section>

          {/* Pandas recap */}
          <section id="pandas" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2">
            <h2 className="text-xl font-semibold">Pandas recap (quick patterns)</h2>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">{`# Read and peek
import pandas as pd

# df = pd.read_csv('file.csv')
print(df.shape)
print(df.head())

# Group and sort
g = df.groupby('city')['pm25'].mean().sort_values(ascending=False)
print(g.head())`}</pre>
            <Box tone="tip" title="Minimal mental load">
              Reuse the same small patterns: read → peek → select/group → sort.
            </Box>
          </section>

          {/* Cleaning recap */}
          <section id="cleaning" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2">
            <h2 className="text-xl font-semibold">Cleaning recap (safe defaults)</h2>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">{`# Coerce numerics + dates
for c in ['temp_c','humidity','pm25']:
    df[c] = pd.to_numeric(df[c], errors='coerce')
df['date'] = pd.to_datetime(df['date'], errors='coerce', dayfirst=True)

# Missing policy: fill numeric, drop critical NA rows
df['pm25'] = df['pm25'].fillna(df['pm25'].median())
df = df.dropna(subset=['temp_c','humidity','date'])

# Dedupe and normalize text
df = df.drop_duplicates().reset_index(drop=True)
df['city'] = df['city'].astype(str).str.strip().str.title()`}</pre>
            <Box tone="warn" title="Investigate first">
              Before dropping, count and inspect affected rows. Document your choices in a short Cleaning Log.
            </Box>
          </section>

          {/* Matplotlib recap */}
          <section id="plots" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2">
            <h2 className="text-xl font-semibold">Matplotlib recap (label everything)</h2>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">{`import matplotlib.pyplot as plt
m = df.groupby('city')['pm25'].mean()
plt.figure(figsize=(5,3))
plt.bar(m.index, m.values)
plt.title('Average PM2.5 by City')
plt.xlabel('City'); plt.ylabel('PM2.5 (µg/m³)')
plt.tight_layout(); plt.show()`}</pre>
            <Box tone="tip" title="One story per chart">
              Short titles, clear units, light grids. That’s 80% of the win.
            </Box>
          </section>

          {/* Mistakes */}
          <section id="mistakes" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">🚨 Common Mistake Prevention</h2>
            <Box tone="warn" title="Types & dates">
              Forgetting <code>errors='coerce'</code> when parsing; not setting <code>dayfirst=True</code> on European-style dates.
            </Box>
            <Box tone="warn" title="Missing values">
              Dropping too aggressively. Prefer targeted <code>dropna(subset=[...])</code> and justify fills (e.g., median).
            </Box>
            <Box tone="warn" title="Plots">
              Unlabeled axes or mixed chart/question (trend ≠ bar). Match question → chart.
            </Box>
          </section>

          {/* Practice plan */}
          <section id="practice" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Daily practice plan (20–30 mins)</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Pandas reps: pick 1 tiny dataset, compute 2 groupbys.</li>
              <li>Cleaning reps: fix types, fill one column, drop precise NA rows, dedupe.</li>
              <li>Plot reps: make one bar and one line with titles + labels.</li>
            </ul>
          </section>

          {/* Final Check (Quiz) */}
          <section id="exam" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-green-700" />
                <h2 className="text-xl font-semibold">Final Check (10 questions)</h2>
              </div>
              {scorePct !== null && (
                <div className={cx('px-2.5 py-1 rounded-md text-sm', (scorePct ?? 0) >= PASS_THRESHOLD ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-amber-50 text-amber-800 border border-amber-200')}>
                  Score: {scorePct}%
                </div>
              )}
            </div>

            <div className="space-y-5">
              {QUIZ.map((q, qi) => (
                <div key={q.id} className="rounded-xl border border-gray-200 p-3 sm:p-4">
                  <div className="font-medium mb-2">{qi + 1}. {q.prompt}</div>
                  <div className="grid gap-2">
                    {q.options.map((opt, oi) => {
                      const checked = answers[q.id] === oi
                      return (
                        <label key={oi} className={cx('flex items-start gap-2 rounded-lg border p-2 cursor-pointer', checked ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:bg-gray-50')}>
                          <input type="radio" name={q.id} className="mt-1" checked={checked || false} onChange={() => selectAnswer(q.id, oi)} />
                          <span className="text-sm"><span className="font-medium mr-1">{letter(oi)}.</span>{opt}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button onClick={submitQuiz} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow disabled:opacity-60" disabled={saving || loadAttempting} title={!user ? 'Sign in to submit your score' : undefined}>
                {saving ? 'Saving…' : 'Submit answers'}
              </button>
              <button onClick={resetQuiz} className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50" disabled={saving}>Reset</button>
              <span className="text-xs text-gray-600">Need <b>{PASS_THRESHOLD}%+</b> to unlock Week 3.</span>
            </div>
          </section>

          {/* Result & Unlock */}
          <section id="result" className="scroll-mt-[72px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Result & Unlock</h2>
            {scorePct === null && !gateFromDb ? (
              <p className="text-gray-700">Take the final check to unlock Week 3. You need <b>{PASS_THRESHOLD}%+</b>.</p>
            ) : (
              <div className="text-gray-700">
                {canProceed ? (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-green-800">
                    <div className="font-medium mb-1">Nice work!</div>
                    <p>Requirement met. Week 3 is unlocked for your account.</p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800">
                    <div className="font-medium mb-1">Almost there</div>
                    <p>Your current score is <b>{scorePct}%</b>. Aim for <b>{PASS_THRESHOLD}%+</b>, review the recaps, and try again.</p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Save & Continue */}
          <section id="save" className="scroll-mt-[72px] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
            <Link href="/course/week-2/cleaning" className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 w-full sm:w-auto">
              <ChevronLeft className="h-4 w-4" /> Back
            </Link>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <button onClick={markComplete} className={cx('px-4 py-2 rounded-lg border w-full sm:w-auto', completed ? 'border-green-200 bg-green-50 text-green-800' : 'border-gray-200 hover:bg-gray-50')} title={user ? 'Save progress for this page' : 'Sign in to save progress'}>
                {completed ? 'Progress saved ✓' : 'Save progress'}
              </button>

              {canProceed ? (
                <button onClick={goNext} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow w-full sm:w-auto">
                  Continue to Week 3 <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button disabled className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-500 w-full sm:w-auto cursor-not-allowed" title={`Score ${PASS_THRESHOLD}%+ on the final check to unlock Week 3`}>
                  Locked • Score {PASS_THRESHOLD}%+ to continue
                </button>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
