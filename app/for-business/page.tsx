'use client';

import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, Keyboard, A11y, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
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
  Mail,
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
        {/* HERO (centered) */}
        <section className="relative overflow-hidden bg-white">
          <div className="max-w-7xl mx-auto px-6 pt-28 pb-20">
            <div className="max-w-4xl mx-auto text-center">
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

              <p className="mt-5 text-lg md:text-xl text-gray-700">
                From strategy to deployment, Tinpear designs and implements AI systems that automate work, augment teams, and deliver measurable ROI—securely and responsibly.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
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
                <Stat label="Avg. time-to-value" value="&lt; 6 wks" />
              </div>
            </div>
          </div>
        </section>

        {/* TRUST STRIP (text-only, no logos) */}
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
              title="End-to-end AI for real business impact"
              subtitle="A modular stack of services—from strategy and proof-of-value to enterprise-grade deployment and enablement."
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
                image="/consulting.jpg"
              />

              <ServiceCard
                icon={<Bot className="w-6 h-6 text-green-700" />}
                title="Automation & AI Agents"
                description="Design autonomous and human-in-the-loop agents that take work off your team’s plate while keeping humans in control."
                bullets={[
                  'Customer support copilots & 24/7 chat',
                  'Back-office automations (ops, finance, HR)',
                  'RPA + LLM orchestration for complex workflows',
                ]}
                image="/automated.jpg"
              />

              <ServiceCard
                icon={<FileCode className="w-6 h-6 text-green-700" />}
                title="Custom AI Solutions"
                description="Build bespoke copilots, RAG/knowledge apps, analytics copilots, and domain-specific models tailored to your data and processes."
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
                  'Executive briefings & hands-on workshops',
                  'Champion programs & internal academies',
                  'Playbooks, SOPs & ongoing office hours',
                ]}
                image="/train.jpg"
              />

              <ServiceCard
                icon={<Shield className="w-6 h-6 text-green-700" />}
                title="Security, Compliance & MLOps"
                description="Operate AI responsibly with the right controls for privacy, auditability, and performance."
                bullets={[
                  'Access controls, secret management & data isolation',
                  'Evaluation, monitoring, drift & feedback loops',
                  'SOC2-ready patterns, audit trails & red-teaming',
                ]}
                image="/sec.jpg"
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
              <OutcomeCard value="&gt;95%" label="SLA adherence" />
            </div>
          </div>
        </section>

        {/* HOW WE WORK */}
        <section className="py-24 px-6 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-6xl mx-auto text-center">
            <SectionHeader
              eyebrow="How We Work"
              title="From ideas to measurable impact"
              subtitle="A simple 3–step journey designed to deliver speed, quality, and real business results."
            />

            {/* Steps */}
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              {[
                {
                  step: '01',
                  title: 'Discover & Align',
                  desc: 'We start with a short sprint to understand your challenges, analyze data, and align on high-value opportunities with clear ROI goals.',
                  icon: <Briefcase className="w-6 h-6 text-green-700" />,
                },
                {
                  step: '02',
                  title: 'Validate Fast',
                  desc: 'Next, we build a rapid prototype to test ideas with real users and data—so you see proof of value before making big investments.',
                  icon: <BarChart className="w-6 h-6 text-green-700" />,
                },
                {
                  step: '03',
                  title: 'Scale & Improve',
                  desc: 'Finally, we launch a secure, scalable solution, integrate with your systems, and keep monitoring to improve ROI over time.',
                  icon: <Cog className="w-6 h-6 text-green-700" />,
                },
              ].map((s) => (
                <div
                  key={s.step}
                  className="bg-white rounded-2xl border shadow-sm p-8 hover:shadow-md transition"
                >
                  <div className="flex flex-col items-center mb-4">
                    <div className="text-sm font-bold text-green-700 bg-green-50 rounded-full w-10 h-10 flex items-center justify-center mb-3">
                      {s.step}
                    </div>
                    {s.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                  <p className="text-gray-600 text-sm">{s.desc}</p>
                </div>
              ))}
            </div>

            {/* Summary Impact */}
            <div className="mt-16 max-w-3xl mx-auto text-center">
              <p className="text-gray-700 text-lg">
                Our approach ensures <span className="font-semibold text-green-700">quick wins early</span> while building
                towards long-term transformation. By combining speed with rigor, we help
                you cut costs, boost efficiency, and create better customer experiences.
              </p>
            </div>
          </div>
        </section>

        {/* CAPABILITIES */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-7xl mx-auto text-center">
            <SectionHeader
              eyebrow="Capabilities"
              title="Your complete AI stack"
              subtitle="Everything you need—from strategy and prototypes to full-scale, secure AI systems."
            />

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
              {[
                {
                  title: 'LLM apps & copilots',
                  desc: 'Conversational AI, drafting, summarization, and intelligent copilots embedded directly into your tools.',
                },
                {
                  title: 'Retrieval & knowledge (RAG)',
                  desc: 'Connect AI to your documents, wikis, and databases—safely powering smarter workflows.',
                },
                {
                  title: 'Automation & orchestration',
                  desc: 'Multi-step flows with human-in-the-loop, service-level guarantees, and seamless handoffs.',
                },
                {
                  title: 'Data engineering',
                  desc: 'ETL/ELT pipelines, data warehouses, vector databases, and automated quality checks.',
                },
                {
                  title: 'MLOps & evaluation',
                  desc: 'Monitoring, evaluation, and feedback loops that keep your AI safe, accurate, and reliable.',
                },
                {
                  title: 'Security & compliance',
                  desc: 'Enterprise-grade access controls, encryption, audit trails, and governance policies.',
                },
              ].map(({ title, desc }) => (
                <div
                  key={title}
                  className="bg-gray-50 border rounded-2xl p-8 text-left hover:shadow-lg hover:border-green-200 transition"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-green-100 text-green-700 rounded-full p-2">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-lg">{title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            {/* Impact Summary */}
            <div className="mt-16 max-w-3xl mx-auto">
              <p className="text-gray-700 text-lg">
                Our capabilities cover the entire lifecycle: from building <span className="font-semibold">AI copilots that save time</span>,
                to <span className="font-semibold">secure data platforms</span> and <span className="font-semibold">enterprise-grade governance</span>.
                No matter where you are in your AI journey, we provide the tools, integrations, and expertise to maximize business impact and ROI.
              </p>
            </div>
          </div>
        </section>

        {/* INTEGRATIONS STRIP — auto-scrolling */}
        <section className="py-16 px-6 bg-gray-50 border-y">
          <div className="max-w-7xl mx-auto">
            <SectionHeader
              eyebrow="Integrations"
              title="We meet you where you work"
              subtitle="Connect AI with your existing stack to unlock value fast."
            />

            <AutoScrollIntegrations
              items={[
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
              ]}
              durationSeconds={40} // slower = larger number (sweet spot)
              gapPx={12}
            />
          </div>
        </section>

        {/* INDUSTRY USE-CASES (modern slider) */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <SectionHeader
              eyebrow="Use-cases"
              title="Proven patterns across industries"
              subtitle="From global enterprises to SMEs, here’s where AI lands real value."
            />

            <UseCasesSlider />

            {/* Summary impact */}
            <div className="mt-14 max-w-3xl mx-auto text-center">
              <p className="text-gray-700 text-lg">
                Different industries, same result: <span className="font-semibold">less busywork, faster service, lower cost</span>.
                We tailor the playbook to your tools and team size.
              </p>
            </div>
          </div>
        </section>

        {/* CONTACT — stores directly to Supabase */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-3xl mx-auto">
            <SectionHeader
              eyebrow="Contact"
              title="Request a consult"
              subtitle="Tell us a bit about your goals and we’ll reach out."
            />
            <ContactForm />
          </div>
        </section>

        {/* TRAINING PROGRAMS */}
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <SectionHeader
              eyebrow="Enablement"
              title="Training that sticks"
              subtitle="We build capability, not just software—so your teams succeed day-to-day."
            />
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: <GraduationCap className="w-5 h-5 text-green-700" />,
                  title: 'Executive briefings',
                  desc: 'Board-level sessions on AI risk, strategy and governance, tailored to your sector.',
                },
                {
                  icon: <Users className="w-5 h-5 text-green-700" />,
                  title: 'Hands-on team workshops',
                  desc: 'Role-based curricula with exercises, templates and take-home playbooks.',
                },
                {
                  icon: <Shield className="w-5 h-5 text-green-700" />,
                  title: 'Responsible AI kits',
                  desc: 'Policies, red-team checklists and evaluation guides embedded into workflows.',
                },
              ].map((t) => (
                <div key={t.title} className="bg-white border rounded-2xl p-6">
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
                    'We follow least-privilege access, encrypt data in transit and at rest, and isolate environments by client. We can deploy in your cloud and integrate with your SSO/SCIM. Logs and prompts can be disabled or scrubbed per policy.',
                },
                {
                  q: 'What does a typical project timeline look like?',
                  a:
                    'Most clients start with a 2–3 week Discovery Sprint, followed by a 3–8 week build depending on scope and integrations. Value is delivered at every stage so you can decide to scale with confidence.',
                },
                {
                  q: 'Which models and platforms do you work with?',
                  a:
                    'We are model-agnostic and choose what best fits your use case and constraints. We support major model providers and open-source where appropriate, and we integrate with your existing cloud and data stack.',
                },
                {
                  q: 'Can you train our teams and help with change management?',
                  a:
                    'Yes. Enablement is core to our approach—executive briefings, role-based workshops, champion programs, SOPs, and ongoing office hours to embed AI into daily work.',
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

/* ---------- UseCasesSlider (modernized) ---------- */
function UseCasesSlider() {
  const slides = [
     {
      image: '/edu.jpg',
      badge: 'Education & Training',
      title: 'Scaled learning. Still personal.',
      text:
        'Adaptive tutors, quick feedback, and tidy lesson summaries for busy learners and teams.',
      chips: ['AI tutor', 'Auto‑feedback', 'Lesson summaries'],
    },
    {
      image: '/med.jpg',
      badge: 'Healthcare',
      title: 'Less admin. More patient time.',
      text:
        'Create intake and discharge summaries in minutes. Pull up guidelines on demand during care.',
      chips: ['Clinical notes', 'Guideline search', 'Referrals'],
    },
    {
      image: '/fin.jpg',
      badge: 'Finance',
      title: 'Faster checks. Cleaner reporting.',
      text:
        'Automate KYC/AML reviews, get instant portfolio snapshots, and triage claims so teams focus on real risk, not paperwork.',
      chips: ['KYC/AML', 'Claims triage', 'Portfolio copilot'],
    },
    
    {
      image: '/op.jpg',
      badge: 'Operations & CX',
      title: 'Fewer tickets. Faster answers.',
      text:
        'Deflect common questions, route the rest smartly, and guide agents with live copilots.',
      chips: ['Ticket deflection', 'Smart routing', 'Agent copilot'],
    },
    {
      image: '/retail.jpg',
      badge: 'Retail & E‑commerce',
      title: 'Personalized journeys that convert.',
      text:
        'Recommend products, forecast demand, and automate post‑purchase help to lift conversion and loyalty.',
      chips: ['Recommendations', 'Demand forecast', 'Post‑purchase'],
    },
    {
      image: '/sme.jpg',
      badge: 'SMEs & Startups',
      title: 'Enterprise‑level wins, minus the bloat.',
      text:
        'Draft content, handle ops, and automate routine work without a heavy IT stack.',
      chips: ['Marketing drafts', 'Ops automation', 'Lightweight stack'],
    },
  ];

  return (
    <div className="mt-12">
      <div className="relative rounded-3xl border bg-gray-50 overflow-hidden">
        {/* Progress bar (top) */}
        <div className="absolute inset-x-0 top-0 h-1 bg-black/5 z-20">
          <div className="swiper-progress h-1 bg-green-600 w-0" />
        </div>

        <Swiper
          modules={[Navigation, Pagination, Autoplay, Keyboard, A11y, EffectFade]}
          slidesPerView={1}
          spaceBetween={0}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop
          keyboard={{ enabled: true }}
          navigation={{
            nextEl: '.uc-next',
            prevEl: '.uc-prev',
          }}
          pagination={{
            clickable: true,
            el: '.uc-pagination',
          }}
          onAutoplayTimeLeft={(_, __, progress) => {
            const bar = document.querySelector<HTMLDivElement>('.swiper-progress');
            if (bar) bar.style.width = `${Math.round((1 - progress) * 100)}%`;
          }}
          className="group"
        >
          {slides.map(({ image, badge, title, text, chips }) => (
            <SwiperSlide key={title}>
              <div className="flex flex-col md:flex-row items-stretch">
                {/* Image side */}
                <div className="relative md:w-1/2">
                  <div className="aspect-[16/10] md:aspect-auto md:h-full w-full">
                    <Image
                      src={image}
                      alt={title}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 50vw, 100vw"
                    />
                  </div>
                  {/* Gradient + glass badge */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent md:from-black/20" />
                  <span className="absolute top-3 left-3 inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur px-3 py-1 text-xs border z-10">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                    {badge}
                  </span>
                </div>

                {/* Content side */}
                <div className="md:w-1/2 p-8 lg:p-10 bg-white">
                  <h3 className="text-2xl font-semibold">{title}</h3>
                  <p className="text-gray-600 leading-relaxed mt-3">{text}</p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {chips.map((c) => (
                      <span
                        key={c}
                        className="text-xs rounded-full border bg-gray-50 px-2.5 py-1"
                      >
                        {c}
                      </span>
                    ))}
                  </div>

                  <div className="mt-8 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                  <div className="mt-3 text-[11px] uppercase tracking-wide text-gray-500">
                    Built fast. Safe by design.
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation + Pagination */}
        <div className="flex items-center justify-between gap-4 px-4 py-4 bg-white/70 backdrop-blur border-t">
          <div className="flex items-center gap-2">
            <button
              className="uc-prev inline-flex items-center justify-center w-9 h-9 rounded-full border hover:bg-gray-50 transition"
              aria-label="Previous"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor">
                <path d="M15 18l-6-6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              className="uc-next inline-flex items-center justify-center w-9 h-9 rounded-full border hover:bg-gray-50 transition"
              aria-label="Next"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor">
                <path d="M9 6l6 6-6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className="uc-pagination flex items-center gap-2
            [&_.swiper-pagination-bullet]:w-2.5
            [&_.swiper-pagination-bullet]:h-2.5
            [&_.swiper-pagination-bullet]:rounded-full
            [&_.swiper-pagination-bullet]:bg-gray-300
            [&_.swiper-pagination-bullet-active]:bg-green-600" />
        </div>
      </div>
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
      <p className="text-2xl md:text-3xl font-extrabold text-gray-900" dangerouslySetInnerHTML={{ __html: value }} />
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

/* ========== Auto-scrolling Integrations Row ========== */
function AutoScrollIntegrations({
  items,
  durationSeconds = 40,
  gapPx = 12,
}: {
  items: string[];
  durationSeconds?: number; // higher = slower
  gapPx?: number;
}) {
  // Duplicate items to create a seamless loop
  const doubled = [...items, ...items];

  return (
    <div className="relative">
      {/* Edge fades to make the scroll feel polished */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-gray-50 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-gray-50 to-transparent" />

      <div className="overflow-hidden">
        <div className="scroller">
          <div className="track">
            {doubled.map((name, idx) => (
              <span
                key={`${name}-${idx}`}
                className="badge"
                style={{ marginRight: `${gapPx}px` }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* styled-jsx for the marquee effect */}
      <style jsx>{`
        .scroller {
          position: relative;
          width: 100%;
        }
        .track {
          display: inline-flex;
          white-space: nowrap;
          will-change: transform;
          animation: scroll linear infinite;
          animation-duration: ${durationSeconds}s;
        }
        .scroller:hover .track {
          animation-play-state: paused;
        }
        .badge {
          flex: 0 0 auto;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          background: #ffffff;
          font-size: 0.875rem;
          line-height: 1.25rem;
        }
        @keyframes scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .track { animation: none; }
        }
      `}</style>
    </div>
  );
}

/* ========== Supabase Contact Form (frontend insert) ========== */
function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setStatus('sending');

    const fd = new FormData(formRef.current!);
    const name = String(fd.get('name') || '').trim();
    const email = String(fd.get('email') || '').trim();
    const company = String(fd.get('company') || '').trim();
    const message = String(fd.get('message') || '').trim();
    const _hp = String(fd.get('_hp') || ''); // honeypot

    try {
      if (_hp) {
        // bot trap: pretend success
        setStatus('success');
        formRef.current?.reset();
        return;
      }
      if (!name || !email || !message) {
        throw new Error('Please fill name, email, and message.');
      }

      const { error } = await supabase
        .from('contact_messages')
        .insert([{
          name,
          email,
          company,
          message,
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
          page: typeof window !== 'undefined' ? window.location.pathname : null,
        }]);

      if (error) throw error;

      setStatus('success');
      formRef.current?.reset();
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong.');
      setStatus('error');
    }
  };

  return (
    <form ref={formRef} onSubmit={onSubmit} className="bg-gray-50 border rounded-2xl p-6 space-y-4">
      {/* Honeypot (hidden) */}
      <input type="text" name="_hp" className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            name="name"
            required
            className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-green-200"
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-green-200"
            placeholder="jane@company.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Company (optional)</label>
        <input
          name="company"
          className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-green-200"
          placeholder="Acme Inc."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Message</label>
        <textarea
          name="message"
          required
          rows={5}
          className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-green-200"
          placeholder="Tell us about your goals…"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={status === 'sending'}
          className="inline-flex items-center justify-center rounded-xl bg-gray-900 text-white font-semibold px-6 py-3 hover:bg-black transition shadow-md disabled:opacity-60"
        >
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </button>

        {status === 'success' && (
          <span className="text-sm text-green-700">Thanks! We’ll be in touch shortly.</span>
        )}
        {status === 'error' && (
          <span className="text-sm text-red-600">{error || 'Failed to send. Try again.'}</span>
        )}
      </div>
    </form>
  );
}
