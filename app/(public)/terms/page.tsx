import React from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-ink">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary-strong hover:underline mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </Link>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-3">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>[LEGAL REVIEW REQUIRED - DRAFT TERMS]</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Terms of Participation</h1>
        <p className="text-xs text-ink-muted mt-1 font-mono">
          Last revised: September 2026
        </p>
      </div>

      <div className="prose prose-sm text-ink-muted space-y-6 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-ink">1. Nature of the Programme</h2>
          <p>
            Campus Plastic Credits is a college-based environmental sustainability programme. Credit points earned through bin drops are recognition tokens and hold no monetary cash value. Points cannot be redeemed for cash or transferred between accounts.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-ink">2. Clean Plastic Drop Guidelines</h2>
          <p>
            Participants agree to deposit only acceptable rigid plastic items (such as PET drinking water and beverage bottles, HDPE containers) that are empty, rinsed of food residues, and uncapped. Depositing garbage, organic waste, metals, or hazardous substances is strictly prohibited and subject to account suspension.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-ink">3. Physical Weighing and Verification</h2>
          <p>
            Entries logged via QR scan remain in a &quot;Pending&quot; state until physical bin collection and scale weighing are conducted by programme staff. The programme reserves the right to scale down points or reject entries if measured batch weights are materially below the count of logged items.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-ink">4. Fair Use Guardrails</h2>
          <p>
            To prevent fraud and maintain integrity:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Single drop limit: Maximum 20 items per submission.</li>
            <li>Daily participant cap: Maximum 40 items per calendar day.</li>
            <li>Bin cooldown: Minimum 30 seconds between successive entries at the same bin.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-ink">5. Revocation of Certificates</h2>
          <p>
            Certificates issued on the basis of fraudulent entries or verified tampering will be immediately marked as &quot;Revoked&quot; in the public verification ledger.
          </p>
        </section>
      </div>
    </div>
  );
}
