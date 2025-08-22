'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
  ListChecks,
  CheckCircle2,
} from 'lucide-react';

/**
 * Week 1 • Wrap-Up & Next Steps (Ultra-beginner friendly)
 * - Reads from `public.profiles` for display only
 * - Tracks progress in `tracking` (user_id, key, completed, completed_at)
 * - Sticky, responsive sidebar with reliable scrollspy (mobile friendly)
 * - Web-Worker Pyodide runner + quick-loads + friendly error hints
 * - Tons of clear explanations, recap, pitfalls, practice, and “what’s next”
 */

const PROGRESS_KEY = 'week-1:wrap-up';

const SECTIONS = [
  { id: 'congrats', label: '🎉 Congrats!' },
  { id: 'big-picture', label: 'AI → ML → Python (big picture)' },
  { id: 'you-learned', label: 'What you learned' },
  { id: 'python-recap', label: 'Python recap (quick)' },
  { id: 'structures-recap', label: 'Data structures recap' },
  { id: 'ml-recap', label: 'ML workflow recap' },
  { id: 'mistakes', label: '🚨 Common mistakes' },
  { id: 'practice-plan', label: 'Daily practice plan' },
  { id: 'mini-quiz', label: 'Mini-quiz (check yourself)' },
  { id: 'try', label: '🏃‍♂️ Try it now' },
  { id: 'reflection', label: 'Your reflection (saved locally)' },
  { id: 'next', label: 'What’s next (Week 2)' },
];

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
      <div className="mt-0.5">{icon}</div>
      <div>
        <div className="font-medium mb-1">{title}</div>
        <div className="text-sm md:text-[0.95rem] leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export default function Week1WrapUpPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  // Force light mode on mount (prevents hydration mismatches from persisted themes)
  useEffect(() => {
    try {
      const el = document.documentElement;
      el.classList.remove('dark');
      el.style.colorScheme = 'light';
      ['theme', 'color-theme', 'ui-theme'].forEach((k) => {
        if (localStorage.getItem(k) === 'dark') localStorage.setItem(k, 'light');
      });
    } catch {}
  }, []);

  // Load user + progress
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

  const username = useMemo(
    () => profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'Learner',
    [profile, user]
  );

  const markComplete = async () => {
    if (!user) return alert('Please sign in to save progress.');
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

  // Reliable scrollspy (largest visible section wins)
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

  // Reflection (local only)
  const [reflection, setReflection] = useState('');
  useEffect(() => {
    const saved = localStorage.getItem('week1_reflection') || '';
    setReflection(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem('week1_reflection', reflection || '');
  }, [reflection]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-100 backdrop-blur bg-white/70">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-bold">Week 1 • Wrap-Up & Next Steps</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <button
              className="lg:hidden inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200"
              onClick={() => setSidebarOpen((v) => !v)}
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              Contents
            </button>
            <span>
              {loading ? 'Loading…' : user ? `Signed in as ${username}` : <Link href="/signin" className="underline">Sign in</Link>}
            </span>
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
          <div className="mt-6 p-3 rounded-xl bg-gray-50 text-xs text-gray-600">
            Tip: Celebrate progress. Tiny wins add up! 🌱
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-10">
          {/* Congrats */}
          <section id="congrats" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">🎉 Great job finishing Week 1!</h1>
            <p className="text-gray-700 mt-2">
              You’ve learned enough Python to read and write basic programs, tried hands-on code in the browser, and explored the ML workflow.
              That’s a huge step. Keep the momentum—curiosity beats perfection.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <span>Mark this page complete to lock in your progress.</span>
            </div>
          </section>

          {/* Big Picture */}
          <section id="big-picture" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">AI → ML → Python (how they connect)</h2>
            <p className="text-gray-700">
              <strong>Artificial Intelligence (AI)</strong> is the big goal: getting computers to act “smart.” <strong>Machine Learning (ML)</strong> is one powerful way to do that:
              we show the computer lots of examples so it <em>learns patterns</em> and makes better guesses over time.
              <strong>Python</strong> is the friendly tool we use to do ML because it’s simple, readable, and has great libraries.
            </p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">{`AI (big goal)
 └─ ML (learn from data)
     └─ Python (the tool you write in)`}</pre>
            <Box tone="tip" title="Plain English">
              You just learned the language (Python), the containers for data (data structures), and the recipe (ML workflow).
              Next week we’ll cook with real ingredients (datasets) and tidy them (data wrangling & EDA).
            </Box>
          </section>

          {/* You learned */}
          <section id="you-learned" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">What you learned this week</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Python basics: variables, types, printing, comparisons, small programs.</li>
              <li>Core data structures: <strong>str, bool, list, tuple, set, dict</strong> — when and why to use them.</li>
              <li>ML workflow: frame the problem, split data, prepare features, baseline, train, evaluate, iterate.</li>
              <li>Hands-on skills: run code in a safe sandbox, read error messages, fix step-by-step.</li>
            </ul>
          </section>

          {/* Python recap */}
          <section id="python-recap" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2">
            <h2 className="text-xl font-semibold">Python recap (quick)</h2>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">{`# Variables and types
age = 18              # int
price = 19.99         # float
name = "Ada"          # str
is_student = True     # bool
print(f"{name} - age {age}, student? {is_student}")`}</pre>
            <Box tone="warn" title="Avoid this">
              Don’t mix text and numbers without converting (<code>"7" + 2</code> → error). Use <code>int("7") + 2</code> or <code>str(7) + "2"</code>.
            </Box>
          </section>

          {/* Data structures recap */}
          <section id="structures-recap" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Data structures recap</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <h3 className="font-medium mb-1">Lists & Dicts</h3>
                <pre className="text-sm whitespace-pre-wrap">{`scores = [85, 92, 90]
scores.append(88)
user = {"name": "Ada", "city": "Lagos"}
user["age"] = 18
print(scores)
print(user.get("email", "missing"))`}</pre>
              </div>
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <h3 className="font-medium mb-1">Tuples & Sets</h3>
                <pre className="text-sm whitespace-pre-wrap">{`point = (3, 4)  # fixed pair
colors = {"red", "blue", "red"}  # unique
print(point, colors)`}</pre>
              </div>
            </div>
          </section>

          {/* ML workflow recap */}
          <section id="ml-recap" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2">
            <h2 className="text-xl font-semibold">ML workflow recap (the reliable recipe)</h2>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">{`Frame → Split → Prepare → Baseline → Train → Evaluate → Iterate`}</pre>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li><strong>Frame:</strong> What are we predicting? How will we measure success?</li>
              <li><strong>Split:</strong> Train (learn), Validation (tune), Test (final exam).</li>
              <li><strong>Prepare:</strong> Clean data, explore patterns, create helpful features.</li>
              <li><strong>Baseline:</strong> A simple rule to beat (e.g., predict the mean).</li>
              <li><strong>Train:</strong> Teach a model from examples.</li>
              <li><strong>Evaluate:</strong> Use the right metrics (MSE, Accuracy, Precision/Recall, etc.).</li>
              <li><strong>Iterate:</strong> Try improvements step-by-step. Keep notes.</li>
            </ul>
          </section>

          {/* Common mistakes */}
          <section id="mistakes" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">🚨 Common Mistake Prevention</h2>
            <Box tone="warn" title="Python">
              • Using <code>=</code> instead of <code>==</code> in comparisons. <br />
              • Forgetting the <code>f</code> in f-strings. <br />
              • Mixing strings and numbers without converting.
            </Box>
            <Box tone="warn" title="Data splits">
              • Peeking at the test set too early (data leakage). Keep test data hidden until the very end.
            </Box>
            <Box tone="warn" title="Metrics">
              • Relying only on accuracy when classes are imbalanced—also check precision/recall/F1.
            </Box>
            <Box tone="tip" title="Pro tips">
              Print values often. Change one small thing at a time. If stuck, simplify your example.
            </Box>
          </section>

          {/* Practice plan */}
          <section id="practice-plan" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Daily practice plan (20–30 mins)</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Warm-up (5 min): rewrite a tiny example from memory.</li>
              <li>New reps (10–15 min): one list/dict exercise + one boolean or string task.</li>
              <li>Mini-ML (5–10 min): split a small dataset (even numbers 0..29), compute a baseline.</li>
            </ul>
            <Box tone="pro" title="Mindset">
              Consistency beats intensity. A little every day grows your skills fast.
            </Box>
          </section>

          {/* Mini-quiz */}
          <section id="mini-quiz" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><ListChecks className="h-5 w-5" /> Mini-quiz (no pressure)</h2>
            <Quiz />
          </section>

          {/* Runner */}
          <section id="try" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">🏃‍♂️ Try it now</h2>
            <p className="text-gray-700">
              Load a snippet, click <strong>Initialize Python</strong>, then <strong>Run</strong>. Tweak one line and run again.
            </p>
            <PythonRunnerWorker />
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              <QuickLoad
                label="Review: types"
                code={`age=18; name="Ada"; is_student=True\nprint(type(age), type(name), type(is_student))`}
              />
              <QuickLoad
                label="Review: list vs dict"
                code={`scores=[85,92,90]; scores.append(88)\nuser={"name":"Ada","city":"Lagos"}\nuser["age"]=18\nprint(scores)\nprint(user.get("email","missing"))`}
              />
              <QuickLoad
                label="Review: split & baseline"
                code={`import random, statistics as st\ndata=list(range(30))\nrandom.shuffle(data)\ntrain=data[:18]; val=data[18:24]; test=data[24:]\nmean_pred=st.mean(train)\nval_pred=[mean_pred]*len(val)\nMSE=lambda a,b: sum((x-y)**2 for x,y in zip(a,b))/len(a)\nprint('baseline MSE:', MSE(val, val_pred))`}
              />
              <QuickLoad
                label="Fix me (syntax)"
                code={`# fix: use ==, add colon, indent\nx=5\nif x = 5\nprint('ok')`}
              />
            </div>
          </section>

          {/* Reflection */}
          <section id="reflection" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Your reflection</h2>
            <p className="text-gray-700 mb-2">
              Write one thing you learned, one thing that was hard, and one thing you’re proud of. This is saved in your browser only.
            </p>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="I learned..., I found ... challenging, I’m proud that..."
              className="w-full min-h-[140px] rounded-xl border border-gray-200 p-3 font-sans text-sm bg-white"
            />
            <p className="text-xs text-gray-500 mt-2">Saved locally as you type.</p>
          </section>

          {/* Next steps */}
          <section id="next" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">What’s next (Week 2 preview)</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li><strong>Data Wrangling & EDA:</strong> load CSVs, clean messy data, explore patterns, visualize.</li>
              <li><strong>Skills you’ll use:</strong> lists/dicts for organizing, booleans for filters, loops for checks, and the ML recipe again.</li>
            </ul>
            <Box tone="tip" title="Optional prep (local tools)">
              Install Python 3 and a code editor (e.g., VS Code). You already practiced in the browser; local setup helps for bigger projects.
            </Box>
          </section>

          {/* Footer Nav */}
          <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <Link
              href="/course/week-1/ml-workflow"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
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
                href="/course/week-2"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow"
                onClick={async () => { if (!completed) await markComplete(); }}
              >
                Next (Week 2) <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

/* ---------------------- Mini-Quiz (client-side) ----------------------- */
function Quiz() {
  type Q = { q: string; choices: string[]; a: number; why: string };
  const qs: Q[] = [
    {
      q: 'Which structure maps a label to a value (e.g., "email" → "ada@example.com")?',
      choices: ['List', 'Tuple', 'Dictionary', 'Set'],
      a: 2,
      why: 'Dictionaries store key → value pairs, perfect for labeled information.',
    },
    {
      q: 'Why do we keep a test set hidden until the end?',
      choices: ['To save storage', 'To avoid data leakage and keep the final score honest', 'Because models can’t read it', 'For faster training'],
      a: 1,
      why: 'If you tune on test data, your final score will be overly optimistic.',
    },
    {
      q: 'In Python, which operator checks equality?',
      choices: ['=', '==', '===', 'is'],
      a: 1,
      why: '`==` checks equality. `=` assigns. `is` checks object identity.',
    },
    {
      q: 'Sets are best when you need…',
      choices: ['Order', 'Duplicates', 'Uniqueness & fast membership checks', 'Key → value pairs'],
      a: 2,
      why: 'Sets remove duplicates and make “is this here?” very fast.',
    },
    {
      q: 'A baseline in ML is…',
      choices: ['A fancy deep model', 'Random predictions', 'A simple rule to beat (e.g., mean)', 'The test score'],
      a: 2,
      why: 'A baseline is a simple starting point to compare against.',
    },
  ];

  const [selected, setSelected] = useState<number[]>(Array(qs.length).fill(-1));
  const [show, setShow] = useState(false);

  const correct = selected.reduce((acc, v, i) => acc + (v === qs[i].a ? 1 : 0), 0);

  return (
    <div className="space-y-4">
      {qs.map((item, i) => (
        <div key={i} className="rounded-xl border border-gray-200 p-4">
          <div className="font-medium mb-2">{i + 1}. {item.q}</div>
          <div className="grid sm:grid-cols-2 gap-2">
            {item.choices.map((c, j) => {
              const active = selected[i] === j;
              return (
                <button
                  key={j}
                  onClick={() => setSelected((s) => s.map((v, k) => (k === i ? j : v)))}
                  className={cx(
                    'text-left px-3 py-2 rounded-lg border transition-colors',
                    active ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
                  )}
                >
                  {c}
                </button>
              );
            })}
          </div>
          {show && (
            <div className="mt-2 text-sm">
              {selected[i] === qs[i].a ? (
                <span className="text-green-700">Correct! {item.why}</span>
              ) : (
                <span className="text-amber-700">Not quite. {item.why}</span>
              )}
            </div>
          )}
        </div>
      ))}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShow((v) => !v)}
          className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
        >
          {show ? 'Hide Answers' : 'Check Answers'}
        </button>
        {show && (
          <div className="text-sm text-gray-700">
            Score: <span className="font-semibold">{correct}/{qs.length}</span> — nice work!
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Runner (Web Worker + friendly errors) ---------------- */
function PythonRunnerWorker() {
  const [initialized, setInitialized] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [code, setCode] = useState<string>(`# Welcome! Edit and Run.\nprint('Week 1 wrap-up sandbox')`);
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
        setOutput('[python] ready\nTip: Click Run to execute the code.');
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
        const hint = hintForError(String(data));
        setOutput(
          (o) => o + (o.endsWith('\n') ? '' : '\n') + '⚠️ ' + String(data) + (hint ? `\n💡 Hint: ${hint}` : '')
        );
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
        <div className="text-sm text-gray-600">
          Interactive Python (loads when you click Initialize)
        </div>
        <div className="flex gap-2">
          {!initialized ? (
            <button
              onClick={init}
              disabled={initializing}
              className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              {initializing ? 'Initializing…' : 'Initialize Python'}
            </button>
          ) : (
            <>
              <button onClick={run} disabled={running} className="px-3 py-2 rounded-lg bg-green-600 text-white hover:shadow">
                {running ? 'Running…' : 'Run'}
              </button>
              <button
                onClick={resetConsole}
                className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
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

/* -------------- Beginner-friendly error hints for Python ---------------- */
function hintForError(msg: string) {
  const m = msg.toLowerCase();
  if (m.includes('syntaxerror')) {
    if (m.includes('invalid syntax') || m.includes('syntaxerror:')) {
      return 'Missing colon (:) after if/for/def? Use == (comparison) not = (assignment)? Balanced parentheses/quotes?';
    }
  }
  if (m.includes('nameerror')) return 'Likely a typo or using a variable before defining it.';
  if (m.includes('indentationerror')) return 'Python uses indentation to define blocks. Indent inside if/for/def (usually 4 spaces).';
  if (m.includes('typeerror')) return 'You might be mixing text and numbers. Convert with int(...), float(...), or str(...).';
  return '';
}
