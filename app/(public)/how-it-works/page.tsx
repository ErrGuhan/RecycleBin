import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      title: 'Collect & Drop Clean Plastic',
      desc: 'Deposit empty, clean PET bottles and rigid plastic containers into marked campus recycling bins. Keeping bottles free of caps and liquids ensures high recycling purity.',
      badge: 'Drop Station',
    },
    {
      num: '02',
      title: 'Scan the Bin QR Code',
      desc: 'Each bin carries a permanent, unique QR code. Point your smartphone camera at the plate to open the drop logging screen instantly. Quick sign-in with Google or email OTP.',
      badge: 'One-Tap Scan',
    },
    {
      num: '03',
      title: 'Log Dropped Items (1-20)',
      desc: 'Enter how many items you dropped using our one-handed stepper. Rates are snapshotted in real-time. If you make a mistake, you have a 5-minute undo window while the entry is pending.',
      badge: 'Instant Snapshot',
    },
    {
      num: '04',
      title: 'Admin Weighs & Verifies the Bin',
      desc: 'On a regular cadence, campus staff weigh the physical contents of the bin. If the scale weight matches the expected weight of logged items within tolerance, the batch is verified.',
      badge: 'Audit & Weight',
    },
    {
      num: '05',
      title: 'Points Credit & Verifiable Certificates',
      desc: 'Verified entries turn into non-expiring credit points in an append-only ledger. When your cumulative points reach milestone tiers (Bronze, Silver, Gold, Platinum), official PDF certificates are issued automatically.',
      badge: 'Recognition',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary-strong hover:underline mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
          How the Campus Plastic Credits System Works
        </h1>
        <p className="mt-3 text-base text-ink-muted max-w-2xl leading-relaxed">
          Designed for audit integrity, simplicity for students, and verifiable documentation for college NAAC accreditation.
        </p>
      </div>

      {/* Step by Step Timeline */}
      <div className="space-y-6">
        {steps.map((step) => (
          <div
            key={step.num}
            className="bg-surface rounded-xl border border-line p-6 shadow-xs flex flex-col sm:flex-row gap-6 items-start"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-primary-soft text-brand-primary-strong font-extrabold text-lg flex items-center justify-center shrink-0">
              {step.num}
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-ink">{step.title}</h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-surface-alt border border-line text-ink-muted">
                  {step.badge}
                </span>
              </div>
              <p className="text-sm text-ink-muted leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Audit & Integrity Callout */}
      <div className="bg-brand-primary-soft/40 border border-brand-primary-strong/20 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-brand-primary-strong font-bold text-base">
            <ShieldCheck className="w-5 h-5" />
            <span>Why Points are &quot;Pending&quot; First</span>
          </div>
          <p className="text-xs text-ink-muted leading-relaxed max-w-xl">
            To ensure fair distribution and prevent inflation, credit points are awarded only after an authorized administrator weighs the physical bin and approves the batch.
          </p>
        </div>
        <Link
          href="/b/7K3Q9DX2"
          className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-lg bg-brand-primary-strong text-white font-semibold text-sm shrink-0 shadow-sm"
        >
          Try Sample Bin
        </Link>
      </div>
    </div>
  );
}
