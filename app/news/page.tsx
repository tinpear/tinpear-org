import Footer from '@/components/ui/footer';
import Header from '@/components/ui/header';
import { getLatestNews } from '@/lib/news';
import Link from 'next/link';

const categories = ['All', 'AI', 'IoT', 'Web3', 'Robotics', 'Tools'];

export default async function NewsPage() {
  const news = await getLatestNews();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 px-4 sm:px-6 py-12 text-gray-800 mt-20">
        <div className="max-w-6xl mx-auto">
          {/* Top Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-extrabold text-indigo-700 mb-3">📡 AI & Tech News</h1>
            <p className="text-lg text-gray-600">
              Latest trends in AI, IoT, Web3, and beyond.
            </p>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                className="px-4 py-2 text-sm rounded-full font-medium border bg-white hover:bg-indigo-50 text-indigo-600 border-indigo-300 transition"
              >
                {cat}
              </button>
            ))}
          </div>

          {/* News Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                <img
                  src={item.image || 'https://source.unsplash.com/random/?technology'}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />

                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                    <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                      {item.category || 'AI'}
                    </span>
                    <span className="text-gray-400">{item.date}</span>
                  </div>

                  <h2 className="text-lg font-semibold text-indigo-800 mb-2">{item.title}</h2>
                  <p className="text-gray-600 text-sm flex-grow">{item.summary}</p>

                  <div className="mt-4">
                    <Link
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Read Full → 
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
