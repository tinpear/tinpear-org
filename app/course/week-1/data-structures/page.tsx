'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

/**
 * Week 1 • Lesson 2: Data Structures (Beginner‑first, page‑based)
 * - Pure Tailwind + semantic HTML (no external UI kits)
 * - Uses existing `public.profiles` (read‑only)
 * - Simple progress tracking via `tracking` (user_id, key)
 * - Step‑by‑step explanations with analogies + simple examples
 * - 🚨 Common Mistake Prevention: warnings & pro tips per section
 * - 🏃‍♂️ Runner: Web Worker + Pyodide (lazy init) with quick‑loads
 * - Mobile‑first layout with a left sidebar (collapsible on small screens)
 */

const PROGRESS_KEY = 'week-1:data-structures';

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'map', label: 'The Map (All Types)' },
  { id: 'str', label: 'Strings (str): text as beads' },
  { id: 'bool', label: 'Booleans (bool): light switches' },
  { id: 'numbers', label: 'Numbers (int/float): counts vs measures' },
  { id: 'list', label: 'Lists: flexible playlists' },
  { id: 'tuple', label: 'Tuples: locked boxes' },
  { id: 'dict', label: 'Dictionaries: labeled drawers' },
  { id: 'set', label: 'Sets: unique sticker packs' },
  { id: 'choose', label: 'Choosing the Right One' },
  { id: 'convert', label: 'Type Conversion' },
  { id: 'practice', label: 'Practice (3 levels)' },
  { id: 'try', label: '🏃‍♂️ Try it now' },
];

function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}

function Box({ tone, title, children }: { tone: 'tip' | 'warn' | 'pro'; title: string; children: any }) {
  const palette = {
    tip: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-900/15 dark:text-emerald-200',
    warn: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/15 dark:text-amber-100',
    pro: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/40 dark:bg-sky-900/15 dark:text-sky-100',
  }[tone];
  const icon = tone === 'tip' ? '💡' : tone === 'warn' ? '🚨' : '✨';
  return (
    <div className={cx('rounded-xl border p-3 md:p-4 flex gap-3 items-start', palette)}>
      <div className="mt-0.5 select-none">{icon}</div>
      <div>
        <div className="font-medium mb-1">{title}</div>
        <div className="text-sm md:text-[0.95rem] leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export default function DataStructuresPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  // Load user + profile + tracking
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
        const { data: track } = await supabase
          .from('tracking')
          .select('completed')
          .eq('user_id', user.id)
          .eq('key', PROGRESS_KEY)
          .maybeSingle();
        setCompleted(Boolean(track?.completed));
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
    const { error } = await supabase.from('tracking').upsert({
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
        for (const entry of entries) {
          if (entry.isIntersecting) { setActiveId(entry.target.id); break; }
        }
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
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white">DS</span>
            <span className="font-bold">Week 1 • Data Structures</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
            <button
              className="lg:hidden inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800"
              onClick={() => setSidebarOpen(v => !v)}
            >
              {sidebarOpen ? 'Close' : 'Contents'}
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
        <aside className={cx(
          'lg:sticky lg:top-[72px] lg:h-[calc(100vh-88px)] lg:overflow-auto',
          'rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 shadow-sm',
          sidebarOpen ? '' : 'hidden lg:block'
        )}>
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">In this lesson</p>
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
        <main className="space-y-10">
          {/* OVERVIEW */}
          <section id="overview" className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm space-y-3">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Data Structures, step by step</h1>
            <p className="text-gray-700 dark:text-gray-300">
              Think of data structures as different kinds of containers: boxes, drawers, lists, and sticker packs. Each holds data in a
              particular way, which makes some tasks easier. Choosing the right one keeps your code clean and your programs fast.
            </p>
            <Box tone="tip" title="Why this matters">
              Every Python program manipulates data. The better your containers, the simpler your code and the fewer bugs you fight.
            </Box>
          </section>

          {/* MAP */}
          <section id="map" className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">The Map (All Types)</h2>
            <p className="text-gray-700 dark:text-gray-300">Scalars (single values) vs collections (many values).</p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded">{`# Scalars
x = 7          # int (whole numbers)
pi = 3.14      # float (decimals)
flag = True    # bool (True/False)
name = "Ada"    # str (text)

# Collections
nums = [1, 2, 3]                # list (mutable, ordered)
pair = (10, 20)                 # tuple (immutable, ordered)
user = {"name": "Ada", "age": 36}  # dict (key → value)
unique = {1, 2, 2, 3}           # set (unique items)`}</pre>
            <p className="text-sm text-gray-600 dark:text-gray-400"><em>Mutable</em> = can change in place. <em>Immutable</em> = new value when changed.</p>
          </section>

          {/* STRINGS */}
          <section id="str" className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Strings (<code>str</code>): text as beads</h2>
            <p className="text-gray-700 dark:text-gray-300"><strong>What:</strong> A string is text. Imagine a necklace of letter beads — you can pick beads by position or slice a segment.</p>
            <p className="text-gray-700 dark:text-gray-300"><strong>Why:</strong> Almost every program works with text: names, messages, file paths.</p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded">{`s = " Python 101 "
print(s[1])         # 'P' (indexing)
print(s[1:7])       # 'Python' (slicing)
print(s.strip())    # remove spaces at both ends → 'Python 101'
print(s.lower())    # ' python 101 '
print('-'.join(['a','b','c']))  # 'a-b-c'
print('data'.replace('a','@'))  # 'd@t@'`}</pre>
            <Box tone="warn" title="Common mistakes">
              • Forgetting quotes (<code>name = Ada</code> ❌ → <code>name = 'Ada'</code> ✅)
              <br />• Mixing single/double quotes incorrectly.
              <br />• Expecting strings to change in place — they’re immutable (methods return new strings).
            </Box>
          </section>

          {/* BOOLEANS */}
          <section id="bool" className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Booleans (<code>bool</code>): light switches</h2>
            <p className="text-gray-700 dark:text-gray-300"><strong>What:</strong> True/False values. Like a switch that’s on or off.</p>
            <p className="text-gray-700 dark:text-gray-300"><strong>Why:</strong> Decisions in code depend on conditions.</p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded">{`is_open = True
is_admin = False
print(is_open and is_admin)   # both must be True

# Truthiness: empties are False; others True
print(bool(0), bool(1), bool(''), bool('hi'), bool([]), bool([1]))

# Comparisons return bool
x, y = 3, 5
print(x < y, x == y, x != y)`}</pre>
            <Box tone="warn" title="Common mistakes">
              • Using <code>True</code>/<code>False</code> with the wrong capitalization (must be capitalized).
              <br />• Confusing assignment <code>=</code> with comparison <code>==</code>.
              <br />• Assuming <code>'False'</code> is False — any non‑empty string is True.
            </Box>
          </section>

          {/* NUMBERS */}
          <section id="numbers" className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Numbers (<code>int</code>/<code>float</code>): counts vs measures</h2>
            <p className="text-gray-700 dark:text-gray-300"><strong>Analogy:</strong> Integers are like counting apples; floats are like measuring liters of juice.</p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded">{`a, b = 7, 2
print('add:', a + b)
print('div:', a / b)     # 3.5 float division
print('floor:', a // b)  # 3  floor division
print('mod:', a % b)     # 1  remainder
print('pow:', a ** b)    # 49`}</pre>
            <Box tone="warn" title="Common mistakes">
              • Expecting <code>/</code> to keep integers — it returns float; use <code>//</code> for floor division.
              <br />• Float precision surprises (<code>0.1 + 0.2</code> is not exactly <code>0.3</code> in binary floats).
              <br />• Mixing strings and numbers (<code>'3' + 2</code> ❌ → use <code>int('3') + 2</code> ✅).
            </Box>
          </section>

          {/* LISTS */}
          <section id="list" className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Lists: flexible playlists</h2>
            <p className="text-gray-700 dark:text-gray-300"><strong>Analogy:</strong> A playlist you can reorder, add to, and remove from.</p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded">{`nums = [3, 1, 4]
nums.append(1)      # [3, 1, 4, 1]
nums.extend([5, 9]) # [3, 1, 4, 1, 5, 9]
nums.insert(1, 2)   # [3, 2, 1, 4, 1, 5, 9]
nums.remove(1)      # remove first 1 → [3, 2, 4, 1, 5, 9]
x = nums.pop()      # remove last → 9
nums.sort()         # in place sort
print(nums)

# Copies
copy1 = nums[:]             # shallow copy
copy2 = list(nums)          # shallow copy
print(copy1 is nums)        # False`}</pre>
            <Box tone="warn" title="Common mistakes">
              • Changing a list while iterating over it (creates surprises). Build a new list instead.
              <br />• Copy confusion: <code>copy = nums</code> shares the same list; use <code>nums[:]</code> or <code>list(nums)</code> for a copy.
              <br />• Multiplying nested lists (<code>[[0]*3]*3</code>) shares rows; use a comprehension instead.
            </Box>
            <Box tone="pro" title="Pro tip: list comprehensions">
              Build lists concisely and clearly: <code>[n*n for n in nums if n % 2 == 0]</code>.
            </Box>
          </section>

          {/* TUPLES */}
          <section id="tuple" className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Tuples: locked boxes</h2>
            <p className="text-gray-700 dark:text-gray-300"><strong>Analogy:</strong> A small box you seal and label (e.g., coordinates <code>(x, y)</code>). Once sealed, you don’t rearrange items.</p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded">{`pt = (10, 20)
x, y = pt     # unpacking
print(x, y)
locations = {(6, 9): 'A', (3, 4): 'B'}  # tuples work as keys
print(locations[(6, 9)])`}</pre>
            <Box tone="warn" title="Common mistakes">
              • Trying to modify a tuple (<code>pt[0] = 99</code> ❌).
              <br />• Forgetting the trailing comma in single‑item tuples: <code>(42,)</code> not <code>(42)</code>.
            </Box>
          </section>

          {/* DICTIONARIES */}
          <section id="dict" className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Dictionaries: labeled drawers</h2>
            <p className="text-gray-700 dark:text-gray-300"><strong>Analogy:</strong> A cabinet of drawers with labels (keys). Open a drawer to get its stuff (value).</p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded">{`user = {'name': 'Ada', 'age': 36}
print(user['name'])
print(user.get('role', 'guest'))  # safe access

user['role'] = 'admin'
user.update({'active': True})
print(user.keys(), user.values())

# Count letters
counts = {}
for ch in 'banana':
    counts[ch] = counts.get(ch, 0) + 1
print(counts)`}</pre>
            <Box tone="warn" title="Common mistakes">
              • <code>KeyError</code> when a key is missing — use <code>dict.get(key, default)</code>.
              <br />• Using unhashable keys (like lists) — keys must be immutable (str, int, tuple...).
              <br />• Assuming order in old Python versions — modern dicts preserve insertion order but don’t rely on it for algorithms.
            </Box>
          </section>

          {/* SETS */}
          <section id="set" className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Sets: unique sticker packs</h2>
            <p className="text-gray-700 dark:text-gray-300"><strong>Analogy:</strong> Toss duplicate stickers; keep one of each. Fast membership checks.</p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded">{`a = {1, 2, 3}
b = {3, 4}
print(a | b)   # union → {1,2,3,4}
print(a & b)   # intersection → {3}
print(a - b)   # difference → {1,2}

nums = [1,1,2,3,3,3]
print(set(nums))  # {1,2,3}
print(2 in a, 5 in a)`}</pre>
            <Box tone="warn" title="Common mistakes">
              • Expecting order (<code>set</code> is unordered).
              <br />• Trying to put unhashable things inside (e.g., lists).
              <br />• Confusing <code>a - b</code> (difference) with symmetric difference <code>a ^ b</code>.
            </Box>
          </section>

          {/* Choosing the Right One */}
          <section id="choose" className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm space-y-2">
            <h2 className="text-xl font-semibold">Choosing the Right One</h2>
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1 text-sm">
              <li><strong>list</strong>: ordered sequence you will edit or iterate a lot.</li>
              <li><strong>tuple</strong>: a small, fixed record (e.g., coordinates, RGB).</li>
              <li><strong>dict</strong>: when you need labels to find values quickly.</li>
              <li><strong>set</strong>: when you care about uniqueness or fast <code>in</code> checks.</li>
              <li><strong>str</strong>: text manipulation; treat it like a sequence (but it’s immutable).</li>
              <li><strong>bool</strong>: driving decisions and control flow.</li>
            </ul>
            <Box tone="pro" title="Rule of thumb">
              Start with a list. If you keep doing lookups by label, move to a dict. If you never change the items, a tuple might be safer.
            </Box>
          </section>

          {/* Type Conversion */}
          <section id="convert" className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm space-y-2">
            <h2 className="text-xl font-semibold">Type Conversion (casting)</h2>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded">{`int('42'), float('2.5'), str(3.14)
list('abc'), tuple([1,2,3]), set([1,1,2])
bool(0), bool(''), bool([1])`}</pre>
            <Box tone="warn" title="Common mistakes">
              • Casting fails on bad input (<code>int('3.5')</code> ❌). Clean or validate first.
            </Box>
          </section>

          {/* Practice */}
          <section id="practice" className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Practice — three levels</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-900">
                <h3 className="font-medium mb-2">Level 1 · Foundations</h3>
                <pre className="text-sm whitespace-pre-wrap">{`# 1) From '  Data Science  ', strip spaces + lowercase it.
# 2) Turn [3,6,1,6,2] into a set of uniques.
# 3) Build a dict from keys=['a','b'] and vals=[1,2].`}</pre>
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-900">
                <h3 className="font-medium mb-2">Level 2 · Apply & Combine</h3>
                <pre className="text-sm whitespace-pre-wrap">{`# Count letters in 'balloon' using dict + get.
# Make pairs (x,y) for x in [1,2], y in [10,20] with a list comp.
# Given words=['cat','dog','cow'], build {word: len(word)}.`}</pre>
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-900">
                <h3 className="font-medium mb-2">Level 3 · Mini‑challenge</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">Write <code>top_counts(text, k)</code> returning the <em>k</em> most common letters as a dict.</p>
                <pre className="text-sm whitespace-pre-wrap">{`def top_counts(text, k=3):
    counts = {}
    for ch in text.lower():
        if ch.isalpha():
            counts[ch] = counts.get(ch, 0) + 1
    items = sorted(counts.items(), key=lambda t: t[1], reverse=True)
    return dict(items[:k])

print(top_counts('Data Structures in Python'))`}</pre>
              </div>
            </div>
            <Box tone="tip" title="Growth mindset">
              If something feels tricky, that’s your brain building new connections. Take a breath, try a smaller example, and run it.
            </Box>
          </section>

          {/* Runner */}
          <section id="try" className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">🏃‍♂️ Try it now</h2>
            <PythonRunnerWorker />
            <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-300">
              <QuickLoad label="Strings" code={`s=' Hello '\nprint(s.strip().upper())`} />
              <QuickLoad label="List comp" code={`nums=[1,2,3,4,5]\nprint([n*n for n in nums if n%2==1])`} />
              <QuickLoad label="Dict count" code={`text='banana'\ncounts={}\nfor ch in text:\n    counts[ch]=counts.get(ch,0)+1\nprint(counts)`} />
              <QuickLoad label="Sets" code={`a={1,2,3}\nb={3,4}\nprint(a|b, a&b, a-b)`} />
              <QuickLoad label="Oops (fix me)" code={`# Spot and fix the mistakes:\n# 1) Use == in the if\n# 2) Add a colon after if\n# 3) Indent the print\nx=3\nif x = 3\nprint('equal')`} />
            </div>
          </section>

          {/* Footer Nav */}
          <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <Link href="/course/week-1/python-syntax" className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
              ← Previous
            </Link>
            <div className="flex items-center gap-3">
              <button
                onClick={markComplete}
                className={cx(
                  'px-4 py-2 rounded-lg border',
                  completed
                    ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-300'
                    : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                {completed ? 'Completed ✓' : 'Mark Complete'}
              </button>
              <Link href="/course/week-1/ml-workflow" className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow">
                Next →
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
  const [code, setCode] = useState<string>(`# Write Python and click Run.\nname='World'\nprint('Hello,', name)\n2+2`);
  const workerRef = useRef<Worker | null>(null);
  const urlRef = useRef<string | null>(null);

  // Allow external quick loaders to set code
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
