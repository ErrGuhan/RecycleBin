'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Award,
  ShieldCheck,
  Download,
  Ban,
  Search,
  CheckCircle2,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface AdminCertificate {
  id: string;
  certificateNo: string;
  studentName: string;
  rollNo: string;
  department: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  itemsCount: number;
  estimatedKg: number;
  issueDate: string;
  status: 'active' | 'revoked';
  revokedReason?: string;
  sha256Hash: string;
}

export default function AdminCertificatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCertId, setExpandedCertId] = useState<string | null>(null);
  const [selectedToRevoke, setSelectedToRevoke] = useState<AdminCertificate | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const [certificates, setCertificates] = useState<AdminCertificate[]>([
    {
      id: 'cert-1',
      certificateNo: 'CPC-2026-7K3Q9D',
      studentName: 'Aditya Kumar',
      rollNo: '24CS108',
      department: 'Computer Science',
      tier: 'Bronze',
      itemsCount: 120,
      estimatedKg: 2.8,
      issueDate: '2026-09-28',
      status: 'active',
      sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
    {
      id: 'cert-2',
      certificateNo: 'CPC-2026-9MN42B',
      studentName: 'Pooja Sharma',
      rollNo: '23CS042',
      department: 'Computer Science',
      tier: 'Silver',
      itemsCount: 350,
      estimatedKg: 8.4,
      issueDate: '2026-09-20',
      status: 'active',
      sha256Hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
    },
    {
      id: 'cert-3',
      certificateNo: 'CPC-2026-3P8R5W',
      studentName: 'Rahul Verma',
      rollNo: '25BT019',
      department: 'Biotechnology',
      tier: 'Silver',
      itemsCount: 310,
      estimatedKg: 7.2,
      issueDate: '2026-09-18',
      status: 'active',
      sha256Hash: '4355a46b19d348dc2f57c046f8ef63d4538ebb936000f3c9ee954a27460dd865',
    },
  ]);

  const showBanner = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleConfirmRevoke = () => {
    if (!selectedToRevoke || !revokeReason.trim()) return;

    setCertificates(
      certificates.map((c) =>
        c.id === selectedToRevoke.id
          ? { ...c, status: 'revoked', revokedReason: revokeReason }
          : c
      )
    );

    showBanner(`Certificate ${selectedToRevoke.certificateNo} has been revoked.`);
    setSelectedToRevoke(null);
    setRevokeReason('');
  };

  const filteredCerts = certificates.filter((c) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        c.studentName.toLowerCase().includes(q) ||
        c.certificateNo.toLowerCase().includes(q) ||
        c.rollNo.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeCount = certificates.filter((c) => c.status === 'active').length;
  const revokedCount = certificates.filter((c) => c.status === 'revoked').length;

  return (
    <div className="space-y-6">
      {/* Banner */}
      {notification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-brand-primary-soft text-brand-primary-strong flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-ink tracking-tight">Issued Certificates</h1>
              <p className="text-xs text-ink-muted">
                Official sustainability credentials verifiable for NAAC and employer records
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/verify"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-line bg-surface hover:bg-surface-alt font-bold text-xs text-ink shadow-xs"
        >
          <ShieldCheck className="w-4 h-4 text-brand-primary-strong" />
          <span>Public Verifier</span>
        </Link>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface rounded-2xl border border-line p-4 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-brand-primary-strong mb-1">
            <Award className="w-4 h-4" />
            <span>Total Credentials</span>
          </div>
          <div className="text-2xl font-black text-ink tabular-nums">{certificates.length}</div>
        </div>

        <div className="bg-surface rounded-2xl border border-line p-4 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Active &amp; Valid</span>
          </div>
          <div className="text-2xl font-black text-ink tabular-nums">{activeCount}</div>
        </div>

        <div className="bg-surface rounded-2xl border border-line p-4 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 mb-1">
            <Ban className="w-4 h-4" />
            <span>Revoked</span>
          </div>
          <div className="text-2xl font-black text-ink tabular-nums">{revokedCount}</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-surface rounded-2xl border border-line p-3 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search certificate ID, student name, or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-line bg-surface text-ink text-xs focus-visible:outline-2 focus-visible:outline-brand-primary-strong"
          />
        </div>
      </div>

      {/* Certificate Cards */}
      <div className="space-y-4">
        {filteredCerts.map((cert) => {
          const isExpanded = expandedCertId === cert.id;

          return (
            <div
              key={cert.id}
              className={`bg-surface rounded-2xl border p-5 shadow-xs transition-all ${
                cert.status === 'revoked'
                  ? 'border-rose-300 bg-rose-50/20 opacity-80'
                  : 'border-line hover:border-brand-primary-strong/40'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      cert.status === 'revoked'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-brand-primary-soft text-brand-primary-strong'
                    }`}
                  >
                    {cert.status === 'revoked' ? (
                      <Ban className="w-6 h-6" />
                    ) : (
                      <Award className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-extrabold text-base text-ink">{cert.studentName}</h2>
                      <span className="font-mono text-[11px] font-bold text-ink-muted bg-surface-alt px-1.5 py-0.5 rounded border border-line">
                        {cert.rollNo}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          cert.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {cert.status}
                      </span>
                    </div>

                    <div className="text-xs text-ink-muted mt-1 flex flex-wrap items-center gap-2">
                      <span className="font-bold text-brand-primary-strong">{cert.tier} Tier</span>
                      <span>•</span>
                      <span>{cert.itemsCount} Items</span>
                      <span>•</span>
                      <span>~{cert.estimatedKg} kg Plastic</span>
                      <span>•</span>
                      <span>Issued {cert.issueDate}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 self-end md:self-auto">
                  <Link
                    href={`/verify/${cert.certificateNo}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-line bg-surface hover:bg-surface-alt text-ink font-bold text-xs shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Verify</span>
                  </Link>

                  <a
                    href={`/api/pdf/certificate/${cert.certificateNo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-primary-strong text-white font-bold text-xs shadow-xs hover:opacity-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </a>

                  {cert.status === 'active' && (
                    <button
                      type="button"
                      onClick={() => setSelectedToRevoke(cert)}
                      className="p-2 min-h-[38px] min-w-[38px] rounded-xl border border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100 font-semibold flex items-center justify-center"
                      title="Revoke Certificate"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Progressive Disclosure (Cryptographic verification details) */}
              <div className="mt-3 pt-3 border-t border-line/60">
                <button
                  type="button"
                  onClick={() => setExpandedCertId(isExpanded ? null : cert.id)}
                  className="text-[11px] text-ink-muted hover:text-ink font-semibold flex items-center gap-1"
                >
                  <span>Verification Hash &amp; Audit Metadata</span>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-2 p-3 rounded-xl bg-surface-alt border border-line font-mono text-[11px] space-y-1.5 text-ink-muted animate-in fade-in duration-150">
                    <div className="flex justify-between">
                      <span>Certificate No:</span>
                      <span className="font-bold text-ink">{cert.certificateNo}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span>SHA256 Fingerprint:</span>
                      <span className="text-ink truncate max-w-[360px]">{cert.sha256Hash}</span>
                    </div>
                    {cert.revokedReason && (
                      <div className="flex justify-between text-rose-700">
                        <span>Revocation Reason:</span>
                        <span className="font-sans font-bold">{cert.revokedReason}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Revocation Modal */}
      {selectedToRevoke && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-line shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2 text-rose-700">
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                  <Ban className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-ink">Revoke Certificate</h3>
              </div>
              <button
                onClick={() => setSelectedToRevoke(null)}
                className="text-ink-muted hover:text-ink p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <p className="text-ink">
                You are about to revoke certificate{' '}
                <span className="font-mono font-bold">{selectedToRevoke.certificateNo}</span> issued
                to <span className="font-bold">{selectedToRevoke.studentName}</span>.
              </p>

              <div>
                <label className="font-bold text-ink block mb-1">
                  Reason for Revocation (Required for Audit Log)
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Audit correction: Plastic batch weight disproved items."
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-line bg-surface text-ink text-xs focus-visible:outline-2 focus-visible:outline-brand-primary-strong"
                />
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-line flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedToRevoke(null)}
                className="px-4 py-2 rounded-xl border border-line text-ink font-semibold hover:bg-surface-alt"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRevoke}
                disabled={!revokeReason.trim()}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold shadow-xs hover:bg-rose-700 disabled:opacity-50"
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
