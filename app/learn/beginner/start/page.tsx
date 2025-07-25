'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { CheckCircle, ChevronRight, NotebookPen, Flame } from 'lucide-react';
import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';

export default function BeginnerStartPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username, full_name')
          .eq('id', user.id)
          .single();
        setProfile(profileData);

        const { data: progress } = await supabase
          .from('course_progress')
          .select('completed')
          .eq('user_id', user.id)
          .eq('course_id', 'beginner')
          .eq('module_id', 'week-1')
          .eq('lesson_id', 'intro')
          .single();

        if (progress?.completed) setCompleted(true);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const markComplete = async () => {
    if (!user) return;

    await supabase
      .from('course_progress')
      .upsert({
        user_id: user.id,
        course_id: 'beginner',
        module_id: 'week-1',
        lesson_id: 'intro',
        completed: true,
        completed_at: new Date().toISOString()
      }, { onConflict: 'user_id,course_id,module_id,lesson_id' });

    setCompleted(true);
  };

  const username = profile?.full_name || profile?.username || user?.email?.split('@')[0];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white py-12 px-4 sm:px-6 mt-10">
        <div className="max-w-4xl mx-auto">
          {/* Greeting */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Welcome{username ? `, ${username}` : ''} 👋
            </h1>
            <p className="text-lg text-gray-600">
              Let’s dive into the first step of your Machine Learning journey!
            </p>
          </div>

          {/* Lesson Content */}
          <div className="bg-gray-50 border border-green-100 rounded-xl p-6 mb-8">
            <div className="flex items-center mb-4">
              <NotebookPen className="text-green-600 w-6 h-6 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Lesson: What is Machine Learning?</h2>
            </div>
            <p className="text-gray-700 mb-4">
              Machine learning is a way for computers to learn from data instead of being explicitly programmed.
              In this lesson, you'll explore what ML really means, see real-world examples, and write your first Python code in Colab.
            </p>

            <div className="flex items-center gap-4 flex-wrap mt-6">
              <a
                href="https://colab.research.google.com/drive/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-5 py-3 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
              >
                🚀 Open in Google Colab
              </a>

              {!completed ? (
                <button
                  onClick={markComplete}
                  className="inline-flex items-center px-5 py-3 bg-gray-200 text-gray-800 text-sm rounded-lg hover:bg-green-100 transition"
                >
                  ✅ Mark as Complete
                </button>
              ) : (
                <div className="inline-flex items-center px-5 py-3 bg-green-100 text-green-800 text-sm rounded-lg">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Lesson Completed
                </div>
              )}
            </div>
          </div>

          {/* Next Lesson CTA */}
          <div className="text-center mt-12">
            <Link
              href="/learn/beginner/week-1/data-types"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white text-lg font-medium rounded-lg hover:shadow-lg transition-all"
            >
              Continue to Next Lesson <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
            <p className="text-sm text-gray-500 mt-2">Next up: Python data types & variables</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
