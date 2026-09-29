'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, Download, ShieldCheck, Calendar, School, Package, Sparkles } from 'lucide-react';
import { DEFAULT_TIERS } from '@/lib/domain/points';
import { TierEmblem } from '@/components/ui/TierEmblem';

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
                        ? 'bg-brand-primary-soft shadow-xs'
                        : 'bg-surface border border-line text-ink-muted'
                    }`}
                  >
                    {isUnlocked ? (
                      <TierEmblem tier={tier.key} size={28} className="w-7 h-7" />
                    ) : (
                      <Lock className="w-5 h-5 text-ink-muted/70" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-extrabold text-base text-ink">{tier.name} Credential</h2>
                      {isUnlocked && (
                        /* Small pulsing "New" badge until student views (BUILD_PROMPT.md §8.7) */
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full animate-pulse">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          <span>New</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-muted mt-0.5 tabular-nums">
                      Required: {tier.min_points} lifetime points
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-brand-primary-strong tabular-nums">
                  Tier {tier.sort}
                </span>
              </div>

              {isUnlocked ? (
                <div className="mt-4 pt-3 border-t border-line/60 space-y-3">
                  {/* Small inline icons next to each stat (§8.6 #6) */}
                  <div className="grid grid-cols-3 gap-2 text-[11px] text-ink-muted pt-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <Package className="w-3.5 h-3.5 text-brand-primary-strong shrink-0" />
                      <span className="tabular-nums font-semibold text-ink">24 items</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Calendar className="w-3.5 h-3.5 text-brand-primary-strong shrink-0" />
                      <span>Sep 2026</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <School className="w-3.5 h-3.5 text-brand-primary-strong shrink-0" />
                      <span>Campus</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-line/40 flex items-center justify-between gap-2">
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
                </div>
              ) : (
                <div className="mt-4 pt-3 border-t border-line/40">
                  <div className="flex items-center justify-between text-xs text-ink-muted mb-1.5 tabular-nums">
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
