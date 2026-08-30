import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { socket } from '../services/socket';
import {
  Trophy,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Calendar,
  Building2,
  Award,
  Loader2,
  Search
} from 'lucide-react';

export default function StudentAchievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [search, setSearch] = useState('');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    description: '',
    date: '',
    proof: '',
    badgeUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/achievements');
      setAchievements(res.data?.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch achievements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();

    // Real-time Socket.IO listeners
    const onAdded = (item) => {
      setAchievements((prev) => {
        if (prev.some((a) => a._id === item._id)) return prev;
        return [item, ...prev];
      });
    };

    const onUpdated = (item) => {
      setAchievements((prev) =>
        prev.map((a) => (a._id === item._id ? item : a))
      );
    };

    const onDeleted = (id) => {
      setAchievements((prev) => prev.filter((a) => a._id !== id));
    };

    socket.on('achievementAdded', onAdded);
    socket.on('achievementUpdated', onUpdated);
    socket.on('achievementDeleted', onDeleted);

    return () => {
      socket.off('achievementAdded', onAdded);
      socket.off('achievementUpdated', onUpdated);
      socket.off('achievementDeleted', onDeleted);
    };
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      organization: '',
      description: '',
      date: new Date().toISOString().substring(0, 10),
      proof: '',
      badgeUrl: '',
    });
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      organization: item.organization || '',
      description: item.description || '',
      date: item.date ? item.date.substring(0, 10) : '',
      proof: item.proof || '',
      badgeUrl: item.badgeUrl || '',
    });
    setError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title) return;

    setSubmitting(true);
    setError(null);

    try {
      if (editingItem) {
        const res = await api.put(`/achievements/${editingItem._id}`, formData);
        setAchievements((prev) =>
          prev.map((a) => (a._id === editingItem._id ? res.data.data : a))
        );
        setSuccess('Achievement updated successfully');
      } else {
        const res = await api.post('/achievements', formData);
        setAchievements((prev) => [res.data.data, ...prev]);
        setSuccess('Achievement registered to your passport');
      }
      closeModal();
      setTimeout(() => setSuccess(null), 3500);
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete achievement "${title}"?`)) return;

    try {
      await api.delete(`/achievements/${id}`);
      setAchievements((prev) => prev.filter((a) => a._id !== id));
      setSuccess(`Removed "${title}" from achievements`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete achievement');
    }
  };

  const filtered = achievements.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      (a.organization && a.organization.toLowerCase().includes(q)) ||
      (a.description && a.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Honors & Achievements
          </h1>
          <p className="text-sm text-slate-400">
            Showcase hackathons won, competitive programming ranks, published research, and academic awards.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xl shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Achievement</span>
        </button>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && !modalOpen && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search achievements, hackathons, organizers..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="h-60 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
          <p className="text-xs">Loading achievements from MongoDB...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/30 border border-slate-800 space-y-3">
          <Trophy className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No achievements recorded</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search
              ? 'No achievements match your query.'
              : 'Add your hackathon awards, competition rankings, or research honors.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <div
              key={item._id}
              className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 shadow-sm flex flex-col justify-between space-y-4 group transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-300 border border-yellow-500/20">
                    {item.organization || 'Global Recognition'}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-yellow-400 transition-colors">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                <div>
                  {item.proof && (
                    <a
                      href={item.proof}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Proof</span>
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-all cursor-pointer"
                    title="Edit Achievement"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id, item.title)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                    title="Delete Achievement"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                {editingItem ? 'Edit Achievement' : 'Register Achievement'}
              </h3>
              <button
                onClick={closeModal}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Achievement / Honor Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1st Place - Smart India Hackathon 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Organizing Body / Institution
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ministry of Education, Google, ACM"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Date Awarded
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Description / Distinction Details
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your competition submission, prototype built, or ranking metrics..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-y"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Proof URL / News Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.proof}
                  onChange={(e) => setFormData({ ...formData, proof: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Add Achievement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
