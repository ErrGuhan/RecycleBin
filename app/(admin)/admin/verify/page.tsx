'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Scale,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Check,
} from 'lucide-react';
import { evaluateBatchRatio } from '@/lib/domain/points';
import { createClient } from '@/lib/supabase/client';

interface BinToVerify {
  id: string;
  name: string;
  code: string;
  location: string;
  pending_items: number;
  expected_grams: number;
  oldest_drop: string;
}

export default function AdminVerifyPage() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [binsList, setBinsList] = useState<BinToVerify[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedBin, setSelectedBin] = useState<BinToVerify>({
    id: 'bin-1',
    name: 'Cafeteria Recycling Station A',
    code: '7K3Q9DX2',
    location: 'Campus Food Court, Ground Floor',
    pending_items: 0,
    oldest_drop: 'None',
    expected_grams: 0,
  });

  // Weigh inputs (in kg)
  const [grossKg, setGrossKg] = useState('0.45');
  const [tareKg, setTareKg] = useState('0.05');
  const [decision, setDecision] = useState<'approved' | 'scaled' | null>(null);

  useEffect(() => {
    async function loadBinsToVerify() {
      try {
        const supabase = createClient();
        const { data: dbBins } = await supabase
          .from('bins')
          .select('id, name, code, location_label')
          .eq('status', 'active');

        const { data: pendingEntries } = await supabase
          .from('entries')
          .select('id, bin_id, items, avg_grams_snapshot, created_at')
          .eq('status', 'pending');

        const binMap: Record<string, { items: number; grams: number; oldest: Date }> = {};

        pendingEntries?.forEach((e) => {
          if (!binMap[e.bin_id]) {
            binMap[e.bin_id] = {
              items: 0,
              grams: 0,
              oldest: new Date(e.created_at),
            };
          }
          binMap[e.bin_id].items += e.items || 0;
          binMap[e.bin_id].grams += (e.items || 0) * (e.avg_grams_snapshot || 20);
          const dt = new Date(e.created_at);
          if (dt < binMap[e.bin_id].oldest) {
            binMap[e.bin_id].oldest = dt;
          }
        });

        if (dbBins && dbBins.length > 0) {
          const mapped: BinToVerify[] = dbBins.map((b) => {
            const stats = binMap[b.id] || { items: 0, grams: 0, oldest: new Date() };
            const hoursAgo = Math.max(1, Math.round((Date.now() - stats.oldest.getTime()) / (1000 * 60 * 60)));
            return {
              id: b.id,
              name: b.name,
              code: b.code,
              location: b.location_label,
              pending_items: stats.items,
              expected_grams: stats.grams,
              oldest_drop: stats.items > 0 ? `${hoursAgo}h ago` : 'None',
            };
          });
          setBinsList(mapped);
          if (mapped.length > 0) setSelectedBin(mapped[0]);
        } else {
          // Canonical pilot stations fallback
          const defaultList: BinToVerify[] = [
            {
              id: 'b0000000-0000-0000-0000-000000000001',
              name: 'Cafeteria Recycling Station A',
              code: '7K3Q9DX2',
              location: 'Central Food Court, Ground Floor',
              pending_items: 0,
              expected_grams: 0,
              oldest_drop: 'None',
            },
            {
              id: 'b0000000-0000-0000-0000-000000000002',
              name: 'Library Quad Station',
              code: '9MN42BC8',
              location: 'East Walkway Entrance',
              pending_items: 0,
              expected_grams: 0,
              oldest_drop: 'None',
            },
            {
              id: 'b0000000-0000-0000-0000-000000000003',
              name: 'Science Block Station',
              code: '3P8R5WT4',
              location: 'Chemistry Lab Corridor, 1st Floor',
              pending_items: 0,
              expected_grams: 0,
              oldest_drop: 'None',
            },
          ];
          setBinsList(defaultList);
          setSelectedBin(defaultList[0]);
        }
      } catch (err) {
        console.warn('Could not load bins to verify:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadBinsToVerify();
  }, []);

  // Calculate net grams
  const netGrams = Math.max(0, Math.round((parseFloat(grossKg || '0') - parseFloat(tareKg || '0')) * 1000));
  const expectedGrams = selectedBin.expected_grams || Math.max(1, selectedBin.pending_items * 20);

  // Domain evaluation
  const evaluation = evaluateBatchRatio(netGrams, expectedGrams, 25);
  const ratioPercentage = Math.round(evaluation.ratio * 100);

  // Calibration calculation
  const actualGramsPerItem =
    netGrams > 0 && selectedBin.pending_items > 0
      ? (netGrams / selectedBin.pending_items).toFixed(1)
      : '0';

  const handleFinalize = async (type: 'approved' | 'scaled') => {
    setDecision(type);
    setCurrentStep(4);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      // Create batch
      if (user) {
        const batchId = `batch-${Date.now()}`;
        await supabase.from('verification_batches').insert({
          id: batchId,
          bin_id: selectedBin.id,
          created_by: user.id,
          cutoff_at: new Date().toISOString(),
          weighed_grams: netGrams,
          tare_grams: Math.round(parseFloat(tareKg || '0') * 1000),
          expected_grams: expectedGrams,
          ratio: evaluation.ratio,
          entries_count: selectedBin.pending_items,
          items_count: selectedBin.pending_items,
          decision: type === 'approved' ? 'approve_all' : 'scaled',
          scale_factor: type === 'scaled' ? evaluation.recommendedScaleFactor : 1.0,
          status: 'finalized',
          finalized_at: new Date().toISOString(),
        });

        // Mark entries verified
        await supabase
          .from('entries')
          .update({
            status: 'verified',
            batch_id: batchId,
            decided_at: new Date().toISOString(),
          })
          .eq('bin_id', selectedBin.id)
          .eq('status', 'pending');

        // Update bin last verified timestamp
        await supabase
          .from('bins')
          .update({ last_verified_at: new Date().toISOString() })
          .eq('id', selectedBin.id);
      }
    } catch (err) {
      console.warn('Could not post batch verification to live db:', err);
    }
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
                  ? 'border-brand-primary-strong bg-brand-primary-soft font-bold text-brand-primary-strong shadow-xs'
                  : isDone
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
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
          <h2 className="font-extrabold text-base text-ink">Select Bin Station to Weigh</h2>
          <p className="text-xs text-ink-muted leading-relaxed">
            The weighing moment creates the snapshot cut-off. Pending drops logged prior to this moment are locked and verified in this batch.
          </p>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-ink-muted space-y-2">
              <div className="w-6 h-6 rounded-full border-2 border-brand-primary-strong border-t-transparent animate-spin mx-auto" />
              <p>Loading stations...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {binsList.map((bin) => (
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
          )}
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

          {/* Real-Time Net Calculations */}
          <div className="p-4 rounded-xl bg-surface-alt border border-line space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-ink-muted">Net Weight:</span>
              <span className="font-black text-ink text-sm tabular-nums">{netGrams} grams ({(netGrams / 1000).toFixed(2)} kg)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-ink-muted">Expected Weight ({selectedBin.pending_items} items):</span>
              <span className="font-bold text-ink tabular-nums">{expectedGrams} grams</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 rounded-xl border border-line text-xs font-bold text-ink-muted hover:text-ink"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2.5 rounded-xl bg-brand-primary-strong text-white font-bold text-xs shadow-xs hover:opacity-95"
            >
              Review Verification
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: REVIEW RATIO & DECISION */}
      {currentStep === 3 && (
        <div className="bg-surface rounded-2xl border border-line p-5 shadow-xs space-y-5">
          <h2 className="font-extrabold text-base text-ink">Batch Tolerance Review</h2>

          <div className="p-4 rounded-xl bg-surface-alt border border-line space-y-3">
            <div className="flex justify-between items-center text-sm font-bold">
              <span>Actual vs Expected Ratio:</span>
              <span className="tabular-nums font-black text-brand-primary-strong">{ratioPercentage}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-line overflow-hidden">
              <div
                className="h-full bg-brand-primary-strong transition-all duration-300"
                style={{ width: `${Math.min(100, ratioPercentage)}%` }}
              />
            </div>
            <p className="text-xs text-ink-muted">
              {evaluation.status === 'approve_all'
                ? 'Within ±25% tolerance threshold. Full points can be safely awarded.'
                : 'Outside tolerance threshold. Scale factor recommended to prevent fraud.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleFinalize('approved')}
              className="py-3 px-4 rounded-xl bg-brand-primary-strong text-white font-bold text-xs hover:opacity-95 shadow-sm"
            >
              Approve All in Full (1.0x)
            </button>
            <button
              type="button"
              onClick={() => handleFinalize('scaled')}
              className="py-3 px-4 rounded-xl bg-amber-700 text-white font-bold text-xs hover:opacity-95 shadow-sm"
            >
              Apply Scaled Points ({evaluation.recommendedScaleFactor.toFixed(2)}x)
            </button>
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
          <div className="p-4 rounded-2xl bg-brand-primary-soft border border-brand-primary-strong/20 text-left space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-brand-primary-strong">
              <Sparkles className="w-4 h-4" />
              <span>Pilot Calibration Telemetry</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-ink">
              <div>
                <span className="text-ink-muted font-medium">Actual weight / item:</span>
                <div className="font-extrabold text-sm">{actualGramsPerItem} g</div>
              </div>
              <div>
                <span className="text-ink-muted font-medium">Assumed baseline:</span>
                <div className="font-extrabold text-sm">20.0 g</div>
              </div>
            </div>
            <p className="text-[11px] text-ink-muted">
              After 10 batches, adjust the baseline rate in Settings to match campus physical density.
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
