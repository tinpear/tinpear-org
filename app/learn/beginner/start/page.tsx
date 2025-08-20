'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, ChevronRight, Sparkles, User2, CheckCircle2 } from 'lucide-react';

/**
 * Beginner ML • Week 1 • Start Page (No MDX, simple pages only)
 * - Friendly welcome + name
 * - Calm, interesting intro to Python + short history
 * - Supabase progress tracking with a single, simple table: `tracking`
 * - Next/Previous nav (Previous disabled on start)
 * - Clear guidance for running Python in the browser (Pyodide)
 */

// ---- Simple Progress (Supabase) ---------------------------------------------
// Table: tracking
// Columns:
//   user_id uuid (pk, references auth.users)
//   key text (pk) -- e.g. 'week-1:start'
//   completed boolean default false
//   completed_at timestamptz null
//   updated_at timestamptz default now()
// Composite primary key (user_id, key)

const PROGRESS_KEY = 'week-1:start';

export default function Week1StartSimple() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

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

  const username = user?.user_metadata?.full_name
    || user?.user_metadata?.username
    || user?.email?.split('@')[0]
    || 'there';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <header className="sticky top-0 z-20 backdrop-blur border-b border-gray-100 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900 dark:text-white">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white"><Sparkles className="h-4 w-4" /></span>
            <span className="font-bold">Beginner ML • Week 1</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
            <User2 className="h-4 w-4" />
            {loading ? 'Loading…' : (user ? (username) : <Link href="/signin" className="underline">Sign in</Link>)}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Welcome */}
        <section className="mb-8">
          <p className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium mb-4 dark:bg-green-900/30 dark:text-green-300">Start here</p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">Welcome{user ? `, ${username}` : ''}!</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            I’m your Python professor for Week 1. We’ll keep things calm, clear, and practical. By the end of this week, you’ll understand
            Python’s core ideas and how they power modern machine learning.
          </p>
        </section>

        {/* Python intro + short history */}
        <section className="mb-10 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">What is Python?</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Python is a high-level, general-purpose programming language known for its readable syntax and huge ecosystem.
            It’s the lingua franca of data science and machine learning: from quick data exploration to production-grade pipelines.
          </p>
          <h3 className="font-semibold mb-1">A short history</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Python began in the late 1980s and was released publicly in 1991 by Guido van Rossum. Its design emphasizes clarity and
            productivity—"there should be one—and preferably only one—obvious way to do it." Over time, its standard library,
            thriving package index (PyPI), and welcoming community made it the go-to language for scientists and engineers.
          </p>
          <h3 className="font-semibold mb-1">Why ML folks love it</h3>
          <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1 mb-2">
            <li>Clean syntax → focus on ideas, not boilerplate.</li>
            <li>Powerful libraries → NumPy, pandas, scikit-learn, PyTorch, TensorFlow, and more.</li>
            <li>Great tooling → notebooks, visualization, and rich data workflows.</li>
          </ul>
        </section>

        {/* Professor voice: gentle breakdown */}
        <section className="mb-10 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">How we’ll learn this week</h2>
          <ol className="list-decimal pl-5 text-gray-700 dark:text-gray-300 space-y-2">
            <li><span className="font-medium">Python basics:</span> variables, types, and control flow.</li>
            <li><span className="font-medium">Data structures:</span> lists, tuples, dictionaries, and sets—when and why.</li>
            <li><span className="font-medium">ML workflow:</span> loading data, splitting, training, and evaluating at a high level.</li>
          </ol>
          <div className="mt-4 flex items-center gap-2 text-green-700 dark:text-green-300">
            <CheckCircle2 className="h-5 w-5" />
            <p className="text-sm">We’ll keep momentum without rushing—small steps, clear wins.</p>
          </div>
        </section>

        {/* Running Python locally & in-browser */}
        <section className="mb-12 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Running Python: your options</h2>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="font-medium">1) Local install (traditional)</h3>
              <p>Install <a href="https://www.python.org/downloads/" className="text-green-700 dark:text-green-300 underline">Python 3</a>, then use a code editor (VS Code) and run scripts with <code className="px-1 rounded bg-gray-100 dark:bg-gray-800">python your_file.py</code>.</p>
            </div>
            <div>
              <h3 className="font-medium">2) In your browser (no install)</h3>
              <p>
                Use <strong>Pyodide</strong> (CPython compiled to WebAssembly) to execute Python safely in the browser. Minimal setup:
              </p>
              <pre className="text-xs md:text-sm p-3 rounded bg-gray-50 dark:bg-gray-900 overflow-x-auto">{`<script src="https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js"></script>
<script>
  async function main(){
    const pyodide = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/' });
    console.log(await pyodide.runPythonAsync('sum([1,2,3])'));
  }
  main();
</script>`}</pre>
              <p className="mt-2">You can wrap this in a simple editor + console later. (PyScript is another option that wraps Pyodide with HTML components.)</p>
            </div>
          </div>
        </section>

        {/* Nav + progress actions */}
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button disabled className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-400 cursor-not-allowed">
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={markComplete}
              className={`px-4 py-2 rounded-lg border ${completed ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-300' : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              title={user ? 'Save progress for this page' : 'Sign in to save progress'}
            >
              {completed ? 'Progress saved ✓' : 'Mark start as complete'}
            </button>
            <Link
              href="/course/week-1/python-syntax"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow"
              onClick={async () => { if (!completed) await markComplete(); }}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
