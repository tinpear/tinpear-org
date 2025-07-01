'use client';

import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';
import Link from 'next/link';

const course = {
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
};

export default function DeepLearningPage() {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-12 text-gray-800 mt-12">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-indigo-700 mb-3">{course.title}</h1>
          <p className="text-gray-600 text-lg">{course.description}</p>
        </header>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-2">📘 Introduction</h2>
          <p className="text-gray-700 leading-relaxed">{course.intro}</p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-2">🎯 What You'll Learn</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            {course.outcomes.map((point, i) => <li key={i}>{point}</li>)}
          </ul>
        </section>

        <section className="mb-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-1">⏳ Estimated Time</h3>
            <p className="text-gray-700">{course.duration}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-1">📚 Learning Mode</h3>
            <p className="text-gray-700">{course.learningMode}</p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-2">💡 Tips to Succeed</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            {course.tips.map((tip, i) => <li key={i}>{tip}</li>)}
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-2">📚 Topics Covered</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            {course.topics.map((topic, i) => <li key={i}>{topic}</li>)}
          </ul>
        </section>

        <section className="mt-10 text-center">
          <Link href="/learn/deep-learning/start">
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
              🚀 Start Course
            </button>
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
