'use client';

import React, { useState } from 'react';
import {
  Settings,
  Scale,
  Shield,
  Clock,
  Save,
  CheckCircle2,
  X,
} from 'lucide-react';
import { PlasticCategoryIcon } from '@/components/plastic/PlasticCategoryIcon';

interface CategoryRate {
  key: string;
  label: string;
  points: number;
  avgGrams: number;
}

export default function AdminSettingsPage() {
  const [rates, setRates] = useState<CategoryRate[]>([
    { key: 'pet_small', label: 'Small Bottle (<750ml)', points: 5, avgGrams: 18 },
    { key: 'pet_medium', label: 'Medium Bottle (1L-1.5L)', points: 8, avgGrams: 28 },
    { key: 'pet_large', label: 'Large Bottle (2L+)', points: 15, avgGrams: 52 },
    { key: 'rigid_other', label: 'Other Rigid Container', points: 10, avgGrams: 45 },
  ]);

  const [tolerancePct, setTolerancePct] = useState(15);
  const [dailyCap, setDailyCap] = useState(30);
  const [undoWindowMins, setUndoWindowMins] = useState(5);
  const [notification, setNotification] = useState<string | null>(null);

  const showBanner = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRateChange = (key: string, field: 'points' | 'avgGrams', val: number) => {
    setRates(
      rates.map((r) => (r.key === key ? { ...r, [field]: Math.max(1, val) } : r))
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showBanner('System calibration and operational parameters updated successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      {notification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-brand-primary-soft text-brand-primary-strong flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-ink tracking-tight">System Settings</h1>
              <p className="text-xs text-ink-muted">
                Calibrate plastic weight baselines, batch tolerances, and anti-fraud caps
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary-strong text-white font-bold text-xs shadow-xs hover:opacity-95"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Snapshot Rule Notice */}
      <div className="p-4 rounded-2xl bg-brand-primary-soft/50 border border-brand-primary-strong/30 flex items-start gap-3 text-xs text-ink">
        <Shield className="w-5 h-5 text-brand-primary-strong shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Rate Snapshot Integrity Rule:</span>
          <p className="text-ink-muted mt-0.5">
            Updating points or weight baselines here applies exclusively to FUTURE student drop
            entries. Existing pending or verified entries retain their immutable snapshot taken at the
            exact moment of submission.
          </p>
        </div>
      </div>

      {/* Rate Calibration Cards */}
      <div className="bg-surface rounded-2xl border border-line p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-brand-primary-strong" />
          <h2 className="font-extrabold text-base text-ink">Plastic Type Calibration</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rates.map((rate) => (
            <div
              key={rate.key}
              className="p-4 rounded-2xl bg-surface-alt/70 border border-line/70 flex flex-col justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface border border-line flex items-center justify-center text-brand-primary-strong shrink-0">
                  <PlasticCategoryIcon typeKey={rate.key} className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-ink">{rate.label}</h3>
                  <span className="text-[11px] text-ink-muted font-mono">{rate.key}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-line/60 text-xs">
                <div>
                  <label className="font-semibold text-ink-muted block mb-1">Points per Item</label>
                  <input
                    type="number"
                    min="1"
                    value={rate.points}
                    onChange={(e) =>
                      handleRateChange(rate.key, 'points', parseInt(e.target.value) || 1)
                    }
                    className="w-full px-3 py-1.5 rounded-xl border border-line bg-surface font-bold text-ink text-sm focus-visible:outline-2 focus-visible:outline-brand-primary-strong tabular-nums"
                  />
                </div>

                <div>
                  <label className="font-semibold text-ink-muted block mb-1">Baseline Weight (g)</label>
                  <input
                    type="number"
                    min="1"
                    value={rate.avgGrams}
                    onChange={(e) =>
                      handleRateChange(rate.key, 'avgGrams', parseInt(e.target.value) || 1)
                    }
                    className="w-full px-3 py-1.5 rounded-xl border border-line bg-surface font-bold text-ink text-sm focus-visible:outline-2 focus-visible:outline-brand-primary-strong tabular-nums"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Batch Verification Tolerance */}
      <div className="bg-surface rounded-2xl border border-line p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-brand-primary-strong" />
          <h2 className="font-extrabold text-base text-ink">Weighing Verification Tolerance</h2>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-ink">Permissible Discrepancy Margin:</span>
            <span className="text-base font-black text-brand-primary-strong tabular-nums">
              ±{tolerancePct}%
            </span>
          </div>

          <input
            type="range"
            min="5"
            max="30"
            step="1"
            value={tolerancePct}
            onChange={(e) => setTolerancePct(parseInt(e.target.value))}
            className="w-full accent-brand-primary-strong"
          />

          <div className="flex justify-between text-[11px] text-ink-muted font-mono">
            <span>±5% (Strict)</span>
            <span>±15% (Recommended for Campus Pilots)</span>
            <span>±30% (Loose)</span>
          </div>

          <p className="text-[11px] text-ink-muted">
            Batches with ratio between{' '}
            <span className="font-bold font-mono">{(1 - tolerancePct / 100).toFixed(2)}</span> and{' '}
            <span className="font-bold font-mono">{(1 + tolerancePct / 100).toFixed(2)}</span> will
            be marked <strong>Within Tolerance</strong> for 1-click verification. Outside this range,
            an admin justification reason is required.
          </p>
        </div>
      </div>

      {/* Anti-Fraud & Operational Limits */}
      <div className="bg-surface rounded-2xl border border-line p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-brand-primary-strong" />
          <h2 className="font-extrabold text-base text-ink">Anti-Fraud &amp; Drop Limits</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-surface-alt/70 border border-line">
            <label className="font-bold text-ink block mb-1">Daily Cap per Student</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="5"
                max="100"
                value={dailyCap}
                onChange={(e) => setDailyCap(parseInt(e.target.value) || 30)}
                className="w-24 px-3 py-1.5 rounded-xl border border-line bg-surface font-bold text-ink text-sm tabular-nums"
              />
              <span className="text-ink-muted">items per day</span>
            </div>
            <p className="text-[11px] text-ink-muted mt-2">
              Prevents bulk commercial waste dumping by unauthorized third parties.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-alt/70 border border-line">
            <label className="font-bold text-ink block mb-1">Student Undo Grace Window</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="15"
                value={undoWindowMins}
                onChange={(e) => setUndoWindowMins(parseInt(e.target.value) || 5)}
                className="w-24 px-3 py-1.5 rounded-xl border border-line bg-surface font-bold text-ink text-sm tabular-nums"
              />
              <span className="text-ink-muted">minutes</span>
            </div>
            <p className="text-[11px] text-ink-muted mt-2">
              Students can cancel mistake submissions only within this window while unbatched.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
