'use client';

import Link from 'next/link';
import { 
  Rocket, 
  BookOpen, 
  Briefcase, 
  Zap, 
  Lightbulb, 
  Users, 
  Code, 
  Globe, 
  BarChart, 
  MessageSquare,
  Mail,
  Twitter,
  Facebook,
  Linkedin
} from 'lucide-react';
import Footer from '@/components/ui/footer';
import Header from '@/components/ui/header';

export default function AboutPage() {
  return (
    <div className="bg-gray-40 text-gray-900 ">
      {/* Navigation */}
      <Header />

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-emerald-800 to-green-500 text-white py-20 mt-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center justify-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-8">
              <Rocket className="w-4 h-4 mr-2" />
              Innovating Since 2019
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Making AI Accessible to <span className="text-green-200">Everyone</span>
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-4xl mx-auto leading-relaxed">
              Tinpear LTD bridges the AI divide - empowering individuals through education and businesses through practical solutions.
            </p>
          </div>
        </section>

        {/* Company Overview */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Dual Mission</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We serve both individual learners seeking AI skills and businesses implementing AI solutions
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 items-stretch">
              {/* AI Education Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-center mb-8">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl mr-6">
                    <BookOpen className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">AI Education</h3>
                </div>
                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                  We demystify artificial intelligence through our project-based learning platform. Whether you're a complete beginner or looking to advance your skills, our courses provide practical, hands-on experience.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                    <p className="text-gray-700">Hands-on projects with real-world applications</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                    <p className="text-gray-700">Structured learning paths from fundamentals to advanced AI</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                    <p className="text-gray-700">Certification programs recognized by industry partners</p>
                  </div>
                </div>
              </div>

              {/* Business Solutions Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-center mb-8">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl mr-6">
                    <Briefcase className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Business Solutions</h3>
                </div>
                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                  We help organizations of all sizes implement AI effectively through custom development, strategic consulting, and comprehensive workforce training programs.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                    <p className="text-gray-700">Custom AI development and integration</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                    <p className="text-gray-700">Rapid prototyping with Tinpear Labs</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                    <p className="text-gray-700">Workforce training and AI strategy consulting</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl shadow-xl p-12 md:p-16">
              <div className="flex items-center mb-10">
                
                <h2 className="text-3xl font-bold text-gray-900">Our Story</h2>
              </div>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                  Founded in 2019, Tinpear LTD began with a simple observation: AI was transforming industries, but access to quality education and practical implementation support was limited to tech elites.
                </p>
                <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                  We set out to create a company that would serve both individual learners and businesses navigating AI adoption. Today, we've helped thousands of users worldwide develop AI skills and implemented solutions for startups to Fortune 500 companies.
                </p>
                <p className="text-xl text-gray-700 leading-relaxed">
                  What sets us apart is our dual focus - we don't just teach AI concepts, we help apply them in real business contexts, ensuring our education translates directly into practical value.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Methodology Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">The Tinpear Methodology</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our approach combines practical application with ethical AI principles
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Lightbulb className="w-8 h-8 text-green-600" />,
                  title: "Practical First",
                  description: "We emphasize immediate application over theoretical perfection. Learn concepts by building real solutions."
                },
                {
                  icon: <Users className="w-8 h-8 text-green-600" />,
                  title: "Human-Centered AI",
                  description: "Our solutions augment human capabilities rather than replace them, focusing on ethical implementation."
                },
                {
                  icon: <Code className="w-8 h-8 text-green-600" />,
                  title: "Modular Solutions",
                  description: "Whether you need one component or end-to-end AI integration, we provide scalable building blocks."
                },
                {
                  icon: <Globe className="w-8 h-8 text-green-600" />,
                  title: "Accessibility Focus",
                  description: "From pricing to interface design, we remove barriers to AI adoption at all levels."
                },
                {
                  icon: <BarChart className="w-8 h-8 text-green-600" />,
                  title: "Business-Aligned",
                  description: "Every educational program and business solution ties directly to measurable outcomes."
                },
                {
                  icon: <MessageSquare className="w-8 h-8 text-green-600" />,
                  title: "Community Powered",
                  description: "We learn from and contribute to the open source AI community while protecting client IP."
                }
              ].map((item, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Industries Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Industries We Transform</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our AI solutions span across multiple sectors, delivering measurable impact
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {['Healthcare', 'Finance', 'Education', 'E-Commerce', 'Manufacturing', 'Media', 'Agriculture', 'Logistics'].map((industry) => (
                <div key={industry} className="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg">
                  <div className="text-lg font-semibold text-gray-900">{industry}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-900 rounded-3xl p-12 md:p-16 text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Connect With Us</h2>
              <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                Whether you're looking to learn AI or implement solutions in your business, we're here to help you succeed.
              </p>
              
              <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <a href="mailto:tinpear.now@gmail.com" className="text-xl font-semibold text-white hover:text-green-400 transition-colors">
                    tinpear.now@gmail.com
                  </a>
                  <p className="text-gray-400 mt-2">Business inquiries and partnerships</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex justify-center space-x-6 mb-4">
                    <a href="https://x.com/TinpearAI?t=M3RUQH4Ob246zzU6e1jWSg&s=09" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-green-400 transition-colors">
                      <Twitter className="w-6 h-6" />
                    </a>
                    <a href="https://www.facebook.com/share/16oyK1cA79/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-green-400 transition-colors">
                      <Facebook className="w-6 h-6" />
                    </a>
                    <a href="https://www.linkedin.com/company/tinpear/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-green-400 transition-colors">
                      <Linkedin className="w-6 h-6" />
                    </a>
                  </div>
                  <p className="text-xl font-semibold text-white">Follow Our Journey</p>
                  <p className="text-gray-400 mt-2">Latest updates and insights</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Ready to Get Started?</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Choose your path to AI success
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-10 text-center shadow-lg border border-gray-100 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl">
                <div className="bg-gradient-to-br from-green-50 to-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Start Learning AI</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Begin your AI journey with our comprehensive project-based courses designed for all skill levels.
                </p>
                <Link href="/learn" className="inline-block px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors shadow-lg">
                  Explore Courses
                </Link>
              </div>
              
              <div className="bg-white rounded-2xl p-10 text-center shadow-lg border border-gray-100 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl">
                <div className="bg-gradient-to-br from-green-50 to-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Briefcase className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Business Solutions</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Transform your organization with custom AI implementations and strategic consulting.
                </p>
                <Link href="/business" className="inline-block px-8 py-4 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl transition-colors shadow-lg">
                  For Businesses
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}