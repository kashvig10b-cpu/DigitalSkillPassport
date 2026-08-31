import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import api from '../services/api';
import { socket } from '../services/socket';
import SkillRadarChart from '../components/SkillRadarChart';
import {
  ShieldCheck,
  Award,
  Briefcase,
  GraduationCap,
  Trophy,
  FolderGit2,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  FileText,
  Copy,
  Check,
  Share2,
  Printer,
  QrCode,
  MapPin,
  Calendar,
  Sparkles,
  Loader2,
  AlertCircle,
  Mail,
  Smartphone
} from 'lucide-react';

export default function PublicPassport() {
  const { passportId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [liveViewers, setLiveViewers] = useState(1);
  const [lanIp, setLanIp] = useState('');

  useEffect(() => {
    api.get('/network-info')
      .then(res => {
        if (res.data?.data?.lanIp && res.data.data.lanIp !== 'localhost') {
          setLanIp(res.data.data.lanIp);
        }
      })
      .catch(() => {});
  }, []);

  const fetchPassport = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/passport/${passportId}`);
      setData(res.data?.data || null);
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
          `Digital Skill Passport "${passportId}" was not found in the verified registry.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPassport();

    if (passportId) {
      // Join passport-specific real-time room
      const room = `passport_${passportId.toUpperCase()}`;
      socket.emit('joinRoom', room);

      // Real-time synchronization listeners
      const refresh = () => fetchPassport();

      socket.on('skillAdded', refresh);
      socket.on('skillUpdated', refresh);
      socket.on('skillDeleted', refresh);

      socket.on('projectAdded', refresh);
      socket.on('projectUpdated', refresh);
      socket.on('projectDeleted', refresh);

      socket.on('certificateUploaded', refresh);
      socket.on('certificateUpdated', refresh);
      socket.on('certificateDeleted', refresh);
      socket.on('certificateVerified', refresh);
      socket.on('certificateRejected', refresh);

      socket.on('achievementAdded', refresh);
      socket.on('achievementUpdated', refresh);
      socket.on('achievementDeleted', refresh);

      socket.on('educationAdded', refresh);
      socket.on('educationUpdated', refresh);
      socket.on('educationDeleted', refresh);

      socket.on('experienceAdded', refresh);
      socket.on('experienceUpdated', refresh);
      socket.on('experienceDeleted', refresh);

      const onPassportViewers = ({ passportId: pid, count }) => {
        if (pid === passportId.toUpperCase()) {
          setLiveViewers(count);
        }
      };

      socket.on('passportViewersUpdated', onPassportViewers);

      return () => {
        socket.emit('leave_passport_room', passportId);
        socket.off('passportViewersUpdated', onPassportViewers);
        socket.off('skillAdded', refresh);
        socket.off('skillUpdated', refresh);
        socket.off('skillDeleted', refresh);
        socket.off('projectAdded', refresh);
        socket.off('projectUpdated', refresh);
        socket.off('projectDeleted', refresh);
        socket.off('certificateUploaded', refresh);
        socket.off('certificateUpdated', refresh);
        socket.off('certificateDeleted', refresh);
        socket.off('certificateVerified', refresh);
        socket.off('certificateRejected', refresh);
        socket.off('achievementAdded', refresh);
        socket.off('achievementUpdated', refresh);
        socket.off('achievementDeleted', refresh);
        socket.off('educationAdded', refresh);
        socket.off('educationUpdated', refresh);
        socket.off('educationDeleted', refresh);
        socket.off('experienceAdded', refresh);
        socket.off('experienceUpdated', refresh);
        socket.off('experienceDeleted', refresh);
      };
    }
  }, [passportId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 p-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-sm font-semibold text-white">
          Accessing Verified Digital Passport Registry...
        </p>
        <p className="text-xs text-slate-500 font-mono mt-1">ID: {passportId}</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Passport Not Found</h2>
          <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
          <Link
            to="/login"
            className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all"
          >
            Go to Platform Login
          </Link>
        </div>
      </div>
    );
  }

  const { student, skills, projects, certificates, achievements, education, experience, stats } = data;
  const verifiedCertificates = certificates.filter((c) => c.status === 'VERIFIED');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white print:bg-white print:text-black">
      {/* Top Floating Action Bar */}
      <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3 print:hidden">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                OFFICIAL VERIFIED PASSPORT
              </span>
            </div>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {liveViewers} Live Viewer{liveViewers > 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium transition-all cursor-pointer"
              title="Copy public link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Link'}</span>
            </button>

            <button
              onClick={() => setShowQR(!showQR)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium transition-all cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-indigo-400" />
              <span>QR Code</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>
      </nav>

      {/* QR Modal View */}
      {showQR && (() => {
        const isPublicDomain = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
        const mobileScanUrl = isPublicDomain
          ? `${window.location.origin}/passport/${data?.passportId}`
          : `${window.location.protocol}//${lanIp || 'localhost'}${window.location.port ? `:${window.location.port}` : ''}/passport/${data?.passportId}`;
        const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(mobileScanUrl)}`;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md print:hidden">
            <div className="bg-slate-900 border border-slate-700 p-7 rounded-3xl max-w-sm w-full text-center space-y-4 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-left">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Scan with Camera</h3>
                    <p className="text-[11px] text-slate-400">Opens real-time passport on phone</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowQR(false)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* QR Image */}
              <div className="p-3 bg-white rounded-2xl inline-block shadow-xl mx-auto">
                <img
                  src={qrImageSrc}
                  alt={`QR Code for ${data?.passportId}`}
                  className="w-56 h-56 mx-auto object-contain block"
                />
              </div>

              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 inline-block">
                  {data?.passportId}
                </span>
                <p className="text-[11px] text-slate-400 font-mono break-all px-2 select-all">
                  {mobileScanUrl}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(mobileScanUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied URL' : 'Copy URL'}</span>
                </button>
                <button
                  onClick={() => setShowQR(false)}
                  className="py-2 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Main Passport Sheet */}
      <main className="max-w-6xl mx-auto p-4 sm:p-8 space-y-10">
        {/* Student Passport Header Card */}
        <section className="p-8 sm:p-10 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {student.profilePhoto ? (
                <img
                  src={student.profilePhoto}
                  alt={student.name}
                  className="w-28 h-28 rounded-3xl object-cover border-2 border-indigo-500/40 shadow-xl"
                />
              ) : (
                <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-3xl font-black text-white shadow-xl">
                  {student.name.charAt(0)}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-3xl font-black text-white tracking-tight">
                    {student.name}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm">
                    <ShieldCheck className="w-4 h-4" />
                    <span>VERIFIED DIGITAL PASSPORT</span>
                  </span>
                </div>

                <p className="text-sm text-indigo-400 font-semibold">
                  {student.degree || 'Computer Science'}{' '}
                  {student.department && `• ${student.department}`}
                </p>

                <p className="text-xs text-slate-400 flex flex-wrap items-center gap-4">
                  {student.college && (
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                      {student.college}
                    </span>
                  )}
                  {student.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {student.location}
                    </span>
                  )}
                  <span className="font-mono text-slate-500">
                    Passport ID: <span className="text-slate-300 font-bold">{data.passportId}</span>
                  </span>
                </p>

                {student.bio && (
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed pt-1">
                    {student.bio}
                  </p>
                )}

                {/* Social & Contact Links */}
                <div className="flex flex-wrap items-center gap-2 pt-2 print:hidden">
                  {student.github && (
                    <a
                      href={student.github}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>GitHub</span>
                    </a>
                  )}
                  {student.linkedin && (
                    <a
                      href={student.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors"
                    >
                      <Linkedin className="w-3.5 h-3.5 text-sky-400" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {student.portfolio && (
                    <a
                      href={student.portfolio}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Portfolio</span>
                    </a>
                  )}
                  {student.resume && (
                    <a
                      href={student.resume}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-xs text-indigo-300 border border-indigo-500/30 transition-colors font-semibold"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Resume PDF</span>
                    </a>
                  )}
                  {/* Contact Email — visible to recruiters on the public passport */}
                  {student.email && (
                    <a
                      href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(student.email)}&su=${encodeURIComponent(`Opportunity: We'd love to connect with you, ${student.name.split(' ')[0]}!`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-xs text-emerald-300 border border-emerald-500/30 transition-colors font-semibold"
                      title={`Send email to ${student.email}`}
                    >
                      <Mail className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{student.email}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Passport QR Pill */}
            {student.qrCode && (
              <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-950/60 border border-slate-800 hidden md:flex">
                <img
                  src={student.qrCode}
                  alt="QR Code"
                  className="w-24 h-24 rounded-xl bg-white p-1.5"
                />
                <span className="text-[10px] font-mono text-slate-400 mt-1.5">Scan to Verify</span>
              </div>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Skills
              </span>
              <span className="text-2xl font-black font-mono text-white mt-0.5 block">
                {stats.totalSkills}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Verified Credentials
              </span>
              <span className="text-2xl font-black font-mono text-emerald-400 mt-0.5 block">
                {stats.verifiedCredentials}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Projects Shipped
              </span>
              <span className="text-2xl font-black font-mono text-indigo-400 mt-0.5 block">
                {stats.totalProjects}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Honors & Wins
              </span>
              <span className="text-2xl font-black font-mono text-yellow-400 mt-0.5 block">
                {stats.totalAchievements}
              </span>
            </div>
          </div>
        </section>

        {/* Dynamic Skill Radar Chart + Skills Breakdown */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Skills Matrix & Proficiency Radar</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Recharts Dynamic Radar Balance
              </h3>
              <SkillRadarChart skills={skills} />
            </div>

            <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Competencies Breakdown ({skills.length})
              </h3>
              {skills.length === 0 ? (
                <p className="text-xs text-slate-500">No skills registered.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                  {skills.map((s) => (
                    <div
                      key={s._id}
                      className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-white">{s.name}</p>
                        <p className="text-[10px] text-slate-500">{s.category || 'General'}</p>
                      </div>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {s.level}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Verified Certificates & Credentials Vault */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-white">
                Verified Credentials & Certifications
              </h2>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              {verifiedCertificates.length} Verified
            </span>
          </div>

          {certificates.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900/30 border border-slate-800 text-center text-slate-500 text-xs">
              No certificates listed yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {certificates.map((c) => {
                const isVerified = c.status === 'VERIFIED';
                const fileDownloadUrl = c.fileUrl
                  ? `http://localhost:5000${c.fileUrl}`
                  : null;

                return (
                  <div
                    key={c._id}
                    className={`p-6 rounded-3xl border flex flex-col justify-between space-y-4 transition-all ${
                      isVerified
                        ? 'bg-slate-900/80 border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                        : 'bg-slate-900/40 border-slate-800/80 opacity-75'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {c.issuer}
                        </span>
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                            <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            {c.status}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-white">{c.title}</h3>

                      {c.credentialId && (
                        <p className="text-[11px] font-mono text-slate-400">
                          Credential ID: <span className="text-slate-300">{c.credentialId}</span>
                        </p>
                      )}

                      <p className="text-[11px] text-slate-500">
                        Issued:{' '}
                        <span className="text-slate-300">
                          {c.issueDate ? new Date(c.issueDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      {fileDownloadUrl && (
                        <a
                          href={fileDownloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Proof</span>
                        </a>
                      )}
                      {c.credentialUrl && (
                        <a
                          href={c.credentialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                        >
                          <span>Verify Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Featured Technical Projects */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Featured Technical Projects</h2>
          </div>

          {projects.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900/30 border border-slate-800 text-center text-slate-500 text-xs">
              No projects added.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {projects.map((proj) => (
                <div
                  key={proj._id}
                  className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
                >
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-white">{proj.title}</h3>
                    {proj.description && (
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {proj.description}
                      </p>
                    )}

                    {proj.techStack && proj.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {proj.techStack.map((tech, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-slate-800 print:hidden">
                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>Source Code</span>
                      </a>
                    )}
                    {proj.liveUrl && (
                      <a
                        href={proj.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-semibold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Live App</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Education & Experience Dual Column */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Work Experience */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Work Experience</h2>
            </div>

            {experience.length === 0 ? (
              <div className="p-6 rounded-3xl bg-slate-900/30 border border-slate-800 text-center text-slate-500 text-xs">
                No work experience recorded.
              </div>
            ) : (
              <div className="space-y-3">
                {experience.map((exp) => (
                  <div
                    key={exp._id}
                    className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-white">{exp.jobTitle}</h4>
                        <p className="text-xs font-semibold text-indigo-400">{exp.company}</p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {exp.employmentType}
                      </span>
                    </div>

                    <p className="text-[11px] font-mono text-slate-500">
                      {exp.startDate ? new Date(exp.startDate).toLocaleDateString() : 'N/A'} —{' '}
                      {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
                      {exp.location && ` • ${exp.location}`}
                    </p>

                    {exp.description && (
                      <p className="text-xs text-slate-400 leading-relaxed pt-1">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Education Timeline */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Education History</h2>
            </div>

            {education.length === 0 ? (
              <div className="p-6 rounded-3xl bg-slate-900/30 border border-slate-800 text-center text-slate-500 text-xs">
                No education history recorded.
              </div>
            ) : (
              <div className="space-y-3">
                {education.map((edu) => (
                  <div
                    key={edu._id}
                    className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-white">{edu.institution}</h4>
                        <p className="text-xs text-slate-300">
                          {edu.degree} {edu.department && `• ${edu.department}`}
                        </p>
                      </div>
                      {edu.cgpa && (
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          GPA {edu.cgpa}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] font-mono text-slate-500">
                      {edu.startYear} — {edu.endYear ? edu.endYear : 'Present'}
                    </p>

                    {edu.description && (
                      <p className="text-xs text-slate-400 leading-relaxed pt-1">
                        {edu.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Honors & Achievements */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-bold text-white">Honors & Achievements</h2>
          </div>

          {achievements.length === 0 ? (
            <div className="p-6 rounded-3xl bg-slate-900/30 border border-slate-800 text-center text-slate-500 text-xs">
              No honors or competition ranks recorded.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {achievements.map((ach) => (
                <div
                  key={ach._id}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-yellow-400 font-semibold">
                      {ach.organization || 'Honor'}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      {ach.date ? new Date(ach.date).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{ach.title}</h4>
                  {ach.description && (
                    <p className="text-xs text-slate-400 line-clamp-2">{ach.description}</p>
                  )}
                  {ach.proof && (
                    <a
                      href={ach.proof}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 pt-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>View Proof</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Footer Verification Seal */}
        <footer className="pt-10 pb-16 border-t border-slate-800/80 text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Digital Skill Passport Registry • Cryptographically Verified on MongoDB</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Real-time public record synchronized via Socket.IO • ID: {data.passportId}
          </p>
        </footer>
      </main>
    </div>
  );
}
