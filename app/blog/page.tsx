// app/blog/page.tsx
import Footer from '@/components/ui/footer';
import Header from '@/components/ui/header';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from 'react';

type BlogRow = {
  id: string;
  slug: string;
  title: string;
  author?: string | null;
  date?: string | null;
  summary?: string | null;
  image_url?: string | null;
  tags?: string[] | null;
  created_at?: string | null;
};

function formatDate(d?: string | null) {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return d ?? '';
  }
}

export const dynamic = 'force-dynamic';

export default async function BlogIndexPage() {
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
      {/* background flair */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-white dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-950" />
        <div className="absolute -top-56 left-1/2 h-[48rem] w-[48rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,theme(colors.green.400/.18),transparent_60%)] blur-3xl" />
      </div>

      <Header />

      <main className="min-h-screen">
        <section className="mx-auto max-w-6xl px-4 pt-16 pb-8 text-center">
          
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
           The <span className="text-green-600">Tinpear</span> Blog
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-balance text-gray-600 dark:text-gray-300">
            Distilled Thinking, Deep Dives & Better Insights.
          </p>
        </section>

        {/* card grid */}
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogs?.map((b: { id: Key | null | undefined; slug: any; image_url: string | Blob | undefined; tags: any[]; title: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; summary: any; author: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; date: string | null | undefined; }) => (
              <Link
                key={b.id}
                href={`/blog/${b.slug}`}
                className="group relative overflow-hidden rounded-2xl border bg-white/70 backdrop-blur-md ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl dark:bg-neutral-900/60"
              >
                {/* cover */}
                {b.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={b.image_url}
                    alt=""
                    className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="h-44 w-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-neutral-800 dark:to-neutral-850" />
                )}

                {/* gradient overlay on hover */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/10 to-transparent opacity-0 transition group-hover:opacity-100" />

                {/* body */}
                <div className="p-5">
                  {/* tags */}
                  {Array.isArray(b.tags) && b.tags.length > 0 ? (
  <div className="mb-2 flex flex-wrap gap-2">
    {b.tags
      ?.filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
      .slice(0, 3)
      .map((tag, i) => (
        <span
          key={`${tag}-${i}`} // <- stable Key
          className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-green-200 dark:bg-neutral-800 dark:text-green-300 dark:ring-neutral-700"
        >
          {tag}
        </span>
      ))}
  </div>
) : null}

                  <h3 className="line-clamp-2 text-lg font-semibold tracking-tight text-gray-900 transition group-hover:text-green-700 dark:text-white">
                    {b.title}
                  </h3>

                  <p className="mt-2 line-clamp-3 text-sm text-gray-600 dark:text-gray-300">
                    {b.summary ?? ''}
                  </p>

                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      {b.author ? <span>{b.author}</span> : null}
                      {b.date ? (
                        <>
                          {b.author ? <span aria-hidden>•</span> : null}
                          <time dateTime={b.date}>{formatDate(b.date)}</time>
                        </>
                      ) : null}
                    </div>

                    <span className="font-medium text-green-700 group-hover:underline dark:text-green-400">
                      Read → 
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* empty / short state */}
          {blogs && blogs.length < 3 ? (
            <div className="mt-12 rounded-2xl border bg-white/60 p-8 text-center text-gray-600 ring-1 ring-black/5 dark:bg-neutral-900/60 dark:text-gray-300">
              More posts coming soon — stay tuned!
            </div>
          ) : null}
        </section>
      </main>

      <Footer />
    </>
  );
}
