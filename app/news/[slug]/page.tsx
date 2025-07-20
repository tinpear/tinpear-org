import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ReactMarkdown from 'react-markdown';
import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';

type Params = Promise<{ slug: string }>;

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;

  const supabase = createClient();
  const { data: blog, error } = await (await supabase)
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!blog || error) return notFound();

  return (
    <>
      <Header />
      <article className="max-w-3xl mx-auto px-4 py-12 mt-10">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">{blog.title}</h1>
        <p className="text-sm text-gray-500 mb-6">{blog.author} • {blog.date}</p>
        <div className="prose prose-lg max-w-none">
          <ReactMarkdown>{blog.content}</ReactMarkdown>
        </div>
      </article>
      <Footer />
    </>
  );
}
