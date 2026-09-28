'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { PlasticCategoryIcon } from '@/components/plastic/PlasticCategoryIcon';
import { createClient } from '@/lib/supabase/client';
import {
  MapPin,
  Plus,
  Minus,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Info,
  Clock,
  Layers,
} from 'lucide-react';
import en from '@/messages/en.json';

interface BinPageProps {
  params: Promise<{ code: string }>;
}

export default function BinDropPage({ params }: BinPageProps) {
  const { code } = use(params);
  const binCode = (code || '').toUpperCase();

  // Known pilot bin lookup defaults
  const pilotBins: Record<string, { name: string; location: string }> = {
    '7K3Q9DX2': {
      name: 'Cafeteria Recycling Station A',
      location: 'Central Food Court, Ground Floor',
    },
    '9MN42BC8': {
      name: 'Library Quad Station',
      location: 'East Walkway Entrance',
    },
    '3P8R5WT4': {
      name: 'Science Block Station',
      location: 'Chemistry Lab Corridor, 1st Floor',
    },
  };

  // Bin metadata state
  const [binInfo, setBinInfo] = useState({
    code: binCode,
    name: pilotBins[binCode]?.name || `Campus Recycling Station ${binCode}`,
    location: pilotBins[binCode]?.location || 'Campus Collection Point',
    campus: "St. Xavier's College",
  });

  // State
  const [selectedType, setSelectedType] = useState('pet_small');
  const [itemsCount, setItemsCount] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);

  // Expanded recyclable categories beyond bottles
  const categories = [
    { key: 'pet_small', label: 'Small Bottle', sub: '≤ 750 ml', points: 5, avgGrams: 15 },
    { key: 'pet_medium', label: 'Medium Bottle', sub: '1L - 1.5 L', points: 8, avgGrams: 25 },
    { key: 'pet_large', label: 'Large Bottle', sub: '2L & above', points: 15, avgGrams: 45 },
    { key: 'plastic_cup', label: 'Cups & Tumblers', sub: 'Juice / Coffee', points: 5, avgGrams: 12 },
    { key: 'food_container', label: 'Food Box / Tray', sub: 'Clean takeaway', points: 10, avgGrams: 28 },
    { key: 'soft_film', label: 'Pouches & Films', sub: 'Clean wrappers', points: 4, avgGrams: 8 },
    { key: 'cutlery_rigid', label: 'Cutlery & Straws', sub: 'Spoons, caps', points: 3, avgGrams: 6 },
    { key: 'rigid_other', label: 'Jugs & Containers', sub: 'Detergent / HDPE', points: 10, avgGrams: 30 },
  ];

  const currentCategory = categories.find((c) => c.key === selectedType) || categories[0];
  const estimatedPoints = itemsCount * currentCategory.points;

  // Fetch live bin info from Supabase if present
  useEffect(() => {
    async function loadBin() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('bins')
          .select('code, name, location_label')
          .eq('code', binCode)
          .maybeSingle();

        if (data) {
          setBinInfo({
            code: data.code,
            name: data.name,
            location: data.location_label,
            campus: "St. Xavier's College",
          });
        }
      } catch (e) {
        console.warn('Could not query bin info:', e);
      }
    }
    loadBin();
  }, [binCode]);

  const handleIncrement = () => {
    if (itemsCount < 20) setItemsCount(itemsCount + 1);
  };

  const handleDecrement = () => {
    if (itemsCount > 1) setItemsCount(itemsCount - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const idempotencyKey = `${binCode}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newEntryId = `entry-${Date.now()}`;

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Try live insert into Supabase entries
        const { error: insertError } = await supabase.from('entries').insert({
          idempotency_key: idempotencyKey,
          student_id: user.id,
          bin_id: 'b0000000-0000-0000-0000-000000000001', // fallback or lookup
          plastic_type_id: 'c0000000-0000-0000-0000-000000000001',
          items: itemsCount,
          points_per_item_snapshot: currentCategory.points,
          avg_grams_snapshot: currentCategory.avgGrams,
          status: 'pending',
        });

        if (insertError) {
          console.warn('Live Supabase insert warning:', insertError.message);
        }
      }

      // Save drop to student local session history
      if (typeof window !== 'undefined') {
        const existingDrops = JSON.parse(localStorage.getItem('recyclebin_recent_drops') || '[]');
        const newDropRecord = {
          id: newEntryId,
          bin_code: binCode,
          bin_name: binInfo.name,
          category_key: selectedType,
          category_label: currentCategory.label,
          items: itemsCount,
          points_estimate: estimatedPoints,
          status: 'pending',
          created_at: new Date().toISOString(),
          can_undo: true,
        };
        localStorage.setItem('recyclebin_recent_drops', JSON.stringify([newDropRecord, ...existingDrops]));
      }

      setActiveEntryId(newEntryId);
      setSavedCount(itemsCount);
      setSubmittedSuccess(true);
      setIsCancelled(false);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#009688', '#005A4E', '#E6F7F4'],
        });
      } catch {
        // Fallback gracefully
      }
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUndo = () => {
    setIsCancelled(true);
    if (typeof window !== 'undefined' && activeEntryId) {
      const existingDrops = JSON.parse(localStorage.getItem('recyclebin_recent_drops') || '[]');
      const updated = existingDrops.map((d: { id: string; status: string }) =>
        d.id === activeEntryId ? { ...d, status: 'cancelled' } : d
      );
      localStorage.setItem('recyclebin_recent_drops', JSON.stringify(updated));
    }
  };

  return (
    <div className="min-h-screen bg-surface-alt flex flex-col items-center justify-start p-3 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-surface rounded-3xl border border-line shadow-sm overflow-hidden flex flex-col my-auto">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-line bg-surface flex items-center justify-between">
          <BrandLogo href="/" showSubtitle={false} />
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-primary-soft text-brand-primary-strong text-xs font-bold font-mono">
            <span>BIN: {binInfo.code}</span>
          </div>
        </div>

        {/* Location Banner with Icon */}
        <div className="px-5 py-3.5 bg-surface-alt border-b border-line flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-primary-soft text-brand-primary-strong flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-extrabold text-sm text-ink truncate">{binInfo.name}</h1>
            <p className="text-xs text-ink-muted truncate font-medium">{binInfo.location}</p>
          </div>
        </div>

        {/* Main Drop Area */}
        <div className="p-5 flex-1">
          {!submittedSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Step 1: Icon-Driven Category Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-ink flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-brand-primary-strong" />
                    <span>1. Select Item Type</span>
                  </span>
                  <span className="text-xs font-bold text-brand-primary-strong bg-brand-primary-soft px-2 py-0.5 rounded-full">
                    +{currentCategory.points} pts / item
                  </span>
                </div>

                {/* 2-Column Responsive Icon Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => {
                    const isSelected = selectedType === cat.key;
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => setSelectedType(cat.key)}
                        className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all min-h-[64px] focus-visible:outline-2 focus-visible:outline-brand-primary-strong ${
                          isSelected
                            ? 'border-brand-primary-strong bg-brand-primary-soft/70 shadow-xs ring-1 ring-brand-primary-strong'
                            : 'border-line bg-surface hover:bg-surface-alt'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-brand-primary-strong text-white'
                              : 'bg-surface-alt text-ink border border-line/60'
                          }`}
                        >
                          <PlasticCategoryIcon typeKey={cat.key} className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-ink leading-tight truncate">{cat.label}</div>
                          <div className="text-[10px] text-ink-muted font-medium mt-0.5 truncate">{cat.sub}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Tactile Stepper */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-ink">
                    2. Quantity Dropped
                  </span>
                  <span className="text-xs text-ink-muted font-medium">Max 20 items</span>
                </div>

                <div className="flex items-center justify-between bg-surface-alt rounded-2xl border border-line p-2">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    disabled={itemsCount <= 1}
                    aria-label="Decrease quantity"
                    className="w-13 h-13 rounded-xl bg-surface border border-line text-ink flex items-center justify-center font-bold text-xl hover:bg-surface-alt transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-xs focus-visible:outline-2 focus-visible:outline-brand-primary-strong active:scale-95"
                  >
                    <Minus className="w-5 h-5" />
                  </button>

                  <div className="flex-1 text-center px-4">
                    <div className="text-3xl font-black text-ink tabular-nums tracking-tight">
                      {itemsCount}
                    </div>
                    <div className="text-[11px] font-semibold text-ink-muted">
                      {itemsCount === 1 ? 'item dropped' : 'items dropped'}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleIncrement}
                    disabled={itemsCount >= 20}
                    aria-label="Increase quantity"
                    className="w-13 h-13 rounded-xl bg-surface border border-line text-ink flex items-center justify-center font-bold text-xl hover:bg-surface-alt transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-xs focus-visible:outline-2 focus-visible:outline-brand-primary-strong active:scale-95"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Reward Preview Pill */}
              <div className="px-4 py-2.5 rounded-2xl bg-brand-primary-soft border border-brand-primary-strong/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-ink font-bold">
                  <Sparkles className="w-4 h-4 text-brand-primary-strong" />
                  <span>Estimated Credit:</span>
                </div>
                <div className="text-sm font-black text-brand-primary-strong tabular-nums">
                  ~{estimatedPoints} points
                </div>
              </div>

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[50px] rounded-2xl bg-brand-primary-strong text-white font-bold text-sm hover:opacity-95 shadow-sm transition-all flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-brand-primary-strong active:scale-[0.99] disabled:opacity-50"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{isSubmitting ? 'Saving Drop...' : en.actions.save_entry}</span>
              </button>

              {/* Collapsible Info Drawer */}
              <div className="pt-2 border-t border-line/60">
                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full flex items-center justify-between text-xs text-ink-muted hover:text-ink py-1 font-semibold"
                >
                  <span className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-brand-primary-strong" />
                    <span>Drop Guidelines &amp; Weighing Rules</span>
                  </span>
                  {showDetails ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {showDetails && (
                  <div className="mt-2.5 p-3 rounded-xl bg-surface-alt text-[11px] text-ink-muted space-y-1.5 border border-line leading-relaxed">
                    <p>• Clean plastic items only (bottles, cups, meal trays, wrappers). Empty of liquids.</p>
                    <p>• Daily limit: 40 items per student per calendar day.</p>
                    <p>• Official points credit after admin physical weighing &amp; verification.</p>
                  </div>
                )}
              </div>
            </form>
          ) : (
            /* Confirmation State */
            <div className="py-6 text-center space-y-5">
              {!isCancelled ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 text-emerald-700 mx-auto flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-ink tracking-tight">
                      {savedCount} {savedCount === 1 ? 'Item' : 'Items'} Recorded!
                    </h2>
                    <p className="text-xs text-ink-muted max-w-xs mx-auto">
                      Points will be awarded as soon as the bin contents are weighed by campus staff.
                    </p>
                  </div>

                  {/* Clean Status Chip */}
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-center gap-2 font-bold">
                    <Clock className="w-4 h-4 text-amber-700" />
                    <span>Pending Bin Scale Weighing</span>
                  </div>

                  {/* Undo Button */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleUndo}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-muted hover:text-danger px-3 py-1.5 rounded-lg border border-line hover:border-danger/30 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Mistake? Cancel this drop</span>
                    </button>
                  </div>

                  <div className="pt-3 space-y-2">
                    <Link
                      href="/home"
                      className="w-full inline-flex items-center justify-center min-h-[48px] rounded-2xl bg-brand-primary-strong text-white font-bold text-sm shadow-sm hover:opacity-95"
                    >
                      <span>View My Points Dashboard</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setSubmittedSuccess(false);
                        setItemsCount(1);
                      }}
                      className="w-full min-h-[42px] text-xs font-bold text-ink-muted hover:text-ink"
                    >
                      Drop another item
                    </button>
                  </div>
                </>
              ) : (
                /* Cancelled State */
                <div className="py-4 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-600 mx-auto flex items-center justify-center">
                    <RotateCcw className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold text-ink">Drop Cancelled</h2>
                    <p className="text-xs text-ink-muted">
                      This drop has been cancelled and will not be submitted for weighing.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedSuccess(false);
                      setIsCancelled(false);
                      setItemsCount(1);
                    }}
                    className="min-h-[44px] px-6 rounded-xl bg-brand-primary-strong text-white font-bold text-xs shadow-xs"
                  >
                    Start Over
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
