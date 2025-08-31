'use client';

import Link from 'next/link';
import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';
import Image, { StaticImageData } from 'next/image';
import { ChevronRight, Check, Star, BookOpen, Rocket, GraduationCap } from 'lucide-react';

// Import images from /public
import mlImg from '@/public/ml.jpg';
import promptImg from '@/public/prompt.jpg';
import secureImg from '@/public/secure.jpg';

type Stage = {
  level: string;
  description: string;
  duration: string;
  topics: string[];
  action: { text: string; href: string; disabled?: boolean };
};

function Track({
  title,
  badge,
  stages,
  anchorId,
}: {
  title: string;
  badge?: string;
  stages: Stage[];
  anchorId: string;
}) {
  return (
    <section id={anchorId} className="scroll-mt-24 mt-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {badge ? (
          <div className="hidden md:flex items-center text-sm text-gray-500">
            <span className="bg-green-100 text-green-600 px-2 py-1 rounded">{badge}</span>
            <div className="h-0.5 w-12 bg-green-200 mx-2" />
            <span>Self-paced</span>
          </div>
        ) : null}
      </div>

      <div className="relative">
        {/* Progress line */}
        <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-green-200 z-0 hidden md:block" />

        <div className="space-y-10 relative z-10">
          {stages.map((stage, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{index + 1}</span>
                </div>
              </div>

              <div className="flex-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <h3 className="text-xl font-bold text-green-600">{stage.level}</h3>
                  <span className="text-sm text-gray-500">{stage.duration}</span>
                </div>

                <p className="text-gray-700 mb-5">{stage.description}</p>

                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">You'll learn:</h4>
                  <ul className="space-y-2">
                    {stage.topics.map((topic, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-gray-700">{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href={stage.action.href}
                    className={`py-2.5 px-5 rounded-lg text-sm font-medium text-center transition-colors ${
                      stage.action.disabled
                        ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-600 to-green-500 hover:brightness-110 text-white'
                    }`}
                  >
                    {stage.action.text}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** -------------------------------------------
 * CourseCard (single image per card)
 * - Mobile: horizontal scroll-snap
 * - Desktop: 3-column grid
 * ------------------------------------------*/
function CourseCard({
  title,
  subtitle,
  href,
  image,
  alt,
}: {
  title: string;
  subtitle: string;
  href: string;
  image: StaticImageData;
  alt: string;
}) {
  return (
    <Link
      href={href}
      className="snap-center flex-1 min-w-[82%] sm:min-w-[60%] md:min-w-0 md:w-auto group"
    >
      <div className="h-full rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        {/* Image */}
        <div className="p-2">
          <div className="aspect-[16/9] rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={image}
              alt={alt}
              className="h-full w-full object-cover"
              sizes="(max-width: 768px) 80vw, 33vw"
              priority={false}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{subtitle}</p>
          <div className="mt-3 inline-flex items-center text-green-700 font-medium">
            View learning path
            <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function LearnPage() {
  // Machine Learning track
  const mlStages: Stage[] = [
    {
      level: 'Beginner ML',
      description: 'Build foundational skills: Python, data wrangling, and your first ML models',
      duration: '3 weeks · 5–6 hrs/week',
      topics: [
        'Python Bootcamp & ML Fundamentals',
        'Data Visualization & EDA',
        'Regression & Classification Basics',
        'Math for ML Concepts',
        'Model Evaluation Fundamentals',
      ],
      action: { text: 'Begin Course', href: '/learn/beginner' },
    },
    {
      level: 'Intermediate ML',
      description: 'Master advanced techniques and unsupervised learning',
      duration: '4 weeks · 6–8 hrs/week',
      topics: [
        'Advanced Algorithms (XGBoost, SVMs)',
        'Model Evaluation Deep Dive',
        'Clustering & Dimensionality Reduction',
        'Feature Engineering',
        'Intro to Deployment',
      ],
      action: { text: 'Opens Sept. 20, 2025', href: '#', disabled: true },
    },
    {
      level: 'Advanced ML',
      description: 'Build deep learning applications and production systems',
      duration: '5+ weeks · 8+ hrs/week',
      topics: [
        'Neural Networks & TensorFlow',
        'CNNs, NLP & Transformers',
        'Model Deployment (FastAPI/Streamlit)',
        'MLOps Fundamentals',
        'Capstone Projects',
      ],
      action: { text: 'Opens Sept. 28, 2025', href: '#', disabled: true },
    },
  ];

  // Prompt Engineering track
  const promptStages: Stage[] = [
    {
      level: 'Prompt Engineering · Beginner',
      description: 'Design clear instructions and ship reliable prompts for everyday tasks.',
      duration: '2 weeks · 3–5 hrs/week',
      topics: [
        'Instruction prompts: goals, constraints, roles',
        'Few-shot patterns (show, not tell)',
        'Chain-of-Thought vs concise prompting',
        'Avoiding ambiguity & leakage',
        'Quality checks & quick evals',
      ],
      action: { text: 'Start Beginner', href: '/learn/prompt-engineering/beginner' },
    },
    {
      level: 'Prompt Engineering · Intermediate',
      description: 'Build modular prompt systems with tools, memory, and structured outputs.',
      duration: '3 weeks · 5–6 hrs/week',
      topics: [
        'Tool-use prompting (functions / actions)',
        'JSON/Schema-constrained output',
        'Retriever + prompt orchestration',
        'System prompts & safety rails',
        'Batch testing & eval harnesses',
      ],
       action: { text: 'Opens Sept. 28, 2025', href: '#', disabled: true },
    },
    {
      level: 'Prompt Engineering · Advanced',
      description: 'Optimize multi-step agents with monitoring and cost/latency controls.',
      duration: '4 weeks · 6–8 hrs/week',
      topics: [
        'Multi-agent patterns & routing',
        'Self-reflection & critique loops',
        'Optimization (cost, latency, quality)',
        'Red-teaming prompts & jailbreak resilience',
        'Production observability & drift',
      ],
       action: { text: 'Opens Sept. 28, 2025', href: '#', disabled: true },
    },
  ];

  // AI Security & Safety track
  const securityStages: Stage[] = [
    {
      level: 'AI Security & Safety · Foundations',
      description:
        'Understand threat models for LLM apps and basic hardening techniques to prevent common failures.',
      duration: '2 weeks · 3–5 hrs/week',
      topics: [
        'Threat modeling for LLM apps',
        'Prompt injection & data exfiltration basics',
        'Safety policies & system prompts',
        'PII handling & redaction patterns',
        'Logging secrets safely',
      ],
      action: { text: 'Start Foundations', href: '/learn/ai-security/foundations' },
    },
    {
      level: 'AI Security & Safety · Practitioner',
      description:
        'Implement robust filtering, sandboxing, and guardrails. Build an eval suite to continuously test risks.',
      duration: '3 weeks · 5–6 hrs/week',
      topics: [
        'Content filtering & classifier choices',
        'Tool sandboxing & least-privilege actions',
        'Watermarking & provenance signals',
        'Offline + online safety evaluations',
        'Attack libraries & red-team scripts',
      ],
       action: { text: 'Opens Sept. 28, 2025', href: '#', disabled: true },
    },
    {
      level: 'AI Security & Safety · Advanced',
      description:
        'Harden agent systems under adversarial pressure, set up incident response, and prove governance readiness.',
      duration: '4 weeks · 6–8 hrs/week',
      topics: [
        'Adversarial prompt design & bypasses',
        'Policy-as-code & auto-remediation',
        'Secure function calling & data scopes',
        'Incident response runbooks for LLMs',
        'Governance, audits, & compliance',
      ],
       action: { text: 'Opens Sept. 28, 2025', href: '#', disabled: true },
    },
  ];

  return (
    <>
      <Header />

      <main className="min-h-screen bg-white px-4 sm:px-6 py-12 text-gray-800 mt-20">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Hero – ONLY one button */}
          <section className="text-center space-y-6">
            <div className="inline-flex items-center justify-center px-4 py-1.5 bg-green-100 text-green-600 rounded-full text-sm font-medium mb-4">
              <Rocket className="h-4 w-4 mr-2" />
              Transform your career with AI
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              Master Machine Learning with <span className="text-green-500">Tinpear</span>
            </h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Structured, hands-on learning path designed for real-world deployment. Go from fundamentals to
              production-ready models.
            </p>
            <div className="flex justify-center">
              <Link
                href="#courses"
                className="bg-gradient-to-r from-green-600 to-green-500 hover:brightness-110 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center transition-all"
              >
                Explore Learning Path <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </section>

          {/* Benefits */}
          <section className="bg-gray-50 rounded-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-8 text-center text-gray-900">Why Learn with Tinpear?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: <BookOpen className="h-8 w-8 text-green-600" />,
                  title: 'Project-Based Curriculum',
                  description: 'Learn by building real applications from day one',
                },
                {
                  icon: <GraduationCap className="h-8 w-8 text-green-600" />,
                  title: 'Industry-Ready Skills',
                  description: 'Focus on deployable models and production best practices',
                },
                {
                  icon: <Star className="h-8 w-8 text-green-600" />,
                  title: 'Personalized Feedback',
                  description: 'Get code reviews and guidance from experts',
                },
              ].map((item, index) => (
                <div key={index} className="text-center p-4">
                  <div className="flex justify-center mb-4">{item.icon}</div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">{item.title}</h3>
                  <p className="text-gray-700">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Course Cards (one image each) */}
          <section id="courses" aria-label="Available courses">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Choose a Course</h2>
            <p className="text-gray-600 mb-6">Tap a course to jump to its learning path.</p>

            {/* Mobile: horizontal scroll-snap */}
            <div className="-mx-4 px-4 md:hidden">
              <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
                <CourseCard
                  title="Machine Learning"
                  subtitle="Beginner → Advanced"
                  href="#ml-track"
                  image={mlImg}
                  alt="Machine Learning"
                />
                <CourseCard
                  title="Prompt Engineering"
                  subtitle="Beginner → Advanced"
                  href="#prompt-engineering"
                  image={promptImg}
                  alt="Prompt Engineering"
                />
                <CourseCard
                  title="AI Security & Safety"
                  subtitle="Foundations → Advanced"
                  href="#ai-security"
                  image={secureImg}
                  alt="AI Security & Safety"
                />
              </div>
            </div>

            {/* Desktop: 3-column grid */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6">
              <CourseCard
                title="Machine Learning"
                subtitle="Beginner → Advanced"
                href="#ml-track"
                image={mlImg}
                alt="Machine Learning"
              />
              <CourseCard
                title="Prompt Engineering"
                subtitle="Beginner → Advanced"
                href="#prompt-engineering"
                image={promptImg}
                alt="Prompt Engineering"
              />
              <CourseCard
                title="AI Security & Safety"
                subtitle="Foundations → Advanced"
                href="#ai-security"
                image={secureImg}
                alt="AI Security & Safety"
              />
            </div>
          </section>

          {/* Learning Paths */}
          <section id="learning-path">
            <Track
              title="Your Learning Journey · Machine Learning"
              badge="Recommended Path"
              stages={mlStages}
              anchorId="ml-track"
            />

            <Track
              title="Prompt Engineering Track"
              badge="New"
              stages={promptStages}
              anchorId="prompt-engineering"
            />

            <Track
              title="AI Security & Safety"
              stages={securityStages}
              anchorId="ai-security"
            />
          </section>

          {/* Testimonials */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
                Transformative <span className="text-green-600">Learning</span> Experiences
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Testimonial 1 */}
                <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 transform hover:-translate-y-2 transition-transform duration-300">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-lg italic text-gray-700 mb-6">
                    "Coming from a non-tech background, I was intimidated by ML. Tinpear's 'learn-by-building' approach gave me the confidence to
                    not just understand concepts, but implement them. Within 6 months, I transitioned from marketing to a junior ML engineer role."
                  </blockquote>
                  <div className="flex items-center">
                    <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-green-100 to-green-50">
                      <div className="absolute inset-0 flex items-center justify-center text-green-600 font-bold">SD</div>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-900">Sarah D.</h4>
                      <p className="text-sm text-gray-500">Former Marketing Specialist → ML Engineer </p>
                    </div>
                  </div>
                </div>

                {/* Testimonial 2 */}
                <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 transform hover:-translate-y-2 transition-transform duration-300">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                    <span className="ml-2 text-sm text-gray-500">Capstone Project</span>
                  </div>
                  <blockquote className="text-lg italic text-gray-700 mb-6">
                    "As a CS student, I knew theory but struggled with deployment. The end-to-end project guidance helped me build and deploy
                    a sentiment analysis API that became my portfolio centerpiece. Recruiters specifically mentioned it during interviews!"
                  </blockquote>
                  <div className="flex items-center">
                    <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-green-100 to-green-50">
                      <div className="absolute inset-0 flex items-center justify-center text-green-600 font-bold">RK</div>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-900">Raj K.</h4>
                      <p className="text-sm text-gray-500">Computer Science Student → AI Research Intern</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mini Case Study */}
              <div className="mt-12 bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-8 text-white">
                <div className="max-w-3xl mx-auto text-center">
                  <h3 className="text-xl font-bold mb-3">From Learning to Earning</h3>
                  <p className="mb-5">
                    Our students report an average <span className="font-bold">2.3x increase</span> in job interview callbacks
                    after completing projects from the curriculum
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
