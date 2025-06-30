import SectionCard from './SectionCard';

const sections = [
  { title: 'Introduction to AI', description: 'Understand what AI is, where it began, and where it’s headed.' },
  { title: 'Machine Learning Basics', description: 'Learn about supervised, unsupervised, and reinforcement learning with visuals and examples.' },
  { title: 'Deep Learning', description: 'Dive into neural networks, layers, and how deep models learn representations.' },
  { title: 'Natural Language Processing (NLP)', description: 'Explore how machines understand and generate language.' },
  { title: 'Computer Vision', description: 'Teach machines to “see” — from image classification to object detection.' },
  { title: 'Building AI Apps', description: 'Use real-world tools like Python, APIs, and ML models to build AI-powered apps.' },
  { title: 'Prompt Engineering', description: 'Master the art of talking to AI — design prompts that work effectively.' },
  { title: 'Projects & Challenges', description: 'Apply what you’ve learned in real-world projects and creative challenges.' }
];

export default function LearnLayout() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-6 py-12 text-gray-800">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-10">Learn AI with Tinpear 🍐</h1>
        <p className="text-center text-lg text-gray-600 mb-12">
          A beautifully structured, beginner-to-advanced path into Artificial Intelligence. Pick your topic, start learning, and build.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section, idx) => (
            <SectionCard key={idx} title={section.title} description={section.description} />
          ))}
        </div>
      </div>
    </main>
  );
}
