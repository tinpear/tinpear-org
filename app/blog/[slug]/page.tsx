// app/blog/[slug]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Header from '@/components/ui/header'
import Footer from '@/components/ui/footer'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from 'react'

type Params = Promise<{ slug: string }>

type BlogRow = {
  id: string
  slug: string
  title: string
  author?: string
  date?: string | null
  tags?: string[] | null
  image_url?: string | null
  excerpt?: string | null
  content: string
}

// --- Utils ---
function formatDate(d?: string | null) {
  if (!d) return ''
  try {
    return new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return d ?? ''
  }
}

function estimateReadTime(text: string) {
  const words = text.trim().split(/\s+/).length
  const minutes = Math.max(1, Math.round(words / 210))
  return `${minutes} min read`
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params

  const supabase = createClient() // ✅ no await
  const { data: blog, error } = await (await supabase)
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .single<BlogRow>()

  if (!blog || error) return notFound()

  const published = formatDate(blog.date)
  const readTime = estimateReadTime(blog.content)

  return (
    <>
      {/* global background flair (pure CSS, no logic changes) */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-white dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-950" />
        <div className="absolute -top-60 left-1/2 h-[56rem] w-[56rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,theme(colors.green.400/.18),transparent_60%)] blur-3xl" />
      </div>

      <Header />

      {/* breadcrumb */}
      <div className="mx-auto mt-8 max-w-3xl px-4 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
          <Link href="/blog" className="hover:text-foreground transition-colors">
            ← Back to Blog
          </Link>
        </nav>
      </div>

      {/* article wrap */}
      <article className="mx-auto mt-6 max-w-3xl px-4 sm:px-6">
        {/* cover card */}
        {blog.image_url ? (
          <div className="relative mb-8 overflow-hidden rounded-3xl border bg-white/60 shadow-xl ring-1 ring-black/5 backdrop-blur-md dark:bg-neutral-900/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={blog.image_url}
              alt="Cover image"
              className="h-80 w-full object-cover sm:h-[24rem] transition duration-300"
            />
            {/* subtle top gradient */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/15 to-transparent" />
          </div>
        ) : null}

        {/* title + meta */}
        <header className="text-center">
          {/* title + meta */}
<header className="text-center">
  {Array.isArray(blog.tags) && blog.tags.length > 0 ? (
    <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
      {(
        (Array.isArray(blog.tags) ? blog.tags : [])
          .map((t: any) => String(t ?? ''))     // coerce to string
          .map((t: string) => t.trim())            // trim
          .filter((t: string | any[]) => t.length > 0)     // drop empties
          .slice(0, 6)
      ).map((tag: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined, i: any) => (
        <Badge
          key={`${tag}-${i}`}
          variant="secondary"
          className="rounded-full px-3 py-1 text-xs"
        >
          {tag}
        </Badge>
      ))}
    </div>
  ) : null}

  <h1 className="text-pretty text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
    {blog.title}
  </h1>

  <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
    {blog.author ? (
      <span>
        By <span className="font-medium text-foreground">{blog.author}</span>
      </span>
    ) : null}
    {published ? (
      <>
        <span className="h-1 w-1 rounded-full bg-foreground/20" />
        <time dateTime={blog.date ?? undefined}>{published}</time>
      </>
    ) : null}
    <span className="h-1 w-1 rounded-full bg-foreground/20" />
    <span>{readTime}</span>
  </div>

  {/* mini action bar unchanged... */}
</header>

        </header>

        {/* divider */}
        <div className="relative my-10">
          <Separator />
          {/* glowing dot (pure CSS) */}
          <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500 shadow-[0_0_25px_6px_rgba(34,197,94,0.35)]" />
        </div>

        {/* content area */}
        <div
          id="article"
          className="
            prose prose-slate dark:prose-invert max-w-none
            prose-headings:scroll-mt-32 prose-headings:font-semibold
            prose-h2:mt-12 prose-h2:text-2xl
            prose-h3:mt-8 prose-h3:text-xl
            prose-p:leading-relaxed prose-p:my-6
            prose-a:underline-offset-4 hover:prose-a:text-green-600
            prose-ul:my-6 prose-ol:my-6
            prose-li:my-1
            prose-strong:text-foreground
            prose-blockquote:my-6 prose-blockquote:border-l-4 prose-blockquote:pl-4
            prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:bg-muted
            prose-img:rounded-xl prose-pre:rounded-xl
            prose-table:my-8 prose-th:px-3 prose-td:px-3
          "
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              img: ({ src = '', alt = '' }) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={alt} />
              ),
              p: ({ children }) => <p className="my-6 leading-relaxed">{children}</p>,
            }}
          >
            {blog.content}
          </ReactMarkdown>
        </div>

        {/* footer meta */}
        <footer className="mt-12">
          <div className="rounded-2xl border bg-white/60 p-5 text-sm text-muted-foreground shadow-sm ring-1 ring-black/5 backdrop-blur-md dark:bg-neutral-900/50">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span>Published</span>
                {published ? (
                  <>
                    <span aria-hidden className="text-foreground/30">•</span>
                    <time dateTime={blog.date ?? undefined}>{published}</time>
                  </>
                ) : null}
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    blog.title
                  )}&url=${encodeURIComponent(
                    process.env.NEXT_PUBLIC_SITE_URL
                      ? `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${blog.slug}`
                      : ''
                  )}`}
                  className="underline-offset-4 hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Share
                </Link>
                <span aria-hidden>·</span>
                <Link href="/blog" className="underline-offset-4 hover:underline">
                  Back to Blog
                </Link>
              </div>
            </div>
          </div>
        </footer>

        <div className="h-16" />
      </article>

      <Footer />
    </>
  )
}
