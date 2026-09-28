'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Scale,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Sparkles,
  ChevronRight,
  Check,
} from 'lucide-react';
import { evaluateBatchRatio } from '@/lib/domain/points';

export default function AdminVerifyPage() {
  // Step in the verification flow: 1 (select bin), 2 (weigh), 3 (review), 4 (done)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Selected bin
  const [selectedBin, setSelectedBin] = useState({
    id: 'bin-1',
    name: 'Cafeteria Recycling Station A',
    code: '7K3Q9DX2',
    location: 'Campus Food Court, Ground Floor',
    pending_items: 24,
    oldest_drop: '18 hours ago',
    expected_grams: 480, // 24 items * ~20g avg
  });

  // Weigh inputs (in kg)
  const [grossKg, setGrossKg] = useState('0.45');
  const [tareKg, setTareKg] = useState('0.05');
  const [decision, setDecision] = useState<'approved' | 'scaled' | null>(null);

  // Calculate net grams
  const netGrams = Math.max(0, Math.round((parseFloat(grossKg || '0') - parseFloat(tareKg || '0')) * 1000));
  const expectedGrams = selectedBin.expected_grams;

  // Domain evaluation
  const evaluation = evaluateBatchRatio(netGrams, expectedGrams, 25);
  const ratioPercentage = Math.round(evaluation.ratio * 100);

  // Calibration calculation
  const actualGramsPerItem = netGrams > 0 && selectedBin.pending_items > 0
    ? (netGrams / selectedBin.pending_items).toFixed(1)
    : '0';

  const handleFinalize = (type: 'approved' | 'scaled') => {
    setDecision(type);
    setCurrentStep(4);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-primary-strong mb-1">
            <Scale className="w-4 h-4" />
            <span>Weighing &amp; Cut-Off Engine</span>
          </div>
          <h1 className="text-2xl font-black text-ink tracking-tight">Verify Bin Collection</h1>
        </div>
        <Link
          href="/admin"
          className="text-xs font-bold text-ink-muted hover:text-ink px-3 py-1.5 rounded-lg border border-line"
        >
          Back to Overview
        </Link>
      </div>

      {/* Progress Stepper with Clean Icons */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        {[
          { step: 1, label: 'Pick Bin', icon: MapPin },
          { step: 2, label: 'Weigh Scale', icon: Scale },
          { step: 3, label: 'Review', icon: AlertTriangle },
          { step: 4, label: 'Finalize', icon: CheckCircle2 },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = currentStep === item.step;
          const isDone = currentStep > item.step;

          return (
            <div
              key={item.step}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                isActive
                  ? 'border-brand-primary-strong bg-brand-primary-soft/50 font-bold text-brand-primary-strong shadow-xs'
                  : isDone
                  ? 'border-emerald-200 bg-emerald-50/50 text-emerald-800'
                  : 'border-line bg-surface text-ink-muted'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  isDone
                    ? 'bg-emerald-600 text-white'
                    : isActive
                    ? 'bg-brand-primary-strong text-white'
                    : 'bg-surface-alt text-ink-muted'
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
              </div>
              <span className="text-[11px] truncate">{item.label}</span>
            </div>
          );
        })}
      </div>

      {/* STEP 1: PICK BIN */}
      {currentStep === 1 && (
        <div className="bg-surface rounded-2xl border border-line p-5 shadow-xs space-y-4">
          <h2 className="font-extrabold text-base text-ink">Select Bin to Verify</h2>
          <p className="text-xs text-ink-muted">
            The weighing moment creates the snapshot cut-off. Pending drops before this moment become part of the batch.
          </p>

          <div className="space-y-3">
            {[
              {
                id: 'bin-1',
                name: 'Cafeteria Recycling Station A',
                code: '7K3Q9DX2',
                location: 'Campus Food Court, Ground Floor',
                pending_items: 24,
                expected_grams: 480,
                oldest_drop: '18 hours ago',
              },
              {
                id: 'bin-2',
                name: 'Library Quad Station',
                code: '9MN42BC8',
                location: 'East Entrance Walkway',
                pending_items: 14,
                expected_grams: 280,
                oldest_drop: '1 day ago',
              },
            ].map((bin) => (
              <button
                key={bin.id}
                type="button"
                onClick={() => {
                  setSelectedBin(bin);
                  setCurrentStep(2);
                }}
                className="w-full p-4 rounded-xl border border-line hover:border-brand-primary-strong text-left flex items-center justify-between gap-4 transition-all hover:bg-surface-alt/50 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary-soft text-brand-primary-strong flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-ink group-hover:text-brand-primary-strong">
                      {bin.name}
                    </div>
                    <div className="text-xs text-ink-muted">
                      {bin.location} • Oldest drop: {bin.oldest_drop}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-black bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full tabular-nums">
                    {bin.pending_items} pending
                  </span>
                  <ChevronRight className="w-4 h-4 text-ink-muted" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: WEIGH ON SCALE */}
      {currentStep === 2 && (
        <div className="bg-surface rounded-2xl border border-line p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-brand-primary-strong uppercase">
                Station: {selectedBin.name}
              </span>
              <h2 className="font-extrabold text-base text-ink">Enter Physical Scale Weight</h2>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-surface-alt border border-line">
              {selectedBin.code}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="gross-weight" className="block text-xs font-bold text-ink mb-1.5">
                Gross Scale Weight (kg)
              </label>
              <input
                id="gross-weight"
                type="number"
                step="0.01"
                value={grossKg}
                onChange={(e) => setGrossKg(e.target.value)}
                className="w-full min-h-[48px] px-4 rounded-xl border border-line bg-surface text-ink text-lg font-mono font-bold focus:ring-2 focus:ring-brand-primary-strong"
              />
            </div>

            <div>
              <label htmlFor="tare-weight" className="block text-xs font-bold text-ink mb-1.5">
                Bag/Bin Tare (kg)
              </label>
              <input
                id="tare-weight"
                type="number"
                step="0.01"
                value={tareKg}
                onChange={(e) => setTareKg(e.target.value)}
                className="w-full min-h-[48px] px-4 rounded-xl border border-line bg-surface text-ink text-lg font-mono font-bold focus:ring-2 focus:ring-brand-primary-strong"
              />
            </div>
          </div>

          {/* Computed Net Preview Card */}
          <div className="p-4 rounded-xl bg-surface-alt border border-line flex items-center justify-between text-sm">
            <div>
              <div className="text-xs text-ink-muted">Net Plastic Weight:</div>
              <div className="text-xl font-black text-ink tabular-nums mt-0.5">
                {(netGrams / 1000).toFixed(2)} kg ({netGrams} grams)
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-ink-muted">Expected from {selectedBin.pending_items} items:</div>
              <div className="text-sm font-bold text-ink-muted tabular-nums mt-0.5">
                {(expectedGrams / 1000).toFixed(2)} kg ({expectedGrams} g)
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="text-xs font-semibold text-ink-muted hover:text-ink px-4 py-2"
            >
              Back to Bins
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="min-h-[46px] px-6 rounded-xl bg-brand-primary-strong text-white font-bold text-sm shadow-xs hover:opacity-95 flex items-center gap-2"
            >
              <span>Calculate &amp; Review</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: REVIEW RATIO & DECISION */}
      {currentStep === 3 && (
        <div className="bg-surface rounded-2xl border border-line p-5 shadow-xs space-y-5">
          <div>
            <span className="text-xs font-bold text-ink-muted uppercase">
              Batch Ratio Analysis
            </span>
            <h2 className="font-extrabold text-base text-ink">Expected vs. Weighed Plastic</h2>
          </div>

          {/* Ratio Visual Gauge Bar */}
          <div className="p-4 rounded-xl bg-surface-alt border border-line space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Ratio: Net Weighed / Expected</span>
              <span
                className={`text-sm tabular-nums ${
                  ratioPercentage >= 75
                    ? 'text-emerald-700'
                    : ratioPercentage >= 50
                    ? 'text-amber-700'
                    : 'text-rose-700'
                }`}
              >
                {ratioPercentage}% Match
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all ${
                  ratioPercentage >= 75
                    ? 'bg-emerald-600'
                    : ratioPercentage >= 50
                    ? 'bg-amber-500'
                    : 'bg-rose-600'
                }`}
                style={{ width: `${Math.min(100, ratioPercentage)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-ink-muted">
              <span>0%</span>
              <span className="text-amber-800 font-bold">Tolerance Floor (75%)</span>
              <span>100% Target</span>
            </div>
          </div>

          {/* Status Message Alert */}
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
              evaluation.canApproveAll
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {evaluation.canApproveAll ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0" />
            )}
            <span className="font-medium">{evaluation.message}</span>
          </div>

          {/* Decision Buttons */}
          <div className="pt-2 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: Approve All */}
              <button
                type="button"
                disabled={!evaluation.canApproveAll}
                onClick={() => handleFinalize('approved')}
                className="min-h-[48px] px-4 rounded-xl bg-brand-primary-strong text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs hover:opacity-95 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve All (100% Points)</span>
              </button>

              {/* Option B: Scale Points */}
              <button
                type="button"
                onClick={() => handleFinalize('scaled')}
                className="min-h-[48px] px-4 rounded-xl bg-surface border border-line hover:bg-surface-alt text-ink font-bold text-xs flex items-center justify-center gap-2"
              >
                <TrendingDown className="w-4 h-4 text-amber-700" />
                <span>
                  Scale Points (x{(evaluation.recommendedScaleFactor).toFixed(2)})
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: FINALIZED & CALIBRATION HINT */}
      {currentStep === 4 && (
        <div className="bg-surface rounded-2xl border border-line p-6 shadow-xs text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 text-emerald-700 mx-auto flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-1">
              <span>Decision: {decision === 'scaled' ? 'Points Scaled' : 'Approved in Full'}</span>
            </div>
            <h2 className="text-2xl font-black text-ink">Batch Verified &amp; Finalized!</h2>
            <p className="text-xs text-ink-muted">
              {selectedBin.pending_items} entries moved to verified status. Points appended to the ledger.
            </p>
          </div>

          {/* Calibration Hint */}
          <div className="p-4 rounded-2xl bg-brand-primary-soft/50 border border-brand-primary-strong/20 text-left space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-brand-primary-strong">
              <Sparkles className="w-4 h-4" />
              <span>Pilot Calibration Hint</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-ink">
              <div>
                <span className="text-ink-muted">Actual weight / item:</span>
                <div className="font-extrabold text-sm">{actualGramsPerItem} g</div>
              </div>
              <div>
                <span className="text-ink-muted">Assumed baseline:</span>
                <div className="font-extrabold text-sm">20.0 g</div>
              </div>
            </div>
            <p className="text-[11px] text-ink-muted">
              After 10 batches, adjust the baseline rate in Settings to match campus reality.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setCurrentStep(1);
                setDecision(null);
              }}
              className="min-h-[44px] px-6 rounded-xl bg-surface border border-line font-bold text-xs text-ink hover:bg-surface-alt"
            >
              Verify Next Bin
            </button>
            <Link
              href="/admin"
              className="min-h-[44px] px-6 rounded-xl bg-brand-primary-strong text-white font-bold text-xs flex items-center justify-center"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
