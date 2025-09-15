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
  Home,
} from 'lucide-react';

/**
 * Week 1 • Lesson 1: Python Syntax (Light-only)
 * - Pure Tailwind UI (no dark classes)
 * - Forces light theme on all devices (mobile + desktop)
 * - Progress via `tracking` (user_id, key)
 * - Sticky, responsive sidebar + scrollspy
 * - In-browser Python runner (Web Worker + Pyodide) with quick-loads
 */

// --- Config ------------------------------------------------------------------
const PROGRESS_KEY = 'week-1:python-syntax';

const SECTIONS = [
  { id: 'intro', label: 'Lesson intro' },
  { id: 'variables', label: 'Variables: labeled containers' },
  { id: 'types', label: 'Core types (int/float/str/bool)' },
  { id: 'print', label: 'Printing & f-strings' },
  { id: 'control', label: 'Decisions: if / elif / else' },
  { id: 'loops', label: 'Loops: for / while' },
  { id: 'helpers', label: 'range · enumerate · zip' },
  { id: 'functions', label: 'Functions: your own commands' },
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
export default function PythonSyntaxPage() {
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
      ;['theme', 'color-theme', 'ui-theme', 'chakra-ui-color-mode', 'mantine-color-scheme', 'next-theme']
        .forEach((k) => {
          if (localStorage.getItem(k) !== 'light') localStorage.setItem(k, 'light');
        });
      if (localStorage.getItem('darkMode') === 'true') localStorage.setItem('darkMode', 'false');
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
      {/* Header (home icon, centered title, tidy mobile toggle) */}
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
                Week 1 · Python Syntax
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
                onClick={() => setSidebarOpen(false)}
              >
                {s.label}
              </a>
            ))}
          </nav>
          <div className="mt-6 p-3 rounded-xl bg-gray-50 text-xs text-gray-600">
            Don’t worry if you get stuck — that’s normal. Small steps compound.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-8">
          {/* Intro */}
          <section id="intro" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Python Syntax, calmly explained</h1>
            <p className="text-gray-700">
              Think of Python as speaking to the computer in friendly, precise sentences. This lesson builds your
              core vocabulary and grammar one brick at a time, so each new idea sits comfortably on the last. We’ll
              trade bullet lists for short, readable explanations and tiny examples you can run immediately.
            </p>
            <Box tone="tip" title="Mindset">
              Progress over perfection. Errors are feedback, not failure. Read messages from top to bottom, change one
              thing, and try again. That loop is how programmers learn—no drama required.
            </Box>
          </section>

          {/* Variables */}
          <section id="variables" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Variables: labeled containers</h2>
            <p className="text-gray-700">
              A <em>variable</em> is a small label you stick on a value so you can refer to it later—like jars on a shelf.
              In Python you don’t declare types up front; you simply assign a name to a value and start using it. Choose
              descriptive names in <code>lowercase_with_underscores</code> so your intent is obvious at a glance, and avoid
              reusing names like <code>list</code> or <code>dict</code> that belong to Python itself.
            </p>
            <pre className="text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap">{`total_cookies = 12
friend_name = 'Ada'
pi = 3.14159
is_hungry = True`}</pre>
            <Box tone="pro" title="Naming like a pro">
              Prefer concrete nouns (<code>total_sales</code>, <code>customer_name</code>) over placeholders (<code>x</code>, <code>thing</code>). Your future
              self will thank you when you return to the file next week.
            </Box>
          </section>

          {/* Core types */}
          <section id="types" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Core types (int · float · str · bool)</h2>
            <p className="text-gray-700">
              Python’s built‑in types cover everyday needs without ceremony. Numbers come as integers and floating‑point
              values; text lives in strings; truth values are booleans. You can mix them freely in expressions, and a few
              small operators unlock most tasks—<code>//</code> for floor division, <code>**</code> for powers, and methods like
              <code>.upper()</code> on strings when you need simple transformations.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <h3 className="font-medium mb-1">Numbers</h3>
                <pre className="text-sm whitespace-pre-wrap">{`apples = 7      # int
price = 2.5     # float
print(apples * price)`}</pre>
                <p className="text-sm text-gray-600 mt-2">Use <code>//</code> for floor division and <code>**</code> for powers.</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <h3 className="font-medium mb-1">Text & truth</h3>
                <pre className="text-sm whitespace-pre-wrap">{`greeting = 'hello'  # str
is_weekend = False   # bool
print(greeting.upper(), bool(1), bool(''))`}</pre>
                <p className="text-sm text-gray-600 mt-2">Empty things are <code>False</code> (<code>''</code>, <code>[]</code>, <code>{'{}'}</code>); others are <code>True</code>.</p>
              </div>
            </div>
            <Box tone="warn" title="Beginner trap: = vs ==">
              <code>=</code> assigns a value (<code>x = 3</code>), while <code>==</code> checks equality (<code>x == 3</code>). Mixing them up causes errors.
            </Box>
          </section>

         {/* Printing */}
<section
  id="print"
  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
>
  <h2 className="text-xl font-semibold">Printing & f-strings</h2>
  <p className="text-gray-700">
    Printing is your window into the program’s brain. Use <code>print()</code>{" "}
    to inspect values as you go. f-strings are lightweight templates—place names
    inside curly braces and let Python fill the blanks, formatting numbers or
    text as needed.
  </p>

  {/* Code */}
  <div className="space-y-2">
    <pre className="text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap">{`name = 'Grace'
score = 93.756
print(f'Hello {name}, score: {score:.1f}')`}</pre>

    {/* Output */}
    <div className="text-sm bg-gray-900 text-green-200 p-3 rounded font-mono">
      Hello Grace, score: 93.8
    </div>
  </div>

  <Box tone="tip" title="Why this matters">
    Seeing the data flow is the fastest way to build intuition and fix bugs
    early.
  </Box>
</section>


          {/* Loops */}
<section
  id="loops"
  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
>
  <h2 className="text-xl font-semibold">
    Loops: <code>for</code> & <code>while</code>
  </h2>
  <p className="text-gray-700">
    Use <code>for</code> when you want to visit each item in a collection; reach
    for <code>while</code> when you need to repeat until a condition changes.
    Both rely on clear stopping rules, and both reward small, readable bodies
    over big, tangled ones.
  </p>

  <div className="grid md:grid-cols-2 gap-4">
    {/* for loop */}
    <div className="rounded-xl border border-gray-200 p-4 bg-gray-50 space-y-2">
      <h3 className="font-medium mb-1">for: walk a collection</h3>
      <pre className="text-sm whitespace-pre-wrap">{`for n in [1,2,3,4]:
    print(n*n)`}</pre>

      {/* Output */}
      <div className="text-sm bg-gray-900 text-green-200 p-3 rounded font-mono">
        1<br />
        4<br />
        9<br />
        16
      </div>
    </div>

    {/* while loop */}
    <div className="rounded-xl border border-gray-200 p-4 bg-gray-50 space-y-2">
      <h3 className="font-medium mb-1">while: repeat until</h3>
      <pre className="text-sm whitespace-pre-wrap">{`total, i = 0, 0
nums = [3, 5, 2]
while i < len(nums):
    total += nums[i]
    i += 1
print(total)`}</pre>

      {/* Output */}
      <div className="text-sm bg-gray-900 text-green-200 p-3 rounded font-mono">
        10
      </div>

      <p className="text-sm text-gray-600 mt-2">
        Use <code>while</code> when the number of steps isn’t known ahead of
        time.
      </p>
    </div>
  </div>

  <Box tone="warn" title="Beginner trap: infinite loop">
    Always move toward the stopping condition (e.g., increment <code>i</code>).
    If your loop never ends, refresh the runner to regain control.
  </Box>
</section>

          {/* Helpers */}
<section
  id="helpers"
  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
>
  <h2 className="text-xl font-semibold">
    Handy helpers: <code>range</code>, <code>enumerate</code>, <code>zip</code>
  </h2>
  <p className="text-gray-700">
    As you loop, three tiny tools make life easier. <code>range(n)</code> gives
    you a stream of numbers without building a list by hand.{" "}
    <code>enumerate(seq)</code> lets you iterate with both index and value in
    one neat pair. And <code>zip(a, b)</code> walks multiple sequences in
    lock-step so related items travel together.
  </p>

  <div className="space-y-4">
    {/* range */}
    <div className="rounded-xl border border-gray-200 p-4 bg-gray-50 space-y-2">
      <h3 className="font-medium mb-1">range</h3>
      <pre className="text-sm whitespace-pre-wrap">{`for i in range(3):
    print('i =', i)`}</pre>
      <div className="text-sm bg-gray-900 text-green-200 p-3 rounded font-mono">
        i = 0<br />
        i = 1<br />
        i = 2
      </div>
    </div>

    {/* enumerate */}
    <div className="rounded-xl border border-gray-200 p-4 bg-gray-50 space-y-2">
      <h3 className="font-medium mb-1">enumerate</h3>
      <pre className="text-sm whitespace-pre-wrap">{`names = ['Ada','Grace','Linus']
for idx, name in enumerate(names):
    print(idx, name)`}</pre>
      <div className="text-sm bg-gray-900 text-green-200 p-3 rounded font-mono">
        0 Ada<br />
        1 Grace<br />
        2 Linus
      </div>
    </div>

    {/* zip */}
    <div className="rounded-xl border border-gray-200 p-4 bg-gray-50 space-y-2">
      <h3 className="font-medium mb-1">zip</h3>
      <pre className="text-sm whitespace-pre-wrap">{`xs, ys = [1,2,3], [10,20,30]
for x, y in zip(xs, ys):
    print(x, y)`}</pre>
      <div className="text-sm bg-gray-900 text-green-200 p-3 rounded font-mono">
        1 10<br />
        2 20<br />
        3 30
      </div>
    </div>
  </div>
</section>

          {/* Functions */}
<section
  id="functions"
  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
>
  <h2 className="text-xl font-semibold">Functions: your own commands</h2>
  <p className="text-gray-700">
    A function is a small machine with a name. You hand it inputs, it performs a
    few steps, and it returns a result. Functions keep programs tidy by
    gathering related logic in one place and giving it a clear purpose.
  </p>

  <div className="space-y-2">
    {/* Code */}
    <pre className="text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap">{`def greet(name='World'):
    """Return a friendly message."""
    return f'Hello, {name}!'

print(greet())
print(greet('Ada'))`}</pre>

    {/* Output */}
    <div className="text-sm bg-gray-900 text-green-200 p-3 rounded font-mono">
      Hello, World!<br />
      Hello, Ada!
    </div>
  </div>

  <Box tone="tip" title="Why use functions?">
    They reduce repetition, make testing easier, and turn long scripts into
    simple, well-named blocks you can reason about quickly.
  </Box>
</section>

          {/* Pitfalls */}
          <section id="pitfalls" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">🚨 Common Mistake Prevention</h2>
            <Box tone="warn" title="Shadowing built-ins">
              Avoid naming variables <code>list</code>, <code>dict</code>, <code>str</code>, <code>sum</code>, etc. Prefer <code>items_list</code>, <code>user_dict</code>,
              or <code>total_sum</code> to keep the real built‑ins available.
            </Box>
            <Box tone="warn" title="Indentation & colons">
              Blocks must be indented with spaces; lines like <code>if</code>, <code>for</code>, and <code>def</code> end with <code>:</code>.
            </Box>
            <Box tone="warn" title="Equality vs assignment">
              <code>==</code> compares; <code>=</code> assigns. <code>if x = 3</code> is invalid—write <code>if x == 3</code>.
            </Box>
            <Box tone="pro" title="Read errors top → bottom">
              The final lines show where execution stopped; earlier lines explain why. Copy a minimal snippet into the
              runner and experiment.
            </Box>
          </section>

          {/* Practice */}
          <section id="practice" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Practice — three levels</h2>
            <p className="text-gray-700">
              Warm up with small reps, then build to a tiny challenge. Treat each prompt like a conversation with the
              computer: write a little, run it, adjust, repeat. Mastery comes from cycles, not cramming.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <h3 className="font-medium mb-2">Level 1 · Foundations</h3>
                <pre className="text-sm whitespace-pre-wrap">{`# 1) Make variables: name (str), age (int), student (bool) and print them.
# 2) Use if/elif/else to classify a temperature number into 'cold/warm/hot'.
# 3) Print numbers 1..5 and their squares.`}</pre>
              </div>
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <h3 className="font-medium mb-2">Level 2 · Functions</h3>
                <pre className="text-sm whitespace-pre-wrap">{`# Write a function area_circle(r) using pi=3.14159.
# Write greet(name) that returns 'Hello, <name>!'.
# Write only_evens(nums) that returns a new list with even numbers.`}</pre>
              </div>
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <h3 className="font-medium mb-2">Level 3 · Mini‑challenge</h3>
                <pre className="text-sm whitespace-pre-wrap">{`# Return a letter grade from a list of scores.
# A: >=90, B: >=80, C: >=70, else D.

def grade_average(scores):
    avg = sum(scores)/len(scores) if scores else 0
    if avg >= 90: return 'A'
    elif avg >= 80: return 'B'
    elif avg >= 70: return 'C'
    else: return 'D'

print(grade_average([88, 92, 79, 90]))`}</pre>
              </div>
            </div>
            <Box tone="tip" title="Confidence boost">
              Each exercise you finish is a real win. Celebrate small steps—they add up quickly.
            </Box>
          </section>

          {/* Runner */}
          <section id="runner" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">🏃‍♂️ Try it now</h2>
            <PythonRunnerWorker />
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              <QuickLoad label="Variables" code={`name='Ada'\nage=36\nis_student=False\nprint(name, age, is_student)`} />
              <QuickLoad label="f-strings" code={`name='Grace'\nscore=93.756\nprint(f'Hello {name}, score: {score:.1f}')`} />
              <QuickLoad label="Decision" code={`temp=28\nif temp>=30: print('hot')\nelif temp>=20: print('warm')\nelse: print('cool')`} />
              <QuickLoad label="Loop" code={`total=0\nfor n in [3,5,2]: total+=n\nprint(total)`} />
              <QuickLoad label="Function" code={`def greet(name='World'):\n    return f'Hello, {name}!'\nprint(greet())\nprint(greet('Ada'))`} />
              <QuickLoad label="Oops (fix me)" code={`# Try to run, then fix the mistakes:\n# 1) Use == instead of = in the if\n# 2) Add a colon after if\n# 3) Indent the print line\nx=3\nif x = 3\nprint('equal')`} />
            </div>
          </section>

          {/* Nav + progress */}
          <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <Link
              href="/course/week-1"
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
                href="/course/week-1/data-structures"
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
  const [code, setCode] = useState<string>(`# Edit and run Python here.\nprint('Hello, Python!')`);
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
        className="w-full min-h[200px] rounded-xl border border-gray-200 p-3 font-mono text-sm bg-white"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
      />
      <div className="mt-3">
        <div className="text-sm font-medium mb-1">Console</div>
        <pre className="w-full min-h-[150px] rounded-xl border border-gray-200 p-3 text-sm bg-gray-50 overflow-auto whitespace-pre-wrap">
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
