import Footer from '@/components/ui/footer';
import Header from '@/components/ui/header';
import { getLatestNews } from '@/lib/news';
import Link from 'next/link';

export default async function NewsPage() {
  const news = await getLatestNews();

  return (
    <>
    <Header />
    <main className="min-h-screen bg-gray-50 px-6 py-12 text-gray-800 mt-15">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">AI & Tech News</h1>
        <p className="text-center text-lg text-gray-600 mb-12">
          Stay updated with breakthrough tools, open-source APIs, and AI innovations.
        </p>

        <div className="space-y-8">
          {news.map((item, idx) => (
            <article key={idx} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
              <h2 className="text-2xl font-semibold text-indigo-700 mb-2">{item.title}</h2>
              <p className="text-gray-600 mb-4">{item.summary}</p>
              <p className="text-sm text-gray-400">Published: {item.date}</p>
              <Link href={item.url} target="_blank" className="mt-3 inline-block text-indigo-600 hover:underline">
                Read more →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
    <Footer />
    </>
);
}
