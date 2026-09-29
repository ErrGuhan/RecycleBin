import React from 'react';
import Link from 'next/link';
import {
  QrCode,
  ArrowRight,
  ShieldCheck,
  Scale,
  Award,
  Sparkles,
  HelpCircle,
  Recycle,
} from 'lucide-react';
import { DEFAULT_TIERS, DEFAULT_PLASTIC_TYPES } from '@/lib/domain/points';
import en from '@/messages/en.json';

export default function LandingPage() {
  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-8 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-primary-soft text-brand-primary-strong text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Campus Plastic Credits Programme</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink max-w-3xl mx-auto leading-[1.15]">
          {en.landing.headline}
        </h1>

        {/* Subhead */}
        <p className="mt-6 text-base sm:text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed">
          {en.landing.subhead}
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/b/7K3Q9DX2"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[48px] px-8 rounded-lg bg-brand-primary-strong text-white font-semibold shadow-sm hover:opacity-95 transition-all text-base focus-visible:outline-2 focus-visible:outline-brand-primary-strong"
          >
            <QrCode className="w-5 h-5" />
            <span>{en.landing.cta_scan}</span>
          </Link>
          <Link
            href="/how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[48px] px-8 rounded-lg bg-surface border border-line text-ink font-semibold hover:bg-surface-alt transition-all text-base"
          >
            <span>{en.landing.cta_how_it_works}</span>
            <ArrowRight className="w-4 h-4 text-ink-muted" />
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 pt-8 border-t border-line/60 grid grid-cols-2 sm:grid-cols-3 gap-4 text-left max-w-3xl mx-auto">
          <div className="flex items-start gap-2.5">
            <Scale className="w-5 h-5 text-brand-primary-strong shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-xs text-ink">Weighed & Verified</div>
              <div className="text-[11px] text-ink-muted">Every point backed by scale measurement</div>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Award className="w-5 h-5 text-brand-primary-strong shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-xs text-ink">Verifiable Certificates</div>
              <div className="text-[11px] text-ink-muted">Official recognition for campus sustainability</div>
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-brand-primary-strong shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-xs text-ink">Append-Only Ledger</div>
              <div className="text-[11px] text-ink-muted">Auditable accounting and NAAC records</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-surface-alt py-16 px-4 sm:px-6 border-y border-line">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-xs uppercase font-bold tracking-wider text-brand-primary-strong">
              Simple 3-Step Journey
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-ink mt-2">
              How Campus Plastic Credits Works
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1: Drop (Recycle) */}
            <div className="bg-surface rounded-xl p-6 border border-line shadow-xs relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-brand-primary-soft text-brand-primary-strong font-extrabold flex items-center justify-center text-base">
                  1
                </div>
                <div className="w-9 h-9 rounded-lg bg-surface-alt flex items-center justify-center text-brand-primary-strong">
                  <Recycle className="w-5 h-5" />
                </div>
              </div>
              <h3 className="font-bold text-base text-ink mb-2">Drop Clean Plastic</h3>
              <p className="text-sm text-ink-muted leading-relaxed">
                {en.landing.step_1_desc}
              </p>
              <div className="mt-4 pt-4 border-t border-line/60 text-xs text-brand-primary-strong font-medium">
                Empty bottles, jars & containers
              </div>
            </div>

            {/* Step 2: Scan (ScanQrCode) */}
            <div className="bg-surface rounded-xl p-6 border border-line shadow-xs relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-brand-primary-soft text-brand-primary-strong font-extrabold flex items-center justify-center text-base">
                  2
                </div>
                <div className="w-9 h-9 rounded-lg bg-surface-alt flex items-center justify-center text-brand-primary-strong">
                  <QrCode className="w-5 h-5" />
                </div>
              </div>
              <h3 className="font-bold text-base text-ink mb-2">Scan & Sign In</h3>
              <p className="text-sm text-ink-muted leading-relaxed">
                {en.landing.step_2_desc}
              </p>
              <div className="mt-4 pt-4 border-t border-line/60 text-xs text-brand-primary-strong font-medium">
                One-tap Google or email code
              </div>
            </div>

            {/* Step 3: Count & Earn (Plus/Minus) */}
            <div className="bg-surface rounded-xl p-6 border border-line shadow-xs relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-brand-primary-soft text-brand-primary-strong font-extrabold flex items-center justify-center text-base">
                  3
                </div>
                <div className="w-9 h-9 rounded-lg bg-surface-alt flex items-center justify-center text-brand-primary-strong">
                  <div className="flex items-center gap-0.5">
                    <span className="text-sm font-black">+</span>
                    <span className="text-sm font-black">/</span>
                    <span className="text-sm font-black">-</span>
                  </div>
                </div>
              </div>
              <h3 className="font-bold text-base text-ink mb-2">Count & Earn</h3>
              <p className="text-sm text-ink-muted leading-relaxed">
                {en.landing.step_3_desc}
              </p>
              <div className="mt-4 pt-4 border-t border-line/60 text-xs text-brand-primary-strong font-medium">
                Points unlock verifiable tiers
              </div>
            </div>
          </div>

          {/* 5-Step Lifecycle Flow Architecture */}
          <div className="mt-12 pt-10 border-t border-line">
            <div className="text-center mb-6">
              <span className="text-xs uppercase font-bold tracking-wider text-ink-muted">
                Complete End-to-End Cycle
              </span>
              <h3 className="text-lg font-bold text-ink mt-1">From Bin Drop to Verified Certificate</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 max-w-4xl mx-auto">
              {/* 1. Teal Entry */}
              <div className="p-4 rounded-xl bg-[#00796B] text-white flex flex-col items-center text-center shadow-xs">
                <span className="text-xs font-bold opacity-80 mb-1">01 • ENTRY</span>
                <span className="text-sm font-bold leading-tight">Scan the bin&apos;s QR</span>
                <span className="text-[11px] opacity-90 mt-1">Sign in once</span>
              </div>

              {/* 2. Amber Pending */}
              <div className="p-4 rounded-xl bg-[#B45309] text-white flex flex-col items-center text-center shadow-xs">
                <span className="text-xs font-bold opacity-80 mb-1">02 • PENDING</span>
                <span className="text-sm font-bold leading-tight">Log how many items</span>
                <span className="text-[11px] opacity-90 mt-1">Saved as pending</span>
              </div>

              {/* 3. Blue Verify */}
              <div className="p-4 rounded-xl bg-[#0B5FA5] text-white flex flex-col items-center text-center shadow-xs">
                <span className="text-xs font-bold opacity-80 mb-1">03 • WEIGHING</span>
                <span className="text-sm font-bold leading-tight">Admin weighs the bin</span>
                <span className="text-[11px] opacity-90 mt-1">Checked against count</span>
              </div>

              {/* 4. Green Points */}
              <div className="p-4 rounded-xl bg-[#005A4E] text-white flex flex-col items-center text-center shadow-xs">
                <span className="text-xs font-bold opacity-80 mb-1">04 • POINTS</span>
                <span className="text-sm font-bold leading-tight">Points added</span>
                <span className="text-[11px] opacity-90 mt-1">Credited to student</span>
              </div>

              {/* 5. Purple Certificate */}
              <div className="p-4 rounded-xl bg-[#6B4C8A] text-white flex flex-col items-center text-center shadow-xs">
                <span className="text-xs font-bold opacity-80 mb-1">05 • REWARDS</span>
                <span className="text-sm font-bold leading-tight">Certificate issued</span>
                <span className="text-[11px] opacity-90 mt-1">At each points tier</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rewards & Tiers Section */}
      <section className="px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-xs uppercase font-bold tracking-wider text-brand-primary-strong">
            Recognition & Rewards
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-ink mt-2">
            Four Certificate Milestone Tiers
          </p>
          <p className="text-sm text-ink-muted mt-2">
            1 point is approximately 3g of clean plastic (~333 points per kg).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {DEFAULT_TIERS.map((tier) => (
            <div
              key={tier.key}
              className="bg-surface border border-line rounded-xl p-5 hover:border-brand-primary-strong transition-all flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Tier {tier.sort}
                  </span>
                  <Award className="w-5 h-5 text-brand-primary-strong" />
                </div>
                <h3 className="text-xl font-bold text-ink">{tier.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-brand-primary-strong tabular-nums">
                    {tier.min_points}
                  </span>
                  <span className="text-xs text-ink-muted font-medium">points</span>
                </div>
                <p className="text-xs text-ink-muted mt-3">
                  Approx. {Math.round(tier.min_points / 5)} small bottles (~
                  {((tier.min_points * 3) / 1000).toFixed(1)} kg)
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-line/60 text-[11px] text-ink-muted">
                Official PDF certificate with verification QR code
              </div>
            </div>
          ))}
        </div>

        {/* Accepted Plastic Types Table */}
        <div className="mt-12 bg-surface-alt rounded-xl p-6 border border-line">
          <h3 className="text-base font-bold text-ink mb-4 flex items-center gap-2">
            <Recycle className="w-4 h-4 text-brand-primary-strong" />
            <span>Eligible Plastic Categories & Starting Credit Rates</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-line text-ink-muted uppercase text-[11px]">
                  <th className="pb-2">Plastic Category</th>
                  <th className="pb-2">Average Weight</th>
                  <th className="pb-2">Points per Item</th>
                  <th className="pb-2">Rate Anchor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/50">
                {DEFAULT_PLASTIC_TYPES.map((type) => (
                  <tr key={type.key}>
                    <td className="py-2.5 font-medium text-ink">{type.label}</td>
                    <td className="py-2.5 text-ink-muted tabular-nums">~{type.avg_grams} g</td>
                    <td className="py-2.5 font-bold text-brand-primary-strong tabular-nums">
                      {type.points_per_item} pts
                    </td>
                    <td className="py-2.5 text-ink-muted text-xs">
                      1 pt / ~{Math.round(type.avg_grams / type.points_per_item)} g
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-surface-alt py-16 px-4 sm:px-6 border-t border-line">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 text-xs uppercase font-bold tracking-wider text-brand-primary-strong mb-2">
              <HelpCircle className="w-4 h-4" />
              <span>Questions & Answers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {en.faq.map((item, idx) => (
              <div
                key={idx}
                className="bg-surface rounded-xl p-5 border border-line shadow-xs space-y-2"
              >
                <h3 className="font-bold text-sm text-ink flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-brand-primary-strong shrink-0 mt-0.5" />
                  <span>{item.q}</span>
                </h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed pl-6">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
