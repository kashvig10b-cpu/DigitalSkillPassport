import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { socket } from '../services/socket';
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Calendar,
  Building2,
  Award,
  Loader2
} from 'lucide-react';

export default function StudentEducation() {
  const [educationList, setEducationList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    institution: '',
    degree: '',
    department: '',
    startYear: new Date().getFullYear() - 3,
    endYear: new Date().getFullYear() + 1,
    cgpa: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchEducation = async () => {
    try {
      setLoading(true);
      const res = await api.get('/education');
      setEducationList(res.data?.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load education history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEducation();

    // Real-time Socket.IO listeners
    const onAdded = (item) => {
      setEducationList((prev) => {
        if (prev.some((e) => e._id === item._id)) return prev;
        return [item, ...prev];
      });
    };

    const onUpdated = (item) => {
      setEducationList((prev) =>
        prev.map((e) => (e._id === item._id ? item : e))
      );
    };

    const onDeleted = (id) => {
      setEducationList((prev) => prev.filter((e) => e._id !== id));
    };

    socket.on('educationAdded', onAdded);
    socket.on('educationUpdated', onUpdated);
    socket.on('educationDeleted', onDeleted);

    return () => {
      socket.off('educationAdded', onAdded);
      socket.off('educationUpdated', onUpdated);
      socket.off('educationDeleted', onDeleted);
    };
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      institution: '',
      degree: '',
      department: '',
      startYear: new Date().getFullYear() - 3,
      endYear: new Date().getFullYear() + 1,
      cgpa: '',
      description: '',
    });
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      institution: item.institution,
      degree: item.degree,
      department: item.department || '',
      startYear: item.startYear || new Date().getFullYear() - 3,
      endYear: item.endYear || '',
      cgpa: item.cgpa !== undefined && item.cgpa !== null ? item.cgpa : '',
      description: item.description || '',
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
    if (!formData.institution || !formData.degree) return;

    setSubmitting(true);
    setError(null);

    const payload = {
      ...formData,
      startYear: Number(formData.startYear),
      endYear: formData.endYear ? Number(formData.endYear) : null,
      cgpa: formData.cgpa ? Number(formData.cgpa) : null,
    };

    try {
      if (editingItem) {
        const res = await api.put(`/education/${editingItem._id}`, payload);
        setEducationList((prev) =>
          prev.map((e) => (e._id === editingItem._id ? res.data.data : e))
        );
        setSuccess('Academic record updated successfully');
      } else {
        const res = await api.post('/education', payload);
        setEducationList((prev) => [res.data.data, ...prev]);
        setSuccess('New education entry added to your passport');
      }
      closeModal();
      setTimeout(() => setSuccess(null), 3500);
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, institution) => {
    if (!window.confirm(`Delete education record for "${institution}"?`)) return;

    try {
      await api.delete(`/education/${id}`);
      setEducationList((prev) => prev.filter((e) => e._id !== id));
      setSuccess('Academic record deleted');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete record');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-emerald-400" />
            Education & Academic Credentials
          </h1>
          <p className="text-sm text-slate-400">
            List your universities, degrees, majors, GPA scores, and academic awards.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xl shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Education</span>
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

      {/* Education Timeline */}
      {loading ? (
        <div className="h-60 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
          <p className="text-xs">Loading educational timeline...</p>
        </div>
      ) : educationList.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/30 border border-slate-800 space-y-3">
          <GraduationCap className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No education history added yet</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click "Add Education" to register your degree, university, and GPA on your digital passport.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {educationList.map((edu) => (
            <div
              key={edu._id}
              className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all group"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {edu.institution}
                  </h3>
                  {edu.cgpa && (
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      GPA {edu.cgpa}
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-300 font-medium">
                  {edu.degree} {edu.department && `• ${edu.department}`}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {edu.startYear} — {edu.endYear ? edu.endYear : 'Present'}
                  </span>
                </div>

                {edu.description && (
                  <p className="text-xs text-slate-400 pt-1 leading-relaxed max-w-2xl">
                    {edu.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 self-end sm:self-center">
                <button
                  onClick={() => openEditModal(edu)}
                  className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-all cursor-pointer"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(edu._id, edu.institution)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                  title="Delete"
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
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-400" />
                {editingItem ? 'Edit Academic Record' : 'Add Education Record'}
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
                  University / College / School
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stanford University"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Degree
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bachelor of Science in Engineering"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Department / Major
                </label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science & AI"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Start Year
                  </label>
                  <input
                    type="number"
                    required
                    min="1970"
                    max="2050"
                    value={formData.startYear}
                    onChange={(e) => setFormData({ ...formData, startYear: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    End Year
                  </label>
                  <input
                    type="number"
                    min="1970"
                    max="2050"
                    placeholder="2026"
                    value={formData.endYear}
                    onChange={(e) => setFormData({ ...formData, endYear: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    CGPA / Grade
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    placeholder="3.9"
                    value={formData.cgpa}
                    onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Academic Highlights / Relevant Coursework
                </label>
                <textarea
                  rows={3}
                  placeholder="Dean's Honor List, Algorithms, Distributed Systems..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-y"
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
                  {submitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Add Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
