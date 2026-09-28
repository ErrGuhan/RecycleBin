'use client';

import React from 'react';
import Link from 'next/link';
import {
  Scale,
  Package,
  Users,
  Award,
  Clock,
  ArrowRight,
  AlertCircle,
  FileBarChart2,
  DollarSign,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const stats = [
    {
      title: 'Verified Plastic (Month)',
      value: '148.5 kg',
      sub: '+22.4 kg this week',
      icon: Scale,
      color: 'text-brand-primary-strong',
      bg: 'bg-brand-primary-soft',
    },
    {
      title: 'Pending Items',
      value: '38 items',
      sub: 'Across 3 campus bins',
      icon: Clock,
      color: 'text-amber-800',
      bg: 'bg-amber-50',
    },
    {
      title: 'Active Students',
      value: '242',
      sub: 'St. Xavier’s College',
      icon: Users,
      color: 'text-blue-800',
      bg: 'bg-blue-50',
    },
    {
      title: 'Points Awarded',
      value: '49,210',
      sub: 'Append-only ledger verified',
      icon: Award,
      color: 'text-emerald-800',
      bg: 'bg-emerald-50',
    },
  ];

  const binsDue = [
    {
      id: 'bin-1',
      name: 'Cafeteria Recycling Station A',
      code: '7K3Q9DX2',
      pending_items: 24,
      oldest_pending: '18 hours ago',
      last_weighed: '6 days ago',
      status: 'Due for weighing',
    },
    {
      id: 'bin-2',
      name: 'Library Quad Bin',
      code: '9MN42BC8',
      pending_items: 14,
      oldest_pending: '1 day ago',
      last_weighed: '4 days ago',
      status: 'Due for weighing',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Campus Recycling Operations Dashboard
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Real-time collection metrics, verification batches, and ledger summaries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/verify"
            className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-lg bg-brand-primary-strong text-white font-semibold text-sm shadow-sm hover:opacity-95"
          >
            <Scale className="w-4 h-4" />
            <span>Verify Bins Now</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="bg-surface rounded-xl border border-line p-5 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                  {s.title}
                </span>
                <div className={`p-2 rounded-lg ${s.bg} ${s.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-ink tabular-nums">
                  {s.value}
                </div>
                <div className="text-xs text-ink-muted mt-1">{s.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bins Due for Verification Alert & Table */}
      <div className="bg-surface rounded-xl border border-line shadow-xs overflow-hidden">
        <div className="p-5 border-b border-line bg-amber-50/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-700" />
            <h2 className="font-bold text-sm text-amber-950">
              Bins Due for Physical Weighing ({binsDue.length})
            </h2>
          </div>
          <Link
            href="/admin/verify"
            className="text-xs font-bold text-brand-primary-strong hover:underline flex items-center gap-1"
          >
            <span>Batch verification workflow</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="divide-y divide-line/60 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-alt text-xs font-semibold text-ink-muted uppercase border-b border-line">
              <tr>
                <th className="py-3 px-4">Bin Station</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Pending Items</th>
                <th className="py-3 px-4">Oldest Drop</th>
                <th className="py-3 px-4">Last Verified</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/50">
              {binsDue.map((bin) => (
                <tr key={bin.id} className="hover:bg-surface-alt/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-ink">{bin.name}</td>
                  <td className="py-3 px-4 font-mono text-xs font-semibold text-brand-primary-strong">
                    {bin.code}
                  </td>
                  <td className="py-3 px-4 font-extrabold text-amber-800 tabular-nums">
                    {bin.pending_items} items
                  </td>
                  <td className="py-3 px-4 text-xs text-ink-muted">{bin.oldest_pending}</td>
                  <td className="py-3 px-4 text-xs text-ink-muted">{bin.last_weighed}</td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/admin/verify?bin=${bin.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-primary-strong text-white hover:opacity-95 shadow-xs"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>Weigh Bin</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/reports"
          className="bg-surface rounded-xl border border-line p-5 shadow-xs hover:border-brand-primary-strong transition-all flex items-start gap-4"
        >
          <div className="p-3 rounded-xl bg-brand-primary-soft text-brand-primary-strong">
            <FileBarChart2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-ink">Campus Sustainability Reports</h3>
            <p className="text-xs text-ink-muted mt-1">
              Download official PDF reports formatted for college NAAC Criterion 7 waste documentation.
            </p>
          </div>
        </Link>

        <Link
          href="/admin/accounting"
          className="bg-surface rounded-xl border border-line p-5 shadow-xs hover:border-brand-primary-strong transition-all flex items-start gap-4"
        >
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-ink">Recycling Ledger &amp; Sales</h3>
            <p className="text-xs text-ink-muted mt-1">
              Record plastic sold to recyclers, track stock balance, and audit collection expenses.
            </p>
          </div>
        </Link>

        <Link
          href="/admin/bins"
          className="bg-surface rounded-xl border border-line p-5 shadow-xs hover:border-brand-primary-strong transition-all flex items-start gap-4"
        >
          <div className="p-3 rounded-xl bg-blue-50 text-blue-800">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-ink">QR Plates &amp; Bin Roster</h3>
            <p className="text-xs text-ink-muted mt-1">
              Generate A4/A5 printable QR signage with permanent codes and tamper rotation.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
