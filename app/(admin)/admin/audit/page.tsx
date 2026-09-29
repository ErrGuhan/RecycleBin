'use client';

import React, { useState } from 'react';
import {
  History,
  Scale,
  RotateCw,
  Settings,
  Ban,
  Plus,
  Shield,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface AuditItem {
  id: string;
  actor: string;
  actorRole: string;
  action: 'batch_finalize' | 'qr_rotate' | 'rate_update' | 'cert_revoke' | 'bin_create';
  target: string;
  summary: string;
  timestamp: string;
  beforeJson?: Record<string, unknown>;
  afterJson?: Record<string, unknown>;
}

export default function AdminAuditPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [auditLogs] = useState<AuditItem[]>([
    {
      id: 'aud-109',
      actor: 'Admin (admin@college.edu)',
      actorRole: 'Operations Admin',
      action: 'batch_finalize',
      target: 'Batch #B-7K3Q9D-0928',
      summary: 'Verified and finalized bin batch: 3,800g measured, 142 items, 204 points credited to 18 students.',
      timestamp: 'Today, 11:42 AM',
      beforeJson: { status: 'open', entries_count: 18, locked: true },
      afterJson: {
        status: 'finalized',
        actual_weight_g: 3800,
        discrepancy_ratio: 0.96,
        tolerance_passed: true,
      },
    },
    {
      id: 'aud-108',
      actor: 'Admin (admin@college.edu)',
      actorRole: 'Operations Admin',
      action: 'qr_rotate',
      target: 'Bin Cafeteria Station A',
      summary: 'Rotated physical QR code to 7K3Q9DX2 following routine 90-day security rotation.',
      timestamp: 'Yesterday, 4:15 PM',
      beforeJson: { code: '4X8M2KP9', is_active: true },
      afterJson: { code: '7K3Q9DX2', is_active: true },
    },
    {
      id: 'aud-107',
      actor: 'Admin (admin@college.edu)',
      actorRole: 'Operations Admin',
      action: 'rate_update',
      target: 'Plastic Type pet_medium',
      summary: 'Updated baseline weight from 27g to 28g based on pilot calibration data.',
      timestamp: '25 Sep, 2:30 PM',
      beforeJson: { avg_grams: 27, points_per_item: 8 },
      afterJson: { avg_grams: 28, points_per_item: 8 },
    },
    {
      id: 'aud-106',
      actor: 'Staff (staff1@college.edu)',
      actorRole: 'Station Staff',
      action: 'bin_create',
      target: 'Science Block Bin',
      summary: 'Provisioned new drop station 3P8R5WT4 in Building C Lobby.',
      timestamp: '20 Sep, 10:00 AM',
      beforeJson: undefined,
      afterJson: { id: 'bin-3', code: '3P8R5WT4', name: 'Science Block Bin' },
    },
  ]);

  const getActionIcon = (action: AuditItem['action']) => {
    switch (action) {
      case 'batch_finalize':
        return <Scale className="w-5 h-5 text-flow-verify" />;
      case 'qr_rotate':
        return <RotateCw className="w-5 h-5 text-brand-primary-strong" />;
      case 'rate_update':
        return <Settings className="w-5 h-5 text-status-pending" />;
      case 'cert_revoke':
        return <Ban className="w-5 h-5 text-status-rejected" />;
      case 'bin_create':
      default:
        return <Plus className="w-5 h-5 text-flow-cert" />;
    }
  };

  const filteredLogs = auditLogs.filter((log) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        log.actor.toLowerCase().includes(q) ||
        log.target.toLowerCase().includes(q) ||
        log.summary.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-brand-primary-soft text-brand-primary-strong flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-ink tracking-tight">Security Audit Log</h1>
              <p className="text-xs text-ink-muted">
                Append-only administrative event stream enforced by Postgres triggers
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Banner */}
      <div className="p-4 rounded-2xl bg-surface rounded-2xl border border-line flex items-start gap-3 text-xs text-ink shadow-xs">
        <Shield className="w-5 h-5 text-brand-primary-strong shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Tamper-Proof Audit Architecture:</span>
          <p className="text-ink-muted mt-0.5">
            Every staff and admin action automatically writes an immutable row to `audit_log` with
            actor UID, target entity, and before/after state diff. Rows cannot be modified or
            deleted.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-surface rounded-2xl border border-line p-3 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail by actor, target, or action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-line bg-surface text-ink text-xs focus-visible:outline-2 focus-visible:outline-brand-primary-strong"
          />
        </div>
      </div>

      {/* Audit Timeline */}
      <div className="space-y-3">
        {filteredLogs.map((item) => {
          const isExpanded = expandedId === item.id;

          return (
            <div
              key={item.id}
              className="bg-surface rounded-2xl border border-line p-5 shadow-xs hover:border-brand-primary-strong/40 hover:border-l-3 hover:border-l-brand-primary-strong transition-all text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-alt border border-line flex items-center justify-center shrink-0">
                    {getActionIcon(item.action)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-ink">{item.target}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-alt border border-line text-ink-muted">
                        {item.action}
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted mt-1 leading-relaxed">{item.summary}</p>
                    <div className="text-[11px] text-ink-muted mt-2 flex items-center gap-2">
                      <span className="font-semibold text-ink">{item.actor}</span>
                      <span>•</span>
                      <span>{item.actorRole}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-bold text-ink-muted tabular-nums">
                    {item.timestamp}
                  </span>
                </div>
              </div>

              {/* Progressive Disclosure: Before/After JSON Diff */}
              {(item.beforeJson || item.afterJson) && (
                <div className="mt-3 pt-3 border-t border-line/60">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="text-[11px] text-ink-muted hover:text-ink font-semibold flex items-center gap-1"
                  >
                    <span>Inspect Raw State Diff (JSON)</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-150">
                      {item.beforeJson && (
                        <div className="p-3 rounded-xl bg-surface-alt border border-line">
                          <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block mb-1">
                            Before State
                          </span>
                          <pre className="font-mono text-[10px] text-ink overflow-x-auto">
                            {JSON.stringify(item.beforeJson, null, 2)}
                          </pre>
                        </div>
                      )}

                      {item.afterJson && (
                        <div className="p-3 rounded-xl bg-brand-primary-soft/30 border border-brand-primary-strong/20">
                          <span className="text-[10px] font-bold text-brand-primary-strong uppercase tracking-wider block mb-1">
                            After State
                          </span>
                          <pre className="font-mono text-[10px] text-brand-primary-strong overflow-x-auto">
                            {JSON.stringify(item.afterJson, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
