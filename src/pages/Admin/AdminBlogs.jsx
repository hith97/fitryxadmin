import React, { useEffect, useState } from 'react';
import { BookOpen, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { adminApi } from '../../services/adminApi';

const EMPTY = {
  title: '', content: '', coverImage: '', author: '',
  category: '', readTime: '', isActive: true, publishedAt: '',
};

function Modal({ title, form, setForm, onSave, saving, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-[20px] bg-white shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <h3 className="font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"
              placeholder="Blog post title..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Author</label>
              <input
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"
                placeholder="Author name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Category</label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"
                placeholder="e.g. Fitness"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Read Time</label>
              <input
                value={form.readTime}
                onChange={(e) => setForm({ ...form, readTime: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"
                placeholder="e.g. 5 min read"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Publish Date</label>
              <input
                type="datetime-local"
                value={form.publishedAt ? form.publishedAt.slice(0, 16) : ''}
                onChange={(e) => setForm({ ...form, publishedAt: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Cover Image URL</label>
            <input
              value={form.coverImage}
              onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Content</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={6}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white resize-none"
              placeholder="Blog post content..."
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm text-slate-700">Published</span>
          </label>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 flex-shrink-0">
          <button onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving || !form.title.trim()}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async (p = page) => {
    try {
      setLoading(true);
      const res = await adminApi.listBlogs(p);
      setBlogs(res.data ?? []);
      setPages(res.pages ?? 1);
    } catch (e) {
      toast.error(e.message || 'Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page); }, [page]);

  const openCreate = () => { setForm(EMPTY); setModal('create'); };
  const openEdit = (b) => { setForm({ ...b }); setModal('edit'); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        publishedAt: form.publishedAt || undefined,
      };
      if (modal === 'create') {
        await adminApi.createBlog(payload);
        toast.success('Blog created');
      } else {
        await adminApi.updateBlog(form.id, payload);
        toast.success('Blog updated');
      }
      setModal(null);
      load(page);
    } catch (e) {
      toast.error(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog post?')) return;
    try {
      await adminApi.deleteBlog(id);
      toast.success('Deleted');
      load(page);
    } catch (e) {
      toast.error(e.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Blog Posts</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage blog content shown in the app</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} /> New Post
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-primary" /></div>
      ) : blogs.length === 0 ? (
        <div className="rounded-[20px] border border-slate-200 bg-white p-12 text-center">
          <BookOpen size={32} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-400">No blog posts yet. Click "New Post" to create one.</p>
        </div>
      ) : (
        <div className="rounded-[20px] border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Title</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Author</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Category</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Published</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {blogs.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {b.coverImage ? (
                        <img src={b.coverImage} alt="" className="h-9 w-14 rounded-lg object-cover flex-shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        <div className="h-9 w-14 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <BookOpen size={14} className="text-slate-300" />
                        </div>
                      )}
                      <span className="font-medium text-slate-800 line-clamp-1">{b.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{b.author || '—'}</td>
                  <td className="px-5 py-3.5 text-slate-600">{b.category || '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {b.isActive ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">
                    {b.publishedAt ? new Date(b.publishedAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(b)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(b.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
              <p className="text-xs text-slate-400">Page {page} of {pages}</p>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-lg px-3 py-1.5 text-xs font-medium border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors">Prev</button>
                <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="rounded-lg px-3 py-1.5 text-xs font-medium border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {modal && (
        <Modal
          title={modal === 'create' ? 'New Blog Post' : 'Edit Blog Post'}
          form={form}
          setForm={setForm}
          onSave={handleSave}
          saving={saving}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
