'use client';

import React, { useState } from 'react';
import {
  ListFilter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Eye,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { PlasticCategoryIcon } from '@/components/plastic/PlasticCategoryIcon';
import { StatusBadge, EntryStatus } from '@/components/ui/StatusBadge';

interface AdminEntry {
  id: string;
  studentName: string;
  rollNo: string;
  department: string;
  binName: string;
  binCode: string;
  categoryKey: string;
  categoryLabel: string;
  items: number;
  pointsSnapshot: number;
  avgGramsSnapshot: number;
  status: EntryStatus;
  createdAt: string;
  flags?: string[];
  gpsDiffMeters?: number;
}

export default function AdminEntriesPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'flagged'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<AdminEntry | null>(null);

  const [entries] = useState<AdminEntry[]>([
    {
      id: 'ent-101',
      studentName: 'Aditya Kumar',
      rollNo: '24CS108',
      department: 'Computer Science',
      binName: 'Cafeteria Station A',
      binCode: '7K3Q9DX2',
      categoryKey: 'pet_small',
      categoryLabel: 'Small Bottle (<750ml)',
      items: 4,
      pointsSnapshot: 20,
      avgGramsSnapshot: 18,
      status: 'pending',
      createdAt: '12 mins ago',
      flags: [],
      gpsDiffMeters: 8,
    },
    {
      id: 'ent-102',
      studentName: 'Pooja Sharma',
      rollNo: '23CS042',
      department: 'Computer Science',
      binName: 'Library Quad Bin',
      binCode: '9MN42BC8',
      categoryKey: 'pet_medium',
      categoryLabel: 'Medium Bottle (1L-1.5L)',
      items: 6,
      pointsSnapshot: 48,
      avgGramsSnapshot: 28,
      status: 'verified',
      createdAt: '1 hour ago',
      flags: [],
      gpsDiffMeters: 14,
    },
    {
      id: 'ent-103',
      studentName: 'Rahul Verma',
      rollNo: '25BT019',
      department: 'Biotechnology',
      binName: 'Cafeteria Station A',
      binCode: '7K3Q9DX2',
      categoryKey: 'rigid_other',
      categoryLabel: 'Rigid Container',
      items: 3,
      pointsSnapshot: 30,
      avgGramsSnapshot: 45,
      status: 'flagged',
      createdAt: '2 hours ago',
      flags: ['no_gps_permission'],
      gpsDiffMeters: undefined,
    },
    {
      id: 'ent-104',
      studentName: 'Sneha Roy',
      rollNo: '24EC088',
      department: 'Economics',
      binName: 'Science Block Bin',
      binCode: '3P8R5WT4',
      categoryKey: 'pet_large',
      categoryLabel: 'Large Bottle (2L+)',
      items: 2,
      pointsSnapshot: 30,
      avgGramsSnapshot: 52,
      status: 'verified',
      createdAt: 'Yesterday, 3:15 PM',
      flags: [],
      gpsDiffMeters: 5,
    },
  ]);

  const filteredEntries = entries.filter((e) => {
    // Filter by tab
    if (filter === 'pending' && e.status !== 'pending') return false;
    if (filter === 'verified' && e.status !== 'verified') return false;
    if (filter === 'flagged' && e.status !== 'flagged') return false;

    // Search query
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        e.studentName.toLowerCase().includes(q) ||
        e.rollNo.toLowerCase().includes(q) ||
        e.binName.toLowerCase().includes(q) ||
        e.binCode.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-brand-primary-soft text-brand-primary-strong flex items-center justify-center">
              <ListFilter className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-ink tracking-tight">Student Drop Entries</h1>
              <p className="text-xs text-ink-muted">
                Audit feed of all item declarations from campus drop stations
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const csv = [
              'id,student,roll,bin,category,items,points,status,time',
              ...entries.map(
                (e) =>
                  `${e.id},"${e.studentName}",${e.rollNo},"${e.binName}","${e.categoryLabel}",${e.items},${e.pointsSnapshot},${e.status},"${e.createdAt}"`
              ),
            ].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `entries-export-${Date.now()}.csv`;
            a.click();
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-line bg-surface hover:bg-surface-alt font-bold text-xs text-ink shadow-xs"
        >
          <FileSpreadsheet className="w-4 h-4 text-brand-primary-strong" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface rounded-2xl border border-line p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Visual Filter Tabs with Icons */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
              filter === 'all'
                ? 'bg-brand-primary-strong text-white'
                : 'text-ink-muted hover:text-ink hover:bg-surface-alt'
            }`}
          >
            <span>All</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {entries.length}
            </span>
          </button>

          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
              filter === 'pending'
                ? 'bg-amber-600 text-white'
                : 'text-ink-muted hover:text-ink hover:bg-surface-alt'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {entries.filter((e) => e.status === 'pending').length}
            </span>
          </button>

          <button
            onClick={() => setFilter('verified')}
            className={`px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
              filter === 'verified'
                ? 'bg-emerald-700 text-white'
                : 'text-ink-muted hover:text-ink hover:bg-surface-alt'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {entries.filter((e) => e.status === 'verified').length}
            </span>
          </button>

          <button
            onClick={() => setFilter('flagged')}
            className={`px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
              filter === 'flagged'
                ? 'bg-rose-700 text-white'
                : 'text-ink-muted hover:text-ink hover:bg-surface-alt'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Flagged</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {entries.filter((e) => e.status === 'flagged').length}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student or bin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-line bg-surface text-ink text-xs focus-visible:outline-2 focus-visible:outline-brand-primary-strong"
          />
        </div>
      </div>

      {/* Entries List / Cards */}
      <div className="space-y-3">
        {filteredEntries.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-line p-12 text-center text-ink-muted">
            <ListFilter className="w-10 h-10 mx-auto mb-2 text-ink-muted/50" />
            <p className="font-semibold text-sm">No entries matching the current filter</p>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-surface rounded-2xl border border-line p-4 shadow-xs hover:border-brand-primary-strong/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-primary-soft text-brand-primary-strong flex items-center justify-center shrink-0">
                  <PlasticCategoryIcon typeKey={entry.categoryKey} className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-ink">{entry.studentName}</span>
                    <span className="font-mono text-[11px] text-ink-muted px-1.5 py-0.5 rounded bg-surface-alt border border-line">
                      {entry.rollNo}
                    </span>
                  </div>
                  <div className="text-[11px] text-ink-muted mt-0.5 flex items-center gap-1.5">
                    <span className="font-semibold text-ink">{entry.items} items</span>
                    <span>•</span>
                    <span>{entry.categoryLabel}</span>
                    <span>•</span>
                    <span>{entry.binName}</span>
                  </div>
                </div>
              </div>

              {/* Status & Quick Action */}
              <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-line/60">
                <div className="text-right">
                  <div className="font-black text-brand-primary-strong text-sm tabular-nums">
                    +{entry.pointsSnapshot} pts
                  </div>
                  <div className="text-[10px] text-ink-muted">{entry.createdAt}</div>
                </div>

                <StatusBadge status={entry.status} size="sm" />

                <button
                  type="button"
                  onClick={() => setSelectedEntry(entry)}
                  className="p-2 min-h-[36px] min-w-[36px] rounded-xl border border-line bg-surface hover:bg-surface-alt text-ink font-semibold flex items-center justify-center"
                  title="View Audit Details"
                >
                  <Eye className="w-4 h-4 text-ink-muted" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detailed Audit Modal (Hides intricate details cleanly until requested) */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-line shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-primary-soft text-brand-primary-strong flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-ink">Entry Audit Record</h3>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-ink-muted hover:text-ink p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-surface-alt border border-line space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Transaction ID:</span>
                  <span className="font-bold text-ink">{selectedEntry.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Bin Station Code:</span>
                  <span className="font-bold text-ink">{selectedEntry.binCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Rate Snapshot:</span>
                  <span className="text-ink">
                    {selectedEntry.pointsSnapshot / selectedEntry.items} pts/item •{' '}
                    {selectedEntry.avgGramsSnapshot}g/item
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">GPS Accuracy:</span>
                  <span className="text-ink">
                    {selectedEntry.gpsDiffMeters !== undefined
                      ? `${selectedEntry.gpsDiffMeters}m from bin`
                      : 'Permission Denied (Flagged)'}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-ink">Student Identification:</span>
                <p className="text-ink-muted">
                  {selectedEntry.studentName} ({selectedEntry.rollNo}) • Department of{' '}
                  {selectedEntry.department}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-ink">Audit Integrity Notice:</span>
                <p className="text-ink-muted text-[11px]">
                  This entry is immutable in Postgres. Points and rates were snapshotted at the
                  moment of submission and cannot be retroactively altered.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-line flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-2 rounded-xl bg-brand-primary-strong text-white font-bold shadow-xs hover:opacity-95 text-xs"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
