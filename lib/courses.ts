export type Course = {
  title: string;
  /** Route slug used by /learn/[slug] */
  slug: string;
  /** In-page anchor on /learn (card "View learning path") */
  anchor: string;
  level: string;
  isNew?: boolean;
  /** Sticker price shown on the card */
  price: string;
  /** Shown alongside price in detail sections */
  free?: boolean;
  /** e.g. "2 weeks · 2–3 hrs/week" */
  duration: string;
  pacing: string;
  /** 1-based module number shown in detail headers */
  module: number;
  description: string;
  /** "You'll learn" bullets */
  learn: string[];
  /** Where the "Begin Course" button sends the user */
  beginHref: string;
};

/**
 * The catalog shown on /learn, ported from the production site
 * (tinpear.org/learn). Four tracks, all Beginner, all ₦4,999 (NGN).
 *
 * `price` is a display string — the Paystack initialize route strips the
 * currency symbol to derive the amount to charge.
 */
export const courses: Course[] = [
  {
    title: 'AI for Everyone',
    slug: 'ai-for-everyone',
    anchor: 'ai-for-everyone',
    level: 'Beginner · No coding',
    isNew: true,
    price: '₦4,999',
    free: false,
    duration: '2 weeks · 2–3 hrs/week',
    pacing: 'Self-paced',
    module: 1,
    description:
      "New to AI? Start here. Get a friendly tour of today's AI landscape and practical, non-technical ways to use it at work. No math, no code—just clear explanations and hands-on demos.",
    learn: [
      'What AI can (and can’t) do today',
      'Everyday workflows with AI assistants',
      'Prompting basics for better results',
      'Ethics, safety, and privacy essentials',
      'Choosing the right AI tool for the job',
    ],
    beginHref: '/learn/ai-for-everyone',
  },
  {
    title: 'Prompt Engineering',
    slug: 'prompt-engineering',
    anchor: 'prompt-engineering',
    level: 'Beginner',
    price: '₦4,999',
    free: false,
    duration: '2 weeks · 3–5 hrs/week',
    pacing: 'Self-paced',
    module: 1,
    description:
      'Design clear instructions and ship reliable prompts for everyday tasks.',
    learn: [
      'Instruction prompts: goals, constraints, roles',
      'Few-shot patterns (show, not tell)',
      'Chain-of-Thought vs concise prompting',
      'Avoiding ambiguity & leakage',
      'Quality checks & quick evals',
    ],
    beginHref: '/learn/prompt-engineering/beginner',
  },
  {
    title: 'Machine Learning',
    slug: 'machine-learning',
    anchor: 'ml-track',
    level: 'Beginner',
    price: '₦4,999',
    free: false,
    duration: '2 weeks · 3–5 hrs/week',
    pacing: 'Self-paced',
    module: 1,
    description:
      'Build foundational skills: Python, data wrangling, and your first ML models',
    learn: [
      'Python Bootcamp & ML Fundamentals',
      'Data Visualization & EDA',
      'Data Cleaning',
      'ML Workflow',
      'Intro to Matplotlib & Pandas',
    ],
    // Production has no dedicated ML page; it routes to the beginner track.
    beginHref: '/learn/beginner',
  },
  {
    title: 'Ethical AI & Safety',
    slug: 'ethical-ai',
    anchor: 'ethical-ai',
    level: 'Beginner',
    price: '₦4,999',
    free: false,
    duration: '2 weeks · 3–5 hrs/week',
    pacing: 'Self-paced',
    module: 1,
    description:
      'Understand responsible AI principles and practical safety techniques for real LLM apps.',
    learn: [
      'AI ethics basics & fairness considerations',
      'Threat modeling & prompt injection awareness',
      'Safety policies, system prompts, and PII handling',
      'Provenance signals & transparency patterns',
      'Lightweight safety evaluations',
    ],
    beginHref: '/learn/ethical-ai',
  },
];

export function getCourse(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug);
}
