'use client';

import Head from 'next/head';
import Link from 'next/link';
import {
  Rocket,
  BookOpen,
  Briefcase,
  Lightbulb,
  Users,
  Code,
  Globe,
  BarChart,
  MessageSquare,
  Mail,
  Twitter,
  Facebook,
  Linkedin,
} from 'lucide-react';

import Footer from '@/components/ui/footer';
import Header from '@/components/ui/header';

export default function AboutPage() {
  return (
    <div className="bg-white text-gray-900">
      <Head>
        <title>About Us – Tinpear</title>
        <meta name="description" content="Learn about Tinpear's mission to make AI accessible through education and practical business solutions." />
      </Head>

      <Header />

      <main className="min-h-screen">
        {/* Hero */}
        <section className="bg-gradient-to-br from-emerald-800 to-green-500 text-white py-24 text-center px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center items-center gap-2 mb-4 text-sm font-medium bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm w-max mx-auto">
              <Rocket className="w-4 h-4" />
              Innovating Since 2019
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Making AI <span className="text-green-200">Accessible</span> to Everyone
            </h1>
            <p className="text-lg md:text-xl text-green-100 max-w-2xl mx-auto">
              Tinpear bridges the AI divide—empowering learners through education and businesses through custom AI solutions.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold">Our Dual Mission</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Equipping individuals to master AI while enabling businesses to harness its power responsibly.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Education */}
              <Card
                icon={<BookOpen className="w-8 h-8 text-green-600" />}
                title="AI Education"
                description="Our hands-on platform helps beginners and developers build real-world AI experience through structured learning paths."
                points={[
                  'Real-world project-based curriculum',
                  'Guided learning paths from beginner to advanced',
                  'Certificates recognized by tech companies',
                ]}
              />

              {/* Business */}
              <Card
                icon={<Briefcase className="w-8 h-8 text-green-600" />}
                title="Business Solutions"
                description="We work with companies to implement tailored AI solutions—from strategy and prototyping to deployment and workforce training."
                points={[
                  'Custom AI system design',
                  'Rapid prototyping via Tinpear Labs',
                  'Executive training & AI adoption consulting',
                ]}
              />
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-24 bg-gradient-to-br from-gray-50 to-slate-100 px-6">
          <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-12 md:p-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-900">Our Story</h2>
            <div className="text-lg text-gray-700 space-y-6">
              <p>
                Founded in 2019, Tinpear started with a vision to break barriers in AI access. While AI advanced rapidly, access to high-quality, affordable learning and implementation was still out of reach for many.
              </p>
              <p>
                We aimed to change that. Our dual approach—AI education and enterprise services—has supported thousands of learners and companies around the world.
              </p>
              <p>
                What makes Tinpear different is our real-world focus: we teach AI and deploy it meaningfully. Our mission is rooted in practical impact and ethical AI transformation.
              </p>
            </div>
          </div>
        </section>

        {/* Methodology */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold">The Tinpear Methodology</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our principles guide how we teach, build, and deploy AI.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[
                ['Practical First', 'Learn by building real solutions.', <Lightbulb className="text-green-600 w-6 h-6" />],
                ['Human-Centered AI', 'AI that augments human potential.', <Users className="text-green-600 w-6 h-6" />],
                ['Modular Design', 'Flexible building blocks for AI.', <Code className="text-green-600 w-6 h-6" />],
                ['Accessibility Focus', 'Making AI approachable for all.', <Globe className="text-green-600 w-6 h-6" />],
                ['Business-Aligned', 'Every solution drives ROI.', <BarChart className="text-green-600 w-6 h-6" />],
                ['Community Powered', 'We contribute to and learn from the open AI ecosystem.', <MessageSquare className="text-green-600 w-6 h-6" />],
              ].map(([title, desc, icon], i) => (
                <div key={i} className="bg-white rounded-xl border p-6 text-center shadow-md hover:shadow-lg transition">
                  <div className="mx-auto mb-4">{icon}</div>
                  <h3 className="font-semibold text-lg">{title}</h3>
                  <p className="text-gray-600 text-sm mt-2">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Industries */}
        <section className="py-20 px-6 bg-gradient-to-br from-gray-50 to-slate-100">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold">Industries We Serve</h2>
              <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
                Delivering impact in healthcare, finance, education, and beyond.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {['Healthcare', 'Finance', 'Education', 'E-Commerce', 'Manufacturing', 'Media', 'Agriculture', 'Logistics'].map(
                (industry) => (
                  <div key={industry} className="bg-white rounded-lg p-4 text-center shadow hover:shadow-lg border">
                    <p className="font-medium">{industry}</p>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-5xl mx-auto bg-gray-900 text-white rounded-3xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Let’s Connect</h2>
            <p className="text-lg text-gray-300 mb-10">
              Whether you're a learner or a business, we’d love to support your AI journey.
            </p>

            <div className="grid md:grid-cols-2 gap-10 text-left max-w-3xl mx-auto">
              <div>
                <div className="flex items-center space-x-4 mb-3">
                  <Mail className="text-white" />
                  <a href="mailto:tinpear.now@gmail.com" className="text-white hover:text-green-300">
                    tinpear.now@gmail.com
                  </a>
                </div>
                <p className="text-gray-400">Business inquiries, partnerships, support</p>
              </div>

              <div>
                <div className="flex space-x-4 mb-3">
                  <a href="https://x.com/TinpearAI" target="_blank" rel="noopener noreferrer">
                    <Twitter className="text-gray-300 hover:text-green-300" />
                  </a>
                  <a href="https://www.facebook.com/share/16oyK1cA79/" target="_blank" rel="noopener noreferrer">
                    <Facebook className="text-gray-300 hover:text-green-300" />
                  </a>
                  <a href="https://www.linkedin.com/company/tinpear/" target="_blank" rel="noopener noreferrer">
                    <Linkedin className="text-gray-300 hover:text-green-300" />
                  </a>
                </div>
                <p className="text-gray-400">Follow us for updates</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// 🔹 Reusable Card component
function Card({
  icon,
  title,
  description,
  points,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  points: string[];
}) {
  return (
    <div className="bg-white rounded-2xl border shadow-md p-8 hover:shadow-xl transition">
      <div className="flex items-center mb-6">
        <div className="bg-green-50 p-4 rounded-xl mr-4">{icon}</div>
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-700 mb-6">{description}</p>
      <ul className="space-y-3 text-sm text-gray-600">
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="w-2 h-2 mt-2 bg-green-500 rounded-full" />
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}
