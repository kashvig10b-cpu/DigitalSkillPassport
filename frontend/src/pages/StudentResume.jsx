import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Save,
  Loader2,
  Trash2,
  FileCheck,
  Link as LinkIcon,
  Download,
  X,
  Sparkles
} from 'lucide-react';

export default function StudentResume() {
  const [resumeUrl, setResumeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadMode, setUploadMode] = useState('file'); // 'file' | 'link'
  const [selectedFile, setSelectedFile] = useState(null);
  const [linkInput, setLinkInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const fetchResume = async () => {
    try {
      setLoading(true);
      const res = await api.get('/profile');
      const currentResume = res.data?.data?.profile?.resume || '';
      setResumeUrl(currentResume);
      if (currentResume.startsWith('http')) {
        setLinkInput(currentResume);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch resume details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResume();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file) => {
    if (file.size > 10 * 1024 * 1024) {
      setError('File exceeds 10MB maximum size limit.');
      return;
    }
    const ext = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'doc', 'docx'];
    if (!validExtensions.includes(ext)) {
      setError(`Unsupported format ".${ext}". Please upload PDF, PNG, JPG, WEBP, or DOC/DOCX.`);
      return;
    }
    setSelectedFile(file);
    setError(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(null);
    setError(null);

    try {
      if (uploadMode === 'file') {
        if (!selectedFile) {
          setError('Please select or drag-and-drop a resume document first.');
          setSaving(false);
          return;
        }
        const formData = new FormData();
        formData.append('file', selectedFile);

        const res = await api.post('/profile/resume', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const newResume = res.data?.data?.resume || '';
        setResumeUrl(newResume);
        setSelectedFile(null);
        setSuccess('Resume document uploaded and verified successfully in MongoDB!');
      } else {
        if (!linkInput.trim()) {
          setError('Please enter a valid resume URL.');
          setSaving(false);
          return;
        }

        const res = await api.post('/profile/resume', { resumeUrl: linkInput.trim() });
        const newResume = res.data?.data?.resume || linkInput.trim();
        setResumeUrl(newResume);
        setSuccess('Resume link updated successfully in MongoDB!');
      }

      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update resume');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm('Are you sure you want to remove your attached resume document?')) {
      return;
    }

    setDeleting(true);
    setError(null);
    try {
      await api.delete('/profile/resume');
      setResumeUrl('');
      setSelectedFile(null);
      setLinkInput('');
      setSuccess('Resume removed successfully from your passport.');
      setTimeout(() => setSuccess(null), 3500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to remove resume');
    } finally {
      setDeleting(false);
    }
  };

  const getCleanFileName = (url) => {
    if (!url) return '';
    if (url.startsWith('/uploads/')) {
      const parts = url.replace('/uploads/', '').split('-');
      // Return the original clean name portion
      return parts.slice(2).join('-') || url.replace('/uploads/', '');
    }
    return url;
  };

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
        <p className="text-xs">Loading verified resume records...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Verified Credential Document</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-400" />
          Resume Management
        </h1>
        <p className="text-sm text-slate-400">
          Upload your official resume file (PDF, Image, Word) or link. Recruiters scanning your QR passport can download or inspect it directly in real time.
        </p>
      </div>

      {/* Alerts */}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Active Attached Resume Card (if exists) */}
      {resumeUrl && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-emerald-500/30 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white truncate">
                    {getCleanFileName(resumeUrl)}
                  </p>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate max-w-md pt-0.5">
                  {resumeUrl}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Document</span>
              </a>

              <button
                type="button"
                onClick={handleDeleteResume}
                disabled={deleting}
                className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-all cursor-pointer"
                title="Remove attached resume"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin text-rose-400" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Form Card */}
      <form onSubmit={handleSave} className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
        {/* Upload Mode Selector Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800 max-w-sm">
          <button
            type="button"
            onClick={() => setUploadMode('file')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              uploadMode === 'file'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setUploadMode('link')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              uploadMode === 'link'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>External Link</span>
          </button>
        </div>

        {uploadMode === 'file' ? (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Choose or Drag & Drop Resume File
            </label>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`p-8 rounded-2xl border-2 border-dashed transition-all text-center relative flex flex-col items-center justify-center ${
                isDragging
                  ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
                  : selectedFile
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-slate-800 hover:border-indigo-500/40 bg-slate-950/60'
              }`}
            >
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />

              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3 pointer-events-none">
                <UploadCloud className="w-7 h-7" />
              </div>

              {selectedFile ? (
                <div className="space-y-1.5 pointer-events-none">
                  <p className="font-bold text-emerald-400 text-sm">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-400 font-mono">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to upload
                  </p>
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30">
                    ✓ File Selected
                  </span>
                </div>
              ) : (
                <div className="space-y-1 pointer-events-none">
                  <p className="font-semibold text-slate-200 text-sm">
                    Drag and drop your resume here, or <span className="text-indigo-400 underline">browse</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    Supports PDF, PNG, JPG, WEBP, Word (.doc, .docx) up to 10MB
                  </p>
                </div>
              )}
            </div>

            {selectedFile && (
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-xs text-slate-400 hover:text-rose-400 inline-flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Choose different file</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Official Resume Document URL (Google Drive, Dropbox, Portfolio PDF)
            </label>
            <div className="relative">
              <input
                type="url"
                placeholder="https://drive.google.com/... or https://example.com/resume.pdf"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Tip: Ensure file sharing permissions are set to "Anyone with the link can view".
            </p>
          </div>
        )}

        {/* Submit button */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
          <p className="text-[11px] text-slate-500">
            Real-time synchronization with Digital Skill Passport and recruiter search.
          </p>

          <button
            type="submit"
            disabled={saving || (uploadMode === 'file' && !selectedFile) || (uploadMode === 'link' && !linkInput.trim())}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{uploadMode === 'file' ? 'Upload & Save Resume' : 'Save Resume Link'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
