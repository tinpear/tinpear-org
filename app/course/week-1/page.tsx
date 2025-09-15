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
  Home,
} from 'lucide-react';

/**
 * Week 1 • Start (Beginner-first, page-based)
 * - Uses existing `public.profiles` (read-only)
 * - Simple progress tracking via `tracking` (user_id, key)
 * - Sticky, responsive sidebar with scrollspy
 * - In-browser Python runner (Web Worker + Pyodide) with quick-loads
 * - Friendly tone, analogies, tips, and common-mistake callouts
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
    tip: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    warn: 'border-amber-200 bg-amber-50 text-amber-900',
    pro: 'border-sky-200 bg-sky-50 text-sky-900',
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
                Week 1 · Start
              </span>
            </div>

            {/* Right: Contents toggle (mobile only) + status */}
            <div className="flex items-center gap-2 justify-self-end">
              <button
                type="button"
                aria-label="Toggle contents"
                className="lg:hidden inline-flex h-10 items-center gap-2 px-3 rounded-xl border border-gray-200 text-gray-800 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2"
                onClick={() => setSidebarOpen(v => !v)}
              >
                {sidebarOpen ? <X className="h-5 w-5"/> : <Menu className="h-5 w-5"/>}
                <span className="sr-only">Contents</span>
              </button>
              <div className="hidden sm:block text-sm text-gray-600">
                {loading ? 'Loading…' : user ? `Signed in as ${username}` : <Link href="/signin" className="underline">Sign in</Link>}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content area */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6">
        {/* Sidebar */}
        <aside className={cx(
          'lg:sticky lg:top-[72px] lg:h-[calc(100vh-88px)] lg:overflow-auto',
          'rounded-2xl border border-gray-200 bg-white p-4 shadow-sm',
          sidebarOpen ? '' : 'hidden lg:block'
        )}>
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">In this page</p>
          <nav className="space-y-1">
            {SECTIONS.map(s => (
              <a key={s.id} href={`#${s.id}`}
                 className={cx(
                   'block px-3 py-2 rounded-lg text-sm',
                   activeId === s.id
                     ? 'bg-green-50 text-green-800'
                     : 'hover:bg-gray-50 text-gray-700'
                 )}
                 onClick={() => setSidebarOpen(false)}
              >{s.label}</a>
            ))}
          </nav>
          <div className="mt-6 p-3 rounded-xl bg-gray-50 text-xs text-gray-600">
            Don’t worry if you get stuck — that’s normal. Small wins add up.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-8">
          {/* Welcome */}
          <section id="welcome" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Start your Python journey</h1>
            <p className="text-lg text-gray-700">
              This week lays a gentle foundation. You’ll get comfortable thinking in Python,
              writing small programs, and seeing how those skills feed naturally into the
              machine‑learning mindset. We’ll keep things practical and confidence‑building:
              short explanations, tiny experiments, and steady momentum from page to page.
            </p>
            <Box tone="tip" title="Beginner roadmap">
              Today you’ll form a big‑picture view of Python. From there we’ll move into
              essentials like syntax and data structures, then connect the dots to a simple
              ML workflow. Each lesson closes with a bite‑size practice so progress is visible
              and immediate.
            </Box>
          </section>

          {/* What is Python */}
          <section id="what-is-python" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">What is Python (and why does it matter)?</h2>
            <p className="text-gray-700">
              Python is a high‑level programming language designed to read like clear prose.
              Instead of wrestling with punctuation, you speak to the computer in straightforward
              sentences. That clarity helps you learn faster, make fewer mistakes, and focus on
              solving the problem in front of you. The language ships with a generous standard
              library and sits at the center of a vast ecosystem—from web servers and automations
              to data analysis and machine learning—so almost any idea you have already has solid
              building blocks waiting for you.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-50">
                <h3 className="font-medium mb-2">Key traits</h3>
                <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                  The syntax is intentionally readable, which keeps your attention on concepts rather
                  than ceremony. A rich “batteries‑included” toolkit comes with the language, so common
                  tasks rarely require extra setup. And when you do need more, the Python Package Index
                  offers mature libraries for virtually every domain.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50">
                <h3 className="font-medium mb-2">Everyday uses</h3>
                <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                  People use Python to automate repetitive chores, transform and visualize data, power web
                  backends and APIs, and glue tools together in DevOps workflows. You’ll start with tiny,
                  human‑sized scripts and quickly discover how the same skills scale to real projects.
                </p>
              </div>
            </div>
          </section>

          {/* History */}
          <section id="history" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">A tiny history</h2>
            <p className="text-gray-700">
              Python began in 1991, created by Guido van Rossum with a simple goal: make code easier to
              read and write. That choice drew in educators and scientists first, then engineers across
              industry. As the scientific stack matured—packages like NumPy and SciPy for fast numerical
              work, followed by pandas and scikit‑learn—Python became the default language for data and ML.
              Today it’s a lingua franca connecting research, production systems, and the tools people use
              every day.
            </p>
          </section>

          {/* Philosophy */}
          <section id="philosophy" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">The Zen of Python: how Python thinks</h2>
            <p className="text-gray-700">
              If you type <code className="px-1 rounded bg-gray-100">import this</code> in a Python shell, you’ll see a playful poem by Tim Peters—
              a compact set of values that guides how Python code is written and read. It isn’t law; it’s taste. But
              when you let these lines shape your decisions, your code becomes easier to reason about, safer to change,
              and friendlier to everyone who touches it (including future‑you).
            </p>
            <p className="text-gray-700">
              <strong>Beauty & clarity.</strong> “Beautiful is better than ugly” and “Readability counts.” Python invites you to write
              code that feels like clear prose. Choose names that say what things mean. Break long expressions into
              smaller, well‑named steps. Favor straightforward control flow over clever one‑liners. When code reads
              naturally, bugs have fewer places to hide and your intent shines through.
            </p>
            <p className="text-gray-700">
              <strong>Be explicit.</strong> “Explicit is better than implicit.” Aim to make the important details visible: pass arguments by
              name when it improves understanding, prefer simple data structures over magical side effects, and note
              assumptions close to where they’re used. The next reader should not have to guess what your function does.
            </p>
            <p className="text-gray-700">
              <strong>Keep it simple.</strong> “Simple is better than complex; complex is better than complicated.” Some problems are
              inherently intricate, but your solution shouldn’t be. Build from small pieces that compose, avoid deep
              nesting when a flat structure will do, and trim incidental complexity. When complexity is unavoidable,
              contain it behind a clean interface so most of your code can stay simple.
            </p>
            <p className="text-gray-700">
              <strong>Prefer flat, prefer sparse.</strong> “Flat is better than nested; sparse is better than dense.” Shallow hierarchies
              and whitespace are features, not flaws. Spread code so that structure is visible at a glance. A little air
              between ideas makes it easier to scan and maintain.
            </p>
            <p className="text-gray-700">
              <strong>Consistency over special cases.</strong> “Special cases aren’t special enough to break the rules, although
              practicality beats purity.” Design for the common path first and resist adding exceptions that make the
              whole system harder to understand. When reality insists, choose the pragmatic option—but do it consciously,
              and document the trade‑off.
            </p>
            <p className="text-gray-700">
              <strong>Make errors loud.</strong> “Errors should never pass silently, unless explicitly silenced.” Fail fast with helpful
              messages. Catch only the exceptions you intend to handle and explain why in code comments. Silent failure is
              costly; explicit handling builds trustworthy software.
            </p>
            <p className="text-gray-700">
              <strong>Clarity in uncertainty.</strong> “In the face of ambiguity, refuse the temptation to guess.” If the
              requirements or input are unclear, stop and surface the question—validate, log, or raise an error. Clear
              failure beats confident wrongness.
            </p>
            <p className="text-gray-700">
              <strong>One obvious way.</strong> “There should be one—and preferably only one—obvious way to do it (even if that way
              isn’t obvious at first unless you’re Dutch).” Prefer the approach that most Python programmers would expect.
              That shared idiom is what people mean by <em>pythonic</em>: code that embraces common Python patterns rather than
              importing habits from other languages. The reward is instant familiarity for your teammates and readers.
            </p>
            <p className="text-gray-700">
              <strong>Now, but not reckless.</strong> “Now is better than never, although never is often better than right now.” Ship the
              simplest slice that works, then iterate. But if a change is dangerous or poorly understood, waiting can be
              wiser than rushing.
            </p>
            <p className="text-gray-700">
              <strong>Explain it simply.</strong> “If the implementation is hard to explain, it’s a bad idea; if it’s easy to explain, it may
              be a good idea.” A design you can describe in a few plain sentences is usually the one you can maintain.
            </p>
            <p className="text-gray-700">
              <strong>Namespaces!</strong> “Namespaces are one honking great idea—let’s do more of those!” Keep things organized and avoid
              name clashes with modules, packages, and well‑scoped variables. Namespaces let large codebases stay tidy as
              they grow.
            </p>
            <Box tone="pro" title="Being Pythonic">
              To be <em>Pythonic</em> is to choose the idioms the community recognizes: list comprehensions for simple
              transformations, context managers (<code>with</code>) to manage resources, iterators and generators for streaming
              data, and clear dunder methods (<code>__repr__</code>, <code>__iter__</code>) when building your own types. Pythonic code favors
              readability, explicitness, and small, composable pieces over clever tricks.
            </Box>
            <p className="text-xs text-gray-500">
              Source: “<a className="underline" href="https://en.wikipedia.org/wiki/Zen_of_Python" target="_blank" rel="noopener noreferrer">The Zen of Python</a>” on Wikipedia (CC BY‑SA). The poem was authored by Tim Peters.
            </p>
          </section>

          {/* Strengths */}
          <section id="strengths" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Where Python shines</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gray-50">
                <h3 className="font-medium mb-1">Rapid prototyping</h3>
                <p className="text-sm text-gray-700">You can try ideas quickly with minimal setup, turning sketches into working code in minutes.</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50">
                <h3 className="font-medium mb-1">Rich data tooling</h3>
                <p className="text-sm text-gray-700">From arrays to plots to classical ML, the ecosystem lets you explore data productively.</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50">
                <h3 className="font-medium mb-1">Friendly community</h3>
                <p className="text-sm text-gray-700">Documentation, tutorials, and open‑source packages make help easy to find when you need it.</p>
              </div>
            </div>
          </section>

          {/* Objectives for the week */}
          <section id="this-week" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">What you’ll learn this week</h2>
            <p className="text-gray-700">
              By the end of the week you’ll read and write core Python comfortably, use variables and control
              flow to guide logic, and recognize when to reach for lists, dictionaries, or other structures.
              You’ll also build a high‑level picture of the ML workflow and practice running small experiments
              interactively. Throughout, we’ll emphasize clean, readable habits that make your work easier to
              share and improve.
            </p>
            <div className="mt-2 text-sm text-gray-600">We’ll keep the pace gentle and celebrate small wins.</div>
            <div className="mt-4 flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5"/>
              <p className="text-sm">Mark this page as complete before moving on.</p>
            </div>
          </section>

          {/* Running Python */}
          <section id="run-python" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">How to run Python</h2>
            <div className="space-y-3 text-gray-700">
              <div>
                <h3 className="font-medium">Local install (later)</h3>
                <p>
                  When you’re ready to work offline, install Python 3 from python.org, choose a code editor like
                  VS Code, and run files with <code className="px-1 rounded bg-gray-100">python your_file.py</code>.
                  We’ll point you there after you’ve had some wins in the browser.
                </p>
              </div>
              <div>
                <h3 className="font-medium">Interactive in your browser (now)</h3>
                <p>
                  Use the runner below to try tiny snippets instantly—no setup, no risk. It loads on demand and
                  executes your code in an isolated environment so you can experiment freely.
                </p>
              </div>
            </div>
          </section>

          {/* Mistakes */}
          <section id="mistakes" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">🚨 Common Mistakes (and how to avoid them)</h2>
            <Box tone="warn" title="Confusing = with ==">
              <code>=</code> assigns; <code>==</code> compares. If you write <code>if x = 3</code> the interpreter will error.
              Use <code>if x == 3</code> when you want to check equality.
            </Box>
            <Box tone="warn" title="Forgetting indentation & colons">
              Python uses indentation to mark code blocks (four spaces is the convention). Lines that introduce a block—
              such as <code>if</code>, <code>for</code>, and <code>def</code>—end with a colon.
            </Box>
            <Box tone="tip" title="Debug like a pro">
              Add small <code>print()</code> checks while you build. Read error messages from top to bottom and change one
              thing at a time so you can see the effect clearly.
            </Box>
          </section>

          {/* Try it now — runner */}
          <section id="try-it" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">🏃‍♂️ Try it now</h2>
            <PythonRunnerWorker />
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              <QuickLoad label="Hello" code={`print('Hello, Python!')`} />
              <QuickLoad label="Variables" code={`name='Ada'\nage=36\nprint(name, age)`} />
              <QuickLoad label="If/Else" code={`x=5\nif x>3:\n    print('big')\nelse:\n    print('small')`} />
              <QuickLoad label="Loop" code={`total=0\nfor n in [1,2,3]:\n    total+=n\nprint(total)`} />
              <QuickLoad label="Zen" code={`import this`} />
             
            </div>
          </section>

          {/* Nav + progress */}
          <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button disabled className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-400 cursor-not-allowed">
              <ChevronLeft className="h-4 w-4"/> Previous
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={markComplete}
                className={cx(
                  'px-4 py-2 rounded-lg border',
                  completed
                    ? 'border-green-200 bg-green-50 text-green-800'
                    : 'border-gray-200 hover:bg-gray-50'
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
              <button onClick={resetConsole} className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">Clear Console</button>
            </>
          )}
        </div>
      </div>
      <textarea
        className="w-full min-h-[200px] rounded-xl border border-gray-200 p-3 font-mono text-sm bg-white"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
      />
      <div className="mt-3">
        <div className="text-sm font-medium mb-1">Console</div>
        <pre className="w-full min-h-[150px] rounded-xl border border-gray-200 p-3 text-sm bg-gray-50 overflow-auto whitespace-pre-wrap">{output}</pre>
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
