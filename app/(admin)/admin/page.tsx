'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
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
  CheckCircle2,
} from 'lucide-react';

interface BinDueItem {
  id: string;
  name: string;
  code: string;
  pending_items: number;
  oldest_pending: string;
  last_weighed: string;
}

export default function AdminDashboardPage() {
  const [statsData, setStatsData] = useState({
    verifiedKg: 0,
    pendingItems: 0,
    activeStudents: 0,
    pointsAwarded: 0,
  });

  const [binsDue, setBinsDue] = useState<BinDueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const supabase = createClient();

        // 1. Fetch Students count
        const { count: studentCount } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'student');

        // 2. Fetch Pending Entries
        const { data: pendingEntries } = await supabase
          .from('entries')
          .select('id, items, created_at, bin_id, bins (id, name, code, last_verified_at)')
          .eq('status', 'pending');

        const totalPending = pendingEntries?.reduce((sum, e) => sum + (e.items || 0), 0) || 0;

        // Group pending entries by bin
        const binMap: Record<string, { bin: { id: string; name: string; code: string; last_verified_at: string | null }; items: number; oldest: Date }> = {};

        pendingEntries?.forEach((e) => {
          const binObj = e.bins as { id?: string; name?: string; code?: string; last_verified_at?: string | null } | null;
          if (binObj?.id) {
            if (!binMap[binObj.id]) {
              binMap[binObj.id] = {
                bin: {
                  id: binObj.id,
                  name: binObj.name || 'Campus Bin',
                  code: binObj.code || '',
                  last_verified_at: binObj.last_verified_at || null,
                },
                items: 0,
                oldest: new Date(e.created_at),
              };
            }
            binMap[binObj.id].items += e.items || 0;
            const entryDate = new Date(e.created_at);
            if (entryDate < binMap[binObj.id].oldest) {
              binMap[binObj.id].oldest = entryDate;
            }
          }
        });

        // 3. Fetch Verified Batches & Points Ledger
        const { data: batches } = await supabase
          .from('verification_batches')
          .select('weighed_grams, tare_grams')
          .eq('status', 'finalized');

        const totalGrams = batches?.reduce((sum, b) => sum + Math.max(0, (b.weighed_grams || 0) - (b.tare_grams || 0)), 0) || 0;
        const totalKg = Number((totalGrams / 1000).toFixed(1));

        const { data: ledger } = await supabase
          .from('points_ledger')
          .select('points');

        const totalPoints = ledger?.reduce((sum, l) => sum + (l.points || 0), 0) || 0;

        // Bins due array
        const formattedBinsDue: BinDueItem[] = Object.values(binMap).map((item) => ({
          id: item.bin.id,
          name: item.bin.name,
          code: item.bin.code,
          pending_items: item.items,
          oldest_pending: `${Math.max(1, Math.round((Date.now() - item.oldest.getTime()) / (1000 * 60 * 60)))}h ago`,
          last_weighed: item.bin.last_verified_at
            ? new Date(item.bin.last_verified_at).toLocaleDateString([], { month: 'short', day: 'numeric' })
            : 'Never',
        }));

        setStatsData({
          verifiedKg: totalKg,
          pendingItems: totalPending,
          activeStudents: studentCount || 0,
          pointsAwarded: totalPoints,
        });

        setBinsDue(formattedBinsDue);
      } catch (err) {
        console.warn('Could not load live admin dashboard stats:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const stats = [
    {
      title: 'Verified Plastic',
      value: `${statsData.verifiedKg} kg`,
      sub: 'Physical scale verified',
      icon: Scale,
      color: 'text-brand-primary-strong',
      bg: 'bg-brand-primary-soft',
    },
    {
      title: 'Pending Items',
      value: `${statsData.pendingItems} items`,
      sub: 'Awaiting bin weighing',
      icon: Clock,
      color: 'text-amber-800',
      bg: 'bg-amber-50',
    },
    {
      title: 'Active Students',
      value: `${statsData.activeStudents}`,
      sub: 'Registered on portal',
      icon: Users,
      color: 'text-blue-800',
      bg: 'bg-blue-50',
    },
    {
      title: 'Points Awarded',
      value: statsData.pointsAwarded.toLocaleString(),
      sub: 'Append-only ledger balance',
      icon: Award,
      color: 'text-emerald-800',
      bg: 'bg-emerald-50',
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
            Real-time collection metrics, live verification batches, and ledger summaries.
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
                <div className="text-2xl sm:text-3xl font-black text-ink tabular-nums">
                  {isLoading ? '...' : s.value}
                </div>
                <div className="text-xs text-ink-muted mt-1 font-medium">{s.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bins Due for Verification Alert & Table */}
      <div className="bg-surface rounded-xl border border-line shadow-xs overflow-hidden">
        <div className="p-5 border-b border-line bg-surface-alt flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-700" />
            <h2 className="font-bold text-sm text-ink">
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

        {binsDue.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-ink">All Bins Up to Date</h3>
            <p className="text-xs text-ink-muted">No pending student drops currently awaiting scale weighing.</p>
          </div>
        ) : (
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
                    <td className="py-3 px-4 font-mono text-xs font-bold text-brand-primary-strong">
                      {bin.code}
                    </td>
                    <td className="py-3 px-4 font-black text-amber-800 tabular-nums">
                      {bin.pending_items} items
                    </td>
                    <td className="py-3 px-4 text-xs text-ink-muted font-medium">{bin.oldest_pending}</td>
                    <td className="py-3 px-4 text-xs text-ink-muted font-medium">{bin.last_weighed}</td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/verify?bin=${bin.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-brand-primary-strong text-white hover:opacity-95 shadow-xs"
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
        )}
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
            <p className="text-xs text-ink-muted mt-1 leading-relaxed">
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
            <p className="text-xs text-ink-muted mt-1 leading-relaxed">
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
            <p className="text-xs text-ink-muted mt-1 leading-relaxed">
              Generate A4/A5 printable QR signage with permanent codes and tamper rotation.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
