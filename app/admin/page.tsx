'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EnvelopeIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  PlusIcon,
} from '@heroicons/react/24/solid';

type Blog = {
  id?: string;
  title: string;
  summary: string;
  author: string;
  date: string; // ISO yyyy-mm-dd, or any string you want
  slug: string;
  content: string;
    image_url?: string | null; 
  created_at?: string;
};

type Contact = {
  id: string;
  name: string;
  email: string;
  company?: string | null;
  message: string;
  user_agent?: string | null;
  page?: string | null;
  created_at: string;
};

/* -------------------- SPACING NORMALIZER -------------------- */
function normalizeMarkdownForSpacing(md: string) {
  if (!md) return '';
  
  // Normalize line endings
  md = md.replace(/\r\n/g, '\n').trim();
  
  // Split into blocks and process each one
  const blocks = md.split(/\n\s*\n/); // Split on any whitespace-only lines
  
  const processedBlocks = blocks
    .map((block: string) => block.trim()) // Trim each block
    .filter((block: string | any[]) => block.length > 0) // Remove empty blocks
    .map((block: string) => {
      // For regular paragraphs (not headings, lists, etc.), ensure they're clean
      if (!block.match(/^(#{1,6}\s|[-*+]\s|\d+\.\s|>\s|```)/)) {
        // This is a regular paragraph - clean up internal spacing
        return block.replace(/\n+/g, ' ').trim();
      }
      return block;
    });
  
  // Join blocks with double newlines
  const result = processedBlocks.join('\n\n');
  
  // Final cleanup: ensure proper spacing around block elements
  return result
    // Ensure blank line before headings
    .replace(/([^\n])\n(#{1,6}\s)/g, '$1\n\n$2')
    // Ensure blank line before lists
    .replace(/([^\n])\n([-*+]\s|\d+\.\s)/g, '$1\n\n$2')
    // Ensure blank line before blockquotes
    .replace(/([^\n])\n(>\s)/g, '$1\n\n$2')
    // Ensure blank line before code blocks
    .replace(/([^\n])\n(```)/g, '$1\n\n$2')
    // Clean up any triple+ newlines
    .replace(/\n{3,}/g, '\n\n')
    + '\n';
}

/* -------------------- MAIN -------------------- */
export default function BlogCMS() {
  const [activeTab, setActiveTab] = useState<'blogs' | 'contacts'>('blogs');

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">Admin Dashboard</h1>
          <p className="text-gray-500">Manage blog posts and view contact submissions.</p>
        </div>

        <nav className="inline-flex rounded-xl border bg-white p-1 shadow-sm">
          {[
            { key: 'blogs', label: 'Blogs' },
            { key: 'contacts', label: 'Contacts' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as 'blogs' | 'contacts')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === t.key
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      {activeTab === 'blogs' ? <BlogsPanel /> : <ContactsPanel />}
    </div>
  );
}

/* -------------------- BLOGS PANEL -------------------- */
function BlogsPanel() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showPreview, setShowPreview] = useState(true);

  const emptyForm: Blog = {
    title: '',
    summary: '',
    author: '',
    date: new Date().toISOString().slice(0, 10), // yyyy-mm-dd
    slug: '',
    content: '',
    image_url: '', // 
  };
  const [form, setForm] = useState<Blog>(emptyForm);

  useEffect(() => {
    fetchBlogs();
    // Optional: add realtime for blogs if you want
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    setBlogs((data as Blog[]) || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // auto-generate slug if empty
    const next = { ...form };
    if (!next.slug && next.title) {
      next.slug = slugify(next.title);
    }

    // ⭐ normalize spacing so the public page renders with proper gaps
    next.content = normalizeMarkdownForSpacing(next.content);

    const blogToSave: any = { ...next };
    delete blogToSave.id;

    if (editing && form.id) {
      const { error } = await supabase.from('blogs').update(blogToSave).eq('id', form.id);
      if (error) return setError(error.message);
    } else {
      const { error } = await supabase.from('blogs').insert([blogToSave]);
      if (error) return setError(error.message);
    }

    await fetchBlogs();
    setForm(emptyForm);
    setEditing(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (blog: Blog) => {
    setForm(blog);
    setEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id?: string) => {
    if (!id || !confirm('Delete this blog?')) return;
    const { error } = await supabase.from('blogs').delete().eq('id', id);
    if (error) return alert(error.message);
    setBlogs((prev) => prev.filter((b) => b.id !== id));
  };

  const filteredBlogs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return blogs;
    return blogs.filter((b) =>
      [b.title, b.summary, b.author, b.slug].some((x) => (x || '').toLowerCase().includes(q))
    );
  }, [blogs, search]);

  return (
    <div className="space-y-10">
      {/* Form Card */}
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {editing ? '✏️ Edit Blog' : '➕ Create New Blog'}
          </h2>
          <button
            onClick={() => {
              setEditing(false);
              setForm({
                title: '',
                summary: '',
                author: '',
                date: new Date().toISOString().slice(0, 10),
                slug: '',
                content: '',
              });
            }}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            title="Reset form"
          >
            <PlusIcon className="h-4 w-4 rotate-45" />
            Reset
          </button>
        </div>

        {error && <p className="px-6 pt-4 text-red-600">{error}</p>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
          {(['title', 'summary', 'author', 'date', 'slug'] as const).map((key) => (
            <div key={key} className="col-span-1">
              <label className="mb-1 block text-sm font-medium capitalize text-gray-700">
                {key}
              </label>
              <input
                type="text"
                id={key}
                value={(form as any)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-gray-900/10"
                required={key !== 'slug'} // slug can be auto
              />
              {key === 'slug' && (
                <p className="mt-1 text-xs text-gray-500">Leave empty to auto-generate.</p>
              )}
            </div>
          ))}

          <div className="col-span-full">
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Content (Markdown)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, content: normalizeMarkdownForSpacing(f.content) }))
                  }
                  className="rounded border bg-white px-2 py-1 text-xs hover:bg-gray-50"
                  title="Auto-insert blank lines for spacing"
                >
                  Fix spacing
                </button>
                <label className="inline-flex items-center gap-1 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={showPreview}
                    onChange={(e) => setShowPreview(e.target.checked)}
                    className="rounded"
                  />
                  Preview
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <textarea
                id="content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={14}
                className="w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-gray-900/10 font-mono leading-6"
                placeholder="# Title\n\nWrite in Markdown. Leave a blank line between blocks."
                required
              />
              {showPreview && (
                <div className="overflow-auto rounded-lg border bg-white p-3">
                  <div className="prose prose-slate max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.content}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="col-span-full mt-2 flex items-center gap-4">
            <button
              type="submit"
              className="rounded-lg bg-gray-900 px-5 py-2 text-white transition hover:bg-black"
            >
              {editing ? 'Update Blog' : 'Create Blog'}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setForm({
                    title: '',
                    summary: '',
                    author: '',
                    date: new Date().toISOString().slice(0, 10),
                    slug: '',
                    content: '',
                  });
                }}
                className="text-sm text-gray-600 underline"
              >
                Cancel
              </button>
            )}
          </div>
<div className="col-span-1 md:col-span-2">
  <label className="block text-sm font-medium text-gray-700 mb-1">Cover image</label>

  <div className="flex flex-col gap-2 md:flex-row md:items-center">
    <input
      type="text"
      id="image_url"
      value={form.image_url ?? ''}
      onChange={(e) => setForm({ ...form, image_url: e.target.value })}
      className="w-full border rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-gray-900/10"
      placeholder="https://.../your-image.jpg"
    />

    <label className="inline-flex items-center gap-2 text-sm">
      <span className="px-3 py-2 border rounded-lg bg-white hover:bg-gray-50 cursor-pointer">
        Upload
      </span>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          // Build a clean path: blog-images/{slug or timestamp}/{file}
          const safeSlug = (form.slug || form.title || 'post')
            .toLowerCase()
            .trim()
            .replace(/['"]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');

          const ext = file.name.split('.').pop() || 'jpg';
          const path = `${safeSlug || Date.now()}/${Date.now()}.${ext}`;

          // Upload to Storage
          const { error: uploadError } = await supabase.storage
            .from('blog-images')
            .upload(path, file, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) {
            alert(uploadError.message);
            return;
          }

          // If bucket is PUBLIC:
          const { data: pub } = supabase.storage.from('blog-images').getPublicUrl(path);
          if (pub?.publicUrl) {
            setForm((f) => ({ ...f, image_url: pub.publicUrl }));
          }

          // If bucket is PRIVATE (use this instead of getPublicUrl):
          // const { data: signed } = await supabase.storage
          //   .from('blog-images')
          //   .createSignedUrl(path, 60 * 60 * 24 * 7); // 7 days
          // setForm((f) => ({ ...f, image_url: signed?.signedUrl ?? '' }));
        }}
      />
    </label>
  </div>

  <p className="text-xs text-gray-500 mt-1">
    Paste a public URL or upload to Supabase Storage. For best results: 1600×900+.
  </p>

  {/* Preview */}
  {form.image_url ? (
    <div className="mt-3 overflow-hidden rounded-lg border bg-gray-50">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={form.image_url} alt="Cover preview" className="h-48 w-full object-cover" />
    </div>
  ) : null}
</div>


        </form>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="inline-flex items-center gap-2 text-sm text-gray-500">
          <span className="font-medium text-gray-900">{filteredBlogs.length}</span> posts
        </div>
        <div className="relative w-full md:w-80">
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            className="w-full rounded-lg border py-2 pl-10 pr-3 text-sm focus:ring-2 focus:ring-gray-900/10"
            placeholder="Search by title, author, slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Blog List */}
      <div className="grid gap-3">
        {loading ? (
          <div className="grid gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : filteredBlogs.length === 0 ? (
          <EmptyState title="No blogs yet" subtitle="Create your first post using the form above." />
        ) : (
          filteredBlogs.map((b) => (
            <div
              key={b.id}
              className="flex flex-col items-start justify-between gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-center"
            >
              <div className="min-w-0 space-y-1">
                <h3 className="truncate text-lg font-semibold text-gray-900">{b.title}</h3>
                <p className="text-sm text-gray-500">
                  {b.author} • {b.date} • <span className="text-gray-400">/{b.slug}</span>
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => handleEdit(b)}
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                  title="Edit"
                >
                  <PencilIcon className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="inline-flex items-center gap-1 text-red-600 hover:text-red-800"
                  title="Delete"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* -------------------- CONTACTS PANEL -------------------- */
function ContactsPanel() {
  const [rows, setRows] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<Contact | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchContacts();

    // Realtime: get new messages as they come in
    const channel = supabase
      .channel('contact_messages_stream')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'contact_messages' },
        (payload) => {
          const newRow = payload.new as Contact;
          setRows((prev) => [newRow, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_messages')
      .select('id, name, email, company, message, user_agent, page, created_at')
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) console.error(error);
    setRows((data as Contact[]) || []);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchContacts();
    setRefreshing(false);
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      [r.name, r.email, r.company ?? '', r.message ?? ''].some((x) =>
        (x || '').toLowerCase().includes(s)
      )
    );
  }, [rows, q]);

  const exportCSV = () => {
    const header = ['created_at', 'name', 'email', 'company', 'message', 'page'];
    const lines = [header.join(',')];
    for (const r of filtered) {
      lines.push(
        [
          r.created_at,
          csvSafe(r.name),
          csvSafe(r.email),
          csvSafe(r.company || ''),
          csvSafe(r.message),
          csvSafe(r.page || ''),
        ].join(',')
      );
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    a.download = `contacts-${ts}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="inline-flex items-center gap-2 text-sm text-gray-500">
          <span className="font-medium text-gray-900">{filtered.length}</span> messages
        </div>
        <div className="flex w-full items-center gap-2 md:w-auto">
          <div className="relative flex-1 md:w-80">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              className="w-full rounded-lg border py-2 pl-10 pr-3 text-sm focus:ring-2 focus:ring-gray-900/10"
              placeholder="Search name, email, company, message..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm hover:bg-gray-50"
            title="Refresh"
          >
            <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm hover:bg-gray-50"
            title="Export CSV"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No messages yet"
          subtitle="Once your form receives submissions, they’ll show up here instantly."
        />
      ) : (
        <div className="grid gap-3">
          {filtered.map((m) => (
            <div
              key={m.id}
              className="flex items-start justify-between rounded-xl border bg-white p-4 shadow-sm"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-semibold text-gray-900">{m.name}</h3>
                  <span className="text-xs text-gray-400">·</span>
                  <a
                    href={`mailto:${m.email}`}
                    className="inline-flex items-center gap-1 text-sm text-blue-700 hover:underline"
                    title={m.email}
                  >
                    <EnvelopeIcon className="h-4 w-4" />
                    {m.email}
                  </a>
                  {m.company && (
                    <>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="truncate text-sm text-gray-600">{m.company}</span>
                    </>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-gray-700">{m.message}</p>
                <div className="mt-2 text-xs text-gray-500">
                  {new Date(m.created_at).toLocaleString()} {m.page ? `• ${m.page}` : ''}
                </div>
              </div>
              <div className="ml-4 shrink-0">
                <button
                  onClick={() => setSelected(m)}
                  className="inline-flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900"
                >
                  <EyeIcon className="h-4 w-4" />
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selected && (
        <Modal onClose={() => setSelected(null)} title="Contact Message">
          <div className="space-y-3">
            <Row label="Name" value={selected.name} />
            <Row
              label="Email"
              value={
                <a className="text-blue-700 hover:underline" href={`mailto:${selected.email}`}>
                  {selected.email}
                </a>
              }
            />
            {selected.company && <Row label="Company" value={selected.company} />}
            <Row
              label="Submitted"
              value={`${new Date(selected.created_at).toLocaleString()}${
                selected.page ? ` • ${selected.page}` : ''
              }`}
            />
            <div>
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                Message
              </div>
              <div className="whitespace-pre-wrap rounded-lg border bg-gray-50 p-3 text-sm text-gray-800">
                {selected.message}
              </div>
            </div>
            {selected.user_agent && <Row label="User Agent" value={selected.user_agent} />}
          </div>
        </Modal>
      )}
    </div>
  );
}

/* -------------------- UI Helpers -------------------- */
function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="rounded-xl border border-dashed bg-white p-8 text-center">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        role="button"
        aria-label="Close"
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl border bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h4 className="font-semibold text-gray-900">{title}</h4>
            <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">
              Close
            </button>
          </div>
          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="text-sm text-gray-800">{value}</div>
    </div>
  );
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function csvSafe(s: string) {
  const needsQuotes = /[",\n]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}
