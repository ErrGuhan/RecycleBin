import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Calendar, School, Package, ArrowLeft, AlertCircle } from 'lucide-react';
import { TierEmblem } from '@/components/ui/TierEmblem';

interface VerifyPageProps {
  params: Promise<{ no: string }>;
}

export default async function CertificateVerifyPage({ params }: VerifyPageProps) {
  const { no } = await params;
  const certificateNo = decodeURIComponent(no).toUpperCase();

  // Demonstration / Mock Record for Valid certificate format
  const isValidFormat = /^CPC-2026-[A-Z0-9]{6}$/.test(certificateNo);

  // In production, this queries the verify_certificate(no) Postgres RPC
  const mockCertificate = isValidFormat
    ? {
        certificate_no: certificateNo,
        recipient_masked: 'Aditya K.',
        tier_name: 'Silver Tier',
        campus_name: "St. Xavier's College - Main Campus",
        program_name: 'Campus Plastic Credits',
        issued_at: '2026-09-20T10:30:00Z',
        items_at_issue: 112,
        points_at_issue: 560,
        estimated_kg: 1.68,
        status: 'issued' as const,
      }
    : null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div>
        <Link
          href="/verify"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary-strong hover:underline mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Lookup Another Certificate
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
          Certificate Authenticity Record
        </h1>
      </div>

      {mockCertificate ? (
        <div className="bg-surface rounded-2xl border-2 border-brand-primary-strong/30 p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
          {/* Authenticity Watermark Header with ShieldCheck */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-line pb-6">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">
                Official Credential ID
              </span>
              <div className="text-xl sm:text-2xl font-mono font-extrabold text-ink mt-0.5">
                {mockCertificate.certificate_no}
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Authentic &amp; Valid</span>
            </div>
          </div>

          {/* Masked Recipient & Tier Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
            <div className="space-y-1">
              <span className="text-xs text-ink-muted font-medium flex items-center gap-1">
                Recipient (Privacy Masked)
              </span>
              <div className="font-bold text-base text-ink">
                {mockCertificate.recipient_masked}
              </div>
              <p className="text-[11px] text-ink-muted">
                Roll number, email, and phone protected under DPDP
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-ink-muted font-medium flex items-center gap-1">
                <span>Milestone Tier</span>
              </span>
              <div className="flex items-center gap-2">
                <TierEmblem
                  tier={mockCertificate.tier_name.toLowerCase().replace(' tier', '')}
                  size={22}
                  className="w-5 h-5 shrink-0"
                />
                <span className="font-bold text-base text-ink">
                  {mockCertificate.tier_name}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-ink-muted font-medium flex items-center gap-1">
                <School className="w-3.5 h-3.5 text-brand-primary-strong" />
                <span>Partner Campus</span>
              </span>
              <div className="font-medium text-ink">
                {mockCertificate.campus_name}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-ink-muted font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-brand-primary-strong" />
                <span>Issue Date</span>
              </span>
              <div className="font-medium text-ink">
                {new Date(mockCertificate.issued_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-ink-muted font-medium flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-brand-primary-strong" />
                <span>Verified Items Recycled</span>
              </span>
              <div className="font-extrabold text-base text-ink tabular-nums">
                {mockCertificate.items_at_issue} items
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-ink-muted font-medium">
                Estimated Plastic Diverted
              </span>
              <div className="font-extrabold text-base text-ink tabular-nums">
                ~{mockCertificate.estimated_kg} kg
              </div>
            </div>
          </div>

          {/* Audit Verification Note */}
          <div className="pt-6 border-t border-line/60 bg-surface-alt -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-6 text-xs text-ink-muted flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-brand-primary-strong shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-ink">Traceable Audit Verification: </span>
              This certificate was issued directly by the Campus Plastic Credits automated points ledger following physical weighing and verification of collection batches.
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-line p-8 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-700 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-ink">Certificate Record Not Found</h2>
          <p className="text-sm text-ink-muted max-w-md mx-auto">
            No active certificate matches identifier <code>{certificateNo}</code>. Please double-check the code printed below the QR on your certificate document.
          </p>
          <div className="pt-4">
            <Link
              href="/verify"
              className="inline-flex items-center min-h-[44px] px-6 rounded-lg bg-surface border border-line text-ink font-semibold text-sm hover:bg-surface-alt"
            >
              Try Another Number
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
