'use client';

import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';
import Link from 'next/link';

const course = {
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
};

export default function ComputerVisionPage() {
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
          <Link href="/learn/computer-vision/start">
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
