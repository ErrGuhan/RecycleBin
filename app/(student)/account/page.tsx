'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  Download,
  Trash2,
  CheckCircle2,
  LogOut,
} from 'lucide-react';

export default function StudentAccountPage() {
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(true);
  const [dataDownloaded, setDataDownloaded] = useState(false);

  const studentProfile = {
    name: 'Aditya Kumar',
    rollNo: '24CS108',
    department: 'Computer Science',
    year: '2nd Year',
    email: 'aditya.k@college.edu',
    campus: "St. Xavier's College - Main Campus",
    consentedAt: '2026-08-15',
    isAdult: true,
  };

  const handleDownloadData = () => {
    const exportData = {
      profile: studentProfile,
      dropsCount: 4,
      lifetimePoints: 104,
      certificates: ['CPC-2026-7K3Q9D'],
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campus-plastic-credits-data-${studentProfile.rollNo}.json`;
    a.click();
    setDataDownloaded(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-ink tracking-tight">Account &amp; Privacy</h1>
        <p className="text-xs text-ink-muted">Manage your profile, data rights, and preferences</p>
      </div>

      {/* Profile Card */}
      <div className="bg-surface rounded-2xl border border-line p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-primary-soft text-brand-primary-strong font-black text-lg flex items-center justify-center">
            AK
          </div>
          <div>
            <h2 className="font-extrabold text-base text-ink">{studentProfile.name}</h2>
            <p className="text-xs text-ink-muted">
              {studentProfile.rollNo} • {studentProfile.department}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-line/60 text-xs">
          <div>
            <span className="text-ink-muted">Campus:</span>
            <div className="font-semibold text-ink">{studentProfile.campus}</div>
          </div>
          <div>
            <span className="text-ink-muted">Email:</span>
            <div className="font-semibold text-ink truncate">{studentProfile.email}</div>
          </div>
          <div>
            <span className="text-ink-muted">DPDP Consent:</span>
            <div className="font-semibold text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Version 1.0 (Active)</span>
            </div>
          </div>
          <div>
            <span className="text-ink-muted">Age Verification:</span>
            <div className="font-semibold text-ink">18+ Confirmed</div>
          </div>
        </div>
      </div>

      {/* Preferences Card */}
      <div className="bg-surface rounded-2xl border border-line p-5 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-ink">Privacy &amp; Display</h3>

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="font-semibold text-xs text-ink">Campus Leaderboard</div>
            <p className="text-[11px] text-ink-muted">
              Display masked name (Aditya K.) and points on top recycler rankings.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={showOnLeaderboard}
            onClick={() => setShowOnLeaderboard(!showOnLeaderboard)}
            className={`w-12 h-6 rounded-full transition-colors relative focus-visible:outline-2 focus-visible:outline-brand-primary-strong ${
              showOnLeaderboard ? 'bg-brand-primary-strong' : 'bg-slate-300'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                showOnLeaderboard ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* DPDP Data Rights */}
      <div className="bg-surface rounded-2xl border border-line p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-brand-primary-strong" />
          <h3 className="font-bold text-sm text-ink">Your Data Rights (DPDP Act)</h3>
        </div>

        <div className="space-y-3">
          {/* Download Data Button */}
          <button
            type="button"
            onClick={handleDownloadData}
            className="w-full min-h-[44px] px-4 rounded-xl border border-line bg-surface hover:bg-surface-alt font-semibold text-xs text-ink flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2">
              <Download className="w-4 h-4 text-brand-primary-strong" />
              <span>Download My Complete Data (JSON)</span>
            </span>
            {dataDownloaded && (
              <span className="text-[10px] text-emerald-800 font-bold">Downloaded ✓</span>
            )}
          </button>

          {/* Delete Account Button */}
          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  'Are you sure you want to delete your account? Your personal name and email will be anonymized while non-identifiable recycling audit entries remain for college NAAC records.'
                )
              ) {
                alert('Account anonymized successfully.');
              }
            }}
            className="w-full min-h-[44px] px-4 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 font-semibold text-xs text-rose-800 flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-700" />
              <span>Delete My Account (Anonymize)</span>
            </span>
            <span className="text-[10px] uppercase font-bold text-rose-700">Irreversible</span>
          </button>
        </div>
      </div>

      {/* Sign Out */}
      <div className="pt-2 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-muted hover:text-ink min-h-[44px]"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Account</span>
        </Link>
      </div>
    </div>
  );
}
