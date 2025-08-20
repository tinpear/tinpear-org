'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2, ChevronLeft, ChevronRight, BrainCircuit, BarChart3, Code,
  Sparkles, Clock, BookOpen, Rocket, ShieldCheck
} from 'lucide-react';
import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';
import { supabase } from '@/lib/supabase';

/**
 * =========================
 * CONFIG (Week 1 only)
 * =========================
 * Course → Beginner ML
 * Module → week_1 (Python & ML Fundamentals)
 */
const COURSE_ID = 'beginner_ml';
const MODULE_ID = 'week_1';

type Profile = { username?: string | null; full_name?: string | null; avatar_url?: string | null };
type ProgressMap = Record<string, { completed: boolean; completed_at: string | null }>;

type Lesson = {
  id: string;
  title: string;
  minutes: number;
  outcomes: string[];
  content: React.ReactNode;
};

const LESSONS: Lesson[] = [
  {
    id: 'welcome',
    title: 'Welcome & Orientation',
    minutes: 8,
    outcomes: [
      'Understand how this course works',
      'Know the tools you’ll use',
      'Set your learning expectations'
    ],
    content: (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-100 p-4 rounded-lg">
          <p className="text-lg font-medium">👋 Welcome to Week 1!</p>
          <p className="text-gray-700 mt-2">
            This week you’ll learn the <span className="font-semibold">Python</span> you actually need for ML,
            and how the end-to-end <span className="font-semibold">ML workflow</span> fits together.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: <Code className="h-5 w-5" />, t: 'Python basics' },
            { icon: <BookOpen className="h-5 w-5" />, t: 'Notebooks & workflow' },
            { icon: <BrainCircuit className="h-5 w-5" />, t: 'Supervised vs Unsupervised' }
          ].map((b, i) => (
            <div key={i} className="border rounded-lg p-4 flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded">{b.icon}</div>
              <span className="text-sm font-medium">{b.t}</span>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'python-basics',
    title: 'Python for ML (The Essentials)',
    minutes: 18,
    outcomes: [
      'Variables, lists & dicts',
      'Loops & conditionals',
      'Functions & imports'
    ],
    content: (
      <div className="space-y-6">
        <p className="text-gray-700">
          Focus on Python constructs you’ll use daily in ML and data science.
        </p>
        <div className="rounded-lg border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Topic</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">You Should Be Able To…</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {[
                ['Lists & Dicts', 'Store/transform records, lookups, and configs'],
                ['Loops/If', 'Iterate over records and branch on conditions'],
                ['Functions', 'Encapsulate reusable logic for data transforms'],
              ].map(([k, v]) => (
                <tr key={k}>
                  <td className="px-4 py-2 font-medium">{k}</td>
                  <td className="px-4 py-2">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
          <p className="font-semibold text-purple-800 mb-1">Practice Prompt</p>
          <p className="text-purple-900">
            Write a function that takes a list of numbers and returns a dict with{' '}
            <code>min</code>, <code>max</code>, and <code>mean</code>.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'ml-concepts',
    title: 'Core ML Concepts',
    minutes: 16,
    outcomes: [
      'Explain features/labels',
      'Understand train/validation/test',
      'Recognize over/underfitting'
    ],
    content: (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h4 className="font-semibold mb-1">Traditional Programming</h4>
            <p>Input + Rules → Output</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h4 className="font-semibold mb-1">Machine Learning</h4>
            <p>Input + Output → Rules</p>
          </div>
        </div>
        <div className="rounded-lg border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Concept</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Why It Matters</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {[
                ['Features & Labels', 'Define the learning objective'],
                ['Splits', 'Prevent information leakage and measure generalization'],
                ['Over/Underfitting', 'Balance model complexity and data']
              ].map(([k, v]) => (
                <tr key={k}>
                  <td className="px-4 py-2 font-medium">{k}</td>
                  <td className="px-4 py-2">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  },
  {
    id: 'checkpoint-quiz',
    title: 'Week 1 Checkpoint (Mini-Quiz)',
    minutes: 8,
    outcomes: [
      'Self-assess understanding of Week 1',
      'Identify topics to review',
      'Prepare for Week 2'
    ],
    content: (
      <div className="space-y-6">
        <p className="text-gray-700">
          Quick knowledge check. You’ll see 5–7 conceptual questions. This doesn’t affect
          your certificate—just your confidence going into Week 2.
        </p>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
          <p className="font-medium text-yellow-900">Tip</p>
          <p className="text-yellow-900">
            If any question feels shaky, revisit the lesson before moving on.
          </p>
        </div>
        <Link
          href="/learn/beginner/week-1/quiz"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
        >
          Start Mini-Quiz
          <ChevronRight className="h-5 w-5 ml-2" />
        </Link>
      </div>
    )
  }
];

/**
 * =========================
 * PAGE (Production)
 * =========================
 */
export default function WeekOnePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email?: string | null } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [progress, setProgress] = useState<ProgressMap>({});
  const [current, setCurrent] = useState(0); // index in LESSONS
  const [hasPassedFinal, setHasPassedFinal] = useState(false);

  const username =
    profile?.full_name ||
    profile?.username ||
    (user?.email ? user.email.split('@')[0] : 'there');

  // Boot: auth → profile → upsert progress rows → load progress → (optional) final status
  useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);
      try {
        const { data: auth } = await supabase.auth.getUser();
        const u = auth.user;
        if (!u) {
          router.push('/signin');
          return;
        }
        if (!active) return;
        setUser({ id: u.id, email: u.email });

        const { data: prof } = await supabase
          .from('profiles')
          .select('username, full_name, avatar_url')
          .eq('id', u.id)
          .single();
        if (active) setProfile(prof || null);

        // Upsert progress rows for this module’s lessons (idempotent)
        const rows = LESSONS.map((l) => ({
          user_id: u.id,
          course_id: COURSE_ID,
          module_id: MODULE_ID,
          lesson_id: l.id,
          completed: false,
          completed_at: null
        }));

        await supabase
          .from('course_progress')
          .upsert(rows, {
            onConflict: 'user_id,course_id,module_id,lesson_id',
            ignoreDuplicates: true
          });

        const { data: progressRows } = await supabase
          .from('course_progress')
          .select('lesson_id, completed, completed_at')
          .eq('user_id', u.id)
          .eq('course_id', COURSE_ID)
          .eq('module_id', MODULE_ID);

        if (active) {
          const map: ProgressMap = {};
          progressRows?.forEach((r) => {
            map[r.lesson_id] = { completed: !!r.completed, completed_at: r.completed_at };
          });
          // ensure every lesson has a key
          LESSONS.forEach((l) => {
            if (!map[l.id]) map[l.id] = { completed: false, completed_at: null };
          });
          setProgress(map);
        }

        // Optional final status (if you use course_assessments)
        const { data: assess } = await supabase
          .from('course_assessments')
          .select('passed')
          .eq('user_id', u.id)
          .eq('course_id', COURSE_ID)
          .eq('assessment_id', 'final_test')
          .maybeSingle();

        if (active) setHasPassedFinal(!!assess?.passed);
      } finally {
        if (active) setLoading(false);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [router]);

  // Derived
  const completion = useMemo(() => {
    const total = LESSONS.length;
    const done = LESSONS.filter((l) => progress[l.id]?.completed).length;
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [progress]);

  // Actions
  const markLesson = async (lessonId: string, newCompleted: boolean) => {
    if (!user) return;
    const completed_at = newCompleted ? new Date().toISOString() : null;

    // optimistic update
    setProgress((prev) => ({ ...prev, [lessonId]: { completed: newCompleted, completed_at } }));

    const { error } = await supabase
      .from('course_progress')
      .update({ completed: newCompleted, completed_at, last_accessed: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('course_id', COURSE_ID)
      .eq('module_id', MODULE_ID)
      .eq('lesson_id', lessonId);

    if (error) {
      // revert
      setProgress((prev) => ({
        ...prev,
        [lessonId]: { completed: !newCompleted, completed_at: prev[lessonId]?.completed_at || null }
      }));
    }
  };

  const go = async (dir: 'prev' | 'next') => {
    const target = dir === 'prev' ? current - 1 : current + 1;
    if (target < 0) return;
    if (target >= LESSONS.length) {
      // end of week → push to week 2 intro route (customize)
      router.push('/learn/beginner/week-2');
      return;
    }
    setCurrent(target);
    if (user) {
      await supabase
        .from('course_progress')
        .update({ last_accessed: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('course_id', COURSE_ID)
        .eq('module_id', MODULE_ID)
        .eq('lesson_id', LESSONS[target].id);
    }
  };

  // UI
  const activeLesson = LESSONS[current];

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600" />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 sm:px-6 pt-10 pb-16">
        {/* Top rail (mobile) */}
        <div className="lg:hidden mb-4">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                <Image
                  src={profile?.avatar_url || '/instructor.jpeg'}
                  fill
                  alt={username || 'user'}
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-xs text-gray-500">Welcome</p>
                <p className="text-sm font-semibold text-gray-900">{username}</p>
              </div>
              <div className="ml-auto text-sm text-green-700 font-medium">{completion.pct}%</div>
            </div>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: `${completion.pct}%` }} />
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-8">
          {/* Sidebar (desktop) */}
          <aside className="hidden lg:block sticky top-20 h-max">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-4 p-5 border-b">
                <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                  <Image
                    src={profile?.avatar_url || '/instructor.jpeg'}
                    fill
                    alt={username || 'user'}
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Welcome</p>
                  <p className="text-base font-semibold text-gray-900">{username}</p>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Week 1 Progress</span>
                  <span className="text-sm font-medium text-green-700">{completion.pct}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full transition-all" style={{ width: `${completion.pct}%` }} />
                </div>
                <p className="text-xs text-gray-500">
                  {completion.done} of {completion.total} lessons completed
                </p>
              </div>

              <div className="border-t">
                <div className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">Lessons</div>
                <ul className="p-4 pt-0 space-y-2">
                  {LESSONS.map((l, i) => {
                    const active = i === current;
                    const done = progress[l.id]?.completed;
                    return (
                      <li key={l.id}>
                        <button
                          type="button"
                          onClick={() => setCurrent(i)}
                          className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 text-left transition
                            ${active ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-800">{l.title}</span>
                            <span className="text-xs text-gray-500">· {l.minutes}m</span>
                          </div>
                          {done ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="p-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-5 w-5 text-green-700" />
                  <p className="font-semibold text-gray-900">Certificate</p>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  You must pass the <span className="font-medium text-gray-900">Final Test</span> to be eligible for a certificate.
                </p>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/learn/beginner/final"
                    className="inline-flex items-center justify-center px-3 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700"
                  >
                    Take Final Test
                  </Link>
                  <button
                    type="button"
                    disabled={!hasPassedFinal}
                    className={`inline-flex items-center justify-center px-3 py-2 text-sm rounded-md border transition
                      ${hasPassedFinal ? 'border-green-600 text-green-700 hover:bg-green-50' : 'border-gray-300 text-gray-400 cursor-not-allowed'}`}
                    onClick={() => router.push('/learn/beginner/certificate')}
                    aria-disabled={!hasPassedFinal}
                    title={hasPassedFinal ? 'Claim your certificate' : 'Pass the Final Test to unlock'}
                  >
                    Claim Certificate
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="space-y-8">
            {/* Hero */}
            <section className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 md:px-8 pt-8 pb-6">
                <div className="inline-flex items-center px-3 py-1 mb-4 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                  <Rocket className="h-3.5 w-3.5 mr-1" />
                  Week 1 · Python & ML Fundamentals
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {user ? <>Welcome, <span className="text-green-600">{username}</span>!</> : 'Beginner Machine Learning'}
                </h1>
                <p className="mt-3 text-gray-600 text-lg">
                  Learn the Python you’ll actually use for ML, build intuition for the ML workflow,
                  and set yourself up for hands-on success.
                </p>
              </div>
            </section>

            {/* Active Lesson */}
            <section className="bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="p-6 md:p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 text-green-700">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Lesson {current + 1} of {LESSONS.length}</p>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {activeLesson.title}
                      </h2>
                    </div>
                  </div>
                  <div className="text-sm text-green-700 font-medium">
                    {completion.pct}% Complete
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                  <div className="bg-green-600 h-2.5 rounded-full transition-all" style={{ width: `${completion.pct}%` }} />
                </div>

                {/* What you'll get from this lesson */}
                <div className="mb-6">
                  <p className="text-gray-700 mb-2">By the end of this lesson, you will be able to:</p>
                  <ul className="space-y-2">
                    {activeLesson.outcomes.map((o) => (
                      <li key={o} className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-800">{o}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Lesson body */}
                <div className="prose max-w-none text-gray-800">
                  {activeLesson.content}
                </div>

                {/* Complete toggle */}
                <div className="mt-8">
                  <button
                    onClick={() => markLesson(activeLesson.id, !(progress[activeLesson.id]?.completed))}
                    className={`inline-flex items-center px-4 py-2 rounded-lg border transition
                      ${progress[activeLesson.id]?.completed
                        ? 'bg-green-50 border-green-300 text-green-800'
                        : 'bg-gray-50 border-gray-300 text-gray-800 hover:bg-gray-100'}`}
                  >
                    <CheckCircle2 className={`h-5 w-5 mr-2 ${progress[activeLesson.id]?.completed ? 'text-green-600' : 'text-gray-400'}`} />
                    {progress[activeLesson.id]?.completed ? 'Marked as Completed' : 'Mark as Complete'}
                  </button>
                </div>
              </div>

              {/* Footer nav */}
              <div className="px-6 md:px-8 py-4 border-t bg-gray-50 flex items-center justify-between">
                <button
                  onClick={() => go('prev')}
                  disabled={current === 0}
                  className={`inline-flex items-center px-4 py-2 rounded-md transition
                    ${current === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-white border'}`}
                >
                  <ChevronLeft className="h-5 w-5 mr-1" />
                  Previous
                </button>

                <button
                  onClick={() => go('next')}
                  className={`inline-flex items-center px-4 py-2 rounded-md transition
                    ${current === LESSONS.length - 1 ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-green-600 text-white hover:bg-green-700'}`}
                >
                  {current === LESSONS.length - 1 ? 'Finish Week 1' : 'Next Lesson'}
                  <ChevronRight className="h-5 w-5 ml-1" />
                </button>
              </div>
            </section>

            {/* Week Outcomes recap */}
            <section className="bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="p-6 md:p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Week 1 Outcomes (Recap)</h3>
                <div className="grid sm:grid-cols-3 gap-6">
                  {[
                    { title: 'Python & tooling', icon: <Code className="h-5 w-5" /> },
                    { title: 'ML workflow intuition', icon: <BrainCircuit className="h-5 w-5" /> },
                    { title: 'Ready for Week 2', icon: <BarChart3 className="h-5 w-5" /> }
                  ].map((b) => (
                    <div key={b.title} className="rounded-xl border p-5 flex items-center gap-3">
                      <div className="p-2 rounded bg-green-50 text-green-700">{b.icon}</div>
                      <span className="font-medium text-gray-900">{b.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Final CTA & certificate note */}
            <section className="text-center">
              <p className="text-gray-700">
                Complete all weeks and <span className="font-semibold">pass the Final Test</span> to unlock your certificate.
              </p>
              <div className="mt-3 flex items-center justify-center gap-3">
                <Link
                  href="/learn/beginner/final"
                  className="inline-flex items-center px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700"
                >
                  Go to Final Test
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Link>
                <Link
                  href="/learn/beginner"
                  className="inline-flex items-center px-6 py-3 rounded-lg border hover:bg-gray-50"
                >
                  Back to Overview
                </Link>
              </div>
            </section>
          </main>
        </div>
      </div>

      <Footer />
    </>
  );
}
