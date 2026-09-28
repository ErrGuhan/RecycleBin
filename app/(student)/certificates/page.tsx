'use client';

import React from 'react';
import Link from 'next/link';
import { Award, Lock, Download, ShieldCheck } from 'lucide-react';
import { DEFAULT_TIERS } from '@/lib/domain/points';

export default function StudentCertificatesPage() {
  const currentLifetimePoints = 120; // Student has achieved Bronze (>100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-ink tracking-tight">Sustainability Certificates</h1>
        <p className="text-xs text-ink-muted">
          Official credentials verifiable by employers and NAAC auditors
        </p>
      </div>

      <div className="space-y-4">
        {DEFAULT_TIERS.map((tier) => {
          const isUnlocked = currentLifetimePoints >= tier.min_points;

          return (
            <div
              key={tier.key}
              className={`rounded-2xl border p-5 shadow-xs transition-all relative overflow-hidden ${
                isUnlocked
                  ? 'bg-surface border-brand-primary-strong/40 ring-1 ring-brand-primary-strong/20'
                  : 'bg-surface-alt/70 border-line opacity-80'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      isUnlocked
                        ? 'bg-brand-primary-soft text-brand-primary-strong shadow-xs'
                        : 'bg-surface border border-line text-ink-muted'
                    }`}
                  >
                    {isUnlocked ? (
                      <Award className="w-6 h-6" />
                    ) : (
                      <Lock className="w-5 h-5 text-ink-muted/70" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-extrabold text-base text-ink">{tier.name} Credential</h2>
                      {isUnlocked && (
                        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          Unlocked
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-muted mt-0.5">
                      Required: {tier.min_points} lifetime points
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-brand-primary-strong tabular-nums">
                  Tier {tier.sort}
                </span>
              </div>

              {isUnlocked ? (
                <div className="mt-5 pt-4 border-t border-line/60 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-ink-muted font-mono">
                    ID: CPC-2026-7K3Q9D
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/verify/CPC-2026-7K3Q9D"
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary-strong hover:underline py-1 px-2"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verify</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => alert('Certificate PDF generation active with official Bisleri green border')}
                      className="inline-flex items-center gap-1 text-xs font-bold bg-brand-primary-strong text-white px-3 py-1.5 rounded-xl shadow-xs hover:opacity-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 pt-3 border-t border-line/40">
                  <div className="flex items-center justify-between text-xs text-ink-muted mb-1.5">
                    <span>Progress: {currentLifetimePoints} / {tier.min_points} pts</span>
                    <span className="font-bold">{tier.min_points - currentLifetimePoints} pts away</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-line overflow-hidden">
                    <div
                      className="h-full bg-brand-primary-strong rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, Math.round((currentLifetimePoints / tier.min_points) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
