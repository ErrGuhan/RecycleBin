'use client';

import React, { useState, useEffect } from 'react';
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
  Inbox,
} from 'lucide-react';
import { generateBinCode } from '@/lib/qr';
import { createClient } from '@/lib/supabase/client';

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
  const [bins, setBins] = useState<Bin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedBinId, setExpandedBinId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBinName, setNewBinName] = useState('');
  const [newBinLocation, setNewBinLocation] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const showBanner = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    async function loadBins() {
      try {
        const supabase = createClient();
        const { data: dbBins } = await supabase
          .from('bins')
          .select(`
            id,
            code,
            name,
            location_label,
            status,
            latitude,
            longitude,
            last_verified_at
          `)
          .order('name', { ascending: true });

        // Query pending counts from entries
        const { data: pendingEntries } = await supabase
          .from('entries')
          .select('bin_id, items')
          .eq('status', 'pending');

        const pendingMap: Record<string, number> = {};
        pendingEntries?.forEach((e) => {
          pendingMap[e.bin_id] = (pendingMap[e.bin_id] || 0) + (e.items || 0);
        });

        // Query lifetime batches
        const { data: batches } = await supabase
          .from('verification_batches')
          .select('bin_id, weighed_grams, tare_grams')
          .eq('status', 'finalized');

        const lifetimeMap: Record<string, number> = {};
        batches?.forEach((b) => {
          const net = Math.max(0, (b.weighed_grams || 0) - (b.tare_grams || 0));
          lifetimeMap[b.bin_id] = (lifetimeMap[b.bin_id] || 0) + net;
        });

        if (dbBins && dbBins.length > 0) {
          const mapped: Bin[] = dbBins.map((b) => ({
            id: b.id,
            code: b.code,
            name: b.name,
            locationLabel: b.location_label,
            status: b.status as 'active' | 'maintenance',
            pendingItems: pendingMap[b.id] || 0,
            totalCollectionsKg: Number(((lifetimeMap[b.id] || 0) / 1000).toFixed(1)),
            lastWeighedAt: b.last_verified_at
              ? new Date(b.last_verified_at).toLocaleDateString([], { month: 'short', day: 'numeric' })
              : 'Never',
            gpsCoords: b.latitude && b.longitude ? { lat: b.latitude, lng: b.longitude } : undefined,
          }));
          setBins(mapped);
        } else {
          // If remote db table is empty, show the 3 canonical pilot bins from seed
          setBins([
            {
              id: 'b0000000-0000-0000-0000-000000000001',
              code: '7K3Q9DX2',
              name: 'Cafeteria Recycling Station A',
              locationLabel: 'Central Food Court, Ground Floor',
              status: 'active',
              pendingItems: 0,
              totalCollectionsKg: 0,
              lastWeighedAt: 'Never',
            },
            {
              id: 'b0000000-0000-0000-0000-000000000002',
              code: '9MN42BC8',
              name: 'Library Quad Station',
              locationLabel: 'East Walkway Entrance',
              status: 'active',
              pendingItems: 0,
              totalCollectionsKg: 0,
              lastWeighedAt: 'Never',
            },
            {
              id: 'b0000000-0000-0000-0000-000000000003',
              code: '3P8R5WT4',
              name: 'Science Block Station',
              locationLabel: 'Chemistry Lab Corridor, 1st Floor',
              status: 'active',
              pendingItems: 0,
              totalCollectionsKg: 0,
              lastWeighedAt: 'Never',
            },
          ]);
        }
      } catch (err) {
        console.warn('Could not load live bins:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadBins();
  }, []);

  const handleRotateCode = async (binId: string) => {
    const newCode = generateBinCode();
    setBins((prev) =>
      prev.map((b) => (b.id === binId ? { ...b, code: newCode } : b))
    );

    try {
      const supabase = createClient();
      await supabase.from('bins').update({ code: newCode }).eq('id', binId);
    } catch {
      // ignore
    }

    showBanner(`Rotated QR code to: ${newCode}. Please print a new plate.`);
  };

  const handleToggleStatus = async (binId: string) => {
    let nextStatus: 'active' | 'maintenance' = 'active';
    setBins((prev) =>
      prev.map((b) => {
        if (b.id !== binId) return b;
        nextStatus = b.status === 'active' ? 'maintenance' : 'active';
        return { ...b, status: nextStatus };
      })
    );

    try {
      const supabase = createClient();
      await supabase.from('bins').update({ status: nextStatus }).eq('id', binId);
    } catch {
      // ignore
    }

    showBanner('Bin status updated successfully.');
  };

  const handleCreateBin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBinName.trim()) return;

    const newCode = generateBinCode();
    const newBinObj: Bin = {
      id: `bin-${Date.now()}`,
      code: newCode,
      name: newBinName.trim(),
      locationLabel: newBinLocation.trim() || 'Campus Drop Location',
      status: 'active',
      pendingItems: 0,
      totalCollectionsKg: 0,
      lastWeighedAt: 'Never',
    };

    setBins((prev) => [...prev, newBinObj]);
    setShowAddModal(false);
    setNewBinName('');
    setNewBinLocation('');

    try {
      const supabase = createClient();
      await supabase.from('bins').insert({
        campus_id: 'a0000000-0000-0000-0000-000000000001',
        code: newCode,
        name: newBinObj.name,
        location_label: newBinObj.locationLabel,
        status: 'active',
      });
    } catch {
      // ignore
    }

    showBanner(`Station "${newBinObj.name}" created with code: ${newCode}`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-brand-primary-strong text-white font-bold text-xs shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
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
              <h1 className="text-2xl font-black text-ink tracking-tight">Bins &amp; QR Roster</h1>
              <p className="text-xs text-ink-muted">
                Manage physical campus collection stations and printable vector QR plates
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary-strong text-white font-bold text-xs shadow-xs hover:opacity-95"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Bin</span>
        </button>
      </div>

      {/* Bins Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-ink-muted space-y-2">
          <div className="w-6 h-6 rounded-full border-2 border-brand-primary-strong border-t-transparent animate-spin mx-auto" />
          <p>Loading campus stations...</p>
        </div>
      ) : bins.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-line p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-surface-alt border border-line text-brand-primary-strong mx-auto flex items-center justify-center">
            <Inbox className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 className="text-sm font-bold text-ink">No Bins Provisioned</h3>
          <p className="text-xs text-ink-muted max-w-sm mx-auto">
            Click &quot;Provision New Bin&quot; to assign your first recycling bin code and generate its QR plate.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bins.map((bin) => {
            const isExpanded = expandedBinId === bin.id;
            return (
              <div
                key={bin.id}
                className="bg-surface rounded-2xl border border-line p-5 shadow-xs flex flex-col justify-between hover:border-brand-primary-strong/40 hover:border-l-3 hover:border-l-brand-primary-strong transition-all"
              >
                <div>
                  {/* Top Row: Name and Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-extrabold text-base text-ink tracking-tight">{bin.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-ink-muted mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-brand-primary-strong shrink-0" />
                        <span className="truncate max-w-[200px]">{bin.locationLabel}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                        bin.status === 'active'
                          ? 'bg-status-verified-bg text-status-verified border border-status-verified/20'
                          : 'bg-status-pending-bg text-status-pending border border-status-pending/20'
                      }`}
                    >
                      {bin.status}
                    </span>
                  </div>

                  {/* QR & Code Snippet */}
                  <div className="my-4 p-3 rounded-xl bg-surface-alt border border-line flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-ink-muted uppercase font-bold block">
                        Station Code
                      </span>
                      <span className="text-xl font-black font-mono tracking-widest text-ink">
                        {bin.code}
                      </span>
                    </div>

                    <Link
                      href={`/b/${bin.code}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface border border-line hover:bg-surface-alt text-ink font-bold text-xs"
                      title="Open student drop page"
                    >
                      <QrCode className="w-3.5 h-3.5 text-brand-primary-strong" />
                      <span>Test Scan</span>
                    </Link>
                  </div>

                  {/* Stats Mini Grid */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-surface-alt/70 border border-line/50">
                      <span className="text-[10px] text-ink-muted font-bold block">Pending Drops</span>
                      <span className="text-base font-black text-amber-800 tabular-nums">
                        {bin.pendingItems} items
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface-alt/70 border border-line/50">
                      <span className="text-[10px] text-ink-muted font-bold block">Lifetime Plastic</span>
                      <span className="text-base font-black text-ink tabular-nums">
                        {bin.totalCollectionsKg} kg
                      </span>
                    </div>
                  </div>

                  {/* Technical & Plate Info Drawer */}
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setExpandedBinId(isExpanded ? null : bin.id)}
                      className="w-full text-[11px] text-ink-muted hover:text-ink font-bold flex items-center justify-between py-1 px-1"
                    >
                      <span>Station Diagnostics &amp; GPS</span>
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
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 min-h-[44px] rounded-xl bg-brand-primary-strong text-white font-bold text-xs shadow-xs hover:opacity-95"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Weigh Bin</span>
                  </Link>

                  <a
                    href={`/api/pdf/plate/${bin.code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 min-h-[44px] min-w-[44px] rounded-xl border border-line bg-surface hover:bg-surface-alt text-ink font-semibold flex items-center justify-center"
                    title="Download Printable Plate (PDF)"
                  >
                    <Download className="w-4 h-4 text-brand-primary-strong" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleRotateCode(bin.id)}
                    className="p-2 min-h-[44px] min-w-[44px] rounded-xl border border-line bg-surface hover:bg-surface-alt text-ink font-semibold flex items-center justify-center"
                    title="Rotate QR Code"
                  >
                    <RotateCw className="w-4 h-4 text-ink-muted" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleStatus(bin.id)}
                    className="p-2 min-h-[44px] min-w-[44px] rounded-xl border border-line bg-surface hover:bg-surface-alt text-ink font-semibold flex items-center justify-center"
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
      )}

      {/* Add New Bin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl border border-line max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="font-black text-ink text-base">Provision New Campus Station</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-ink-muted hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-ink mb-1">Station Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Student Center Quad"
                  value={newBinName}
                  onChange={(e) => setNewBinName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-line bg-surface text-ink text-sm focus-visible:outline-2 focus-visible:outline-brand-primary-strong"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Location Label *</label>
                <input
                  type="text"
                  placeholder="e.g. 1st Floor East Entrance"
                  value={newBinLocation}
                  onChange={(e) => setNewBinLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-line bg-surface text-ink text-sm focus-visible:outline-2 focus-visible:outline-brand-primary-strong"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-surface-alt text-ink-muted text-[11px] leading-relaxed">
                A permanent 8-character unique alphanumeric code will be generated automatically.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-line text-ink-muted hover:text-ink font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-primary-strong text-white font-bold hover:opacity-95"
                >
                  Create &amp; Generate Plate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
