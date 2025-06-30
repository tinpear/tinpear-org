export type Course = {
  title: string;
  slug: string;
  description: string;
  intro: string;
  duration: string;
  learningMode: string;
  outcomes: string[];
  tips: string[];
  topics: string[];
};

export const courses: Course[] = [
  {
    title: 'Introduction to AI',
    slug: 'introduction-to-ai',
    description: 'Understand what AI is, where it began, and where it’s headed.',
    intro: 'This course will take you on a journey into the world of Artificial Intelligence — what it is, how it works, and why it matters in today’s world.',
    duration: '2–3 hours',
    learningMode: 'Self-paced with visuals, illustrations, and simple videos.',
    outcomes: [
      'Understand the foundations of AI',
      'Identify real-world applications',
      'Recognize types and categories of AI',
      'Be aware of ethical considerations',
    ],
    tips: [
      'Take it slow — no rush!',
      'Pause videos and read explanations.',
      'Use our notes and summaries.',
      'Ask questions in the community.',
    ],
    topics: [
      'What is AI?',
      'History and Evolution',
      'Types of AI',
      'Real-world Applications',
      'Ethics & Future of AI',
    ],
  },
  {
    title: 'Machine Learning Basics',
    slug: 'machine-learning-basics',
    description: 'Learn the foundations of machine learning through clear examples and analogies.',
    intro: 'Machine Learning is a core part of AI. In this course, you’ll explore how computers learn from data — using patterns to make predictions and decisions.',
    duration: '3–5 hours',
    learningMode: 'Videos + code demos + interactive quizzes',
    outcomes: [
      'Understand types of machine learning',
      'Train and test simple models',
      'Handle real-world data',
      'Understand underfitting and overfitting',
    ],
    tips: [
      'Try the examples yourself.',
      'Review terminology regularly.',
      'Focus on concepts before code.',
    ],
    topics: [
      'Supervised vs Unsupervised Learning',
      'Regression & Classification',
      'Training vs Testing',
      'Evaluation Metrics',
      'Bias & Variance',
    ],
  },
  {
    title: 'Deep Learning',
    slug: 'deep-learning',
    description: 'Explore neural networks, CNNs, and how machines learn complex patterns.',
    intro: 'This course dives into how neural networks mimic the brain and power today’s most powerful AI systems like ChatGPT, DALL·E, and self-driving cars.',
    duration: '5–7 hours',
    learningMode: 'Visual explainer videos + animated diagrams',
    outcomes: [
      'Understand neural networks',
      'Know how deep learning differs from ML',
      'Work with layers, weights, and activation functions',
      'Train and tweak simple models',
    ],
    tips: [
      'Don’t worry about the math — focus on flow.',
      'Play with visual tools and animations.',
      'Rewatch videos to understand intuitions.',
    ],
    topics: [
      'Neural Network Basics',
      'Feedforward & Backpropagation',
      'Activation Functions',
      'Convolutional Networks (CNNs)',
      'Training Deep Models',
    ],
  },
  {
    title: 'Natural Language Processing (NLP)',
    slug: 'natural-language-processing',
    description: 'Teach machines to understand and generate human language.',
    intro: 'From chatbots to language translators, NLP is behind it all. In this course, you’ll discover how AI reads, writes, and talks.',
    duration: '4–6 hours',
    learningMode: 'Text + interactive demos + embedded models',
    outcomes: [
      'Clean and prepare textual data',
      'Understand vectorization & embeddings',
      'Explore LLMs and transformers',
      'Create simple chatbots',
    ],
    tips: [
      'Use real examples like tweets and emails.',
      'Visualize how tokens and vectors work.',
      'Compare before and after models.',
    ],
    topics: [
      'Tokenization & Text Cleaning',
      'TF-IDF & Word2Vec',
      'Embeddings & Semantic Search',
      'Transformers, BERT, and GPT',
      'Building Simple NLP Apps',
    ],
  },
  {
    title: 'Computer Vision',
    slug: 'computer-vision',
    description: 'Enable machines to see and understand visual information.',
    intro: 'Learn how machines interpret images and videos — from facial recognition to object detection and augmented reality.',
    duration: '3–5 hours',
    learningMode: 'Visual slides + short screen recordings',
    outcomes: [
      'Work with images in code',
      'Understand object detection & classification',
      'Use pre-trained vision models',
      'Apply real-time camera projects',
    ],
    tips: [
      'Start with small image files.',
      'Use OpenCV or similar libraries.',
      'Run experiments visually.',
    ],
    topics: [
      'Image Representation',
      'Edge Detection & Filters',
      'CNNs for Vision',
      'YOLO / SSD for Detection',
      'Deploying Vision Models',
    ],
  },
  {
    title: 'Building AI Apps',
    slug: 'building-ai-apps',
    description: 'Take your models and bring them to life in real applications.',
    intro: 'This course connects your AI knowledge with real tools — so you can build working apps using APIs, models, and web frameworks.',
    duration: '4–8 hours',
    learningMode: 'Hands-on coding + deployment guides',
    outcomes: [
      'Build a frontend + backend AI flow',
      'Use Hugging Face or OpenAI APIs',
      'Build web apps with Next.js + Python',
      'Deploy and share your AI projects',
    ],
    tips: [
      'Keep it simple — one feature at a time.',
      'Use starter kits or boilerplates.',
      'Test locally before deploying.',
    ],
    topics: [
      'Flask/FastAPI + Next.js Setup',
      'Calling AI APIs',
      'Handling User Input',
      'Deploying on Render or Vercel',
      'AI App Project',
    ],
  },
  {
    title: 'Prompt Engineering',
    slug: 'prompt-engineering',
    description: 'Learn how to design prompts that make AI respond better and smarter.',
    intro: 'AI models are smart — but only if you ask them right. Prompt engineering teaches you the art of crafting perfect inputs for amazing outputs.',
    duration: '1.5–3 hours',
    learningMode: 'Prompt demos + screenshots + analysis',
    outcomes: [
      'Write zero-shot and few-shot prompts',
      'Use prompt templates and chaining',
      'Debug and refine AI outputs',
      'Use LangChain for advanced prompting',
    ],
    tips: [
      'Break your prompt into steps.',
      'Use examples for clarity.',
      'Save prompt patterns you like.',
    ],
    topics: [
      'What is Prompt Engineering?',
      'Prompt Formats & Templates',
      'Few-shot Examples',
      'Chaining & Tools',
      'LLM Playground Experiments',
    ],
  },
  {
    title: 'Projects & Challenges',
    slug: 'projects-and-challenges',
    description: 'Practice what you’ve learned through real-world projects.',
    intro: 'The best way to learn AI is by building with it. This course gives you hands-on mini-projects and creative challenges to build your portfolio.',
    duration: 'Ongoing / Self-paced',
    learningMode: 'Self-driven projects + submission system',
    outcomes: [
      'Build AI projects from scratch',
      'Solve real-world problems',
      'Collaborate on group challenges',
      'Prepare for hackathons & interviews',
    ],
    tips: [
      'Start with your interests.',
      'Share your work — even unfinished.',
      'Join the community for feedback.',
    ],
    topics: [
      'Mini Projects',
      'Thematic Challenges',
      'Capstone Planning',
      'Portfolio Publishing',
      'Community Submissions',
    ],
  },
];
