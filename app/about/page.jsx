import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white px-6 py-20 text-gray-800 mt-20">
        <section className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-indigo-700 mb-4">About Tinpear</h1>
          <p className="text-lg text-gray-600 mb-10">
            Tinpear is a platform dedicated to empowering creators, learners, and builders through the power of AI.
          </p>
        </section>

        <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 py-10">
          <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold text-indigo-600 mb-3">🌍 Our Mission</h2>
            <p className="text-gray-700 leading-relaxed">
              To make AI education practical, creative, and accessible — for developers, designers, founders, and dreamers alike.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold text-indigo-600 mb-3">💡 Our Approach</h2>
            <p className="text-gray-700 leading-relaxed">
              No jargon. No fluff. We use visual storytelling, mini-projects, interactive content, and real-world tools to help you learn AI with clarity and confidence.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold text-indigo-600 mb-3">🚀 Why Tinpear?</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Learn by building — with projects that matter.</li>
              <li>Stay updated with real tools, APIs, and trends.</li>
              <li>Rooted in simplicity, powered by purpose.</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold text-indigo-600 mb-3">🙌 Community First</h2>
            <p className="text-gray-700 leading-relaxed">
              Tinpear is more than content. It's a community of learners, teachers, and builders helping each other grow. We believe learning AI should be fun, social, and deeply human.
            </p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto text-center mt-20">
          <h2 className="text-3xl font-bold text-indigo-700 mb-4">We're just getting started.</h2>
          <p className="text-gray-600 mb-6">
            The future of learning is collaborative, visual, and AI-driven. Join us on the journey.
          </p>
          <a
            href="/learn"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            🌟 Start Learning with Tinpear
          </a>
        </section>
      </main>
      <Footer />
    </>
  );
}
