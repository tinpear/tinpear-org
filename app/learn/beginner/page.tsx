'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Rocket, BookOpen, Code, BarChart, BrainCircuit, ChevronRight, CheckCircle } from 'lucide-react';
import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';

export default function BeginnerMLCourse() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('username, full_name, avatar_url')
            .eq('id', user.id)
            .single();
          setProfile(data);
        }
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, []);

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 mt-10">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center px-6 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-6">
            <Rocket className="h-4 w-4 mr-2" />
            Start Your AI Journey
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {user ? (
              <>
                Welcome, <span className="text-green-600">{username}</span>!
              </>
            ) : (
              'Beginner Machine Learning Course'
            )}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Master the fundamentals of ML with Python through hands-on projects and real-world applications
          </p>
        </div>

        {/* Course Overview Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-12">
          <div className="md:flex">
            {/* Left Side - Course Image */}
            <div className="md:w-1/3 bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-8">
              <div className="text-center">
                <BrainCircuit className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Beginner ML</h2>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                  3 Weeks • 5-6 hrs/week
                </div>
              </div>
            </div>

            {/* Right Side - Course Details */}
            <div className="md:w-2/3 p-8">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">What You'll Learn</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { icon: <Code className="h-5 w-5 text-green-600" />, text: "Python programming fundamentals" },
                    { icon: <BarChart className="h-5 w-5 text-green-600" />, text: "Data analysis & visualization" },
                    { icon: <BrainCircuit className="h-5 w-5 text-green-600" />, text: "Core ML concepts & algorithms" },
                    { icon: <BookOpen className="h-5 w-5 text-green-600" />, text: "Model evaluation techniques" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start">
                      <span className="mr-3 mt-0.5">{item.icon}</span>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <Link
                    href="/learn/beginner/start"
                    className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:shadow-md transition-all"
                  >
                    Start Learning Now <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/signin"
                      className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:shadow-md transition-all"
                    >
                      Join Course <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                    
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Instructor Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-12">
          <div className="md:flex">
            <div className="md:w-1/3 p-8 bg-gray-50 flex items-center justify-center">
              <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <Image
                  src="/instructor.jpeg"
                  alt="Taofeeq Mukadaz"
                  width={160}
                  height={160}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
            <div className="md:w-2/3 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Instructor</h3>
              <p className="text-lg font-medium text-green-600 mb-4">Taofeeq Mukadaz</p>
              <p className="text-gray-700 mb-4">
                Machine Learning Engineer & Fullstack Developer at Tinpear with a passion for making AI education accessible and practical.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700 italic">
                  "I remember struggling with abstract ML concepts when I started. That's why I designed this course to focus on hands-on learning with real projects from day one."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Course Modules Preview */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Course Breakdown</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Week 1: Python & ML Fundamentals",
                icon: <Code className="h-8 w-8 text-green-600" />,
                description: "Master Python basics and core ML concepts",
                topics: ["Python syntax", "Data structures", "ML workflow"]
              },
              {
                title: "Week 2: Data Wrangling & EDA",
                icon: <BarChart className="h-8 w-8 text-green-600" />,
                description: "Clean, analyze and visualize data",
                topics: ["Pandas", "Matplotlib", "Data cleaning"]
              },
              {
                title: "Week 3: Your First ML Models",
                icon: <BrainCircuit className="h-8 w-8 text-green-600" />,
                description: "Build and evaluate real models",
                topics: ["Linear regression", "Classification", "Model evaluation"]
              }
            ].map((module, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="mr-4 p-2 bg-green-50 rounded-lg">
                    {module.icon}
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">{module.title}</h4>
                </div>
                <p className="text-gray-600 mb-4">{module.description}</p>
                <ul className="space-y-2">
                  {module.topics.map((topic, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Begin?</h3>
          <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of students who've launched their AI journey with this course
          </p>
          {user ? (
            <Link
              href="/learn/beginner/start"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white text-lg font-medium rounded-lg hover:shadow-lg transition-all"
            >
              Continue Learning <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          ) : (
            <Link
              href="/signup"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white text-lg font-medium rounded-lg hover:shadow-lg transition-all"
            >
              Enroll Now <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}