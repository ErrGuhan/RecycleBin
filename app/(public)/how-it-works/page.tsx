import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ShieldCheck,
  ScanQrCode,
  Clock,
  Weight,
  CheckCircle2,
  Award,
} from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      title: 'Scan the Bin QR & Sign In',
      desc: 'Each bin carries a permanent, unique QR code. Point your smartphone camera at the plate to open the drop logging screen instantly. Quick sign-in with Google or email OTP.',
      badge: '01 • Entry',
      icon: ScanQrCode,
      colorClass: 'bg-[#00796B] text-white',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    {
      num: '02',
      title: 'Log How Many Items (Saved as Pending)',
      desc: 'Enter how many items you dropped using our one-handed stepper (1-20). Rates are snapshotted in real-time. Entries remain pending until bin weighing.',
      badge: '02 • Pending',
      icon: Clock,
      colorClass: 'bg-[#B45309] text-white',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      num: '03',
      title: 'Admin Weighs the Bin',
      desc: 'On a regular cadence, campus staff weigh the physical contents of the bin. The scale net weight is verified against the count ratio before approval.',
      badge: '03 • Verification',
      icon: Weight,
      colorClass: 'bg-[#0B5FA5] text-white',
      badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
    },
    {
      num: '04',
      title: 'Points Added to Student Balance',
      desc: 'Verified entries turn into non-expiring credit points in an append-only ledger. Points are permanently credited to your campus account.',
      badge: '04 • Points',
      icon: CheckCircle2,
      colorClass: 'bg-[#005A4E] text-white',
      badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
    },
    {
      num: '05',
      title: 'Certificate Issued at Each Tier',
      desc: 'When cumulative points reach milestone tiers (Bronze, Silver, Gold, Platinum), official verifiable PDF certificates are generated automatically.',
      badge: '05 • Certificates',
      icon: Award,
      colorClass: 'bg-[#6B4C8A] text-white',
      badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
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
          The 5-step lifecycle ensuring audit integrity, transparency for students, and verifiable documentation for college sustainability records.
        </p>
      </div>

      {/* Step by Step Timeline */}
      <div className="space-y-6">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className="bg-surface rounded-xl border border-line p-6 shadow-xs flex flex-col sm:flex-row gap-6 items-start"
            >
              <div className={`w-12 h-12 rounded-xl ${step.colorClass} font-extrabold text-base flex items-center justify-center shrink-0 shadow-xs`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-ink">{step.title}</h2>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${step.badgeClass}`}>
                    {step.badge}
                  </span>
                </div>
                <p className="text-sm text-ink-muted leading-relaxed">{step.desc}</p>
              </div>
            </div>
          );
        })}
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
