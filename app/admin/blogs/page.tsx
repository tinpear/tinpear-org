'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid';

type Blog = {
  id?: string;
  title: string;
  summary: string;
  author: string;
  date: string;
  slug: string;
  content: string;
};

export default function BlogCMS() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  const emptyForm: Blog = {
    title: '',
    summary: '',
    author: '',
    date: '',
    slug: '',
    content: '',
  };

  const [form, setForm] = useState<Blog>(emptyForm);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    setBlogs(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const blogToSave = { ...form };
    delete blogToSave.id;

    if (editing && form.id) {
      const { error } = await supabase
        .from('blogs')
        .update(blogToSave)
        .eq('id', form.id);
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
  };

  const handleDelete = async (id?: string) => {
    if (!id || !confirm('Delete this blog?')) return;

    const { error } = await supabase.from('blogs').delete().eq('id', id);
    if (error) return alert(error.message);
    setBlogs((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-10 text-gray-900">🛠️ Blog Admin Dashboard</h1>

      {/* Blog List */}
      <div className="mb-12 space-y-4">
        {loading ? (
          <p>Loading blogs...</p>
        ) : blogs.length === 0 ? (
          <p className="text-gray-500">No blogs yet.</p>
        ) : (
          blogs.map((b) => (
            <div
              key={b.id}
              className="bg-white border border-gray-200 rounded-lg p-5 flex justify-between items-start shadow-sm"
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{b.title}</h2>
                <p className="text-sm text-gray-500">
                  {b.author} • {b.date}
                </p>
              </div>
              <div className="flex gap-4 mt-2">
                <button
                  onClick={() => handleEdit(b)}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <PencilIcon className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="text-red-600 hover:text-red-800 flex items-center gap-1"
                >
                  <TrashIcon className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Blog Form */}
      <div className="bg-white border rounded-xl p-8 shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {editing ? '✏️ Edit Blog' : '➕ Create New Blog'}
        </h2>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className="w-full border rounded-md px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          ))}

          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              id="content"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={6}
              className="w-full border rounded-md px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="col-span-full flex items-center gap-4 mt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
            >
              {editing ? 'Update Blog' : 'Create Blog'}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setForm(emptyForm);
                }}
                className="text-gray-600 underline text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
