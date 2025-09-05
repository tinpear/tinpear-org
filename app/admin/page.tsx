'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
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

export default function BlogCMS() {
  const [activeTab, setActiveTab] = useState<'blogs' | 'contacts'>('blogs');

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Admin Dashboard</h1>
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
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
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

  const emptyForm: Blog = {
    title: '',
    summary: '',
    author: '',
    date: new Date().toISOString().slice(0, 10), // yyyy-mm-dd
    slug: '',
    content: '',
  };
  const [form, setForm] = useState<Blog>(emptyForm);

  useEffect(() => {
    fetchBlogs();
    // Optional: realtime could be added for blogs as well
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
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
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
            <PlusIcon className="w-4 h-4 rotate-45" />
            Reset
          </button>
        </div>

        {error && <p className="px-6 pt-4 text-red-600">{error}</p>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {(['title', 'summary', 'author', 'date', 'slug'] as const).map((key) => (
            <div key={key} className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                {key}
              </label>
              <input
                type="text"
                id={key}
                value={(form as any)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-gray-900/10"
                required={key !== 'slug'} // slug can be auto
              />
              {key === 'slug' && (
                <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate.</p>
              )}
            </div>
          ))}

          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              id="content"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={8}
              className="w-full border rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-gray-900/10"
              required
            />
          </div>

          <div className="col-span-full flex items-center gap-4 mt-2">
            <button
              type="submit"
              className="bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-black transition"
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
                className="text-gray-600 underline text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="inline-flex items-center gap-2 text-sm text-gray-500">
          <span className="font-medium text-gray-900">{filteredBlogs.length}</span> posts
        </div>
        <div className="relative w-full md:w-80">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          <input
            className="w-full border rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-gray-900/10"
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
              <div key={i} className="h-20 animate-pulse bg-gray-100 rounded-xl" />
            ))}
          </div>
        ) : filteredBlogs.length === 0 ? (
          <EmptyState title="No blogs yet" subtitle="Create your first post using the form above." />
        ) : (
          filteredBlogs.map((b) => (
            <div
              key={b.id}
              className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between shadow-sm"
            >
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-900">{b.title}</h3>
                <p className="text-sm text-gray-500">
                  {b.author} • {b.date} • <span className="text-gray-400">/{b.slug}</span>
                </p>
              </div>
              <div className="flex gap-4 mt-3 md:mt-0">
                <button
                  onClick={() => handleEdit(b)}
                  className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                  title="Edit"
                >
                  <PencilIcon className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="text-red-600 hover:text-red-800 inline-flex items-center gap-1"
                  title="Delete"
                >
                  <TrashIcon className="w-4 h-4" />
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="inline-flex items-center gap-2 text-sm text-gray-500">
          <span className="font-medium text-gray-900">{filtered.length}</span> messages
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            <input
              className="w-full border rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-gray-900/10"
              placeholder="Search name, email, company, message..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm"
            title="Refresh"
          >
            <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm"
            title="Export CSV"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse bg-gray-100 rounded-xl" />
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
              className="bg-white border rounded-xl p-4 shadow-sm flex items-start justify-between"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 truncate">{m.name}</h3>
                  <span className="text-xs text-gray-400">·</span>
                  <a
                    href={`mailto:${m.email}`}
                    className="inline-flex items-center gap-1 text-sm text-blue-700 hover:underline"
                    title={m.email}
                  >
                    <EnvelopeIcon className="w-4 h-4" />
                    {m.email}
                  </a>
                  {m.company && (
                    <>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-sm text-gray-600 truncate">{m.company}</span>
                    </>
                  )}
                </div>
                <p className="text-gray-700 mt-1 line-clamp-2">{m.message}</p>
                <div className="mt-2 text-xs text-gray-500">
                  {new Date(m.created_at).toLocaleString()} {m.page ? `• ${m.page}` : ''}
                </div>
              </div>
              <div className="ml-4 shrink-0">
                <button
                  onClick={() => setSelected(m)}
                  className="inline-flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900"
                >
                  <EyeIcon className="w-4 h-4" />
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
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Message
              </div>
              <div className="rounded-lg border bg-gray-50 p-3 text-sm text-gray-800 whitespace-pre-wrap">
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
    <div className="border border-dashed rounded-xl p-8 text-center bg-white">
      <h3 className="text-gray-900 font-semibold">{title}</h3>
      {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
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
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border">
          <div className="flex items-center justify-between px-5 py-3 border-b">
            <h4 className="font-semibold text-gray-900">{title}</h4>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-sm">
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
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
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
