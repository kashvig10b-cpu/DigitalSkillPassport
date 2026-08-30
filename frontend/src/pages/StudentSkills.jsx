import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { socket } from '../services/socket';
import SkillRadarChart from '../components/SkillRadarChart';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Filter,
  Loader2,
  Award
} from 'lucide-react';

const CATEGORIES = [
  'Programming',
  'Web Development',
  'Database',
  'AI/ML',
  'Problem Solving',
  'Communication',
  'Leadership',
  'Cloud & DevOps',
  'Mobile Development',
  'Other',
];

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export default function StudentSkills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Filters & search
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Programming',
    level: 'Intermediate',
    yearsOfExperience: 1,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const res = await api.get('/skills');
      setSkills(res.data?.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch skills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();

    // Real-time Socket.IO listeners
    const onSkillAdded = (newSkill) => {
      setSkills((prev) => {
        if (prev.some((s) => s._id === newSkill._id)) return prev;
        return [newSkill, ...prev];
      });
    };

    const onSkillUpdated = (updatedSkill) => {
      setSkills((prev) =>
        prev.map((s) => (s._id === updatedSkill._id ? updatedSkill : s))
      );
    };

    const onSkillDeleted = (deletedId) => {
      setSkills((prev) => prev.filter((s) => s._id !== deletedId));
    };

    socket.on('skillAdded', onSkillAdded);
    socket.on('skillUpdated', onSkillUpdated);
    socket.on('skillDeleted', onSkillDeleted);

    return () => {
      socket.off('skillAdded', onSkillAdded);
      socket.off('skillUpdated', onSkillUpdated);
      socket.off('skillDeleted', onSkillDeleted);
    };
  }, []);

  const openAddModal = () => {
    setEditingSkill(null);
    setFormData({
      name: '',
      category: 'Programming',
      level: 'Intermediate',
      yearsOfExperience: 1,
    });
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      category: skill.category,
      level: skill.level,
      yearsOfExperience: skill.yearsOfExperience,
    });
    setError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingSkill(null);
  };

  const handleSaveSkill = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    setSubmitting(true);
    setError(null);

    try {
      if (editingSkill) {
        // Update skill
        const res = await api.put(`/skills/${editingSkill._id}`, formData);
        setSkills((prev) =>
          prev.map((s) => (s._id === editingSkill._id ? res.data.data : s))
        );
        setSuccess('Skill updated successfully');
      } else {
        // Create skill
        const res = await api.post('/skills', formData);
        setSkills((prev) => [res.data.data, ...prev]);
        setSuccess('New skill registered to your passport');
      }
      closeModal();
      setTimeout(() => setSuccess(null), 3500);
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSkill = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove '${name}' from your passport?`)) {
      return;
    }

    try {
      await api.delete(`/skills/${id}`);
      setSkills((prev) => prev.filter((s) => s._id !== id));
      setSuccess(`Removed '${name}' from skills`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete skill');
    }
  };

  // Filter skills by search and category
  const filteredSkills = skills.filter((skill) => {
    const matchesSearch = skill.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || skill.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const getLevelBadgeClass = (level) => {
    switch (level) {
      case 'Expert':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'Advanced':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'Intermediate':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            Skills & Competency Matrix
          </h1>
          <p className="text-sm text-slate-400">
            Add your verified technical and soft skills. These power your radar chart and recruiter search ranking.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xl shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Skill</span>
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

      {/* Top Grid: Radar Chart + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart Card (Requirement 27) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Competency Radar (Live Recharts)
              </h2>
              <p className="text-xs text-slate-400">Calculated directly from your MongoDB skills</p>
            </div>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {skills.length} Total Skills
            </span>
          </div>

          <SkillRadarChart skills={skills} />
        </div>

        {/* Skill Category Overview Card */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
            Proficiency Levels
          </h2>
          <div className="space-y-3 text-xs">
            {LEVELS.map((level) => {
              const count = skills.filter((s) => s.level === level).length;
              const pct = skills.length > 0 ? Math.round((count / skills.length) * 100) : 0;
              return (
                <div key={level} className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-300">{level}</span>
                    <span className="text-indigo-400 font-mono">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-800">
            <p className="text-xs text-slate-400 leading-relaxed">
              Employers can filter candidate profiles by verified skills and experience duration.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skills..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-500 font-semibold uppercase flex items-center gap-1 pl-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Skills Grid */}
      {loading ? (
        <div className="h-60 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
          <p className="text-xs">Loading skills from MongoDB...</p>
        </div>
      ) : filteredSkills.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/30 border border-slate-800 space-y-3">
          <Award className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No skills found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search || selectedCategory !== 'All'
              ? 'Try adjusting your search or category filter.'
              : 'Click "Add Skill" to start building your verified competency passport.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((skill) => (
            <div
              key={skill._id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 shadow-sm flex flex-col justify-between space-y-4 group transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {skill.name}
                  </h3>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getLevelBadgeClass(
                      skill.level
                    )}`}
                  >
                    {skill.level}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[10px]">
                    {skill.category}
                  </span>
                  <span>•</span>
                  <span>{skill.yearsOfExperience} {skill.yearsOfExperience === 1 ? 'yr' : 'yrs'} exp</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
                <button
                  onClick={() => openEditModal(skill)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-all cursor-pointer"
                  title="Edit Skill"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteSkill(skill._id, skill.name)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                  title="Delete Skill"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Skill Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingSkill ? 'Edit Skill' : 'Add New Skill'}
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

            <form onSubmit={handleSaveSkill} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Skill Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. React.js, Python, MongoDB, Docker"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Proficiency Level
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    {LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.yearsOfExperience}
                    onChange={(e) =>
                      setFormData({ ...formData, yearsOfExperience: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
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
                  {submitting ? 'Saving...' : editingSkill ? 'Save Changes' : 'Add Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
