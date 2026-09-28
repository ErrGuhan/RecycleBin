'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { PlasticCategoryIcon } from '@/components/plastic/PlasticCategoryIcon';
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
} from 'lucide-react';
import en from '@/messages/en.json';

interface BinPageProps {
  params: Promise<{ code: string }>;
}

export default function BinDropPage({ params }: BinPageProps) {
  const { code } = use(params);
  const binCode = (code || '').toUpperCase();

  // Bin metadata
  const binInfo = {
    code: binCode,
    name: 'Cafeteria Recycling Station A',
    location: 'Central Campus Food Court',
    campus: "St. Xavier's College",
  };

  // State
  const [selectedType, setSelectedType] = useState('pet_small');
  const [itemsCount, setItemsCount] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

  // Simplified friendly categories
  const categories = [
    { key: 'pet_small', label: 'Small Bottle', sub: 'Up to 750ml', points: 5 },
    { key: 'pet_medium', label: 'Medium Bottle', sub: '1L - 1.5L', points: 8 },
    { key: 'pet_large', label: 'Large Bottle', sub: '2L & above', points: 15 },
    { key: 'rigid_other', label: 'Container / Jug', sub: 'Hard plastic', points: 10 },
  ];

  const currentCategory = categories.find((c) => c.key === selectedType) || categories[0];
  const estimatedPoints = itemsCount * currentCategory.points;

  const handleIncrement = () => {
    if (itemsCount < 20) setItemsCount(itemsCount + 1);
  };

  const handleDecrement = () => {
    if (itemsCount > 1) setItemsCount(itemsCount - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const idempotencyKey = `${binCode}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    if (process.env.NODE_ENV === 'development') {
      console.log('Submission key:', idempotencyKey);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSavedCount(itemsCount);
      setSubmittedSuccess(true);
      setIsCancelled(false);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#00B3A1', '#00796B', '#E0F5F2'],
        });
      } catch {
        // Fallback gracefully if canvas is blocked
      }
    }, 450);
  };

  const handleUndo = () => {
    setIsCancelled(true);
  };

  return (
    <div className="min-h-screen bg-surface-alt flex flex-col items-center justify-start p-3 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-surface rounded-3xl border border-line shadow-sm overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-line bg-surface flex items-center justify-between">
          <BrandLogo href="/" showSubtitle={false} />
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-primary-soft text-brand-primary-strong text-xs font-bold font-mono">
            <span>BIN: {binInfo.code}</span>
          </div>
        </div>

        {/* Location Banner with Icon */}
        <div className="px-5 py-3.5 bg-surface-alt border-b border-line flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-primary-soft text-brand-primary-strong flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-sm text-ink truncate">{binInfo.name}</h1>
            <p className="text-xs text-ink-muted truncate">{binInfo.location}</p>
          </div>
        </div>

        {/* Flow Content */}
        <div className="p-5 flex-1">
          {!submittedSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Visual Icon Selection Grid */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-ink-muted">
                    1. Tap Item Type
                  </span>
                  <span className="text-xs font-semibold text-brand-primary-strong">
                    +{currentCategory.points} pts / item
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {categories.map((cat) => {
                    const isSelected = selectedType === cat.key;
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => setSelectedType(cat.key)}
                        className={`p-3 rounded-2xl border text-left flex flex-col items-center justify-center text-center gap-2 transition-all min-h-[96px] focus-visible:outline-2 focus-visible:outline-brand-primary-strong ${
                          isSelected
                            ? 'border-brand-primary-strong bg-brand-primary-soft/60 shadow-xs ring-1 ring-brand-primary-strong'
                            : 'border-line bg-surface hover:bg-surface-alt hover:border-line/80'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-brand-primary-strong text-white'
                              : 'bg-surface-alt text-ink-muted'
                          }`}
                        >
                          <PlasticCategoryIcon typeKey={cat.key} className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-ink leading-tight">{cat.label}</div>
                          <div className="text-[10px] text-ink-muted mt-0.5">{cat.sub}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Tactile Counter Stepper */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-ink-muted">
                    2. How Many Dropped?
                  </span>
                  <span className="text-xs text-ink-muted font-medium">Max 20</span>
                </div>

                <div className="flex items-center justify-between bg-surface-alt rounded-2xl border border-line p-2">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    disabled={itemsCount <= 1}
                    aria-label="Decrease quantity"
                    className="w-14 h-14 rounded-xl bg-surface border border-line text-ink flex items-center justify-center font-bold text-xl hover:bg-surface-alt transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-xs focus-visible:outline-2 focus-visible:outline-brand-primary-strong active:scale-95"
                  >
                    <Minus className="w-6 h-6" />
                  </button>

                  <div className="flex-1 text-center px-4">
                    <div className="text-4xl font-black text-ink tabular-nums tracking-tight">
                      {itemsCount}
                    </div>
                    <div className="text-xs font-medium text-ink-muted">
                      {itemsCount === 1 ? 'bottle dropped' : 'bottles dropped'}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleIncrement}
                    disabled={itemsCount >= 20}
                    aria-label="Increase quantity"
                    className="w-14 h-14 rounded-xl bg-surface border border-line text-ink flex items-center justify-center font-bold text-xl hover:bg-surface-alt transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-xs focus-visible:outline-2 focus-visible:outline-brand-primary-strong active:scale-95"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Reward Preview Pill */}
              <div className="px-4 py-3 rounded-2xl bg-brand-primary-soft/50 border border-brand-primary-strong/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-ink font-medium">
                  <Sparkles className="w-4 h-4 text-brand-primary-strong" />
                  <span>Credits to receive:</span>
                </div>
                <div className="text-sm font-extrabold text-brand-primary-strong tabular-nums">
                  ~{estimatedPoints} points
                </div>
              </div>

              {/* Big Primary Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[54px] rounded-2xl bg-brand-primary-strong text-white font-bold text-base hover:opacity-95 shadow-sm transition-all flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-brand-primary-strong active:scale-[0.99] disabled:opacity-50"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{isSubmitting ? 'Saving...' : en.actions.save_entry}</span>
              </button>

              {/* Hidden Intricate Details Disclosure */}
              <div className="pt-2 border-t border-line/60">
                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full flex items-center justify-between text-xs text-ink-muted hover:text-ink py-1 font-medium"
                >
                  <span className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <span>Drop Guidelines &amp; Audit Info</span>
                  </span>
                  {showDetails ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {showDetails && (
                  <div className="mt-2.5 p-3 rounded-xl bg-surface-alt text-[11px] text-ink-muted space-y-1.5 border border-line leading-relaxed">
                    <p>• Clean, empty bottles only. Caps and liquids removed.</p>
                    <p>• Daily limit: 40 items per student per calendar day.</p>
                    <p>• Weight verification: Admin scale is the source of truth.</p>
                  </div>
                )}
              </div>
            </form>
          ) : (
            /* Clean Confirmation State */
            <div className="py-6 text-center space-y-5">
              {!isCancelled ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="text-2xl font-black text-ink tracking-tight">
                      {savedCount} {savedCount === 1 ? 'Item' : 'Items'} Saved!
                    </h2>
                    <p className="text-xs text-ink-muted max-w-xs mx-auto">
                      Points are added automatically once the bin is weighed and verified.
                    </p>
                  </div>

                  {/* Clean Status Chip */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-center justify-center gap-2 font-medium">
                    <Clock className="w-4 h-4 text-amber-700" />
                    <span>Pending Bin Scale Weighing</span>
                  </div>

                  {/* Undo Button */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleUndo}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-danger px-3 py-1.5 rounded-lg border border-line hover:border-danger/30 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Mistake? Cancel this entry</span>
                    </button>
                  </div>

                  <div className="pt-4 space-y-2">
                    <Link
                      href="/home"
                      className="w-full inline-flex items-center justify-center min-h-[50px] rounded-2xl bg-brand-primary-strong text-white font-bold text-sm shadow-sm hover:opacity-95"
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
                      className="w-full min-h-[44px] text-xs font-semibold text-ink-muted hover:text-ink"
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
                    <h2 className="text-lg font-bold text-ink">Entry Cancelled</h2>
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
                    className="min-h-[44px] px-6 rounded-xl bg-brand-primary-strong text-white font-semibold text-xs shadow-xs"
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
