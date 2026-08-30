import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { socket } from '../services/socket';
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Calendar,
  Building2,
  MapPin,
  Loader2
} from 'lucide-react';

const EMPLOYMENT_TYPES = [
  'Full-time',
  'Part-time',
  'Internship',
  'Freelance',
  'Contract',
  'Research Fellowship',
];

export default function StudentExperience() {
  const [experienceList, setExperienceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    company: '',
    jobTitle: '',
    employmentType: 'Internship',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    skills: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchExperience = async () => {
    try {
      setLoading(true);
      const res = await api.get('/experience');
      setExperienceList(res.data?.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load experience records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperience();

    // Real-time Socket.IO listeners
    const onAdded = (item) => {
      setExperienceList((prev) => {
        if (prev.some((e) => e._id === item._id)) return prev;
        return [item, ...prev];
      });
    };

    const onUpdated = (item) => {
      setExperienceList((prev) =>
        prev.map((e) => (e._id === item._id ? item : e))
      );
    };

    const onDeleted = (id) => {
      setExperienceList((prev) => prev.filter((e) => e._id !== id));
    };

    socket.on('experienceAdded', onAdded);
    socket.on('experienceUpdated', onUpdated);
    socket.on('experienceDeleted', onDeleted);

    return () => {
      socket.off('experienceAdded', onAdded);
      socket.off('experienceUpdated', onUpdated);
      socket.off('experienceDeleted', onDeleted);
    };
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      company: '',
      jobTitle: '',
      employmentType: 'Internship',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      skills: '',
    });
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      company: item.company,
      jobTitle: item.jobTitle,
      employmentType: item.employmentType || 'Internship',
      location: item.location || '',
      startDate: item.startDate ? item.startDate.substring(0, 10) : '',
      endDate: item.endDate ? item.endDate.substring(0, 10) : '',
      current: !!item.current,
      description: item.description || '',
      skills: Array.isArray(item.skills) ? item.skills.join(', ') : '',
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
    if (!formData.company || !formData.jobTitle) return;

    setSubmitting(true);
    setError(null);

    const payload = {
      ...formData,
      skills: formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      if (editingItem) {
        const res = await api.put(`/experience/${editingItem._id}`, payload);
        setExperienceList((prev) =>
          prev.map((e) => (e._id === editingItem._id ? res.data.data : e))
        );
        setSuccess('Work experience updated successfully');
      } else {
        const res = await api.post('/experience', payload);
        setExperienceList((prev) => [res.data.data, ...prev]);
        setSuccess('Work experience recorded in your passport');
      }
      closeModal();
      setTimeout(() => setSuccess(null), 3500);
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, company) => {
    if (!window.confirm(`Delete experience record for "${company}"?`)) return;

    try {
      await api.delete(`/experience/${id}`);
      setExperienceList((prev) => prev.filter((e) => e._id !== id));
      setSuccess('Experience record deleted');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete record');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-400" />
            Work & Professional Experience
          </h1>
          <p className="text-sm text-slate-400">
            Document software internships, freelance contracts, fellowships, and industry roles.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xl shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Experience</span>
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

      {/* Experience List */}
      {loading ? (
        <div className="h-60 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
          <p className="text-xs">Loading experience timeline...</p>
        </div>
      ) : experienceList.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/30 border border-slate-800 space-y-3">
          <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No work experience listed</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Adding internships or professional projects highlights your real-world delivery capabilities.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {experienceList.map((exp) => (
            <div
              key={exp._id}
              className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-6 transition-all group"
            >
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {exp.jobTitle}
                  </h3>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-sm font-semibold text-slate-200">
                    {exp.company}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {exp.employmentType}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-mono">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {exp.startDate ? new Date(exp.startDate).toLocaleDateString() : 'N/A'} —{' '}
                      {exp.current
                        ? 'Present'
                        : exp.endDate
                        ? new Date(exp.endDate).toLocaleDateString()
                        : 'Present'}
                    </span>
                  </div>
                  {exp.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{exp.location}</span>
                    </div>
                  )}
                </div>

                {exp.description && (
                  <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                    {exp.description}
                  </p>
                )}

                {/* Skills tags */}
                {exp.skills && exp.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {exp.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 self-end sm:self-start">
                <button
                  onClick={() => openEditModal(exp)}
                  className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-all cursor-pointer"
                  title="Edit Experience"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(exp._id, `${exp.jobTitle} at ${exp.company}`)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                  title="Delete Experience"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-400" />
                {editingItem ? 'Edit Work Experience' : 'Add Work Experience'}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Job Title / Role
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Backend Software Engineer Intern"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Microsoft, Stripe"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Employment Type
                  </label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    {EMPLOYMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Remote / New York, NY"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    disabled={formData.current}
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:opacity-40"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.current}
                  onChange={(e) =>
                    setFormData({ ...formData, current: e.target.checked, endDate: '' })
                  }
                  className="w-4 h-4 accent-indigo-600 rounded"
                />
                <span className="text-xs text-slate-300 font-medium">I currently work in this role</span>
              </label>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Responsibilities & Impact
                </label>
                <textarea
                  rows={3}
                  placeholder="Built microservices processing 50k requests/sec, reduced query latency by 40%..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-y"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Skills Used (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="Go, Redis, Kubernetes, GraphQL, PostgreSQL"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
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
                  {submitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Add Experience'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
