'use client';

import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Bot,
  Cog,
  Server,
  Shield,
  GraduationCap,
  Plug,
  BarChart,
  CheckCircle,
  FileCode,
  Users,
  Globe,
  Mail,
  Rocket,
} from 'lucide-react';

import Footer from '@/components/ui/footer';
import Header from '@/components/ui/header';

export default function ForBusinessPage() {
  return (
    <div className="bg-white text-gray-900">
      <Head>
        <title>AI for Business – Tinpear</title>
        <meta
          name="description"
          content="Tinpear helps organizations plan, build, and scale AI—strategy, automation, integrations, custom solutions, training, and responsible governance to drive measurable ROI."
        />
        <meta property="og:title" content="AI for Business – Tinpear" />
        <meta
          property="og:description"
          content="Strategy, automation, integrations, custom solutions, training, and governance. Built for real business impact."
        />
      </Head>

      <Header />

      <main className="min-h-screen">
        {/* HERO (light theme, black text, green accents) */}
        <section className="relative overflow-hidden bg-white">
          <div className="max-w-7xl mx-auto px-6 pt-28 pb-20">
            <div className="grid lg:grid-cols-12 gap-10 items-center">
              {/* Copy */}
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 mb-5 text-[11px] font-medium uppercase tracking-wider text-green-700 bg-green-50 px-3 py-1 rounded-full">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-600" />
                  Built for modern enterprises
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight text-gray-900">
                  AI that{' '}
                  <span className="relative inline-block">
                    <span className="text-green-600">accelerates</span>
                    {/* animated underline */}
                    <motion.span
                      layoutId="underline"
                      className="absolute left-0 right-0 -bottom-1 h-2 rounded-full bg-green-100"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.9, ease: 'easeOut' }}
                    />
                  </span>{' '}
                  your business
                </h1>
                <p className="mt-5 text-lg md:text-xl text-gray-700 max-w-2xl">
                  From strategy to deployment, Tinpear designs and implements AI systems that automate work, augment teams, and deliver measurable ROI—securely and responsibly.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <a
                    href="mailto:tinpear.now@gmail.com?subject=Get%20Started%20with%20Tinpear%20AI%20for%20Business"
                    className="inline-flex items-center justify-center rounded-xl bg-gray-900 text-white font-semibold px-6 py-3 hover:bg-black transition shadow-md"
                  >
                    Talk to us
                  </a>
                  <Link
                    href="#services"
                    className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-900 hover:bg-gray-50 transition"
                  >
                    Explore services
                  </Link>
                </div>

                {/* Hero Stats */}
                <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Stat label="Since" value="2019" />
                  <Stat label="Industries" value="12+" />
                  <Stat label="Projects delivered" value="150+" />
                  <Stat label="Avg. time‑to‑value" value="< 6 wks" />
                </div>
              </div>

              {/* Visual with subtle rocket animation */}
              <div className="lg:col-span-5 relative h-[300px] md:h-[420px]">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-gray-50 to-white border" />
                {/* Launch pad */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-64 h-2 bg-gray-200 rounded-full" />
                {/* Rocket */}
                <motion.div
                  initial={{ y: 120, opacity: 0 }}
                  animate={{ y: -40, opacity: 1 }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                  className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center"
                >
                  <div className="p-4 rounded-2xl bg-gray-900 text-white shadow-lg shadow-green-200/40">
                    <Rocket className="w-8 h-8" />
                  </div>
                  {/* exhaust */}
                  <motion.div
                    className="mt-2 w-2 h-20 rounded-b-full bg-gradient-to-b from-green-400 to-transparent"
                    initial={{ opacity: 0.7 }}
                    animate={{ opacity: [0.7, 0.3, 0.7] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST STRIP (text‑only, no logos) */}
        <section className="py-10 px-6 bg-white border-y">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs md:text-sm text-gray-600">
              {[
                'AI Strategy',
                'Automation & Agents',
                'Custom Solutions',
                'Integrations',
                'Training & Enablement',
                'Security & MLOps',
              ].map((t) => (
                <span key={t} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CORE SERVICES */}
        <section id="services" className="py-20 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <SectionHeader
              eyebrow="What we do"
              title="End‑to‑end AI for real business impact"
              subtitle="A modular stack of services—from strategy and proof‑of‑value to enterprise‑grade deployment and enablement."
            />

            <div className="grid md:grid-cols-2 gap-8">
              <ServiceCard
                icon={<Briefcase className="w-6 h-6 text-green-700" />}
                title="AI Strategy & Consulting"
                description="We assess your workflows, data, and objectives to craft a pragmatic AI roadmap aligned to ROI and risk."
                bullets={[
                  'Opportunity discovery, value mapping & prioritization',
                  'Executive education & AI adoption playbooks',
                  'Responsible AI policy, governance & risk management',
                ]}
                image="/consult.jpg"
              />

              <ServiceCard
                icon={<Bot className="w-6 h-6 text-green-700" />}
                title="Automation & AI Agents"
                description="Design autonomous and human‑in‑the‑loop agents that take work off your team’s plate while keeping humans in control."
                bullets={[
                  'Customer support copilots & 24/7 chat',
                  'Back‑office automations (ops, finance, HR)',
                  'RPA + LLM orchestration for complex workflows',
                ]}
                image="/automation.jpg"
              />

              <ServiceCard
                icon={<FileCode className="w-6 h-6 text-green-700" />}
                title="Custom AI Solutions"
                description="Build bespoke copilots, RAG/knowledge apps, analytics copilots, and domain‑specific models tailored to your data and processes."
                bullets={[
                  'LLM apps, RAG & knowledge retrieval',
                  'Forecasting, NLP, vision & classification',
                  'Product embeddings & personalization',
                ]}
                image="/custom.jpg"
              />

              <ServiceCard
                icon={<Plug className="w-6 h-6 text-green-700" />}
                title="Integrations & Data Foundation"
                description="Connect your tools and data sources for secure, reliable AI—from CRM and ticketing to data warehouses and internal wikis."
                bullets={[
                  'Salesforce, HubSpot, Zendesk, Notion, Slack, M365',
                  'ETL/ELT to warehouses & vector DBs',
                  'APIs, webhooks, event buses & SSO/SCIM',
                ]}
                image="/integration.jpg"
              />

              <ServiceCard
                icon={<GraduationCap className="w-6 h-6 text-green-700" />}
                title="Training & Enablement"
                description="Upskill executives and teams to use, govern, and extend AI solutions with confidence."
                bullets={[
                  'Executive briefings & hands‑on workshops',
                  'Champion programs & internal academies',
                  'Playbooks, SOPs & ongoing office hours',
                ]}
                image="/training.jpg"
              />

              <ServiceCard
                icon={<Shield className="w-6 h-6 text-green-700" />}
                title="Security, Compliance & MLOps"
                description="Operate AI responsibly with the right controls for privacy, auditability, and performance."
                bullets={[
                  'Access controls, secret management & data isolation',
                  'Evaluation, monitoring, drift & feedback loops',
                  'SOC2‑ready patterns, audit trails & red‑teaming',
                ]}
                image="/security.jpg"
              />
            </div>
          </div>
        </section>

        {/* OUTCOMES */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <SectionHeader
              eyebrow="Why it matters"
              title="Outcomes you can measure"
              subtitle="We design for business value—speed, quality, cost and customer experience."
            />
            <div className="grid md:grid-cols-4 gap-6">
              <OutcomeCard value="40–70%" label="Task time reduced" />
              <OutcomeCard value="2–5×" label="Throughput increase" />
              <OutcomeCard value="30–60%" label="Support deflection" />
              <OutcomeCard value=">95%" label="SLA adherence" />
            </div>
          </div>
        </section>

        {/* HOW WE WORK */}
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <SectionHeader
              eyebrow="Engagement"
              title="A proven path from idea to impact"
              subtitle="Move quickly with confidence—each stage delivers value on its own."
            />
            <ol className="grid md:grid-cols-3 gap-6">
              {[
                {
                  step: '01',
                  title: 'Discovery Sprint',
                  desc: '2–3 weeks to map opportunities, assess data, and define a prioritized AI roadmap with clear ROI hypotheses.',
                  icon: <Briefcase className="w-5 h-5 text-green-700" />,
                },
                {
                  step: '02',
                  title: 'Proof of Value',
                  desc: 'Rapid prototype to validate assumptions and success metrics with real users and data.',
                  icon: <BarChart className="w-5 h-5 text-green-700" />,
                },
                {
                  step: '03',
                  title: 'Production Build',
                  desc: 'Ship a secure, scalable solution with monitoring, evaluations and governance baked in.',
                  icon: <Cog className="w-5 h-5 text-green-700" />,
                },
                {
                  step: '04',
                  title: 'Integrations',
                  desc: 'Wire up your stack—CRMs, ticketing, data warehouses, knowledge bases, SSO and more.',
                  icon: <Plug className="w-5 h-5 text-green-700" />,
                },
                {
                  step: '05',
                  title: 'Enablement',
                  desc: 'Train executives and teams, ship playbooks and SOPs, and set up champion programs.',
                  icon: <GraduationCap className="w-5 h-5 text-green-700" />,
                },
                {
                  step: '06',
                  title: 'Operate & Improve',
                  desc: 'We monitor, evaluate and iterate—continuously improving quality, safety and ROI.',
                  icon: <Server className="w-5 h-5 text-green-700" />,
                },
              ].map((s) => (
                <li key={s.step} className="bg-white rounded-2xl border shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-xs font-semibold text-green-700 bg-green-50 rounded-md px-2 py-1">{s.step}</div>
                    {s.icon}
                    <h3 className="font-semibold">{s.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm">{s.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* CAPABILITIES */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <SectionHeader
              eyebrow="Capabilities"
              title="Your AI stack, covered"
              subtitle="From LLM apps and retrieval to data platforms, integrations and governance."
            />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                ['LLM apps & copilots', 'Chat, drafting, summarization, copilots embedded in your tools.'],
                ['Retrieval (RAG) & knowledge', 'Use your documents, wikis and data safely in AI workflows.'],
                ['Automation & orchestration', 'Multi‑step flows, human‑in‑the‑loop reviews, SLAs.'],
                ['Data engineering', 'ETL/ELT, warehouses, vector DBs, quality checks.'],
                ['MLOps & evaluation', 'Offline/online evals, monitoring, feedback loops.'],
                ['Security & compliance', 'Access controls, audit trails, encryption and policies.'],
              ].map(([title, desc]) => (
                <div key={title} className="bg-gray-50 border rounded-2xl p-6 hover:shadow-md transition">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-700" />
                    <h3 className="font-semibold">{title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INTEGRATIONS STRIP */}
        <section className="py-16 px-6 bg-gray-50 border-y">
          <div className="max-w-7xl mx-auto">
            <SectionHeader
              eyebrow="Integrations"
              title="We meet you where you work"
              subtitle="Connect AI with your existing stack to unlock value fast."
            />
            <div className="flex flex-wrap gap-3">
              {[
                'Salesforce',
                'HubSpot',
                'Zendesk',
                'Slack',
                'Microsoft 365',
                'Google Workspace',
                'Notion',
                'Confluence',
                'ServiceNow',
                'Shopify',
                'Zapier',
                'Make',
                'Twilio',
                'WhatsApp Business',
                'PostgreSQL',
                'BigQuery',
              ].map((name) => (
                <span
                  key={name}
                  className="text-sm border rounded-full px-3 py-1 bg-white hover:bg-green-50 hover:border-green-200 transition"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* INDUSTRY USE‑CASES */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <SectionHeader
              eyebrow="Use‑cases"
              title="Proven patterns across industries"
              subtitle="We tailor solutions to your context while reusing what works."
            />

            <div className="grid md:grid-cols-3 gap-8">
              <UseCaseCard
                image="/business/finance.jpg"
                title="Financial Services"
                points={[
                  'KYC/AML document automation',
                  'Portfolio insights & reporting copilots',
                  'Claims triage & customer support automations',
                ]}
              />
              <UseCaseCard
                image="/business/healthcare.jpg"
                title="Healthcare"
                points={[
                  'Intake, referral & discharge summaries',
                  'Clinical documentation assistance',
                  'Knowledge search across guidelines',
                ]}
              />
              <UseCaseCard
                image="/business/ops.jpg"
                title="Operations & CX"
                points={[
                  'Ticket deflection & smart routing',
                  'Order exceptions & refunds automation',
                  'QA, insights & agent assist copilots',
                ]}
              />
            </div>
          </div>
        </section>

        {/* CASE STUDY TEASERS */}
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <SectionHeader
              eyebrow="Results"
              title="From pilots to production"
              subtitle="A glimpse at the kind of outcomes we deliver."
            />
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  img: '/business/case-ops.jpg',
                  tag: 'Ops Automation',
                  title: '60% faster case resolution',
                  desc: 'Built triage & summarization copilots integrated with ticketing and knowledge base.',
                },
                {
                  img: '/business/case-sales.jpg',
                  tag: 'Revenue Enablement',
                  title: '2× pipeline coverage',
                  desc: 'Deployed prospecting and drafting copilots connected to CRM and email.',
                },
                {
                  img: '/business/case-support.jpg',
                  tag: 'Customer Support',
                  title: '35% deflection in 90 days',
                  desc: 'Launched multilingual chat with secure retrieval and human handoff.',
                },
              ].map((c) => (
                <article key={c.title} className="bg-white border rounded-2xl overflow-hidden hover:shadow-md transition">
                  <div className="relative h-44">
                    <Image src={c.img} alt={c.tag} fill className="object-cover" />
                  </div>
                  <div className="p-5">
                    <span className="text-[11px] uppercase tracking-wider text-green-700 bg-green-50 px-2 py-1 rounded">{c.tag}</span>
                    <h3 className="mt-2 font-semibold">{c.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{c.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* TRAINING PROGRAMS */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <SectionHeader
              eyebrow="Enablement"
              title="Training that sticks"
              subtitle="We build capability, not just software—so your teams succeed day‑to‑day."
            />
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: <GraduationCap className="w-5 h-5 text-green-700" />,
                  title: 'Executive briefings',
                  desc: 'Board‑level sessions on AI risk, strategy and governance, tailored to your sector.',
                },
                {
                  icon: <Users className="w-5 h-5 text-green-700" />,
                  title: 'Hands‑on team workshops',
                  desc: 'Role‑based curricula with exercises, templates and take‑home playbooks.',
                },
                {
                  icon: <Shield className="w-5 h-5 text-green-700" />,
                  title: 'Responsible AI kits',
                  desc: 'Policies, red‑team checklists and evaluation guides embedded into workflows.',
                },
              ].map((t) => (
                <div key={t.title} className="bg-gray-50 border rounded-2xl p-6">
                  <div className="flex items-center gap-3">
                    {t.icon}
                    <h3 className="font-semibold">{t.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <SectionHeader
              eyebrow="FAQ"
              title="Common questions"
              subtitle="If you don’t see yours here, reach out—we’re happy to help."
            />
            <div className="divide-y rounded-2xl border bg-white">
              {[
                {
                  q: 'How do you handle data security and privacy?',
                  a:
                    'We follow least‑privilege access, encrypt data in transit and at rest, and isolate environments by client. We can deploy in your cloud and integrate with your SSO/SCIM. Logs and prompts can be disabled or scrubbed per policy.',
                },
                {
                  q: 'What does a typical project timeline look like?',
                  a:
                    'Most clients start with a 2–3 week Discovery Sprint, followed by a 3–8 week build depending on scope and integrations. Value is delivered at every stage so you can decide to scale with confidence.',
                },
                {
                  q: 'Which models and platforms do you work with?',
                  a:
                    'We are model‑agnostic and choose what best fits your use case and constraints. We support major model providers and open‑source where appropriate, and we integrate with your existing cloud and data stack.',
                },
                {
                  q: 'Can you train our teams and help with change management?',
                  a:
                    'Yes. Enablement is core to our approach—executive briefings, role‑based workshops, champion programs, SOPs, and ongoing office hours to embed AI into daily work.',
                },
              ].map((f) => (
                <details key={f.q} className="group p-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                    <span className="font-medium">{f.q}</span>
                    <span className="text-green-700 group-open:rotate-45 transition">+</span>
                  </summary>
                  <p className="text-sm text-gray-600 mt-3">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6 bg-black text-white">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
              Ready to unlock ROI with AI?
            </h2>
            <p className="mt-4 text-gray-300 md:text-lg">
              Let’s start with a short conversation about your goals. We’ll suggest the fastest path to value.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:tinpear.now@gmail.com?subject=Get%20Started%20with%20Tinpear%20AI"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-gray-900 font-semibold px-6 py-3 hover:bg-gray-100 transition shadow-md"
              >
                <Mail className="w-5 h-5" /> Contact us
              </a>
              <Link
                href="#services"
                className="inline-flex items-center justify-center rounded-xl border border-white/40 px-6 py-3 font-semibold text-white hover:bg-white/10 transition"
              >
                See what we do
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

/* ========== Reusable Components ========== */
function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center mb-12">
      {eyebrow && (
        <p className="text-[11px] md:text-xs font-medium uppercase tracking-wider text-green-700">{eyebrow}</p>
      )}
      <h2 className="text-2xl md:text-4xl font-bold mt-1">{title}</h2>
      {subtitle && <p className="text-gray-600 max-w-2xl mx-auto mt-3">{subtitle}</p>}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border px-4 py-3 text-left bg-white">
      <p className="text-2xl md:text-3xl font-extrabold text-gray-900">{value}</p>
      <p className="text-gray-500 text-xs md:text-sm">{label}</p>
    </div>
  );
}

function OutcomeCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border bg-white p-6 text-center hover:shadow-md transition">
      <div className="text-3xl font-extrabold text-green-700">{value}</div>
      <div className="text-gray-600 text-sm mt-2">{label}</div>
    </div>
  );
}

function ServiceCard({
  icon,
  title,
  description,
  bullets,
  image,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  bullets: string[];
  image: string;
}) {
  return (
    <article className="bg-white rounded-3xl border shadow-sm overflow-hidden hover:shadow-lg transition">
      <div className="grid md:grid-cols-5">
        <div className="md:col-span-3 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-50 p-3 rounded-xl">{icon}</div>
            <h3 className="text-lg font-bold">{title}</h3>
          </div>
          <p className="text-gray-700 mb-4 text-sm md:text-base">{description}</p>
          <ul className="space-y-2 text-sm text-gray-600">
            {bullets.map((b) => (
              <li key={b} className="flex gap-2 items-start">
                <span className="w-2 h-2 rounded-full bg-green-600 mt-2" />
                {b}
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2 relative h-48 md:h-auto">
          <Image src={image} alt={title} fill className="object-cover" />
        </div>
      </div>
    </article>
  );
}

function UseCaseCard({
  image,
  title,
  points,
}: {
  image: string;
  title: string;
  points: string[];
}) {
  return (
    <article className="bg-white border rounded-2xl overflow-hidden hover:shadow-md transition">
      <div className="relative h-40">
        <Image src={image} alt={title} fill className="object-cover" />
      </div>
      <div className="p-6">
        <h3 className="font-semibold">{title}</h3>
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          {points.map((p) => (
            <li key={p} className="flex gap-2 items-start">
              <CheckCircle className="w-4 h-4 text-green-700 mt-0.5" />
              {p}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
