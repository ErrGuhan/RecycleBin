'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function VerifySearchPage() {
  const router = useRouter();
  const [certNo, setCertNo] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = certNo.trim().toUpperCase();
    if (trimmed) {
      router.push(`/verify/${trimmed}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-8">
      <div className="w-16 h-16 rounded-2xl bg-brand-primary-soft text-brand-primary-strong mx-auto flex items-center justify-center">
        <ShieldCheck className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-ink tracking-tight">
          Verify a Sustainability Certificate
        </h1>
        <p className="text-sm text-ink-muted max-w-md mx-auto">
          Enter the unique certificate number found on any official Campus Plastic Credits PDF to confirm its authenticity.
        </p>
      </div>

      <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="e.g. CPC-2026-7K3Q9D"
            value={certNo}
            onChange={(e) => setCertNo(e.target.value)}
            className="w-full min-h-[48px] px-4 rounded-lg border border-line bg-surface text-ink text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-brand-primary-strong"
            required
          />
        </div>
        <button
          type="submit"
          className="min-h-[48px] px-6 rounded-lg bg-brand-primary-strong text-white font-semibold text-sm flex items-center gap-2 hover:opacity-95 shadow-sm"
        >
          <span>Verify</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="pt-8 border-t border-line/60 text-xs text-ink-muted">
        <p>
          Privacy notice: In compliance with DPDP standards, public verification displays only the recipient&apos;s first name, last initial, college campus, tier, and verified item count.
        </p>
      </div>
    </div>
  );
}
