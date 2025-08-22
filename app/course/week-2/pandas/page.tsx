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
  Table,
  Columns,
  Rows,
  Filter,
  SortAsc,
  PlusCircle,
  Eraser,
  Workflow,
  GitMerge,
  Layers3,
  CheckCircle2,
} from 'lucide-react';

/**
 * Week 2 • Pandas (Ultra-beginner friendly)
 * - Light-only UI (forces light theme; removes persisted dark mode)
 * - Tracks progress via `tracking` (user_id, key)
 * - Sticky, responsive sidebar + scrollspy (mobile friendly)
 * - Every sample has a paired Output block (so learners see results)
 * - Web-Worker Pyodide runner that PRELOADS pandas and conditionally loads matplotlib
 * - Watchdog timeout prevents “Initializing…” from hanging
 */

const PROGRESS_KEY = 'week-2:pandas';

const SECTIONS = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'what', label: 'What is pandas? (plain English)' },
  { id: 'df-series', label: 'DataFrame vs Series' },
  { id: 'create', label: 'Create a DataFrame' },
  { id: 'select', label: 'Select columns & rows' },
  { id: 'filter-sort', label: 'Filter & sort' },
  { id: 'new-cols', label: 'Add new columns' },
  { id: 'missing', label: 'Missing values (NA)' },
  { id: 'groupby', label: 'Group & aggregate' },
  { id: 'merge', label: 'Join (merge) basics' },
  { id: 'reshape', label: 'Reshape (pivot/unpivot)' },
  { id: 'pitfalls', label: '🚨 Common Mistake Prevention' },
  { id: 'practice', label: 'Practice (micro-quests)' },
  { id: 'runner', label: '🏃‍♂️ Try it now' },
  { id: 'next', label: 'Next steps' },
];

// Utilities
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
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <div className="font-medium mb-1">{title}</div>
        <div className="text-sm md:text-[0.95rem] leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

function CodeBlock({
  code,
  expected,
  label = 'Python',
}: {
  code: string;
  expected?: string;
  label?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="px-3 py-1.5 bg-gray-50 text-xs text-gray-600 rounded-t-lg border border-b-0 border-gray-200">
        {label}
      </div>
      <pre className="bg-white border border-gray-200 rounded-b-lg p-3 text-sm whitespace-pre-wrap">{code}</pre>
      {expected && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-900">
          <strong>Expected output (what you should see):</strong>
          <pre className="whitespace-pre-wrap mt-1">{expected}</pre>
        </div>
      )}
    </div>
  );
}

// Tiny CSV preview
function CsvPreview({ csv }: { csv: string }) {
  const rows = csv.trim().split(/\r?\n/).map((r) => r.split(','));
  const headers = rows[0] || [];
  const data = rows.slice(1);
  return (
    <div className="overflow-auto rounded-xl border border-gray-200">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2 text-left font-semibold text-gray-700">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((r, i) => (
            <tr key={i} className="odd:bg-white even:bg-gray-50">
              {r.map((c, j) => (
                <td key={j} className="px-3 py-2 text-gray-700 whitespace-nowrap">{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Sample CSV (continuity with Intro)
const SAMPLE_CSV = `city,month,temp_c,humidity,pm25
Lagos,Jan,33,78,32
Lagos,Feb,34,76,30
Lagos,Mar,33,80,41
Abuja,Jan,30,40,22
Abuja,Feb,31,45,24
Abuja,Mar,32,42,19
Kano,Jan,28,25,14
Kano,Feb,29,27,17
Kano,Mar,31,30,18`;

export default function Week2PandasPage() {
  const [user, setUser] = useState<any>(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  // Force light theme everywhere (mobile + desktop)
  useEffect(() => {
    try {
      const el = document.documentElement;
      el.classList.remove('dark');
      el.style.colorScheme = 'light';
      ['theme','color-theme','ui-theme','next-theme','chakra-ui-color-mode','mantine-color-scheme'].forEach((k) => {
        if (localStorage.getItem(k) !== 'light') localStorage.setItem(k, 'light');
      });
      if (localStorage.getItem('darkMode') === 'true') localStorage.setItem('darkMode', 'false');
    } catch {}
  }, []);

  // Load user + progress
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

  // Scrollspy (largest visible section wins)
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('main section[id]'));
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a,b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId((visible[0].target as HTMLElement).id);
      },
      { root: null, rootMargin: '-112px 0px -55% 0px', threshold: [0.1,0.25,0.5,0.75,1] }
    );
    sections.forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-100 backdrop-blur bg-white/70">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-bold">Week 2 • Pandas</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <button
              className="lg:hidden inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200"
              onClick={() => setSidebarOpen(v => !v)}
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />} Contents
            </button>
            <span>{loading ? 'Loading…' : user ? 'Signed in' : <Link className="underline" href="/signin">Sign in</Link>}</span>
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
            Tip: print small slices often. Seeing the table keeps you honest. 👀
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-10">
          {/* Welcome */}
          <section id="welcome" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome to Pandas</h1>
            <p className="text-gray-700 mt-2">
              Think of pandas as a <strong>super-powered spreadsheet</strong> inside Python. You load data (CSV),
              clean it, and ask smart questions with just a few lines.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <span>Mark complete when you’ve explored this page.</span>
            </div>
          </section>

          {/* What is pandas */}
          <section id="what" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Table className="h-5 w-5" /> What is pandas? (plain English)</h2>
            <Box tone="tip" title="Simple definition">
              <strong>pandas</strong> lets you work with tables (rows & columns) in Python, quickly and safely.
              The main object is a <strong>DataFrame</strong> (a labeled table). A single column is a <strong>Series</strong>.
            </Box>
            <CodeBlock
              code={`import pandas as pd
print(pd.__name__)
print(type(pd))
print('Pandas ready!')`}
              expected={`pandas
<class 'module'>
Pandas ready!`}
            />
          </section>

          {/* DataFrame vs Series */}
          <section id="df-series" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Columns className="h-5 w-5" /> DataFrame vs <Rows className="h-5 w-5" /> Series</h2>
            <p className="text-gray-700">
              A <strong>DataFrame</strong> is like a whole sheet; a <strong>Series</strong> is a single labeled column from it.
              Variable name <code>df</code> is just a popular nickname for your DataFrame.
            </p>
            <CodeBlock
              code={`import pandas as pd
df = pd.DataFrame({'city':['Lagos','Abuja','Kano'], 'temp_c':[33,30,28]})
print(type(df))
print(type(df['temp_c']))`}
              expected={`<class 'pandas.core.frame.DataFrame'>
<class 'pandas.core.series.Series'>`}
            />
          </section>

          {/* Create a DataFrame */}
          <section id="create" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Create a DataFrame (from dicts)</h2>
            <CodeBlock
              code={`import pandas as pd
df = pd.DataFrame({
  'city': ['Lagos','Abuja','Kano'],
  'temp_c': [33,30,28],
  'pm25': [32,22,14],
})
print(df)
print('shape:', df.shape)
print(df.dtypes)`}
              expected={`    city  temp_c  pm25
0  Lagos      33    32
1  Abuja      30    22
2   Kano      28    14
shape: (3, 3)
city      object
temp_c     int64
pm25       int64
dtype: object`}
            />
          </section>

          {/* Select columns & rows */}
          <section id="select" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Filter className="h-5 w-5" /> Select columns & rows</h2>
            <CodeBlock
              code={`import pandas as pd, io
csv = io.StringIO("""${SAMPLE_CSV.replace(/"/g,'\\"')}""")
df = pd.read_csv(csv)

# Column(s)
print(df['city'].head(3))
print(df[['city','temp_c']].head(3))

# Row by label (index): .loc
print(df.loc[0])

# Row by position: .iloc
print(df.iloc[0:2])`}
              expected={`0    Lagos
1    Lagos
2    Lagos
Name: city, dtype: object
    city  temp_c
0  Lagos      33
1  Lagos      34
2  Lagos      33
city        Lagos
month         Jan
temp_c         33
humidity       78
pm25           32
Name: 0, dtype: object
    city month  temp_c  humidity  pm25
0  Lagos   Jan      33        78    32
1  Lagos   Feb      34        76    30`}
            />
            <Box tone="tip" title="Rule">
              <code>df['col']</code> for a single column; <code>df[['a','b']]</code> for several.{' '}
              <code>.loc</code> = label-based; <code>.iloc</code> = position-based.
            </Box>
          </section>

          {/* Filter & sort */}
          <section id="filter-sort" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><SortAsc className="h-5 w-5" /> Filter & sort</h2>
            <CodeBlock
              code={`import pandas as pd, io
csv = io.StringIO("""${SAMPLE_CSV.replace(/"/g,'\\"')}""")
df = pd.read_csv(csv)

hot = df[df['temp_c'] >= 33]
print('hot (temp_c >= 33):')
print(hot)

sorted_pm = df.sort_values('pm25', ascending=False).head(3)
print('\\nTop 3 by pm25:')
print(sorted_pm[['city','month','pm25']])`}
              expected={`hot (temp_c >= 33):
    city month  temp_c  humidity  pm25
0  Lagos   Jan      33        78    32
1  Lagos   Feb      34        76    30
2  Lagos   Mar      33        80    41

Top 3 by pm25:
    city month  pm25
2  Lagos   Mar    41
0  Lagos   Jan    32
1  Lagos   Feb    30`}
            />
          </section>

          {/* Add new columns */}
          <section id="new-cols" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><PlusCircle className="h-5 w-5" /> Add new columns</h2>
            <CodeBlock
              code={`import pandas as pd, io
csv = io.StringIO("""${SAMPLE_CSV.replace(/"/g,'\\"')}""")
df = pd.read_csv(csv)

# Celsius to Fahrenheit
df['temp_f'] = df['temp_c'] * 9/5 + 32
# Category by pm25 level (naive rule for demo)
df['pm25_level'] = pd.cut(df['pm25'], bins=[0,15,30,100],
                          labels=['low','mid','high'], right=True)

print(df[['city','month','temp_c','temp_f','pm25','pm25_level']].head(4))`}
              expected={`    city month  temp_c  temp_f  pm25 pm25_level
0  Lagos   Jan      33    91.4    32       high
1  Lagos   Feb      34    93.2    30        mid
2  Lagos   Mar      33    91.4    41       high
3  Abuja   Jan      30    86.0    22        mid`}
            />
          </section>

          {/* Missing values */}
          <section id="missing" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Eraser className="h-5 w-5" /> Missing values (NA)</h2>
            <CodeBlock
              code={`import pandas as pd
df = pd.DataFrame({'x':[1, None, 3], 'y':['4','5',None]})
print('Before:')
print(df)
print('\\nNA count per column:\\n', df.isna().sum())

df['y'] = pd.to_numeric(df['y'], errors='coerce')
df['x'] = df['x'].fillna(df['x'].median())
df['y'] = df['y'].fillna(df['y'].median())

print('\\nAfter:')
print(df)
print('\\nNA count per column:\\n', df.isna().sum())`}
              expected={`Before:
     x     y
0  1.0     4
1  NaN     5
2  3.0  None

NA count per column:
 x    1
y    1
dtype: int64

After:
     x    y
0  1.0  4.0
1  2.0  5.0
2  3.0  4.5

NA count per column:
 x    0
y    0
dtype: int64`}
            />
            <Box tone="warn" title="Don’t peek at test data">
              Fit your cleaning rules (like medians) on train only. Then apply to validation/test.
            </Box>
          </section>

          {/* Group & aggregate */}
          <section id="groupby" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Workflow className="h-5 w-5" /> Group & aggregate</h2>
            <CodeBlock
              code={`import pandas as pd, io
csv = io.StringIO("""${SAMPLE_CSV.replace(/"/g,'\\"')}""")
df = pd.read_csv(csv)

by_city = df.groupby('city')['pm25'].mean().sort_values(ascending=False)
print(by_city)

by_city_month = df.groupby(['city','month'])['temp_c'].mean()
print('\\nPer city-month temp_c mean:')
print(by_city_month)`}
              expected={`city
Lagos    34.333333
Abuja    21.666667
Kano     16.333333
Name: pm25, dtype: float64

Per city-month temp_c mean:
city   month
Abuja  Feb      31
       Jan      30
       Mar      32
Kano   Feb      29
       Jan      28
       Mar      31
Lagos  Feb      34
       Jan      33
       Mar      33
Name: temp_c, dtype: int64`}
            />
          </section>

          {/* Merge (join) */}
          <section id="merge" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><GitMerge className="h-5 w-5" /> Join (merge) basics</h2>
            <CodeBlock
              code={`import pandas as pd
left = pd.DataFrame({'city':['Lagos','Abuja','Kano'], 'pop_m':[15.4, 3.6, 4.1]})
right = pd.DataFrame({'city':['Lagos','Abuja','Kano'], 'region':['SW','NC','NW']})

joined = left.merge(right, on='city', how='left')
print(joined)`}
              expected={`    city  pop_m region
0  Lagos   15.4     SW
1  Abuja    3.6     NC
2   Kano    4.1     NW`}
            />
            <Box tone="tip" title="Keys & how=">
              Make sure the join key(s) match exactly. Common <code>how</code> values: <code>'inner'</code>, <code>'left'</code>, <code>'right'</code>, <code>'outer'</code>.
            </Box>
          </section>

          {/* Reshape */}
          <section id="reshape" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Layers3 className="h-5 w-5" /> Reshape (pivot/unpivot)</h2>
            <CodeBlock
              code={`import pandas as pd
df = pd.DataFrame({
  'city':['Lagos','Lagos','Abuja','Abuja'],
  'month':['Jan','Feb','Jan','Feb'],
  'pm25':[32,30,22,24]
})

wide = df.pivot(index='city', columns='month', values='pm25')
print('Wide:')
print(wide)

long = wide.reset_index().melt(id_vars='city', var_name='month', value_name='pm25')
print('\\nBack to long:')
print(long.sort_values(['city','month']))`}
              expected={`Wide:
month   Feb   Jan
city
Abuja  24.0  22.0
Lagos  30.0  32.0

Back to long:
    city month  pm25
2  Abuja   Feb  24.0
3  Abuja   Jan  22.0
0  Lagos   Feb  30.0
1  Lagos   Jan  32.0`}
            />
          </section>

          {/* Pitfalls */}
          <section id="pitfalls" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">🚨 Common Mistake Prevention</h2>
            <Box tone="warn" title="String numbers">
              Use <code>pd.to_numeric(col, errors='coerce')</code> before math. Otherwise <code>'42'</code> + <code>1</code> will fail.
            </Box>
            <Box tone="warn" title="Chained assignment">
              Avoid writing to a slice like <code>df[df.a&gt;0]['b']=...</code>. Prefer <code>df.loc[df.a&gt;0, 'b']=...</code>.
            </Box>
            <Box tone="tip" title="Document cleaning">
              Write down: what you filled/dropped/converted — and why. Future-you will celebrate.
            </Box>
          </section>

          {/* Practice */}
          <section id="practice" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Practice (micro-quests)</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Load the sample CSV; print <code>shape</code>, <code>head()</code>, <code>dtypes</code>.</li>
              <li>Filter rows where <code>humidity &gt;= 70</code>; sort by <code>pm25</code> descending.</li>
              <li>Add <code>temp_f</code> column; create a simple <code>pm25_level</code> category.</li>
              <li>Group by <code>city</code> and compute mean <code>pm25</code>. Which is highest?</li>
              <li>Create a tiny “city → region” table and left-merge it with your DataFrame.</li>
              <li>Pivot to wide (months as columns), then melt back to long.</li>
            </ul>
            <Box tone="pro" title="Mindset">
              Look → Clean a little → Look again. Repeat. That loop is where insight lives.
            </Box>
          </section>

          {/* Runner */}
          <section id="runner" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">🏃‍♂️ Try it now</h2>
            <PythonRunnerWorker />
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              <QuickLoad
                label="Peek DataFrame"
                code={`import pandas as pd, io
csv = io.StringIO("""${SAMPLE_CSV.replace(/"/g,'\\"')}""")
df = pd.read_csv(csv)
print('shape:', df.shape)
print(df.head())
print(df.dtypes)
# Expected: shape (9,5) and columns city/month/temp_c/humidity/pm25`}
              />
              <QuickLoad
                label="Filter + sort"
                code={`import pandas as pd, io
csv = io.StringIO("""${SAMPLE_CSV.replace(/"/g,'\\"')}""")
df = pd.read_csv(csv)
hot = df[df['temp_c'] >= 33]
print(hot)
print('\\nTop by pm25:')
print(df.sort_values('pm25', ascending=False).head(3)[['city','month','pm25']])`}
              />
              <QuickLoad
                label="New columns"
                code={`import pandas as pd, io
csv = io.StringIO("""${SAMPLE_CSV.replace(/"/g,'\\"')}""")
df = pd.read_csv(csv)
df['temp_f'] = df['temp_c']*9/5 + 32
df['pm25_level'] = pd.cut(df['pm25'], bins=[0,15,30,100], labels=['low','mid','high'])
print(df[['city','month','temp_c','temp_f','pm25','pm25_level']].head())`}
              />
              <QuickLoad
                label="Group & aggregate"
                code={`import pandas as pd, io
csv = io.StringIO("""${SAMPLE_CSV.replace(/"/g,'\\"')}""")
df = pd.read_csv(csv)
print(df.groupby('city')['pm25'].mean().sort_values(ascending=False))`}
              />
              <QuickLoad
                label="Merge"
                code={`import pandas as pd, io
csv = io.StringIO("""${SAMPLE_CSV.replace(/"/g,'\\"')}""")
df = pd.read_csv(csv)
regions = pd.DataFrame({'city':['Lagos','Abuja','Kano'], 'region':['SW','NC','NW']})
print(df.merge(regions, on='city', how='left').head())`}
              />
              <QuickLoad
                label="Pivot & melt"
                code={`import pandas as pd, io
csv = io.StringIO("""${SAMPLE_CSV.replace(/"/g,'\\"')}""")
df = pd.read_csv(csv)
wide = df.pivot(index='city', columns='month', values='pm25')
print('Wide:\\n', wide)
long = wide.reset_index().melt(id_vars='city', var_name='month', value_name='pm25')
print('\\nLong again:\\n', long.sort_values(['city','month']))`}
              />
              <QuickLoad
                label="Fix me (loc)"
                code={`# Fix the assignment (use .loc)
import pandas as pd
df = pd.DataFrame({'a':[1,2,3], 'b':[10,20,30]})
# WRONG: df[df['a']>1]['b'] = 99
df.loc[df['a']>1, 'b'] = 99
print(df)`}
              />
            </div>
          </section>

          {/* Next steps */}
          <section id="next" className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Next steps</h2>
            <p className="text-gray-700">
              Up next: <strong>Matplotlib</strong> (bar/line/hist/scatter), then <strong>EDA patterns</strong>.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <Link
                href="/course/week-2"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" /> Back to Week 2 Intro
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
                {/* ✅ Next goes to Matplotlib page */}
                <Link
                  href="/course/week-2/matplotlib"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow"
                  onClick={async () => { if (!completed) await markComplete(); }}
                >
                  Go to Matplotlib <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

/* --------------------------- Runner (Web Worker) --------------------------- */
/**
 * Key fixes:
 * - Preload 'pandas' during init → no ModuleNotFoundError.
 * - Conditionally load 'matplotlib' iff user code imports it.
 * - Watchdog timeouts for init and run (prevents infinite "Initializing…").
 */
function PythonRunnerWorker() {
  const [initialized, setInitialized] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [code, setCode] = useState<string>(`# Edit and run. Use QuickLoads below to try pandas.
print('Pandas sandbox ready')`);
  const workerRef = useRef<Worker | null>(null);
  const urlRef = useRef<string | null>(null);
  const initTimerRef = useRef<number | null>(null);
  const runTimerRef = useRef<number | null>(null);

  // Allow external quick loaders to set code
  (globalThis as any).__setRunnerCode = (c: string) => setCode(c);

  const killWorker = (msg?: string) => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    if (initTimerRef.current) {
      window.clearTimeout(initTimerRef.current);
      initTimerRef.current = null;
    }
    if (runTimerRef.current) {
      window.clearTimeout(runTimerRef.current);
      runTimerRef.current = null;
    }
    setInitialized(false);
    setInitializing(false);
    setRunning(false);
    if (msg) setOutput((o) => (o ? o + '\n' : '') + msg);
  };

  const ensureWorker = () => {
    if (workerRef.current) return;
    const workerCode = `
let pyodideReadyPromise = null;
let isReady = false;

async function loadCore(){
  if(!pyodideReadyPromise){
    importScripts('https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js');
    pyodideReadyPromise = loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/' });
  }
  const py = await pyodideReadyPromise;
  // Preload pandas so user code never sees ModuleNotFoundError
  try {
    postMessage({ type: 'status', data: '[pyodide] Loading pandas…' });
    await py.loadPackage('pandas');
    postMessage({ type: 'status', data: '[pyodide] pandas ready' });
  } catch (e) {
    postMessage({ type: 'error', data: 'Failed to load pandas: ' + String(e) });
    throw e;
  }
  // Route stdout/stderr
  py.setStdout({ batched: (s) => postMessage({ type: 'stdout', data: s }) });
  py.setStderr({ batched: (s) => postMessage({ type: 'stderr', data: s }) });
  return py;
}

self.onmessage = async (e) => {
  const { type, code } = e.data || {};
  try {
    if (type === 'init'){
      const py = await loadCore();
      isReady = true;
      postMessage({ type: 'ready' });
    } else if (type === 'run'){
      if (!isReady){
        const py = await loadCore();
        isReady = true;
        postMessage({ type: 'ready' });
      }
      const py = await pyodideReadyPromise;

      // If the code imports matplotlib, load it on demand
      if ((code || '').includes('matplotlib')) {
        try {
          postMessage({ type: 'status', data: '[pyodide] Loading matplotlib…' });
          await py.loadPackage('matplotlib');
          postMessage({ type: 'status', data: '[pyodide] matplotlib ready' });
        } catch (e) {
          postMessage({ type: 'error', data: 'Failed to load matplotlib: ' + String(e) });
        }
      }

      try {
        let result = await py.runPythonAsync(code);
        postMessage({ type: 'result', data: String(result ?? '') });
      } catch (err){
        postMessage({ type: 'error', data: String(err) });
      }
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
        if (initTimerRef.current) {
          window.clearTimeout(initTimerRef.current);
          initTimerRef.current = null;
        }
        setInitialized(true);
        setInitializing(false);
        setOutput((o) => (o ? o + '\n' : '') + '[python] ready\nTip: Click Run to execute the code.');
      } else if (type === 'stdout') {
        setOutput((o) => o + String(data));
      } else if (type === 'stderr') {
        setOutput((o) => o + String(data));
      } else if (type === 'status') {
        setOutput((o) => (o ? o + '\n' : '') + String(data));
      } else if (type === 'result') {
        if (runTimerRef.current) {
          window.clearTimeout(runTimerRef.current);
          runTimerRef.current = null;
        }
        setRunning(false);
        if (data) setOutput((o) => o + (o.endsWith('\n') ? '' : '\n') + String(data) + '\nNice! ✅');
        else setOutput((o) => o + (o.endsWith('\n') ? '' : '\n') + 'Done. ✅');
      } else if (type === 'error') {
        if (runTimerRef.current) {
          window.clearTimeout(runTimerRef.current);
          runTimerRef.current = null;
        }
        setRunning(false);
        setOutput((o) => o + (o.endsWith('\n') ? '' : '\n') + '⚠️ ' + String(data));
      }
    };
  };

  useEffect(() => {
    return () => {
      killWorker();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const init = () => {
    ensureWorker();
    if (!initialized && workerRef.current && !initializing) {
      setInitializing(true);
      setOutput('[ui] Initializing Python… this runs in your browser.');
      workerRef.current.postMessage({ type: 'init' });
      // Watchdog: if init takes too long, reset
      initTimerRef.current = window.setTimeout(() => {
        killWorker('⚠️ Initialization timed out. Recreating Python… Click "Initialize Python" again.');
      }, 45000); // 45s
    }
  };

  const run = () => {
    ensureWorker();
    if (!initialized || !workerRef.current) return;
    setRunning(true);
    setOutput('');
    workerRef.current.postMessage({ type: 'run', code });
    // Watchdog for long-running code
    runTimerRef.current = window.setTimeout(() => {
      killWorker('⚠️ Execution timed out. Your code took too long or got stuck. The sandbox has been reset.');
    }, 60000); // 60s
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
