import React from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export default function PrivacyPage() {
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
          <span>[LEGAL REVIEW REQUIRED - DRAFT POLICY]</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Privacy Notice</h1>
        <p className="text-xs text-ink-muted mt-1 font-mono">
          Last revised: September 2026 • DPDP Compliance Draft
        </p>
      </div>

      <div className="prose prose-sm text-ink-muted space-y-6">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-ink">1. Purpose and Data Controller</h2>
          <p className="text-sm leading-relaxed">
            The Campus Plastic Credits portal is operated in partnership with Bisleri to incentivize and audit campus plastic recycling. This notice describes how we process your personal data in accordance with the Digital Personal Data Protection (DPDP) standards.
          </p>
          <p className="text-xs italic bg-surface-alt p-3 rounded border border-line">
            [CLIENT TO CONFIRM: Data fiduciary entity name, registered office address, and Data Protection Officer contact details].
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-ink">2. Itemized Data Collection &amp; Purpose Specification</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-line rounded-lg">
              <thead className="bg-surface-alt border-b border-line text-ink font-semibold">
                <tr>
                  <th className="p-3">Data Field</th>
                  <th className="p-3">Purpose</th>
                  <th className="p-3">Requirement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                <tr>
                  <td className="p-3 font-medium text-ink">Full Name</td>
                  <td className="p-3">Printed on milestone sustainability certificates</td>
                  <td className="p-3">Mandatory</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-ink">College Roll Number</td>
                  <td className="p-3">Campus identity verification and NAAC records</td>
                  <td className="p-3">Mandatory</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-ink">Department &amp; Year</td>
                  <td className="p-3">Campus cohort analytics and certificate credentialing</td>
                  <td className="p-3">Mandatory</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-ink">Email Address</td>
                  <td className="p-3">Account authentication, security alerts, magic links</td>
                  <td className="p-3">Mandatory</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-ink">Phone Number</td>
                  <td className="p-3">Operational inquiries regarding flagged drop batches</td>
                  <td className="p-3 text-ink-muted">Optional</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-ink">GPS Location (at drop)</td>
                  <td className="p-3">Proximity fraud check flag (no continuous tracking)</td>
                  <td className="p-3 text-ink-muted">Optional (flag-only)</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-ink">Age Flag (is_adult)</td>
                  <td className="p-3">Compliance with minor consent requirements</td>
                  <td className="p-3">Mandatory boolean</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-ink">3. Public Certificate Verification Transparency</h2>
          <p className="text-sm leading-relaxed">
            Sustainability certificates carry a public verification URL and QR code. To prevent personal information harvesting, public verification pages display ONLY:
          </p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>First name and last initial (e.g. &quot;Aditya K.&quot;)</li>
            <li>College campus name and achieved tier</li>
            <li>Issue date and count of verified recycled items</li>
          </ul>
          <p className="text-sm font-semibold text-ink">
            Your email, student roll number, and phone number are NEVER exposed publicly.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-ink">4. Your Data Rights</h2>
          <p className="text-sm leading-relaxed">
            In accordance with applicable data protection laws, students possess the right to:
          </p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li><strong>Download my data:</strong> Export all logged entries, batch histories, and profile metadata as JSON from the Account page.</li>
            <li><strong>Delete my account:</strong> Anonymizes personal identifiers from the profile while retaining non-identifiable batch weights for university recycling audits.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
