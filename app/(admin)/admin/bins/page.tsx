'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  QrCode,
  Plus,
  Scale,
  RotateCw,
  Download,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
} from 'lucide-react';
import { generateBinCode } from '@/lib/qr';

interface Bin {
  id: string;
  code: string;
  name: string;
  locationLabel: string;
  status: 'active' | 'maintenance' | 'full';
  pendingItems: number;
  totalCollectionsKg: number;
  lastWeighedAt: string;
  gpsCoords?: { lat: number; lng: number };
}

export default function AdminBinsPage() {
  const [bins, setBins] = useState<Bin[]>([
    {
      id: 'bin-1',
      code: '7K3Q9DX2',
      name: 'Cafeteria Station A',
      locationLabel: 'Ground Floor, North Dining Hall Entrance',
      status: 'active',
      pendingItems: 14,
      totalCollectionsKg: 48.5,
      lastWeighedAt: 'Yesterday, 4:30 PM',
      gpsCoords: { lat: 19.076, lng: 72.8777 },
    },
    {
      id: 'bin-2',
      code: '9MN42BC8',
      name: 'Library Quad Bin',
      locationLabel: 'Central Courtyard near Water Station',
      status: 'active',
      pendingItems: 22,
      totalCollectionsKg: 86.2,
      lastWeighedAt: '2 days ago',
      gpsCoords: { lat: 19.0765, lng: 72.8781 },
    },
    {
      id: 'bin-3',
      code: '3P8R5WT4',
      name: 'Science Block Bin',
      locationLabel: 'Building C Lobby, opposite Physics Lab',
      status: 'maintenance',
      pendingItems: 0,
      totalCollectionsKg: 34.0,
      lastWeighedAt: '5 days ago',
      gpsCoords: { lat: 19.0758, lng: 72.8769 },
    },
  ]);

  const [expandedBinId, setExpandedBinId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBinName, setNewBinName] = useState('');
  const [newBinLocation, setNewBinLocation] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const showBanner = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRotateCode = (binId: string) => {
    const newCode = generateBinCode();
    setBins(
      bins.map((b) =>
        b.id === binId ? { ...b, code: newCode } : b
      )
    );
    showBanner(`Rotated QR code to: ${newCode}. Please print a new plate.`);
  };

  const handleToggleStatus = (binId: string) => {
    setBins(
      bins.map((b) => {
        if (b.id !== binId) return b;
        const nextStatus = b.status === 'active' ? 'maintenance' : 'active';
        return { ...b, status: nextStatus };
      })
    );
    showBanner('Bin status updated successfully.');
  };

  const handleCreateBin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBinName.trim()) return;

    const newBin: Bin = {
      id: `bin-${Date.now()}`,
      code: generateBinCode(),
      name: newBinName,
      locationLabel: newBinLocation || 'Campus Drop Location',
      status: 'active',
      pendingItems: 0,
      totalCollectionsKg: 0,
      lastWeighedAt: 'Never',
    };

    setBins([...bins, newBin]);
    setShowAddModal(false);
    setNewBinName('');
    setNewBinLocation('');
    showBanner(`New bin "${newBin.name}" created with code ${newBin.code}!`);
  };

  return (
    <div className="space-y-6">
      {/* Banner notification */}
      {notification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-semibold flex items-center justify-between shadow-xs transition-all">
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
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-ink tracking-tight">Campus Drop Bins</h1>
              <p className="text-xs text-ink-muted">
                Manage physical bins, print QR plates, and trigger weigh-in cycles
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/verify"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-line bg-surface hover:bg-surface-alt font-bold text-xs text-ink shadow-xs"
          >
            <Scale className="w-4 h-4 text-brand-primary-strong" />
            <span>Weigh Batches</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary-strong text-white font-bold text-xs shadow-xs hover:opacity-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Bin</span>
          </button>
        </div>
      </div>

      {/* Icon-Based Bin Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bins.map((bin) => {
          const isExpanded = expandedBinId === bin.id;

          return (
            <div
              key={bin.id}
              className="bg-surface rounded-2xl border border-line p-5 shadow-xs hover:border-brand-primary-strong/40 transition-all flex flex-col justify-between"
            >
              {/* Card Top */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-xs ${
                        bin.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-extrabold text-sm text-ink">{bin.name}</h2>
                      <div className="flex items-center gap-1 text-[11px] text-ink-muted">
                        <MapPin className="w-3 h-3 text-ink-muted/70" />
                        <span className="truncate max-w-[180px]">{bin.locationLabel}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      bin.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {bin.status}
                  </span>
                </div>

                {/* 8-Char Unambiguous Code Display */}
                <div className="mt-4 p-3 rounded-xl bg-surface-alt border border-line flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">
                      QR Code ID
                    </span>
                    <div className="font-mono text-base font-black text-brand-primary-strong tracking-widest">
                      {bin.code}
                    </div>
                  </div>

                  <a
                    href={`/b/${bin.code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-brand-primary-strong hover:underline flex items-center gap-1"
                  >
                    <span>Test Drop</span>
                    <FileText className="w-3 h-3" />
                  </a>
                </div>

                {/* Quick Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-surface-alt/70 border border-line/50">
                    <span className="text-[10px] text-ink-muted font-semibold block">Pending Items</span>
                    <span className="text-base font-extrabold text-ink tabular-nums">
                      {bin.pendingItems}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-alt/70 border border-line/50">
                    <span className="text-[10px] text-ink-muted font-semibold block">Lifetime Plastic</span>
                    <span className="text-base font-extrabold text-ink tabular-nums">
                      {bin.totalCollectionsKg} kg
                    </span>
                  </div>
                </div>

                {/* Progressive Disclosure (Technical Details) */}
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setExpandedBinId(isExpanded ? null : bin.id)}
                    className="w-full text-[11px] text-ink-muted hover:text-ink font-semibold flex items-center justify-between py-1 px-1"
                  >
                    <span>Technical &amp; GPS Info</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 p-2.5 rounded-xl bg-surface-alt/90 border border-line text-[11px] space-y-1.5 font-mono text-ink-muted animate-in fade-in duration-150">
                      <div className="flex justify-between">
                        <span>Internal ID:</span>
                        <span className="text-ink">{bin.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Weighed:</span>
                        <span className="text-ink">{bin.lastWeighedAt}</span>
                      </div>
                      {bin.gpsCoords && (
                        <div className="flex justify-between">
                          <span>GPS Pin:</span>
                          <span className="text-ink">
                            {bin.gpsCoords.lat}, {bin.gpsCoords.lng}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Plate Format:</span>
                        <span className="text-ink">A4 Landscape / 8cm QR</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="mt-4 pt-3 border-t border-line/70 flex items-center justify-between gap-1.5">
                <Link
                  href={`/admin/verify?bin=${bin.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-brand-primary-strong text-white font-bold text-xs shadow-xs hover:opacity-95"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Weigh</span>
                </Link>

                <a
                  href={`/api/pdf/plate/${bin.code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 min-h-[40px] min-w-[40px] rounded-xl border border-line bg-surface hover:bg-surface-alt text-ink font-semibold flex items-center justify-center"
                  title="Download Printable Plate (PDF)"
                >
                  <Download className="w-4 h-4 text-brand-primary-strong" />
                </a>

                <button
                  type="button"
                  onClick={() => handleRotateCode(bin.id)}
                  className="p-2 min-h-[40px] min-w-[40px] rounded-xl border border-line bg-surface hover:bg-surface-alt text-ink font-semibold flex items-center justify-center"
                  title="Rotate QR Code"
                >
                  <RotateCw className="w-4 h-4 text-ink-muted" />
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleStatus(bin.id)}
                  className="p-2 min-h-[40px] min-w-[40px] rounded-xl border border-line bg-surface hover:bg-surface-alt text-ink font-semibold flex items-center justify-center"
                  title="Toggle Maintenance Mode"
                >
                  <AlertTriangle
                    className={`w-4 h-4 ${
                      bin.status === 'active' ? 'text-amber-600' : 'text-emerald-700'
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Bin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-line shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-primary-soft text-brand-primary-strong flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-ink">Add Campus Bin</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-ink-muted hover:text-ink p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBin} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-bold text-ink block mb-1">Bin Station Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sports Complex Quad"
                  value={newBinName}
                  onChange={(e) => setNewBinName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-line bg-surface text-ink text-sm font-medium focus-visible:outline-2 focus-visible:outline-brand-primary-strong"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Physical Location Label</label>
                <input
                  type="text"
                  placeholder="e.g. Building E, Ground Floor Exit"
                  value={newBinLocation}
                  onChange={(e) => setNewBinLocation(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-line bg-surface text-ink text-sm font-medium focus-visible:outline-2 focus-visible:outline-brand-primary-strong"
                />
              </div>

              <div className="p-3 rounded-xl bg-surface-alt border border-line text-[11px] text-ink-muted flex items-start gap-2">
                <QrCode className="w-4 h-4 text-brand-primary-strong shrink-0 mt-0.5" />
                <span>
                  A unique 8-character code from the unambiguous alphabet will be automatically generated.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-line text-ink font-semibold hover:bg-surface-alt"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-primary-strong text-white font-bold shadow-xs hover:opacity-95"
                >
                  Save Bin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
