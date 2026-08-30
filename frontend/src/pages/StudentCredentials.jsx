import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShieldCheck, Award, ExternalLink, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentCredentials() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreds = async () => {
      try {
        const res = await api.get('/profile');
        setProfileData(res.data?.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCreds();
  }, []);

  const verifiedCount = profileData?.stats?.verifiedCredentials || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Verified Credentials Vault</h1>
        <p className="text-sm text-slate-400">
          Only certificates verified and cryptographically stamped by administrators appear here and in your public passport.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 rounded-3xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Accredited Status</span>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">{verifiedCount}</p>
          <p className="text-xs text-emerald-400 font-medium">✓ Officially Verified by Admin</p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Verification Queue</span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">
            {Math.max(0, (profileData?.stats?.totalCertificates || 0) - verifiedCount)}
          </p>
          <p className="text-xs text-amber-400 font-medium">Pending Admin Review</p>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white">Credential Verification Standard</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          In Phase 6 & Phase 8, certificates uploaded by students are submitted with Credential ID, Issuing Organization, and PDF proof. When an admin verifies a certificate in the Admin Control Room, Socket.IO pushes an immediate update, elevating it to Verified Credential status on your passport.
        </p>
        <div className="pt-2">
          <Link
            to="/student/certificates"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all"
          >
            <Award className="w-4 h-4" />
            <span>Manage Certificates & Proofs</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
