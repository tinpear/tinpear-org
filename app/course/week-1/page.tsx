'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

/**
 * Week 1 • Start (Beginner‑first, page-based)
 * - Uses existing `public.profiles` (read‑only)
 * - Simple progress tracking via `tracking` (user_id, key)
 * - Sticky, responsive sidebar with scrollspy
 * - In‑browser Python runner (Web Worker + Pyodide) with quick‑loads
 * - Friendly tone, analogies, tips, and common‑mistake callouts
 */

// --- Config ------------------------------------------------------------------
const PROGRESS_KEY = 'week-1:start';

const SECTIONS = [
  { id: 'welcome', label: 'Welcome & Roadmap' },
  { id: 'what-is-python', label: 'What is Python (and why)?' },
  { id: 'history', label: 'A tiny history' },
  { id: 'philosophy', label: 'The Zen: how Python thinks' },
  { id: 'strengths', label: 'Where Python shines' },
  { id: 'this-week', label: "What you’ll learn this week" },
  { id: 'run-python', label: 'How to run Python' },
  { id: 'mistakes', label: '🚨 Common Mistakes' },
  { id: 'try-it', label: '🏃‍♂️ Try it now' },
];

// --- Utilities ---------------------------------------------------------------
function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}

function Box({ tone, title, children }: { tone: 'tip' | 'warn' | 'pro'; title: string; children: any }) {
  const palette = {
    tip: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-900/15 dark:text-emerald-200',
    warn: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/15 dark:text-amber-100',
    pro: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/40 dark:bg-sky-900/15 dark:text-sky-100',
  }[tone];
  const icon = tone === 'tip' ? <Lightbulb className="h-4 w-4"/> : tone === 'warn' ? <AlertTriangle className="h-4 w-4"/> : <Sparkles className="h-4 w-4"/>;
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

// --- Page --------------------------------------------------------------------
export default function Week1Start() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
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

  const username = useMemo(() => (
    profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'Learner'
  ), [profile, user]);

  const markComplete = async () => {
    if (!user) return alert('Please sign in to save your progress.');
    const { error } = await supabase
      .from('tracking')
      .upsert({
        user_id: user.id,
        key: PROGRESS_KEY,
        completed: true,
        completed_at: new Date().toISOString(),
      }, { onConflict: 'user_id,key' });
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
        for (const entry of entries) { if (entry.isIntersecting) { setActiveId(entry.target.id); break; } }
      },
      { rootMargin: '0px 0px -70% 0px', threshold: [0, 1] }
    );
    const els = SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean) as Element[];
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-100 dark:border-gray-800 backdrop-blur bg-white/70 dark:bg-gray-900/70">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900 dark:text-white">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white"><Sparkles className="h-4 w-4"/></span>
            <span className="font-bold">Week 1 • Python & ML Fundamentals</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800"
              onClick={() => setSidebarOpen(v => !v)}
            >
              {sidebarOpen ? <X className="h-4 w-4"/> : <Menu className="h-4 w-4"/>}
              Contents
            </button>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {loading ? 'Loading…' : user ? `Signed in as ${username}` : <Link href="/signin" className="underline">Sign in</Link>}
            </div>
          </div>
        </div>
      </header>

      {/* Content area */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6">
        {/* Sidebar */}
        <aside className={cx(
          'lg:sticky lg:top-[72px] lg:h-[calc(100vh-88px)] lg:overflow-auto',
          'rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 shadow-sm',
          sidebarOpen ? '' : 'hidden lg:block'
        )}>
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">In this page</p>
          <nav className="space-y-1">
            {SECTIONS.map(s => (
              <a key={s.id} href={`#${s.id}`}
                 className={cx(
                   'block px-3 py-2 rounded-lg text-sm',
                   activeId === s.id
                     ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                     : 'hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300'
                 )}
              >{s.label}</a>
            ))}
          </nav>
          <div className="mt-6 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 text-xs text-gray-600 dark:text-gray-300">
            Don’t worry if you get stuck — that’s normal. Small wins add up.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-8">
          {/* Welcome */}
          <section id="welcome" className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Start here — calm, clear, hands‑on</h1>
            <p className="text-lg text-gray-700 dark:text-gray-300">This week sets your foundation: think in Python, write simple programs, and see how these skills feed into ML. We’ll keep it friendly and build confidence step by step.</p>
            <Box tone="tip" title="Beginner roadmap">
              Today → understand Python at a high level; then <strong>Python Syntax</strong> → <strong>Data Structures</strong> → <strong>ML Workflow</strong>. Each lesson ends with practice and a mini win.
            </Box>
          </section>

          {/* What is Python */}
          <section id="what-is-python" className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">What is Python (and why does it matter)?</h2>
            <p className="text-gray-700 dark:text-gray-300"><strong>What:</strong> Python is a high‑level language focused on readability. Think of it as speaking to the computer in clear, simple sentences.</p>
            <p className="text-gray-700 dark:text-gray-300"><strong>Why:</strong> You’ll learn faster, write fewer bugs, and access a massive ecosystem (data, web, automation, ML).</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900">
                <h3 className="font-medium mb-2">Key traits</h3>
                <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1">
                  <li>Readable syntax → focus on ideas, not punctuation</li>
                  <li>“Batteries included” standard library</li>
                  <li>Huge package index (PyPI) for anything you need</li>
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900">
                <h3 className="font-medium mb-2">Everyday uses</h3>
                <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1">
                  <li>Automating tasks (rename files, parse text)</li>
                  <li>Data analysis & visualization</li>
                  <li>Web backends, APIs, and DevOps tooling</li>
                </ul>
              </div>
            </div>
          </section>

          {/* History */}
          <section id="history" className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">A tiny history</h2>
            <p className="text-gray-700 dark:text-gray-300">Python began in 1991 (by Guido van Rossum) with a simple mission: make code easier to read and write. That design choice attracted scientists and engineers, then the data & ML community.</p>
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1">
              <li><strong>1990s:</strong> Foundations laid; clarity over cleverness.</li>
              <li><strong>2000s:</strong> Scientific stack (NumPy/SciPy) takes off.</li>
              <li><strong>2010s → now:</strong> Python dominates in data & ML.</li>
            </ul>
          </section>

          {/* Philosophy */}
          <section id="philosophy" className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">The Zen of Python: how Python thinks</h2>
            <p className="text-gray-700 dark:text-gray-300">Type <code className="px-1 rounded bg-gray-100 dark:bg-gray-800">import this</code> in Python to read its “Zen.” Here are a few lines we’ll live by:</p>
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1">
              <li>Simple is better than complex.</li>
              <li>Readability counts.</li>
              <li>There should be one—and preferably only one—obvious way to do it.</li>
            </ul>
            <Box tone="pro" title="How this helps you">
              Following these ideas makes your code easier to revisit, debug, and share. It’s like writing clear notes for your future self.
            </Box>
          </section>

          {/* Strengths */}
          <section id="strengths" className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Where Python shines</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900">
                <h3 className="font-medium mb-1">Rapid prototyping</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">Turn ideas into code quickly with minimal ceremony.</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900">
                <h3 className="font-medium mb-1">Rich data tooling</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">NumPy, pandas, Matplotlib, scikit‑learn—and beyond.</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900">
                <h3 className="font-medium mb-1">Friendly community</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">Abundant help, tutorials, and open‑source libraries.</p>
              </div>
            </div>
          </section>

          {/* Objectives for the week */}
          <section id="this-week" className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">What you’ll learn this week</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1">
                <li>Read & write core Python syntax confidently</li>
                <li>Use variables, types, and control flow</li>
                <li>Choose the right data structure for a task</li>
              </ul>
              <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1">
                <li>Understand the ML workflow at a high level</li>
                <li>Run and experiment with Python interactively</li>
                <li>Adopt clean, readable coding habits</li>
              </ul>
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">We’ll keep the pace gentle and celebrate small wins.</div>
            <div className="mt-4 flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle2 className="h-5 w-5"/>
              <p className="text-sm">Mark this page as complete before moving on.</p>
            </div>
          </section>

          {/* Running Python */}
          <section id="run-python" className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">How to run Python</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <div>
                <h3 className="font-medium">Local install (later)</h3>
                <p>Install Python 3 from python.org, use a code editor (VS Code is great), and run scripts with <code className="px-1 rounded bg-gray-100 dark:bg-gray-800">python your_file.py</code>.</p>
              </div>
              <div>
                <h3 className="font-medium">Interactive in your browser (now)</h3>
                <p>Use the embedded runner below to try tiny snippets instantly. It’s safe and fast.</p>
              </div>
            </div>
          </section>

          {/* Mistakes */}
          <section id="mistakes" className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">🚨 Common Mistakes (and how to avoid them)</h2>
            <Box tone="warn" title="Confusing = with ==">
              <code>=</code> assigns; <code>==</code> compares. If you write <code>if x = 3</code> the interpreter will error. Use <code>if x == 3</code>.
            </Box>
            <Box tone="warn" title="Forgetting indentation & colons">
              Blocks are indented (4 spaces). Lines like <code>if</code>, <code>for</code>, <code>def</code> end with <code>:</code>.
            </Box>
            <Box tone="tip" title="Debug like a pro">
              Add small <code>print()</code> checks as you write. Read error messages top → bottom and change one thing at a time.
            </Box>
          </section>

          {/* Try it now — runner */}
          <section id="try-it" className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">🏃‍♂️ Try it now</h2>
            <PythonRunnerWorker />
            <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-300">
              <QuickLoad label="Hello" code={`print('Hello, Python!')`} />
              <QuickLoad label="Variables" code={`name='Ada'\nage=36\nprint(name, age)`} />
              <QuickLoad label="If/Else" code={`x=5\nif x>3:\n    print('big')\nelse:\n    print('small')`} />
              <QuickLoad label="Loop" code={`total=0\nfor n in [1,2,3]:\n    total+=n\nprint(total)`} />
              <QuickLoad label="Zen" code={`import this`} />
              <QuickLoad label="Oops (fix me)" code={`# Fix the 3 issues:\n# 1) Use == in the if\n# 2) Add a colon after if\n# 3) Indent the print\nx=3\nif x = 3\nprint('equal')`} />
            </div>
          </section>

          {/* Nav + progress */}
          <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button disabled className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-400 cursor-not-allowed">
              <ChevronLeft className="h-4 w-4"/> Previous
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={markComplete}
                className={cx(
                  'px-4 py-2 rounded-lg border',
                  completed
                    ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-300'
                    : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
                title={user ? 'Save progress for this page' : 'Sign in to save progress'}
              >
                {completed ? 'Progress saved ✓' : 'Mark page complete'}
              </button>
              <Link
                href="/course/week-1/python-syntax"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow"
                onClick={async () => { if (!completed) await markComplete(); }}
              >
                Next <ChevronRight className="h-4 w-4"/>
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

// --- Runner (Web Worker + Pyodide) ------------------------------------------
function PythonRunnerWorker() {
  const [initialized, setInitialized] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [code, setCode] = useState<string>(`# Edit and run Python here.\nprint('Hello, Python!')`);
  const workerRef = useRef<Worker | null>(null);
  const urlRef = useRef<string | null>(null);

  // Expose for quick-load buttons
  ;(globalThis as any).__setRunnerCode = (c: string) => setCode(c);

  const ensureWorker = () => {
    if (workerRef.current) return;
    const workerCode = `self.language='python';\nlet pyodideReadyPromise;\nasync function init(){\n  if(!pyodideReadyPromise){\n    importScripts('https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js');\n    pyodideReadyPromise = loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/' });\n  }\n  self.pyodide = await pyodideReadyPromise;\n  self.pyodide.setStdout({ batched: (s) => postMessage({ type: 'stdout', data: s }) });\n  self.pyodide.setStderr({ batched: (s) => postMessage({ type: 'stderr', data: s }) });\n}\nself.onmessage = async (e) => {\n  const { type, code } = e.data || {};\n  try {\n    if (type === 'init'){\n      await init();\n      postMessage({ type: 'ready' });\n    } else if (type === 'run'){\n      await init();\n      let result = await self.pyodide.runPythonAsync(code);\n      postMessage({ type: 'result', data: String(result ?? '') });\n    }\n  } catch (err){\n    postMessage({ type: 'error', data: String(err) });\n  }\n};`;
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    urlRef.current = url;
    workerRef.current = new Worker(url);
    workerRef.current.onmessage = (e: MessageEvent) => {
      const { type, data } = (e as any).data || {};
      if (type === 'ready') {
        setInitialized(true);
        setInitializing(false);
        setOutput('[python] ready\nTip: click Run to execute the code.');
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
        <div className="text-sm text-gray-600 dark:text-gray-300">Interactive Python (isolated; loads on demand)</div>
        <div className="flex gap-2">
          {!initialized ? (
            <button onClick={init} disabled={initializing} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
              {initializing ? 'Initializing…' : 'Initialize Python'}
            </button>
          ) : (
            <>
              <button onClick={run} disabled={running} className="px-3 py-2 rounded-lg bg-green-600 text-white hover:shadow">
                {running ? 'Running…' : 'Run'}
              </button>
              <button onClick={resetConsole} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">Clear Console</button>
            </>
          )}
        </div>
      </div>
      <textarea
        className="w-full min-h-[200px] rounded-xl border border-gray-200 dark:border-gray-800 p-3 font-mono text-sm bg-white dark:bg-gray-900"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
      />
      <div className="mt-3">
        <div className="text-sm font-medium mb-1">Console</div>
        <pre className="w-full min-h-[150px] rounded-xl border border-gray-200 dark:border-gray-800 p-3 text-sm bg-gray-50 dark:bg-gray-950 overflow-auto whitespace-pre-wrap">{output}</pre>
      </div>
    </div>
  );
}

function QuickLoad({ label, code }: { label: string; code: string }) {
  return (
    <button
      className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
      onClick={() => (globalThis as any).__setRunnerCode?.(code)}
      title="Load example into the editor"
    >
      {label}
    </button>
  );
}
