'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Menu,
  X,
  ChevronLeft,
  Home,
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
 * Week 1 • Lesson 3: ML Workflow (Big‑picture to deployment)
 * - Reads from existing `public.profiles`
 * - Tracks progress in `tracking` (user_id, key, completed, completed_at)
 * - Mobile-first sticky sidebar with reliable scrollspy
 * - Web-Worker Pyodide runner (friendly error hints + quick-loads)
 * - Very simple language, analogies, reassurance, common mistakes, tiny steps
 */

// --- Config ------------------------------------------------------------------
const PROGRESS_KEY = 'week-1:ml-workflow';

const SECTIONS = [
  { id: 'landscape', label: 'AI → ML → Deep Learning → Python' },
  { id: 'ai-overview', label: 'What is AI? (the big umbrella)' },
  { id: 'ml-overview', label: 'What is ML? How is it different?' },
  { id: 'dl-overview', label: 'Deep Learning (neural networks)' },
  { id: 'connections', label: 'How AI/ML/DL fit together' },
  { id: 'why-ml', label: 'Why use ML? (when rules break down)' },
  { id: 'types-ml', label: 'Types of Learning: Supervised / Unsupervised / RL' },
  { id: 'batch-online', label: 'Batch vs Online Learning' },
  { id: 'instance-model', label: 'Instance‑ vs Model‑based' },
  { id: 'pipeline', label: 'The ML Pipeline (reliable recipe)' },
  { id: 'frame', label: '1) Frame the problem' },
  { id: 'data', label: '2) Get & split the data' },
  { id: 'prepare', label: '3) Clean, explore, features' },
  { id: 'baseline', label: '4) Build a baseline' },
  { id: 'train', label: '5) Train a tiny model' },
  { id: 'evaluate', label: '6) Evaluate (right score)' },
  { id: 'iterate', label: '7) Improve → deploy → monitor' },
  { id: 'frameworks', label: 'Ecosystem: TensorFlow, PyTorch, scikit‑learn, JAX' },
  { id: 'applications', label: 'Real‑world applications (medicine, finance, etc.)' },
  { id: 'interpretability', label: 'Interpretability & fairness' },
  { id: 'mlops', label: 'MLOps: reproducibility, deployment, monitoring' },
  { id: 'practice', label: 'Practice mini‑exercises' },
  { id: 'try', label: '🏃‍♂️ Try it now (Python sandbox)' },
];

// --- Utilities ---------------------------------------------------------------
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

function Code({ children }: { children: string }) {
  return <pre className="text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap">{children}</pre>;
}
function Output({ children }: { children: string }) {
  return <pre className="text-sm bg-gray-900 text-gray-50 p-3 rounded whitespace-pre-wrap">{children}</pre>;
}

// --- Page --------------------------------------------------------------------
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
                Week 1 · ML Workflow
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
          {/* AI→ML→DL→Python Landscape */}
          <section id="landscape" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              AI → ML → DL → Python: how it all fits
            </h1>
            <p className="text-gray-700">
              <strong>Artificial Intelligence (AI)</strong> is the big umbrella: making computers do things that look smart. 
              <strong> Machine Learning (ML)</strong> is a part of AI where we <em>teach by examples</em> instead of hand‑coding rules. 
              <strong>Deep Learning (DL)</strong> is a modern ML approach that stacks simple units (neurons) into deep networks to learn powerful patterns. 
              <strong>Python</strong> is our friendly glue—the language we use to explore data, train models, and ship ideas.
            </p>
            <Code>{`AI (big idea)
└─ ML (learn from examples)
   └─ Deep Learning (neural nets)
      └─ Python (our tool to build, test, and ship)`}</Code>
            <Box tone="tip" title="Plain English">
              You’ve learned Python basics—now you’ll use them to build honest, useful ML projects step by step.
            </Box>
          </section>

          {/* AI Overview */}
          <section id="ai-overview" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">What is AI?</h2>
            <p className="text-gray-700">
              AI covers any technique that makes computers behave intelligently: search (finding good moves in chess), planning, logic, expert systems,
              and learning from data. Today’s boom is driven by <em>learning</em> approaches that scale with data and compute.
            </p>
            <Box tone="pro" title="Fun examples">
              Chess engines, route planning in maps, voice assistants, large language models, and smart cameras all live under the AI umbrella.
            </Box>
          </section>

          {/* ML Overview */}
          <section id="ml-overview" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">What is Machine Learning?</h2>
            <p className="text-gray-700">
              ML finds patterns in data and uses them to make predictions or decisions. We don’t list every rule; we show examples and the model learns patterns.
              When the real world changes, we update the model with fresh examples.
            </p>
            <Box tone="tip" title="Analogy">
              Teaching a child to recognize cats: show many pictures (data) and say “cat” or “not cat.” With enough examples, they internalize the pattern.
            </Box>
          </section>

          {/* DL Overview */}
          <section id="dl-overview" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Deep Learning in one breath</h2>
            <p className="text-gray-700">
              Deep Learning stacks many simple math units (neurons) into layers. Each layer transforms the data a bit; stack enough layers and the network can
              model complex functions. We train by nudging weights to reduce error (gradient descent), guided by backpropagation.
            </p>
            <Code>{`# Tiny neuron intuition: a weighted sum, then a squish (sigmoid)
import math
w, b, x = 1.2, -2.0, 3
z = w*x + b
sigmoid = 1/(1+math.exp(-z))
print('z =', round(z, 3))
print('σ(z) =', round(sigmoid, 3))`}</Code>
            <div className="text-xs font-medium text-gray-600">Output</div>
            <Output>{`z = 1.6
σ(z) = 0.832`}</Output>
            <Box tone="tip" title="Where DL shines">
              Images, speech, language, and other high‑dimensional signals where handcrafted rules struggle.
            </Box>
          </section>

          {/* Connections */}
          <section id="connections" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">How AI, ML, and DL connect</h2>
            <p className="text-gray-700">
              AI is the goal. ML is a set of methods to reach that goal using data. DL is one powerful ML family. Most real projects mix classic ML (like
              trees and linear models) with deep models depending on the task, data size, and latency budget.
            </p>
          </section>

          {/* Why ML */}
          <section id="why-ml" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Why use ML?</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li><strong>Too many rules</strong> to code by hand (spam detection).</li>
              <li><strong>Data drifts</strong> over time (recommendations evolve with tastes).</li>
              <li><strong>Patterns are subtle</strong> (fraud, medical signals, supply forecasts).</li>
            </ul>
            <Box tone="tip" title="Everyday ML">
              Movie suggestions, email spam filters, translation, travel times, credit scoring, personalized feeds.
            </Box>
          </section>

          {/* Types of Learning */}
          <section id="types-ml" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Types of Learning</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-xl p-4 bg-gray-50">
                <h3 className="font-medium mb-1">Supervised</h3>
                <p className="text-sm text-gray-700">We have inputs <em>and</em> correct answers (labels). Learn input → answer.</p>
                <ul className="list-disc pl-5 text-sm text-gray-700 mt-1">
                  <li>Classification: category (spam / not spam)</li>
                  <li>Regression: number (house price)</li>
                </ul>
                <Code>{`# Logistic: turn a score into a probability
import math
w, b = 1.2, -2
for x in [0,1,2,3]:
    z = w*x + b
    p = 1/(1+math.exp(-z))
    print(x, round(p, 3))`}</Code>
                <div className="text-xs font-medium text-gray-600">Output</div>
                <Output>{`0 0.119
1 0.231
2 0.401
3 0.598`}</Output>
              </div>
              <div className="rounded-xl p-4 bg-gray-50">
                <h3 className="font-medium mb-1">Unsupervised</h3>
                <p className="text-sm text-gray-700">Only inputs; discover structure (clusters, manifolds, anomalies).</p>
                <Code>{`# 1-D k-means intuition
pts = [1,2,8,9]
centers = [2.0, 8.0]
for _ in range(3):
    left, right = [], []
    for p in pts:
        (left if abs(p-centers[0])<=abs(p-centers[1]) else right).append(p)
    centers = [sum(left)/len(left), sum(right)/len(right)]
print([round(c,1) for c in centers])`}</Code>
                <div className="text-xs font-medium text-gray-600">Output</div>
                <Output>{`[1.5, 8.5]`}</Output>
              </div>
              <div className="rounded-xl p-4 bg-gray-50">
                <h3 className="font-medium mb-1">Reinforcement Learning (RL)</h3>
                <p className="text-sm text-gray-700">An <em>agent</em> acts in an environment, gets rewards, and learns a policy to maximize long‑term reward.
                  Think game playing, robotics, and resource allocation.</p>
              </div>
            </div>
            <Box tone="tip" title="Mnemonic">
              Supervised = study with answer key. Unsupervised = discover patterns. RL = learn by trial‑and‑error rewards.
            </Box>
          </section>

          {/* Batch vs Online */}
          <section id="batch-online" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Batch vs Online Learning</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li><strong>Batch:</strong> Train on a big chunk at once; retrain occasionally (daily/weekly).</li>
              <li><strong>Online:</strong> Update a little as each new example arrives (streams).</li>
            </ul>
            <Box tone="tip" title="Analogy">
              Batch = cook a big pot once. Online = keep tasting and adjusting as guests arrive.
            </Box>
          </section>

          {/* Instance vs Model-based */}
          <section id="instance-model" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Instance‑Based vs Model‑Based</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li><strong>Instance‑based:</strong> Store examples; predict by comparing to neighbors.</li>
              <li><strong>Model‑based:</strong> Learn compact parameters (a formula) and predict with them.</li>
            </ul>
            <Box tone="tip" title="Analogy">
              Instance‑based: “Look up similar past cases.” Model‑based: “Use a learned formula that usually works.”
            </Box>
          </section>

          {/* Pipeline */}
          <section id="pipeline" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2"><Layers className="h-5 w-5" />The ML Pipeline (your reliable recipe)</h2>
            <Code>{`Train (60%)  →  [Learning Phase] → model fits examples
Val   (20%)  →  [Tuning Phase]   → adjust fairly (no peeking at test)
Test  (20%)  →  [Final Check]    → one-time honest score`}</Code>
            <Box tone="pro" title="Why splits matter">
              Honest splits + a simple baseline keep you grounded. Fancy models come later.
            </Box>
          </section>

          {/* Frame */}
          <section id="frame" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">1) Frame the problem</h2>
            <p className="text-gray-700">
              Be painfully clear: What is the input? What do you want to predict? How will you measure success? Your framing decides your data,
              model family, and evaluation metric.
            </p>
            <Box tone="warn" title="Common slips">
              Vague goal (“make it good”), wrong metric (accuracy on imbalanced data), optimizing the wrong target.
            </Box>
          </section>

          {/* Data */}
          <section id="data" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">2) Get & split the data</h2>
            <p className="text-gray-700">Shuffle first, then split (e.g., 60/20/20). Train to learn, validation to tune, test only once at the end.</p>
            <Code>{`import random
random.seed(0)
data=list(range(100))
random.shuffle(data)
n=len(data)
train=data[:int(0.6*n)]
val  =data[int(0.6*n):int(0.8*n)]
test =data[int(0.8*n):]
print(len(train), len(val), len(test))`}</Code>
            <div className="text-xs font-medium text-gray-600">Output</div>
            <Output>{`60 20 20`}</Output>
            <Box tone="warn" title="Leaks & order">
              Don’t peek at test. Shuffle before split (order matters). Time‑series needs time‑aware splits.
            </Box>
          </section>

          {/* Prepare */}
          <section id="prepare" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">3) Clean, explore, make features</h2>
            <p className="text-gray-700">
              <strong>Clean:</strong> fix types, missing values, outliers. <strong>Explore:</strong> understand distributions. <strong>Features:</strong> craft inputs that reveal signal.
            </p>
            <Code>{`nums=[1,2,3,4,5,100]
mean=sum(nums)/len(nums)
mad=sum(abs(x-mean) for x in nums)/len(nums)
print('mean=', round(mean,2), 'MAD=', round(mad,2))`}</Code>
            <div className="text-xs font-medium text-gray-600">Output</div>
            <Output>{`mean= 19.17 MAD= 28.47`}</Output>
            <Code>{`# Min-max scale example
xs=[2,4,6,10]
mn, mx=min(xs), max(xs)
scaled=[(x-mn)/(mx-mn) for x in xs]
print(scaled)`}</Code>
            <div className="text-xs font-medium text-gray-600">Output</div>
            <Output>{`[0.0, 0.25, 0.5, 1.0]`}</Output>
          </section>

          {/* Baseline */}
          <section id="baseline" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">4) Build a baseline</h2>
            <p className="text-gray-700">A simple rule to beat. If your model can’t beat it, improve features or rethink the framing.</p>
            <Code>{`import statistics as st
train=[2,3,4,5]
val=[3,6]
mean_pred=st.mean(train)
MSE=lambda a,b: sum((x-y)**2 for x,y in zip(a,b))/len(a)
val_pred=[mean_pred]*len(val)
print('baseline MSE:', MSE(val, val_pred))`}</Code>
            <div className="text-xs font-medium text-gray-600">Output</div>
            <Output>{`baseline MSE: 3.25`}</Output>
            <Box tone="tip" title="Grandma’s recipe">
              Keep it honest and simple. Fancy models must beat your baseline, not just feel clever.
            </Box>
          </section>

          {/* Train */}
          <section id="train" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">5) Train a tiny model</h2>
            <p className="text-gray-700">
              Learn a line <code>y ≈ a*x + b</code>: guess <code>a</code>/<code>b</code>, measure error, nudge them, repeat (gradient descent).
            </p>
            <Code>{`xs=[0,1,2,3,4]
ys=[1,3,5,7,9]   # roughly y = 2x + 1
a,b=0.0,0.0
lr=0.05
for _ in range(200):
    pred=[a*x+b for x in xs]
    da=sum(2*(p-y)*x for p,y,x in zip(pred,ys,xs))/len(xs)
    db=sum(2*(p-y)   for p,y   in zip(pred,ys))/len(xs)
    a-=lr*da; b-=lr*db
print('a≈', round(a,3), 'b≈', round(b,3))`}</Code>
            <div className="text-xs font-medium text-gray-600">Output</div>
            <Output>{`a≈ 1.996 b≈ 1.01`}</Output>
            <Box tone="tip" title="Hot or cold">
              Like the childhood game: each step tells you which way to move. Keep steps small; measure as you go.
            </Box>
          </section>

          {/* Evaluate */}
          <section id="evaluate" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">6) Evaluate (pick the right score)</h2>
            <p className="text-gray-700">
              Metrics should match your goal. For rare positives, accuracy can look great while missing what matters. Use precision, recall, and F1.
            </p>
            <Code>{`true=[1,0,1,0,1,0]
pred=[1,0,1,1,0,0]
TP=sum(t==1 and p==1 for t,p in zip(true,pred))
TN=sum(t==0 and p==0 for t,p in zip(true,pred))
FP=sum(t==0 and p==1 for t,p in zip(true,pred))
FN=sum(t==1 and p==0 for t,p in zip(true,pred))
precision=TP/(TP+FP)
recall=TP/(TP+FN)
F1=2*precision*recall/(precision+recall)
print('TP, TN, FP, FN =', TP, TN, FP, FN)
print('precision =', round(precision,3))
print('recall    =', round(recall,3))
print('F1        =', round(F1,3))`}</Code>
            <div className="text-xs font-medium text-gray-600">Output</div>
            <Output>{`TP, TN, FP, FN = 2 3 1 1
precision = 0.667
recall    = 0.667
F1        = 0.667`}</Output>
            <Box tone="tip" title="Accuracy trap">
              A model that predicts “no fraud” all day can be 99% accurate—yet completely useless. Measure what matters.
            </Box>
          </section>

          {/* Iterate/Deploy */}
          <section id="iterate" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">7) Improve → deploy → monitor</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1 text-sm">
              <li>Try better features and stronger models; compare against the baseline.</li>
              <li>Keep validation separate; test once at the end.</li>
              <li>Save the best model and serve it via an API.</li>
              <li>Monitor drift, latency, and user feedback; retrain as needed.</li>
            </ul>
            <Box tone="pro" title="Pro habit">
              Keep an experiment log: “change → metric before/after.” You’ll learn faster and avoid rerunning dead ends.
            </Box>
          </section>

          {/* Frameworks */}
          <section id="frameworks" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Workflow className="h-5 w-5"/>Ecosystem: TensorFlow, PyTorch, scikit‑learn, JAX</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="rounded-xl p-4 bg-gray-50">
                <h3 className="font-medium">scikit‑learn (classic ML)</h3>
                <p>Friendly API for regression, classification, clustering, preprocessing, and pipelines. Great for tabular data and baselines.</p>
                <h3 className="font-medium mt-3">TensorFlow & Keras</h3>
                <p>Industry‑grade deep learning with automatic differentiation and deployment tooling. Keras is the high‑level, beginner‑friendly API.</p>
                <h3 className="font-medium mt-3">PyTorch</h3>
                <p>Dynamic computation graphs, pythonic feel, and a huge research community. Common in academia and production alike.</p>
              </div>
              <div className="rounded-xl p-4 bg-gray-50">
                <h3 className="font-medium">JAX</h3>
                <p>High‑performance autodiff and compilation (XLA). Great for research and scalable training.</p>
                <h3 className="font-medium mt-3">ONNX & TorchScript</h3>
                <p>Portable formats for model export to servers, browsers, or mobile devices.</p>
                <h3 className="font-medium mt-3">Hugging Face</h3>
                <p>Model zoo + tokenizers + pipelines for NLP, vision, audio, and multimodal (Transformers, Diffusers).</p>
              </div>
            </div>
            <Box tone="warn" title="Sandbox note">
              The in‑browser runner below supports <em>pure Python only</em> (no heavy ML libraries). Use these frameworks in a local notebook or cloud runtime.
            </Box>
          </section>

          {/* Applications */}
          <section id="applications" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Applications that change lives</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="rounded-xl p-4 bg-gray-50 space-y-2">
                <h3 className="font-medium">Medicine</h3>
                <p>Detecting diabetic retinopathy from eye scans, spotting cancer early, triaging radiology, predicting sepsis risk, summarizing clinical notes.</p>
                <h3 className="font-medium">Finance</h3>
                <p>Fraud detection, credit scoring, risk modeling, algorithmic trading, underwriting, and customer support automation.</p>
                <h3 className="font-medium">NLP</h3>
                <p>Search, translation, chat assistants, summarization, question‑answering, code generation (transformers & LLMs).</p>
              </div>
              <div className="rounded-xl p-4 bg-gray-50 space-y-2">
                <h3 className="font-medium">Vision</h3>
                <p>Object detection in self‑driving, defect detection on assembly lines, face de‑identification for privacy, AR filters.</p>
                <h3 className="font-medium">Recommenders</h3>
                <p>Personalized feeds in e‑commerce and media, ranking systems balancing relevance, diversity, and fairness.</p>
                <h3 className="font-medium">Robotics & RL</h3>
                <p>Learning to grasp delicate objects, warehouse navigation, energy‑efficient control policies.</p>
              </div>
            </div>
            <Box tone="tip" title="Career fuel">
              You’re learning tools that power products used by billions. Tiny practice reps now translate into real impact later.
            </Box>
          </section>

          {/* Interpretability */}
          <section id="interpretability" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Interpretability & fairness</h2>
            <p className="text-gray-700">Trustworthy models are <em>explainable</em> and <em>fair</em>. Use simple models when possible, inspect features, and consider techniques like feature importance, partial dependence, and counterfactuals. Validate across subgroups to detect bias.</p>
            <Box tone="warn" title="Data is people">
              Handle personal data with care. Ask “should we?” not just “can we?”. Prefer privacy‑preserving designs and human oversight.
            </Box>
          </section>

          {/* MLOps */}
          <section id="mlops" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">MLOps: from notebook to production</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1 text-sm">
              <li><strong>Reproducibility:</strong> pin random seeds, record code + data + metrics.</li>
              <li><strong>Versioning:</strong> datasets and models (e.g., DVC, MLflow).</li>
              <li><strong>Deployment:</strong> serve with REST/gRPC; batch vs real‑time; CPU vs GPU.</li>
              <li><strong>Monitoring:</strong> data drift, concept drift, latency, cost, fairness.</li>
              <li><strong>Feedback loop:</strong> collect labels, retrain, and validate safely.</li>
            </ul>
          </section>

          {/* Practice */}
          <section id="practice" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <ListChecks className="h-5 w-5" /> Practice mini‑exercises (tiny, confidence‑building)
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <h3 className="font-medium mb-2">1) Split & baseline</h3>
                <p className="text-sm text-gray-700 mb-2">Make numbers 0..29. Shuffle. Split 60/20/20. Predict train mean on val. Print MSE.</p>
                <Code>{`# Steps:
# 1) data=0..29
# 2) shuffle
# 3) split
# 4) mean of train
# 5) predict mean on val
# 6) print MSE`}</Code>
              </div>
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <h3 className="font-medium mb-2">2) Fit a tiny line</h3>
                <p className="text-sm text-gray-700 mb-2">Use the gradient descent example. Change <code>ys</code> to <code>3*x + 2</code> (optionally add small noise). Do <code>a</code> and <code>b</code> get near 3 and 2?</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <h3 className="font-medium mb-2">3) Metric sense</h3>
                <p className="text-sm text-gray-700 mb-2">Create an imbalanced dataset. Compute accuracy vs precision/recall/F1. Which speaks to your goal?</p>
              </div>
            </div>
            <Box tone="tip" title="Encouragement">
              Getting stuck is part of learning. Shrink the example, print values, try again. Every tiny win counts!
            </Box>
          </section>

          {/* Runner */}
          <section id="try" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">🏃‍♂️ Try it now</h2>
            <p className="text-gray-700">Click “Initialize Python,” load an example, then “Run.” Read the error if any and try a tiny fix—this is where real learning happens.</p>
            <PythonRunnerWorker />
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              <QuickLoad
                label="Split & mean baseline"
                code={`import random, statistics as st\ndata=list(range(30))\nrandom.shuffle(data)\ntrain=data[:18]; val=data[18:24]; test=data[24:]\nmean_pred=st.mean(train)\nval_pred=[mean_pred]*len(val)\nMSE=lambda a,b: sum((x-y)**2 for x,y in zip(a,b))/len(a)\nprint('baseline MSE:', MSE(val, val_pred))`}
              />
              <QuickLoad
                label="Tiny gradient descent"
                code={`xs=[0,1,2,3,4]\nys=[1,3,5,7,9]\na=b=0.0\nlr=0.05\nfor _ in range(200):\n    pred=[a*x+b for x in xs]\n    da=sum(2*(p-y)*x for p,y,x in zip(pred,ys,xs))/len(xs)\n    db=sum(2*(p-y)   for p,y   in zip(pred,ys))/len(xs)\n    a-=lr*da; b-=lr*db\nprint(round(a,3), round(b,3))`}
              />
              <QuickLoad
                label="Logistic probability"
                code={`import math\nw,b=1.2,-2\nfor x in [0,1,2,3]:\n    z=w*x+b\n    p=1/(1+math.exp(-z))\n    print(x, round(p,3))`}
              />
              <QuickLoad
                label="Confusion metrics"
                code={`true=[1,0,1,0,1,0]\npred=[1,0,1,1,0,0]\nTP=sum(t==1 and p==1 for t,p in zip(true,pred))\nTN=sum(t==0 and p==0 for t,p in zip(true,pred))\nFP=sum(t==0 and p==1 for t,p in zip(true,pred))\nFN=sum(t==1 and p==0 for t,p in zip(true,pred))\nprecision=TP/(TP+FP)\nrecall=TP/(TP+FN)\nF1=2*precision*recall/(precision+recall)\nprint('TP, TN, FP, FN =', TP, TN, FP, FN)\nprint('precision =', round(precision,3))\nprint('recall    =', round(recall,3))\nprint('F1        =', round(F1,3))`}
              />
              <QuickLoad
                label="1‑D k‑means"
                code={`pts=[1,2,8,9]\ncenters=[2.0,8.0]\nfor _ in range(3):\n    L,R=[],[]\n    for p in pts:\n        (L if abs(p-centers[0])<=abs(p-centers[1]) else R).append(p)\n    centers=[sum(L)/len(L), sum(R)/len(R)]\nprint([round(c,1) for c in centers])`}
              />
              <QuickLoad
                label="Scale features"
                code={`xs=[2,4,6,10]\nmn, mx=min(xs), max(xs)\nprint([(x-mn)/(mx-mn) for x in xs])`}
              />
              <QuickLoad
                label="Accuracy trap"
                code={`true=[1,1,1,1,0]\npred=[1,1,1,1,1]\nacc=sum(int(t==p) for t,p in zip(true,pred))/len(true)\nprint('accuracy=',acc)\nprint('Think: what about the 0s?')`}
              />
              <QuickLoad
                label="Oops (fix me)"
                code={`# Fix issues: missing colon, wrong operator, indentation\nacc=0.8\nif acc = 1\nprint('perfect!')`}
              />
            </div>
            <div className="text-xs text-gray-600">Note: heavy libraries (NumPy, scikit‑learn, TensorFlow, PyTorch) are not available in this in‑browser runner.</div>
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
        <div className="text-sm text-gray-600">Interactive Python (loads when you click Initialize)</div>
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