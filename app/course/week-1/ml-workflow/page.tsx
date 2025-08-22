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
  AlertTriangle,
  Lightbulb,
  LineChart,
  Layers,
  ListChecks,
  BrainCircuit,
  GraduationCap,
  Workflow,
} from 'lucide-react';

/**
 * Week 1 • Lesson 3: ML Workflow (Ultra-beginner friendly + AI→ML→Python)
 * - Reads from existing `public.profiles`
 * - Tracks progress in `tracking` (user_id, key, completed, completed_at)
 * - Mobile-first sticky sidebar with reliable scrollspy
 * - Web-Worker Pyodide runner (friendly error hints + quick-loads)
 * - Very simple language, analogies, reassurance, common mistakes, tiny steps
 */

const PROGRESS_KEY = 'week-1:ml-workflow';

const SECTIONS = [
  { id: 'landscape', label: 'AI → ML → Python (big picture)' },
  { id: 'what-is-ml', label: 'What is Machine Learning?' },
  { id: 'why-ml', label: 'Why use ML?' },
  { id: 'types-ml', label: 'Types of ML Systems' },
  { id: 'batch-online', label: 'Batch vs Online Learning' },
  { id: 'instance-model', label: 'Instance- vs Model-based' },
  { id: 'challenges', label: 'Main Challenges in ML' },
  { id: 'pipeline', label: 'The ML Pipeline (recipe)' },
  { id: 'frame', label: '1) Frame the problem' },
  { id: 'data', label: '2) Get & split the data' },
  { id: 'prepare', label: '3) Clean, explore, features' },
  { id: 'baseline', label: '4) Build a baseline' },
  { id: 'train', label: '5) Train a tiny model' },
  { id: 'evaluate', label: '6) Evaluate (right score)' },
  { id: 'iterate', label: '7) Improve → deploy → monitor' },
  { id: 'ethics', label: 'Responsible ML' },
  { id: 'practice', label: 'Practice mini-exercises' },
  { id: 'try', label: '🏃‍♂️ Try it now' },
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
    tone === 'tip' ? (
      <Lightbulb className="h-4 w-4" />
    ) : tone === 'warn' ? (
      <AlertTriangle className="h-4 w-4" />
    ) : (
      <Sparkles className="h-4 w-4" />
    );
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

export default function MLWorkflowPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
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

  // Load user + progress
  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
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

  // Reliable Scrollspy: track the section with the largest visible area
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
      {
        root: null,
        rootMargin: '-112px 0px -55% 0px',
        threshold: [0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-100 backdrop-blur bg-white/70">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white">
              <LineChart className="h-4 w-4" />
            </span>
            <span className="font-bold">Week 1 • ML Workflow</span>
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
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">In this lesson</p>
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
            Tiny steps → frequent wins. Run small code, learn one idea at a time. You’ve got this. 🌱
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-10">
          {/* AI→ML→Python Landscape */}
          <section id="landscape" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
               AI → ML → Python: how it all fits
            </h1>
            <p className="text-gray-700">
              <strong>Artificial Intelligence (AI)</strong> is the big umbrella: making computers do “smart” things.
              <strong> Machine Learning (ML)</strong> is a part of AI where we <em>teach computers by showing examples</em> rather than hard-coding rules.
              <strong> Python</strong> is our friendly language to do all this—clean data, train models, and test ideas quickly.
            </p>
            <pre className="whitespace-pre rounded bg-gray-50 p-3 text-sm overflow-auto">{`AI (big idea)
└─ ML (learn from examples)
   └─ Python (our tool to build, test, and ship)`}</pre>
            <Box tone="tip" title="Plain English">
              You just learned Python basics. Now we plug Python into the ML workflow to make useful, honest models step by step.
            </Box>
          </section>

          {/* What is ML */}
          <section id="what-is-ml" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">What is Machine Learning?</h2>
            <p className="text-gray-700">
              ML lets computers find patterns in data and use them to make predictions or decisions. Instead of telling the computer every rule,
              we give examples and it figures out patterns on its own.
            </p>
            <Box tone="tip" title="Analogy">
              Teaching a child to recognize cats: you show many pictures (data) and say “cat” or “not cat.” With enough examples, the child learns the pattern.
            </Box>
          </section>

          {/* Why ML */}
          <section id="why-ml" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Why use ML?</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li><strong>Too many rules to code by hand</strong> (spam detection).</li>
              <li><strong>Data changes over time</strong> (recommendations update as tastes change).</li>
              <li><strong>Patterns are subtle</strong> (fraud detection, medical signals).</li>
            </ul>
            <Box tone="tip" title="Real life">
              Netflix suggestions, email spam filters, translation apps, map travel times—ML is everywhere.
            </Box>
          </section>

          {/* Types of ML */}
          <section id="types-ml" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Types of Machine Learning Systems (beginner view)</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl p-4 bg-gray-50">
                <h3 className="font-medium mb-1">Supervised Learning</h3>
                <p className="text-sm text-gray-700">We have inputs and the correct answers (labels). Model learns to map input → answer.</p>
                <ul className="list-disc pl-5 text-sm text-gray-700 mt-1">
                  <li>Classification: pick a category (spam / not-spam)</li>
                  <li>Regression: predict a number (house price)</li>
                </ul>
              </div>
              <div className="rounded-xl p-4 bg-gray-50">
                <h3 className="font-medium mb-1">Unsupervised Learning</h3>
                <p className="text-sm text-gray-700">We only have inputs. Model finds groups/patterns by itself.</p>
                <ul className="list-disc pl-5 text-sm text-gray-700 mt-1">
                  <li>Clustering: group similar customers</li>
                  <li>Dimensionality reduction: compress data while keeping structure</li>
                </ul>
              </div>
            </div>
            <Box tone="tip" title="Plain English">
              Supervised = “study with answer key.” Unsupervised = “discover patterns with no answer key.”
            </Box>
          </section>

          {/* Batch vs Online */}
          <section id="batch-online" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Batch vs Online Learning</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li><strong>Batch:</strong> Train on a big chunk of data at once. Retrain occasionally (daily/weekly).</li>
              <li><strong>Online:</strong> Learn a little bit as each new example arrives (good for streams).</li>
            </ul>
            <Box tone="tip" title="Analogy">
              Batch = cooking a big pot once. Online = adding ingredients and tasting as guests arrive.
            </Box>
          </section>

          {/* Instance vs Model-based */}
          <section id="instance-model" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Instance-Based vs Model-Based Learning</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li><strong>Instance-based:</strong> Keep the examples; predict by comparing new input to stored examples (like nearest neighbor).</li>
              <li><strong>Model-based:</strong> Learn a compact rule (a model with parameters) and use that to predict.</li>
            </ul>
            <Box tone="tip" title="Analogy">
              Instance-based: “Look up similar past cases.” Model-based: “I’ve learned a formula that usually works.”
            </Box>
          </section>

          {/* Challenges */}
          <section id="challenges" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Main Challenges of ML (what trips beginners)</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Box tone="warn" title="Insufficient training data">
                Not enough examples → the model can’t learn the pattern well. <br />
                <em>Starter tip:</em> Use simpler models/strong baselines; gather more data later.
              </Box>
              <Box tone="warn" title="Non-representative data">
                Training data doesn’t reflect the real world → model fails in production. <br />
                <em>Tip:</em> Make sure your sample looks like the data you’ll see later.
              </Box>
              <Box tone="warn" title="Poor-quality data">
                Typos, missing values, weird outliers. <br />
                <em>Tip:</em> Clean early (fix types, handle missing, cap outliers).
              </Box>
              <Box tone="warn" title="Irrelevant features">
                Inputs that don’t help (noise) can confuse models. <br />
                <em>Tip:</em> Create better features (ratios, counts) from domain knowledge.
              </Box>
              <Box tone="warn" title="Overfitting (memorizing)">
                Model is great on train but bad on new data. <br />
                <em>Tip:</em> Use validation, simpler models, regularization, more data.
              </Box>
              <Box tone="warn" title="Underfitting (too simple)">
                Model can’t capture the pattern even on train. <br />
                <em>Tip:</em> Add features, try a stronger model, tune hyperparameters.
              </Box>
            </div>
          </section>

          {/* Pipeline */}
          <section id="pipeline" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2"><Layers className="h-5 w-5" />The ML Pipeline (your reliable recipe)</h2>
            <pre className="whitespace-pre rounded bg-gray-50 p-3 text-sm overflow-auto">{`Train Data (60%)  →  [Learning Phase] → Model learns from examples
Val Data (20%)    →  [Tuning Phase]   → Adjust fairly (no peeking at test)
Test Data (20%)   →  [Final Test]     → One-time honest score`}</pre>
            <Box tone="pro" title="Why this matters">
              Honest splits + a simple baseline keep you grounded. Fancy models come later.
            </Box>
          </section>

          {/* Frame */}
          <section id="frame" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">1) Frame the problem</h2>
            <p className="text-gray-700">
              <strong>What:</strong> Turn a vague wish into a clear question. <strong>Why:</strong> Your question decides your data, model, and metric.
            </p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1 text-sm">
              <li><em>Regression</em> → number (house price)</li>
              <li><em>Classification</em> → label (spam / not-spam)</li>
            </ul>
            <Box tone="tip" title="Analogy">
              Framing is like picking the recipe before cooking. It shapes every next step.
            </Box>
            <Box tone="warn" title="🚨 Common mistakes">
              • Vague goal (“make it good”) → choose a measurable target. <br />
              • Using the wrong metric (e.g., accuracy on imbalanced data).
            </Box>
          </section>

          {/* Data */}
          <section id="data" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">2) Get & split the data</h2>
            <p className="text-gray-700">Shuffle first, then split (e.g., 60/20/20). Train to learn, validation to tune, test only once at the end.</p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">{`# Simple split (no extra libraries)
import random
random.seed(0)

data = list(range(100))
random.shuffle(data)      # shuffle BEFORE splitting

n = len(data)
train = data[: int(0.6*n)]
val   = data[int(0.6*n): int(0.8*n)]
test  = data[int(0.8*n):]

len(train), len(val), len(test)`}</pre>
            <Box tone="warn" title="🚨 Common mistakes">
              • Peeking at test data (data leakage). <br />
              • Splitting, then shuffling (order matters—shuffle first).
            </Box>
          </section>

          {/* Prepare */}
          <section id="prepare" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">3) Clean, explore, and make features</h2>
            <p className="text-gray-700">
              <strong>Clean:</strong> fix missing/weird values. <strong>Explore:</strong> check patterns and outliers. <strong>Features:</strong> create helpful inputs that reveal signal.
            </p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">{`# Tiny EDA idea (pure Python)
nums = [1,2,3,4,5,100]
mean = sum(nums)/len(nums)
mad = sum(abs(x-mean) for x in nums)/len(nums)
print('mean=', mean, 'MAD=', round(mad,2))  # big MAD → possible outlier`}</pre>
            <Box tone="tip" title="Analogy">
              Features are the “ingredient prep”—chop/slice/marinate to bring out flavor (signal).
            </Box>
          </section>

          {/* Baseline */}
          <section id="baseline" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">4) Build a baseline</h2>
            <p className="text-gray-700">A simple rule to beat. If your model can’t beat it, improve features or rethink the framing.</p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">{`# Baseline: predict the mean (regression)
import statistics as st
train = [2, 3, 4, 5]
val   = [3, 6]
mean_pred = st.mean(train)

def mse(y_true, y_pred):
    return sum((a-b)**2 for a,b in zip(y_true, y_pred)) / len(y_true)

val_pred = [mean_pred for _ in val]
print('baseline MSE:', mse(val, val_pred))`}</pre>
            <Box tone="tip" title="Analogy">
              Grandma’s simple recipe. Beat this, or go back and prep better.
            </Box>
          </section>

          {/* Train */}
          <section id="train" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">5) Train a tiny model (make better guesses)</h2>
            <p className="text-gray-700">
              Learn a line <code>y ≈ a*x + b</code>: guess <code>a</code> and <code>b</code>, see how off we are, nudge them, repeat (gradient descent).
            </p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">{`# Tiny gradient descent for y ≈ a*x + b
xs = [0,1,2,3,4]
ys = [1,3,5,7,9]   # roughly y = 2x + 1

a, b = 0.0, 0.0
lr = 0.05
for epoch in range(200):
    pred = [a*x + b for x in xs]
    da = sum(2*(p - y)*x for p,y,x in zip(pred, ys, xs)) / len(xs)
    db = sum(2*(p - y)   for p,y    in zip(pred, ys))    / len(xs)
    a -= lr * da
    b -= lr * db

print('a≈', round(a,3), 'b≈', round(b,3))`}</pre>
            <Box tone="tip" title="Analogy">
              Like playing “hot or cold.” Each hint nudges you closer to the right number.
            </Box>
          </section>

          {/* Evaluate */}
          <section id="evaluate" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">6) Evaluate (pick the right score)</h2>
            <p className="text-gray-700">
              Choose a metric that matches your goal. For rare classes, accuracy can look good but hide mistakes—check precision/recall/F1 too.
            </p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">{`# Accuracy can mislead with rare classes
true = [1,1,1,1,0]
pred = [1,1,1,1,1]
acc = sum(int(t==p) for t,p in zip(true,pred)) / len(true)
print('accuracy=', acc)  # 0.8 looks good, but we missed the only 0!`}</pre>
            <Box tone="tip" title="Plain English">
              If the rare thing matters (fraud), measure how well you catch it (recall) and how clean your catches are (precision).
            </Box>
          </section>

          {/* Iterate */}
          <section id="iterate" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">7) Improve → deploy → monitor</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1 text-sm">
              <li>Try better features; compare to the baseline.</li>
              <li>Keep validation separate; test once at the end.</li>
              <li>Save the best model and serve it via an API.</li>
              <li>Monitor drift and user feedback; retrain as needed.</li>
            </ul>
            <Box tone="pro" title="Pro habit">
              Keep a small experiment log: “what changed → metric before/after.” Faster learning, fewer mistakes.
            </Box>
          </section>

          {/* Ethics */}
          <section id="ethics" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2">
            <h2 className="text-xl font-semibold">Responsible ML</h2>
            <p className="text-gray-700">
              Be mindful of bias and privacy. Ask “should we?” not just “can we?”. Simple checks early prevent harm later.
            </p>
          </section>

          {/* Practice */}
          <section id="practice" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <ListChecks className="h-5 w-5" /> Practice mini-exercises (tiny, confidence-building)
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <h3 className="font-medium mb-2">1) Split & baseline</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Make numbers 0..29. Shuffle. Split 60/20/20. Predict train mean on val. Print MSE.
                </p>
                <pre className="text-sm whitespace-pre-wrap">{`# Steps:
# 1) data=0..29
# 2) shuffle
# 3) split
# 4) mean of train
# 5) predict mean on val
# 6) print MSE`}</pre>
              </div>

              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <h3 className="font-medium mb-2">2) Fit a tiny line</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Use the gradient descent example. Change <code>ys</code> to <code>3*x + 2</code> (optionally add small noise). Do <code>a</code> and <code>b</code> get near 3 and 2?
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <h3 className="font-medium mb-2">3) Metric sense</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Make true/pred with a rare class. Compute accuracy. Why is it misleading? How would precision/recall help?
                </p>
              </div>
            </div>

            <Box tone="tip" title="Encouragement">
              Getting stuck is part of learning. Shrink the example, print values, try again. Every tiny win counts!
            </Box>
          </section>

          {/* Runner */}
          <section id="try" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">🏃‍♂️ Try it now</h2>
            <p className="text-gray-700">
              Click “Initialize Python,” load an example, then “Run.” Read any error and try a tiny fix—this is where real learning happens.
            </p>
            <PythonRunnerWorker />
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              <QuickLoad
                label="Split & mean baseline"
                code={`import random, statistics as st
data=list(range(30))
random.shuffle(data)
train=data[:18]; val=data[18:24]; test=data[24:]
mean_pred=st.mean(train)
val_pred=[mean_pred]*len(val)
MSE=lambda a,b: sum((x-y)**2 for x,y in zip(a,b))/len(a)
print('baseline MSE:', MSE(val, val_pred))`}
              />
              <QuickLoad
                label="Tiny gradient descent"
                code={`xs=[0,1,2,3,4]
ys=[1,3,5,7,9]
a=b=0.0
lr=0.05
for _ in range(200):
    pred=[a*x+b for x in xs]
    da=sum(2*(p-y)*x for p,y,x in zip(pred,ys,xs))/len(xs)
    db=sum(2*(p-y)   for p,y   in zip(pred,ys))/len(xs)
    a-=lr*da; b-=lr*db
print(round(a,3), round(b,3))`}
              />
              <QuickLoad
                label="Accuracy trap"
                code={`true=[1,1,1,1,0]
pred=[1,1,1,1,1]
acc=sum(int(t==p) for t,p in zip(true,pred))/len(true)
print('accuracy=',acc)
print('Think: what about the 0s?')`}
              />
              <QuickLoad
                label="Oops (fix me)"
                code={`# Fix issues: missing colon, wrong operator, indentation
acc=0.8
if acc = 1
print('perfect!')`}
              />
            </div>
          </section>

          {/* Footer Nav */}
          <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <Link
              href="/course/week-1/data-structures"
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
                href="/course/week-1/wrap-up"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <ChevronRight className="h-4 w-4" /> Next
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
  const [code, setCode] = useState<string>(`# Welcome! Edit and Run.\nprint('ML workflow sandbox')`);
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
        setOutput((o) => o + (o.endsWith('\n') ? '' : '\n') + '⚠️ ' + String(data) + (hint ? `\n💡 Hint: ${hint}` : ''));
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

// Beginner-friendly error hints for common Python issues
function hintForError(msg: string) {
  const m = msg.toLowerCase();
  if (m.includes('syntaxerror')) {
    if (m.includes('invalid syntax') || m.includes('syntaxerror:')) {
      return 'Check for a missing colon (:) after if/for/def, missing parentheses, or use == (comparison) instead of = (assignment).';
    }
  }
  if (m.includes('nameerror')) return 'This usually means a typo or using a variable before defining it.';
  if (m.includes('indentationerror')) return 'Python uses indentation to define blocks. Indent inside if/for/def (typically 4 spaces).';
  if (m.includes('typeerror')) return 'You might be mixing text and numbers. Convert with int(...), float(...), or str(...).';
  return '';
}
