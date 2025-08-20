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
  Lightbulb,
  AlertTriangle,
  Boxes,
  Braces,
  Layers,
} from 'lucide-react';

// --- Config ------------------------------------------------------------------
const PROGRESS_KEY = 'week-2:data-structures';

const SECTIONS = [
  { id: 'intro', label: 'Lesson intro' },
  { id: 'lists', label: 'Lists (arrays you can grow)' },
  { id: 'tuples', label: 'Tuples (fixed packs)' },
  { id: 'dicts', label: 'Dictionaries (key → value)' },
  { id: 'sets', label: 'Sets (unique items)' },
  { id: 'stackqueue', label: 'Stacks & Queues' },
  { id: 'complexity', label: 'Big-O intuition' },
  { id: 'pitfalls', label: '🚨 Common Mistake Prevention' },
  { id: 'practice', label: 'Practice (3 levels)' },
  { id: 'runner', label: 'Try it now' },
];

// --- Utilities ---------------------------------------------------------------
function classNames(...xs: (string | boolean | undefined | null)[]) {
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
    tip: {
      border: 'border-emerald-200',
      bg: 'bg-emerald-50',
      text: 'text-emerald-900',
      icon: <Lightbulb className="h-4 w-4" />,
    },
    warn: {
      border: 'border-amber-200',
      bg: 'bg-amber-50',
      text: 'text-amber-900',
      icon: <AlertTriangle className="h-4 w-4" />,
    },
    pro: {
      border: 'border-sky-200',
      bg: 'bg-sky-50',
      text: 'text-sky-900',
      icon: <Sparkles className="h-4 w-4" />,
    },
  }[tone];
  return (
    <div className={classNames('rounded-xl border p-3 md:p-4 flex gap-3 items-start', palette.border, palette.bg, palette.text)}>
      <div className="mt-0.5">{palette.icon}</div>
      <div>
        <div className="font-medium mb-1">{title}</div>
        <div className="text-sm md:text-[0.95rem] leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

// --- Page --------------------------------------------------------------------
export default function DataStructuresPage() {
  const [user, setUser] = useState<any>(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  // Force light mode on mount (handles client-side nav too)
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

  // Scrollspy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '0px 0px -70% 0px', threshold: [0, 1] }
    );
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as Element[];
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-100 backdrop-blur bg-white/70">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white">
              <Boxes className="h-4 w-4" />
            </span>
            <span className="font-bold">Week 2 • Data Structures</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200"
              onClick={() => setSidebarOpen((v) => !v)}
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              Contents
            </button>
            <div className="text-sm text-gray-600">
              {loading ? 'Loading…' : user ? 'Signed in' : <Link href="/signin" className="underline">Sign in</Link>}
            </div>
          </div>
        </div>
      </header>

      {/* Shell */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6">
        {/* Sidebar */}
        <aside
          className={classNames(
            'lg:sticky lg:top-[72px] lg:h-[calc(100vh-88px)] lg:overflow-auto',
            'rounded-2xl border border-gray-200 bg-white p-4 shadow-sm',
            sidebarOpen ? '' : 'hidden lg:block'
          )}
        >
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">In this lesson</p>
          <nav className="space-y-1">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={classNames(
                  'block px-3 py-2 rounded-lg text-sm',
                  activeId === s.id ? 'bg-green-50 text-green-800' : 'hover:bg-gray-50 text-gray-700'
                )}
              >
                {s.label}
              </a>
            ))}
          </nav>
          <div className="mt-6 p-3 rounded-xl bg-gray-50 text-xs text-gray-600">
            The right structure = simpler code and faster programs.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-8">
          {/* Intro */}
          <section id="intro" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Data Structures, clearly explained</h1>
            <p className="text-gray-700">
              Data structures are containers with superpowers. Pick the right one, and your code becomes cleaner, faster, and easier to reason about.
            </p>
            <Box tone="tip" title="Mindset">
              Learn how each structure behaves and when to reach for it. Practice reading, updating, and iterating.
            </Box>
          </section>

          {/* Lists */}
          <section id="lists" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Lists — growable, ordered collections</h2>
            <p className="text-gray-700">Use lists when order matters and you’ll add/remove or index by position.</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <h3 className="font-medium mb-1">Essentials</h3>
                <pre className="text-sm whitespace-pre-wrap">{`nums = [3, 1, 4]
nums.append(1)     # [3,1,4,1]
nums.extend([5,9]) # [3,1,4,1,5,9]
nums[0] = 10       # [10,1,4,1,5,9]
print(nums[:3])    # slicing -> [10,1,4]`}</pre>
                <p className="text-sm text-gray-600 mt-2">Indexing is O(1). Inserting/removing in the middle is O(n).</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <h3 className="font-medium mb-1">Comprehensions</h3>
                <pre className="text-sm whitespace-pre-wrap">{`squares = [n*n for n in range(6)]  # [0,1,4,9,16,25]
evens   = [n for n in squares if n % 2 == 0]`}</pre>
                <p className="text-sm text-gray-600 mt-2">Readable, compact, and fast for mapping/filtering.</p>
              </div>
            </div>
            <Box tone="warn" title="Mutable traps">
              Copy with <code>list(a)</code> or <code>a[:]</code>. Don’t use <code>b = a</code> if you need an independent copy.
            </Box>
          </section>

          {/* Tuples */}
          <section id="tuples" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Tuples — fixed-size, ordered, hashable</h2>
            <p className="text-gray-700">Use tuples for fixed records and as dict/set keys.</p>
            <pre className="text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap">{`pt = (10, 20)
x, y = pt
colors = ('red', 'green', 'blue')
# tuples are immutable -> safer to pass around`}</pre>
            <Box tone="pro" title="Common pattern">
              Return multiple results as a tuple: <code>return x, y</code>. Unpack at the call site.
            </Box>
          </section>

          {/* Dicts */}
          <section id="dicts" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Dictionaries — fast lookups by key</h2>
            <p className="text-gray-700">Great for counting, grouping, and configuration. Average O(1) get/set.</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <h3 className="font-medium mb-1">Basics</h3>
                <pre className="text-sm whitespace-pre-wrap">{`user = {'name':'Ada','age':36}
user['role'] = 'engineer'
print(user.get('city','N/A'))
for k, v in user.items():
    print(k, '->', v)`}</pre>
              </div>
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <h3 className="font-medium mb-1">Counting words</h3>
                <pre className="text-sm whitespace-pre-wrap">{`counts = {}
for w in ['a','b','a','c','b','a']:
    counts[w] = counts.get(w, 0) + 1
print(counts)  # {'a':3,'b':2,'c':1}`}</pre>
                <p className="text-sm text-gray-600 mt-2">Tip: <code>collections.Counter</code> does this too.</p>
              </div>
            </div>
            <Box tone="warn" title="Hashable keys only">
              Keys must be immutable (e.g., <code>str</code>, <code>int</code>, <code>tuple</code>). Lists can’t be dict keys.
            </Box>
          </section>

          {/* Sets */}
          <section id="sets" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Sets — unique membership, fast tests</h2>
            <p className="text-gray-700">Use sets to remove duplicates and for fast <em>in</em> checks (~O(1)).</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <h3 className="font-medium mb-1">Basics</h3>
                <pre className="text-sm whitespace-pre-wrap">{`s = set([1,2,2,3])
s.add(4)
print(2 in s)     # True
s.remove(3)       # KeyError if missing -> use discard
s.discard(99)`}</pre>
              </div>
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <h3 className="font-medium mb-1">Algebra</h3>
                <pre className="text-sm whitespace-pre-wrap">{`a, b = {1,2,3}, {3,4}
print(a | b)  # union -> {1,2,3,4}
print(a & b)  # intersection -> {3}
print(a - b)  # difference -> {1,2}`}</pre>
              </div>
            </div>
            <Box tone="pro" title="Deduplicate while preserving order">
              Use a loop with a seen-set: add if unseen; append to a new list.
            </Box>
          </section>

          {/* Stacks & Queues */}
          <section id="stackqueue" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Stacks & Queues</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <h3 className="font-medium mb-1">Stack (LIFO)</h3>
                <pre className="text-sm whitespace-pre-wrap">{`stack = []
stack.append('A')
stack.append('B')
print(stack.pop())  # 'B'`}</pre>
                <p className="text-sm text-gray-600 mt-2">Use list <code>append/pop</code> at the end (O(1)).</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <h3 className="font-medium mb-1">Queue (FIFO)</h3>
                <pre className="text-sm whitespace-pre-wrap">{`from collections import deque
q = deque()
q.append('A'); q.append('B')
print(q.popleft())   # 'A'`}</pre>
                <p className="text-sm text-gray-600 mt-2"><code>deque</code> gives O(1) appends/pops from both ends.</p>
              </div>
            </div>
            <Box tone="warn" title="List as queue? Not quite">
              Avoid <code>list.pop(0)</code> — it’s O(n). Prefer <code>deque</code>.
            </Box>
          </section>

          {/* Complexity */}
          <section id="complexity" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Big-O intuition</h2>
            <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="font-medium mb-1">Typical costs</h3>
                  <ul className="list-disc pl-5 text-gray-700 space-y-1">
                    <li>Index list item: ~O(1)</li>
                    <li>Insert in middle of list: O(n)</li>
                    <li>Dict/set lookup: ~O(1) average</li>
                    <li>Scan a container: O(n)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Heuristics</h3>
                  <ul className="list-disc pl-5 text-gray-700 space-y-1">
                    <li>Need fast membership? Use a <em>set</em>.</li>
                    <li>Need labels? Use a <em>dict</em>.</li>
                    <li>Need order & growth? Use a <em>list</em>.</li>
                    <li>Need fixed record? Use a <em>tuple</em>.</li>
                  </ul>
                </div>
              </div>
            </div>
            <Box tone="tip" title="Measure to be sure">
              Time a few approaches with <code>timeit</code> when performance matters.
            </Box>
          </section>

          {/* Pitfalls */}
          <section id="pitfalls" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">🚨 Common Mistake Prevention</h2>
            <Box tone="warn" title="Mutating while iterating">
              Building/removing while looping the same list can skip items. Iterate over a copy or build a new list.
            </Box>
            <Box tone="warn" title="Shallow vs deep copies">
              <code>list(a)</code> copies the outer list only. For nested structures, consider <code>copy.deepcopy</code>.
            </Box>
            <Box tone="warn" title="Default mutable args">
              Never use <code>def f(x=[]):</code>. Use <code>None</code> and create a list inside.
            </Box>
            <Box tone="pro" title="Use the right tool">
              <code>deque</code> for queues, <code>heapq</code> for priority queues, <code>Counter</code> for tallies, <code>defaultdict</code> for grouping.
            </Box>
          </section>

          {/* Practice */}
          <section id="practice" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Practice — three levels</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <h3 className="font-medium mb-2">Level 1 · Foundations</h3>
                <pre className="text-sm whitespace-pre-wrap">{`# 1) Make a list of names; print the first & last.
# 2) Make a tuple (x,y); unpack and print.
# 3) Make a set from a list with duplicates.`}</pre>
              </div>
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <h3 className="font-medium mb-2">Level 2 · Dictionaries</h3>
                <pre className="text-sm whitespace-pre-wrap">{`# word_count(s) -> dict of word -> frequency
def word_count(s):
    counts = {}
    for w in s.lower().split():
        counts[w] = counts.get(w, 0) + 1
    return counts`}</pre>
              </div>
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <h3 className="font-medium mb-2">Level 3 · Queue/Stack</h3>
                <pre className="text-sm whitespace-pre-wrap">{`# is_balanced(s): returns True if (), [], {} are balanced
def is_balanced(s):
    pairs = {')':'(', ']':'[', '}':'{'}
    stack = []
    for ch in s:
        if ch in '([{': stack.append(ch)
        elif ch in ')]}':
            if not stack or stack.pop() != pairs[ch]: return False
    return not stack`}</pre>
              </div>
            </div>
            <Box tone="tip" title="Confidence boost">
              Focus on clarity first; performance tuning comes after correctness.
            </Box>
          </section>

          {/* Runner */}
          <section id="runner" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">🏃‍♂️ Try it now</h2>
            <PythonRunnerWorker />
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              <QuickLoad label="List ops" code={`nums=[3,1,4]; nums.append(1); nums.extend([5,9]); print(nums)`} />
              <QuickLoad label="Word count" code={`def word_count(s):\n    counts={}\n    for w in s.lower().split():\n        counts[w]=counts.get(w,0)+1\n    return counts\nprint(word_count('To be or not to be'))`} />
              <QuickLoad label="Set algebra" code={`a={1,2,3}; b={3,4}; print(a|b, a&b, a-b)`} />
              <QuickLoad label="Balanced?" code={`def is_balanced(s):\n    pairs={')':'(',']':'[','}':'{'}\n    st=[]\n    for ch in s:\n        if ch in '([{': st.append(ch)\n        elif ch in ')]}':\n            if not st or st.pop()!=pairs[ch]: return False\n    return not st\nprint(is_balanced('([{}])'))`} />
              <QuickLoad label="Queue (deque)" code={`from collections import deque\nq=deque(['A']); q.append('B'); print(q.popleft(), list(q))`} />
              <QuickLoad label="Oops (fix me)" code={`# Fix:\n# 1) dict key must be hashable\n# 2) avoid list.pop(0)\nfrom collections import deque\nbad = {['x','y']:'oops'}\nprint(bad)`} />
            </div>
          </section>

          {/* Nav + progress */}
          <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <Link
              href="/course/week-2"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Link>
            <div className="flex items-center gap-3">
              <button
                onClick={markComplete}
                className={classNames(
                  'px-4 py-2 rounded-lg border',
                  completed
                    ? 'border-green-200 bg-green-50 text-green-800'
                    : 'border-gray-200 hover:bg-gray-50'
                )}
                title={user ? 'Save progress for this page' : 'Sign in to save progress'}
              >
                {completed ? 'Progress saved ✓' : 'Mark lesson complete'}
              </button>
              <Link
                href="/course/week-1/ml-workflow"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow"
                onClick={async () => {
                  if (!completed) await markComplete();
                }}
              >
                Next <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

// --------------------------- Runner (Web Worker) ------------------------------
function PythonRunnerWorker() {
  const [initialized, setInitialized] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [code, setCode] = useState<string>(`# Edit and run Python here. Try the QuickLoad buttons above.\nprint('Hello from Data Structures!')`);
  const workerRef = useRef<Worker | null>(null);
  const urlRef = useRef<string | null>(null);

  // Allow external quick loaders to set code
  (globalThis as any).__setRunnerCode = (c: string) => setCode(c);

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
