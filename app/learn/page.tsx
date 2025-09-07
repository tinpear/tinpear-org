'use client';

import Link from 'next/link';
import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';
import Image, { StaticImageData } from 'next/image';
import { ChevronRight, Check, Star, BookOpen, GraduationCap, Sparkles } from 'lucide-react';

// Import images from /public
import mlImg from '@/public/ml.jpg';
import promptImg from '@/public/prompt.jpg';
import secureImg from '@/public/secure.jpg';

const aiEveryoneImg = '/ai-for-everyone.jpg';

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
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
        {badge ? (
          <div className="hidden md:flex items-center text-sm text-gray-600">
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">{badge}</span>
            <div className="h-0.5 w-12 bg-green-200 mx-2" />
            <span>Self‑paced</span>
          </div>
        ) : null}
      </div>

      <div className="relative">
        {/* Progress line */}
        <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-green-200 z-0 hidden md:block" />

        <div className="space-y-8 md:space-y-10 relative z-10">
          {stages.map((stage, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row gap-5 md:gap-6 transition-transform duration-200 will-change-transform hover:-translate-y-0.5"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center shadow-sm ring-2 ring-green-100">
                  <span className="text-white font-bold text-sm">{index + 1}</span>
                </div>
              </div>

              <div className="flex-1 bg-white p-5 md:p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 mb-3 md:mb-4">
                  <h3 className="text-lg md:text-xl font-bold text-green-600">{stage.level}</h3>
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
                    className={`py-2.5 px-5 rounded-lg text-sm font-medium text-center transition-all ${
                      stage.action.disabled
                        ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-600 to-green-500 hover:brightness-110 hover:shadow text-white'
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
 * - Desktop: responsive grid
 * ------------------------------------------*/
function CourseCard({
  title,
  subtitle,
  href,
  image,
  alt,
  badge,
}: {
  title: string;
  subtitle: string;
  href: string;
  image: StaticImageData | string;
  alt: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="snap-center flex-1 min-w-[82%] sm:min-w-[60%] md:min-w-0 md:w-auto group"
    >
      <div className="h-full rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        {/* Image */}
        <div className="p-2">
          <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-gray-100">
            {!!badge && (
              <span className="absolute z-10 top-3 left-3 inline-flex items-center gap-1 text-xs font-semibold bg-white/90 backdrop-blur px-2 py-1 rounded text-green-700 border border-green-200 shadow-sm">
                <Sparkles className="h-3.5 w-3.5" /> {badge}
              </span>
            )}
            <Image
              src={image}
              alt={alt}
              className="h-full w-full object-cover"
              sizes="(max-width: 768px) 80vw, (max-width: 1024px) 45vw, 25vw"
              priority={false}
              fill
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
  // AI for Everyone (Beginner, no code)
  const aiEveryoneStages: Stage[] = [
    {
      level: 'AI for Everyone',
      description:
        "New to AI? Start here. Get a friendly tour of today's AI landscape and practical, non-technical ways to use it at work. No math, no code—just clear explanations and hands-on demos.",
      duration: '2 weeks · 2–3 hrs/week',
      topics: [
        'What AI can (and can’t) do today',
        'Everyday workflows with AI assistants',
        'Prompting basics for better results',
        'Ethics, safety, and privacy essentials',
        'Choosing the right AI tool for the job',
      ],
      action: { text: 'Begin Course', href: '/learn/ai-for-everyone' },
    },
  ];

  // Prompt Engineering (Beginner)
  const promptStages: Stage[] = [
    {
      level: 'Introduction to Prompt Engineering',
      description: 'Design clear instructions and ship reliable prompts for everyday tasks.',
      duration: '2 weeks · 3–5 hrs/week',
      topics: [
        'Instruction prompts: goals, constraints, roles',
        'Few-shot patterns (show, not tell)',
        'Chain-of-Thought vs concise prompting',
        'Avoiding ambiguity & leakage',
        'Quality checks & quick evals',
      ],
      action: { text: 'Begin Course', href: '/learn/prompt-engineering/beginner' },
    },
  ];

  // Machine Learning (Beginner)
  const mlStages: Stage[] = [
    {
      level: 'Introduction to Machine Learning',
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
  ];

  // Ethical AI & Safety (Beginner)
  const ethicalStages: Stage[] = [
    {
      level: 'Introduction to Ethical AI & Safety',
      description:
        'Understand responsible AI principles and practical safety techniques for real LLM apps.',
      duration: '2 weeks · 3–5 hrs/week',
      topics: [
        'AI ethics basics & fairness considerations',
        'Threat modeling & prompt injection awareness',
        'Safety policies, system prompts, and PII handling',
        'Provenance signals & transparency patterns',
        'Lightweight safety evaluations',
      ],
      action: { text: 'Begin Course', href: '/learn/ethical-ai' },
    },
  ];

  return (
    <>
      <Header />

      <main className="min-h-screen bg-white px-4 sm:px-6 py-10 md:py-12 text-gray-800 mt-20">
        <div className="max-w-6xl mx-auto space-y-14 md:space-y-16">
          {/* Announcement / Onboarding Nudge */}
          <div className="rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-white p-4 md:p-5 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-green-600 mt-0.5" />
            <p className="text-sm md:text-base text-gray-800">
              <span className="font-semibold text-green-700">New to AI?</span> Take our beginner course{' '}
              <Link href="#ai-for-everyone" className="underline decoration-green-400 underline-offset-2 hover:text-green-700">
                AI for Everyone
              </Link>{' '}
              to get ahead—no coding, just clear explanations and practical skills.
            </p>
          </div>

          {/* Hero (cleaner, no top pill) */}
          <section className="text-center space-y-5 md:space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900"> Master Machine Learning with <span className="text-green-500">Tinpear</span> </h1> <p className="text-lg text-gray-700 max-w-2xl mx-auto"> Structured, hands-on learning path designed for real-world deployment. Go from fundamentals to production-ready models. </p>
            <div className="flex justify-center">
              <Link
                href="#courses"
                className="bg-gradient-to-r from-green-600 to-green-500 hover:brightness-110 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center transition-all shadow hover:shadow-md"
              >
                Explore Courses <ChevronRight className="ml-2 h-4 w-4" />
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
                  title: 'Beginner-Friendly',
                  description: 'Short lessons, plain language, and guided paths',
                },
                {
                  icon: <Star className="h-8 w-8 text-green-600" />,
                  title: 'Practical Outcomes',
                  description: 'Finish with portfolio pieces and confidence',
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

          {/* Course Cards */}
          <section id="courses" aria-label="Available courses">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose a Course</h2>
            <p className="text-gray-600 mb-6">
              New to AI ? Start with <span className="font-medium text-gray-900">AI for Everyone</span>, then continue with other beginner tracks.
            </p>

            {/* Mobile: horizontal scroll-snap */}
            <div className="-mx-4 px-4 md:hidden">
              <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
                <CourseCard
                  title="AI for Everyone"
                  subtitle="Beginner · No coding"
                  href="#ai-for-everyone"
                  image={aiEveryoneImg}
                  alt="AI for Everyone course"
                  badge="New"
                />
                <CourseCard
                  title="Prompt Engineering"
                  subtitle="Beginner"
                  href="#prompt-engineering"
                  image={promptImg}
                  alt="Prompt Engineering"
                />
                <CourseCard
                  title="Machine Learning"
                  subtitle="Beginner"
                  href="#ml-track"
                  image={mlImg}
                  alt="Machine Learning"
                />
                <CourseCard
                  title="Ethical AI & Safety"
                  subtitle="Beginner"
                  href="#ethical-ai"
                  image={secureImg}
                  alt="Ethical AI & Safety"
                />
              </div>
            </div>

            {/* Desktop: 4-column grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
              <CourseCard
                title="AI for Everyone"
                subtitle="Beginner · No coding"
                href="#ai-for-everyone"
                image={aiEveryoneImg}
                alt="AI for Everyone course"
                badge="New"
              />
              <CourseCard
                title="Prompt Engineering"
                subtitle="Beginner"
                href="#prompt-engineering"
                image={promptImg}
                alt="Prompt Engineering"
              />
              <CourseCard
                title="Machine Learning"
                subtitle="Beginner"
                href="#ml-track"
                image={mlImg}
                alt="Machine Learning"
              />
              <CourseCard
                title="Ethical AI & Safety"
                subtitle="Beginner"
                href="#ethical-ai"
                image={secureImg}
                alt="Ethical AI & Safety"
              />
            </div>
          </section>

          {/* Learning Paths */}
          <section id="learning-path">
            <Track
              title="AI for Everyone"
              badge="Beginner"
              stages={aiEveryoneStages}
              anchorId="ai-for-everyone"
            />

            <Track
              title="Prompt Engineering"
              badge="Beginner"
              stages={promptStages}
              anchorId="prompt-engineering"
            />

            <Track
              title="Machine Learning"
              badge="Beginner"
              stages={mlStages}
              anchorId="ml-track"
            />

            <Track
              title="Ethical AI & Safety"
              badge="Beginner"
              stages={ethicalStages}
              anchorId="ethical-ai"
            />
          </section>

          {/* Testimonials */}
          <section className="py-14 md:py-16 bg-gray-50 rounded-xl">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <h2 className="text-3xl font-bold text-center mb-10 md:mb-12 text-gray-900">
                Transformative <span className="text-green-600">Learning</span> Experiences
              </h2>

              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                {/* Testimonial 1 */}
                <div className="bg-white p-6 md:p-8 rounded-xl shadow-md border border-gray-100 transform hover:-translate-y-2 transition-transform duration-300">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-base md:text-lg italic text-gray-700 mb-6">
                    "Coming from a non-tech background, I was intimidated by ML. Tinpear's 'learn-by-building' approach gave me the confidence to
                    not just understand concepts, but implement them. Within 6 months, I transitioned from marketing to a junior ML engineer role."
                  </blockquote>
                  <div className="flex items-center">
                    <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden bg-gradient-to-br from-green-100 to-green-50">
                      <div className="absolute inset-0 flex items-center justify-center text-green-600 font-bold">SD</div>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-900">Sarah D.</h4>
                      <p className="text-sm text-gray-500">Former Marketing Specialist → ML Engineer </p>
                    </div>
                  </div>
                </div>

                {/* Testimonial 2 */}
                <div className="bg-white p-6 md:p-8 rounded-xl shadow-md border border-gray-100 transform hover:-translate-y-2 transition-transform duration-300">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                    <span className="ml-2 text-sm text-gray-500">Capstone Project</span>
                  </div>
                  <blockquote className="text-base md:text-lg italic text-gray-700 mb-6">
                    "As a CS student, I knew theory but struggled with deployment. The end-to-end project guidance helped me build and deploy
                    a sentiment analysis API that became my portfolio centerpiece. Recruiters specifically mentioned it during interviews!"
                  </blockquote>
                  <div className="flex items-center">
                    <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden bg-gradient-to-br from-green-100 to-green-50">
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
              <div className="mt-10 md:mt-12 bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 md:p-8 text-white">
                <div className="max-w-3xl mx-auto text-center">
                  <h3 className="text-lg md:text-xl font-bold mb-3">From Learning to Earning</h3>
                  <p className="mb-2 md:mb-5">
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
