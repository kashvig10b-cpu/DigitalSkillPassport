import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Search,
  Filter,
  Users,
  ShieldCheck,
  Award,
  GraduationCap,
  MapPin,
  ExternalLink,
  FileText,
  Github,
  Linkedin,
  LogOut,
  Sparkles,
  RotateCcw,
  Loader2,
  AlertCircle,
  FolderGit2,
  Mail,
  X,
  Send,
  QrCode,
  Copy,
  Check
} from 'lucide-react';

export default function RecruiterDashboard() {
  const { user, logout } = useAuth();

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // QR Modal state
  const [qrModal, setQrModal] = useState(null); // null or candidate
  const [lanIp, setLanIp] = useState('');
  const [copiedQR, setCopiedQR] = useState(false);

  // Email compose modal state
  const [emailModal, setEmailModal] = useState(null); // null or { candidate }
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Filter options from API
  const [filterOptions, setFilterOptions] = useState({
    colleges: [],
    degrees: [],
    departments: [],
    skills: [],
  });

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    skill: '',
    degree: '',
    college: '',
    location: '',
    minCompletion: 0,
    verifiedOnly: false,
  });

  // Fetch filter dropdown options once
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [res, netRes] = await Promise.all([
          api.get('/recruiter/filters'),
          api.get('/network-info').catch(() => null)
        ]);
        if (res.data?.data) {
          setFilterOptions(res.data.data);
        }
        if (netRes?.data?.data?.lanIp && netRes.data.data.lanIp !== 'localhost') {
          setLanIp(netRes.data.data.lanIp);
        }
      } catch (err) {
        console.error('Failed to load recruiter filter options', err);
      }
    };
    fetchOptions();
  }, []);

  // Fetch candidates whenever filters change
  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.skill) params.skill = filters.skill;
      if (filters.degree) params.degree = filters.degree;
      if (filters.college) params.college = filters.college;
      if (filters.location) params.location = filters.location;
      if (filters.minCompletion > 0) params.minCompletion = filters.minCompletion;
      if (filters.verifiedOnly) params.verifiedOnly = 'true';

      const res = await api.get('/recruiter/search', { params });
      setCandidates(res.data?.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to search candidate registry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCandidates();
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [filters]);

  const handleReset = () => {
    setFilters({
      search: '',
      skill: '',
      degree: '',
      college: '',
      location: '',
      minCompletion: 0,
      verifiedOnly: false,
    });
  };

  const openEmailModal = (cand) => {
    const defaultSubject = `Opportunity: We'd love to connect with you, ${cand.name.split(' ')[0]}!`;
    const defaultBody = `Hi ${cand.name},

I came across your Digital Skill Passport and I'm really impressed with your profile — especially your skills and projects.

We have an exciting opportunity at ${user?.college || 'our company'} that I believe would be a great fit for you.

Would you be open to a brief conversation? Please let me know a time that works for you.

Looking forward to hearing from you!

Best regards,
${user?.name}
${user?.college || ''}`;
    setEmailSubject(defaultSubject);
    setEmailBody(defaultBody);
    setEmailModal(cand);
  };

  const sendEmail = () => {
    if (!emailModal) return;
    const to = encodeURIComponent(emailModal.email);
    const subject = encodeURIComponent(emailSubject);
    const body = encodeURIComponent(emailBody);
    // Opens recruiter's own Gmail compose window in new tab
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`, '_blank');
    setEmailModal(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-1 ring-white/20">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Skill Passport
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                Recruiter Portal
              </span>
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-3 text-right">
              <div>
                <p className="text-xs font-semibold text-white">{user?.name}</p>
                <p className="text-[11px] text-slate-400">{user?.college || 'Talent Acquisition'}</p>
              </div>
              <div className="h-9 w-9 rounded-xl bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-bold text-sm">
                {user?.name ? user.name[0].toUpperCase() : 'R'}
              </div>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-400 border border-slate-700 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Email Compose Modal */}
      {emailModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Email Candidate</h3>
                  <p className="text-[11px] text-slate-400">Opens in your Gmail account</p>
                </div>
              </div>
              <button
                onClick={() => setEmailModal(null)}
                className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">
              {/* To */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">To</label>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-emerald-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {emailModal.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{emailModal.name}</p>
                    <p className="text-[11px] text-emerald-400 font-mono">{emailModal.email}</p>
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-500"
                />
              </div>

              {/* Body */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Message</label>
                <textarea
                  rows={8}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none placeholder-slate-500 leading-relaxed"
                />
              </div>

              <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3 h-3" />
                Clicking "Open Gmail" will launch your Gmail with this message pre-filled. Send it from your own account.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setEmailModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={sendEmail}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Open Gmail & Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate QR Scan Modal */}
      {qrModal && (() => {
        const scanHost = lanIp || (window.location.hostname !== 'localhost' ? window.location.hostname : '10.167.66.101');
        const port = window.location.port ? `:${window.location.port}` : '';
        const mobileCandidateUrl = `${window.location.protocol}//${scanHost}${port}/passport/${qrModal.passportId}`;
        const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(mobileCandidateUrl)}`;

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-700 p-7 rounded-3xl max-w-sm w-full text-center space-y-4 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-left">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Scan Candidate Passport</h3>
                    <p className="text-[11px] text-slate-400">Opens real-time credentials on phone</p>
                  </div>
                </div>
                <button
                  onClick={() => setQrModal(null)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* QR Image */}
              <div className="p-3 bg-white rounded-2xl inline-block shadow-xl mx-auto">
                <img
                  src={qrImageSrc}
                  alt={`QR Code for ${qrModal.name}`}
                  className="w-56 h-56 mx-auto object-contain block"
                />
              </div>

              <div className="space-y-1 pt-1">
                <p className="text-sm font-bold text-white">{qrModal.name}</p>
                <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 inline-block">
                  {qrModal.passportId}
                </span>
                <p className="text-[11px] text-slate-400 font-mono break-all px-2 select-all pt-1">
                  {mobileCandidateUrl}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(mobileCandidateUrl);
                    setCopiedQR(true);
                    setTimeout(() => setCopiedQR(false), 2000);
                  }}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedQR ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedQR ? 'Copied URL' : 'Copy URL'}</span>
                </button>
                <button
                  onClick={() => setQrModal(null)}
                  className="py-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 shadow-xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <Users className="w-3.5 h-3.5" />
            <span>Verified Candidate Talent Scout</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Discover Pre-Verified Student Engineers
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Query candidates by verified competencies, accredited certificates, academic institutions, and live projects. Every student has an immutable QR passport.
          </p>
        </div>

        {/* Multi-Criteria Filter Controls Panel */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
              <Filter className="w-4 h-4 text-emerald-400" />
              <span>Search & Filter Parameters</span>
            </div>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Keyword Search */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-400">Search Candidate / College</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. David, Stanford, MIT..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>
            </div>

            {/* Skill Filter */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-400">Skill / Technology</label>
              <input
                type="text"
                placeholder="e.g. React, Python, Docker..."
                value={filters.skill}
                onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
              />
            </div>

            {/* Degree Filter */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-400">Degree</label>
              <select
                value={filters.degree}
                onChange={(e) => setFilters({ ...filters, degree: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
              >
                <option value="">All Degrees</option>
                <option value="B.Tech">B.Tech / B.E.</option>
                <option value="M.Tech">M.Tech / M.S.</option>
                <option value="BCA">BCA / MCA</option>
                <option value="Computer Science">Computer Science</option>
              </select>
            </div>

            {/* Minimum Profile Completion % */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-400 flex justify-between">
                <span>Min Completion</span>
                <span className="text-emerald-400 font-mono">{filters.minCompletion}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={filters.minCompletion}
                onChange={(e) =>
                  setFilters({ ...filters, minCompletion: Number(e.target.value) })
                }
                className="w-full accent-emerald-500 cursor-pointer mt-1"
              />
            </div>
          </div>

          {/* Toggle: Verified Only */}
          <div className="flex items-center gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={filters.verifiedOnly}
                onChange={(e) =>
                  setFilters({ ...filters, verifiedOnly: e.target.checked })
                }
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <span className="text-slate-300 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Only Show Candidates with Verified Credentials
              </span>
            </label>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <span className="font-bold text-white">{candidates.length}</span> verified candidates
          </div>
          {filters.verifiedOnly && (
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Verified Credentials Filter Applied
            </span>
          )}
        </div>

        {/* Candidate Cards Grid */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
            <p className="text-xs">Querying MongoDB candidate registry...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        ) : candidates.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-slate-900/30 border border-slate-800 space-y-3">
            <Users className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No candidates match your criteria</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try loosening your skill or completion filters to expand the talent pool.
            </p>
            <button
              onClick={handleReset}
              className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((cand) => {
              const passportUrl = `/passport/${cand.passportId}`;

              return (
                <div
                  key={cand.id}
                  className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 shadow-xl flex flex-col justify-between space-y-5 transition-all group"
                >
                  {/* Candidate Header */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {cand.profilePhoto ? (
                          <img
                            src={cand.profilePhoto}
                            alt={cand.name}
                            className="w-12 h-12 rounded-2xl object-cover border border-slate-700"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-600 flex items-center justify-center text-lg font-bold text-white shadow-md">
                            {cand.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                              {cand.name}
                            </h3>
                            {cand.verifiedCredentialsCount > 0 && (
                              <ShieldCheck
                                className="w-4 h-4 text-emerald-400"
                                title="Verified Credentials Available"
                              />
                            )}
                          </div>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <GraduationCap className="w-3 h-3 text-slate-500" />
                            <span>{cand.college || 'Engineering University'}</span>
                          </p>
                        </div>
                      </div>

                      {/* Completion Badge */}
                      <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                        {cand.profileCompletion}% Match
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 font-medium">
                      {cand.degree} {cand.department && `• ${cand.department}`}
                    </div>

                    {cand.location && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <MapPin className="w-3 h-3" />
                        <span>{cand.location}</span>
                      </div>
                    )}

                    {cand.bio && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed pt-1">
                        {cand.bio}
                      </p>
                    )}

                    {/* Top 3-5 Skills */}
                    {cand.topSkills && cand.topSkills.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-1.5">
                          Top Skills
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {cand.topSkills.map((s, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-mono px-2.5 py-0.5 rounded-md bg-slate-950 text-slate-200 border border-slate-800 flex items-center gap-1"
                            >
                              <span className="text-emerald-400">•</span>
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Metric Pills */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-center">
                      <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase block">Verified Badges</span>
                        <span className="text-sm font-bold font-mono text-emerald-400">
                          {cand.verifiedCredentialsCount}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase block">Projects</span>
                        <span className="text-sm font-bold font-mono text-indigo-400">
                          {cand.totalProjectsCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2">
                    <a
                      href={passportUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 transition-all"
                    >
                      <span>View Digital Skill Passport</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQrModal(cand)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 hover:text-indigo-200 text-xs font-semibold transition-all cursor-pointer"
                        title={`Scan QR Code for ${cand.name}`}
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>QR Code</span>
                      </button>

                      {cand.resume && (
                        <a
                          href={cand.resume}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all"
                        >
                          <FileText className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Resume PDF</span>
                        </a>
                      )}
                      {cand.email && (
                        <button
                          onClick={() => openEmailModal(cand)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 text-xs font-semibold transition-all cursor-pointer"
                          title={`Email ${cand.name}`}
                        >
                          <Mail className="w-3.5 h-3.5" />
                          Email
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
