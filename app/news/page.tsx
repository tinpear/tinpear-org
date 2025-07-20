import Footer from '@/components/ui/footer';
import Header from '@/components/ui/header';
import { getLatestNews } from '@/lib/news';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { NewsItem } from '@/lib/types';
import { Blog } from '@/lib/blogs';

export default async function NewsPage() {
  const news: NewsItem[] = await getLatestNews();

  const supabase = createClient();
  const { data: blogs, error } = await (await supabase)
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error.message);
    return <div className="text-red-600">Failed to load blogs</div>;
  }

  return (
    <>
      <Header />

      <main className="bg-gray-50 min-h-screen mt-10">
        <div className="max-w-6xl mx-auto px-4 py-12 space-y-20">

          {/* Mobile Only: Jump to Blogs */}
          <div className="block md:hidden text-center mb-4">
            <a
              href="#blog-section"
              className="inline-block bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded hover:bg-blue-700 transition"
            >
              ↓ Jump to Blogs
            </a>
          </div>

          {/* Hero Section */}
          <section className="text-center space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Tech <span className="text-blue-600">News Hub</span>
            </h1>
            <p className="text-lg text-gray-600">
              Stay ahead with the latest in tech and insights from our blog.
            </p>
          </section>

          {/* News + Blog Layout */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

            {/* News Column */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Latest News</h2>
              <div className="space-y-6">
                {news.map((item, idx) => (
                  <article
  key={`news-${idx}`}
  className="group bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition"
>
  <div className="flex gap-4 max-w-full overflow-hidden">
    <img
      src={item.image || '/news/default.jpg'}
      alt={item.title}
      className="w-24 h-24 object-cover rounded-lg shrink-0"
    />
    <div className="flex-1 min-w-0 w-full overflow-hidden">
      <div className="flex items-center gap-2 text-xs mb-1">
        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
          {item.category || 'General'}
        </span>
        <span className="text-gray-500">{item.date}</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 break-words">
        {item.title}
      </h3>
      <p className="text-sm text-gray-600 line-clamp-2 break-words">
        {item.summary}
      </p>
      <Link
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block text-blue-600 hover:text-blue-700 text-sm font-medium"
      >
        Read more →
      </Link>
    </div>
  </div>
</article>

                ))}
              </div>
            </div>

            {/* Blog Column */}
            <div id="blog-section">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Latest Blogs</h2>
              <div className="space-y-6">
                {blogs.map((blog) => (
                  <Link
                    key={blog.id}
                    href={`/news/${blog.slug}`}
                    className="group block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700">
                      {blog.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{blog.summary}</p>
                    <div className="text-xs text-gray-400 mt-2">
                      {blog.author} • {blog.date}
                    </div>
                    <span className="inline-block mt-2 text-blue-600 text-sm font-medium group-hover:underline">
                      Read more →
                    </span>
                  </Link>
                ))}

                {blogs.length < 3 && (
                  <div className="text-center text-gray-500 italic pt-10">
                    More blog posts coming soon — stay tuned!
                  </div>
                )}
              </div>
            </div>

          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
