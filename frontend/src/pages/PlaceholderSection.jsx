import React from 'react';
import { Layers, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PlaceholderSection({ title, phase, description, nextAction }) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">{title}</h1>
        <p className="text-sm text-slate-400">
          {description || `This section connects to MongoDB in ${phase}.`}
        </p>
      </div>

      <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col items-center text-center space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
          <Layers className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300">
            {phase} Up Next
          </span>
          <h3 className="text-lg font-bold text-white pt-2">{title} Module</h3>
          <p className="text-xs text-slate-400 max-w-md">
            The database schemas and API controllers are configured. This module will be wired with full interactive CRUD forms in the next phase!
          </p>
        </div>

        <div className="pt-2 flex gap-3">
          <Link
            to="/student/profile"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
          >
            <span>Edit Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/student/qr"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
          >
            <span>View QR Passport</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
