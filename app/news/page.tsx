import Footer from '@/components/ui/footer';
import Header from '@/components/ui/header';
import { getLatestNews } from '@/lib/news';
import { blogs } from '@/lib/blogs';
import Link from 'next/link';
import AutoSlideshow from '@/components/AutoSlideshow';
import { createClient } from '@/lib/supabase/server'; 

// Import the actual types from their source files
import { NewsItem } from '@/lib/types';
import { Blog } from '@/lib/blogs';

export default async function NewsPage() {
  const news: NewsItem[] = await getLatestNews();
  const featuredNews: NewsItem[] = news.slice(0, 5); // Top 5 for slideshow
  const regularNews: NewsItem[] = news.slice(5); // Rest for feed
  
  const supabase = await createClient();
  const { data: blogs, error } = await supabase
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Hero Section */}
          <div className="pt-20 pb-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                Tech <span className="text-blue-600">News Hub</span>
              </h1>
              <p className="text-lg text-gray-600">Latest updates in technology and innovation</p>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* News Feed - Left Side (Mobile: Top, Desktop: Takes 2 columns) */}
              <div className="lg:col-span-2 order-2 lg:order-1">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Latest Stories</h2>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-500">Live</span>
                  </div>
                </div>
                
                {/* News Feed */}
                <div className="space-y-4">
                  {regularNews.map((item: NewsItem, idx: number) => (
                    <article
                      key={idx}
                      className="group bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <img
                            src={item.image || '/news/default.jpg'}
                            alt={item.title}
                            className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium">
                              {item.category || 'General'}
                            </span>
                            <span className="text-gray-500 text-xs">{item.date}</span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                            {item.title}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                            {item.summary}
                          </p>
                          <Link
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                          >
                            Read more
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              {/* Slideshow Sidebar - Right Side (Mobile: Top, Desktop: 1 column) */}
              <div className="lg:col-span-1 order-1 lg:order-2">
                <div className="sticky top-24">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      BREAKING
                    </span>
                    <span className="text-gray-500 text-sm">Featured Stories</span>
                  </div>
                  
                  {/* Slideshow Component */}
                  <AutoSlideshow featuredNews={featuredNews} />
                </div>
              </div>
            </div>
          </div>

          {/* Blog Section */}
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-10">📰 Latest Blogs</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.map((blog) => (
          <Link
            key={blog.id}
            href={`/news/${blog.slug}`}
            className="border rounded-lg p-6 hover:shadow-md transition bg-white"
          >
            <h2 className="text-xl font-semibold text-gray-900">{blog.title}</h2>
            <p className="text-sm text-gray-600 mt-1">{blog.summary}</p>
            <div className="text-xs text-gray-400 mt-3">
              {blog.author} • {blog.date}
            </div>
          </Link>
        ))}
      </div>
    </div>

          </section>

        </div>
      </main>
      <Footer />
    </>
  );
}