'use client';

import Link from 'next/link';
import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';
import { courses } from '@/lib/courses'; // ✅ now pulling from lib

export default function LearnPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-6 py-12 text-gray-800 mt-15">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-10">Learn AI with Tinpear 🍐</h1>
          <p className="text-center text-lg text-gray-600 mb-12">
            A step-by-step path to master Artificial Intelligence, from beginner to advanced.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course, idx) => (
              <Link key={idx} href={`/learn/${course.slug}`}>
                <div className="p-6 border border-gray-200 rounded-lg shadow hover:shadow-md transition bg-white cursor-pointer">
                  <h2 className="text-xl font-semibold text-indigo-700 mb-2">{course.title}</h2>
                  <p className="text-gray-600 text-sm">{course.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
