// app/news/page.tsx
import Footer from '@/components/ui/footer';
import Header from '@/components/ui/header';
import { getLatestNews } from '@/lib/news';
import Link from 'next/link';
import { NewsItem } from '@/lib/types';

export const dynamic = 'force-dynamic'; // or remove if you pre-render

export default async function NewsPage() {
  const news: NewsItem[] = await getLatestNews();

  return (
    <>
      <Header />

      <main className="bg-gray-50 min-h-screen mt-10">
        <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
          {/* Hero */}
          <section className="text-center space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Tech <span className="text-green-600">News Hub</span>
            </h1>
            <p className="text-lg text-gray-600">
              Stay ahead with the latest AI Insights.
            </p>
          </section>

          {/* News List */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Latest News</h2>
              <Link
                href="/blog"
                className="text-sm font-medium text-green-700 hover:underline"
              >
                Visit our Blog →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {news.map((item, idx) => (
                <article
                  key={`news-${idx}`}
                  className="group bg-white rounded-2xl p-4 border border-gray-200 hover:shadow-lg transition"
                >
                  <div className="flex gap-4 max-w-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image || '/news/default.jpg'}
                      alt={item.title}
                      className="w-28 h-28 object-cover rounded-xl shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs mb-1">
                        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">
                          {item.category || 'General'}
                        </span>
                        <span className="text-gray-500">{item.date}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-700 break-words">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 break-words">
                        {item.summary}
                      </p>
                      <Link
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-green-700 hover:underline text-sm font-medium"
                      >
                        Read more →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
