'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  Home,
} from 'lucide-react';

// --- Config ------------------------------------------------------------------
const PROGRESS_KEY = 'ethical-week-1:start';

const SECTIONS = [
  { id: 'welcome', label: 'Welcome & Goals' },
  { id: 'principles', label: 'Responsible AI Principles' },
  { id: 'why-it-matters', label: 'Why It Matters' },
  { id: 'threat-modeling', label: 'Threat Modeling (LLMs)' },
  { id: 'privacy', label: 'Privacy & PII' },
  { id: 'policies-prompts', label: 'Safety Policies & System Prompts' },
  { id: 'evaluation', label: 'Quick Safety Evaluation' },
  { id: 'next', label: 'Next Steps' },
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
  const icon =
    tone === 'tip' ? <Lightbulb className="h-4 w-4" /> :
    tone === 'warn' ? <AlertTriangle className="h-4 w-4" /> :
    <ShieldCheck className="h-4 w-4" />;
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
export default function EthicalAIWeek1Start() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [profile, setProfile] = useState<any>(null);
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

  const username = useMemo(
    () => profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'Learner',
    [profile, user]
  );

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
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '0px 0px -70% 0px', threshold: [0, 1] }
    );
    const els = SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean) as Element[];
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header (like other course pages) */}
      <header className="sticky top-0 z-30 border-b border-gray-100 backdrop-blur bg-white/70">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-14 grid grid-cols-[auto_1fr_auto] items-center gap-3">
            <Link
              href="/learn/ethical-ai"
              aria-label="Go to Ethical AI home"
              prefetch={false}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2"
            >
              <Home className="h-5 w-5" />
            </Link>
            <div className="flex items-center justify-center">
              <span className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                Week 1 · Ethical AI & Safety (Intro)
              </span>
            </div>
            <button
              type="button"
              aria-label="Toggle contents"
              className="lg:hidden inline-flex h-10 items-center gap-2 px-3 rounded-xl border border-gray-200 text-gray-800 hover:bg-gray-50 justify-self-end"
              onClick={() => setSidebarOpen(v => !v)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Contents</span>
            </button>
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
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">On this page</p>
          <nav className="space-y-1">
            {SECTIONS.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={cx(
                  'block px-3 py-2 rounded-lg text-sm',
                  activeId === s.id ? 'bg-green-50 text-green-800' : 'hover:bg-gray-50 text-gray-700'
                )}
              >
                {s.label}
              </a>
            ))}
          </nav>
          <div className="mt-6 p-3 rounded-xl bg-gray-50 text-xs text-gray-600">
            Safety by design leads to durable user trust.
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-8">
          {/* Welcome & Goals */}
          <section id="welcome" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Welcome{user ? `, ${username}` : ''} — Ethical AI for Builders
            </h1>
            <p className="text-gray-700">
              This introduction sets the tone for the rest of the track. Our objective is simple: make ethics feel practical. 
              Instead of abstract ideals, you will learn how to express guardrails in code, how to translate policy into prompts, 
              and how to evaluate risks before they reach users. By the end of this week, you should be able to describe what 
              your system is allowed to do, recognize when it should refuse, and put lightweight checks in place that keep those 
              promises honest as you iterate.
            </p>
            <p className="text-gray-700">
              A gentle prerequisite is familiarity with the foundations of AI—what models are, where they make mistakes, and how 
              we frame tasks for them. If you want a quick refresher, take our friendly primer <Link href="/learn/ai-for-everyone" className="text-green-700 underline">AI for Everyone</Link>, then return here. 
              The material below assumes you are comfortable describing an AI feature at a high level and can follow the flow from 
              input, through the model, to an output that a person will use.
            </p>
            <Box tone="tip" title="How to use this page">
              <p>
                Read each section in order. The ideas build from principles, to risks, to concrete safeguards. Whenever you see an example, 
                imagine it in your product and ask, “What could go wrong, and how would we notice?” That question alone will carry you far.
              </p>
            </Box>
          </section>

          {/* Responsible AI Principles */}
          <section id="principles" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Responsible AI Principles</h2>
            <p className="text-gray-700">
              Most organizations anchor their approach on fairness, transparency, and accountability. Fairness means you actively look
              for patterns where similar users are treated differently and reduce that disparity. It begins with clear definitions: 
              who are the people your system serves, which outcomes matter, and what would count as unfair treatment in context. 
              Once those definitions exist, you can check for differences in error rates and adjust your data or rules to correct them.
            </p>
            <p className="text-gray-700">
              Transparency is about being open with users regarding what the system can and cannot do. Useful interfaces set expectations, 
              provide short explanations for critical actions, and offer a path for feedback when something seems off. In practice that 
              might mean a one-sentence “how it works” message, an easily discoverable “report a problem” link, and release notes for 
              prompt or model updates that influence behavior.
            </p>
            <p className="text-gray-700">
              Accountability is the habit of naming owners and writing decisions down. Choose a person responsible for safety in your 
              feature, document your boundaries as a living artifact, and specify how issues are escalated. These small rituals make 
              ethical choices visible and repeatable as your team grows.
            </p>
            <Box tone="pro" title="From values to actions">
              <p>
                Pick one fairness check to run on your data this week, add one sentence of guidance to your UI where users need it most, 
                and assign one clear owner for safety decisions. Small steps compound quickly.
              </p>
            </Box>
          </section>

          {/* Why It Matters */}
          <section id="why-it-matters" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Why It Matters</h2>
            <p className="text-gray-700">
              Ethical design lowers the chance of harmful or misleading outputs reaching real people. It reduces legal and compliance risk,
              and it grows user trust in a way that marketing cannot fabricate. When users see that your product knows when to decline, 
              admits uncertainty, and treats them with respect, they come back. In a competitive space, that reliability becomes your edge.
            </p>
            <p className="text-gray-700">
              There is also a practical engineering benefit. By making your constraints explicit up front, you prevent a class of bugs 
              before they appear. A few hours spent on boundaries and testing now saves days of incident response later. Safety work is 
              velocity work when you consider the whole lifecycle.
            </p>
            <Box tone="tip" title="Outcome of this week">
              <p>
                By the end of the week you will have a short policy prompt, a simple redaction step for sensitive inputs, and a tiny 
                evaluation that checks refusal behavior and basic privacy rules. That kit is enough to ship responsibly and iterate.
              </p>
            </Box>
          </section>

          {/* Threat Modeling */}
          <section id="threat-modeling" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Threat Modeling (LLMs)</h2>
            <p className="text-gray-700">
              Threat modeling is a structured way to ask, “What could go wrong?” Start by naming your crown jewels—the data, tools, and 
              capabilities that would be most damaging if misused. For an LLM feature, that might include personally identifiable 
              information, access to external tools like email or file systems, and prompts that drive high-impact actions.
            </p>
            <p className="text-gray-700">
              Next, imagine who might try to exploit your system and how. An ordinary user could accidentally paste something sensitive 
              into a prompt. A malicious actor could attempt prompt injection to bypass instructions or trigger an unsafe tool call. 
              A well-meaning teammate might change a system prompt and unknowingly relax a boundary. Naming these possibilities is not 
              about fear; it is about clarity.
            </p>
            <Box tone="pro" title="A simple pattern you can ship">
              <p>
                Choose three important assets, list two realistic threats for each, and write one mitigation you can implement this 
                week. Examples include input filters for unsafe content, sandboxing any external tools the model can call, and basic 
                rate limits to reduce abuse. Revisit the list monthly as your product evolves.
              </p>
            </Box>
          </section>

          {/* Privacy & PII */}
          <section id="privacy" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Privacy & PII</h2>
            <p className="text-gray-700">
              Good privacy begins with restraint. Collect only the data that your feature truly needs, and avoid sending unnecessary 
              details to a model. Before a request leaves your server, remove or mask obvious identifiers such as names, emails, phone 
              numbers, and government IDs. Placeholder tokens can preserve structure without exposing the original values.
            </p>
            <p className="text-gray-700">
              Treat logs as a security surface. Avoid storing secrets, rotate access, and set retention windows so data does not linger 
              longer than it should. If you must keep examples for debugging, scrub them in the same way you scrub live traffic. 
              The goal is to make the safe path the easy path for every engineer on the team.
            </p>
            <Box tone="warn" title="A common pitfall">
              <p>
                Do not log raw prompts that include user identifiers. Hash or tokenize stable IDs, and mask payloads on the server 
                before they reach any shared storage.
              </p>
            </Box>
          </section>

          {/* Safety Policies & System Prompts */}
          <section id="policies-prompts" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Safety Policies & System Prompts</h2>
            <p className="text-gray-700">
              Policies describe what is allowed, what is denied, and how the system should refuse. The system prompt is where those 
              decisions become operational. Write in plain language, give short examples of acceptable requests, and show what a polite 
              refusal looks like for prohibited ones. For sensitive topics, add instructions to consult a human or provide resources 
              rather than advice.
            </p>
            <p className="text-gray-700">
              Keep prompts versioned so you can track changes over time. When another teammate updates the policy or prompt, treat it like 
              a code change: review it, test it, and document the rationale. This discipline preserves intent as you improve quality.
            </p>
            <Box tone="tip" title="A practical starting draft">
              <p>
                Begin with a short paragraph stating scope and user intent, follow with two or three positive examples the model should 
                help with, then describe a few cases it must refuse and the tone to use when refusing. End with when to escalate to a 
                human. You can refine details later; having a first draft already prevents many surprises.
              </p>
            </Box>
          </section>

          {/* Quick Safety Evaluation */}
          <section id="evaluation" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold">Quick Safety Evaluation</h2>
            <p className="text-gray-700">
              Evaluations keep your guardrails from drifting as you update prompts or models. Create a tiny set of prompts that represent 
              normal use, obvious violations, and tricky edge cases. Define simple pass or fail checks you can automate, such as patterns 
              that should appear in correct refusals or the absence of sensitive fields in outputs.
            </p>
            <p className="text-gray-700">
              Run the set whenever you change something important and record the results. A small, consistent evaluation suite will catch 
              regressions early and give you confidence to ship improvements quickly.
            </p>
            <Box tone="pro" title="Ship the habit, not just the code">
              <p>
                Commit your test prompts alongside your policy prompt. Treat them as part of the feature. When they live together, 
                your team will naturally update both and your safety story stays intact.
              </p>
            </Box>
          </section>

          {/* Next Steps */}
          <section id="next" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Ready to build responsibly?</h2>
            <p className="text-gray-700 mb-4">
              You now have a working vocabulary for ethics in practice and a simple plan to apply it: define your principles, map your 
              risks, write a policy prompt, and keep everything honest with a small evaluation. In the next lesson we will walk through a 
              lightweight threat model for your feature and turn it into concrete mitigations you can deploy.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="/ethical-ai"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Course Home
              </Link>

              <button
                onClick={markComplete}
                className={cx(
                  'px-4 py-2 rounded-lg border',
                  completed
                    ? 'border-green-200 bg-green-50 text-green-800'
                    : 'border-gray-200 hover:bg-gray-50'
                )}
              >
                {completed ? 'Progress saved ✓' : 'Mark page complete'}
              </button>

              <Link
                href="/learn/ethical-ai/beginner/week1/threat-modeling"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow"
                onClick={async () => { if (!completed) await markComplete(); }}
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
