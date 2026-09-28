'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  Package,
  Truck,
  Building2,
  TrendingUp,
  X,
  CheckCircle2,
} from 'lucide-react';

interface AccountingRecord {
  id: string;
  type: 'sale' | 'expense';
  category: string;
  description: string;
  weightKg?: number;
  amountPaise: number;
  date: string;
  partnerName: string;
  invoiceNo?: string;
}

export default function AdminAccountingPage() {
  const [records, setRecords] = useState<AccountingRecord[]>([
    {
      id: 'acc-1',
      type: 'sale',
      category: 'PET Flakes / Baled',
      description: 'Sale of baled PET bottles to GreenCycle Recyclers',
      weightKg: 120.0,
      amountPaise: 420000, // ₹4,200.00 (₹35/kg)
      date: '2026-09-26',
      partnerName: 'GreenCycle Polymers Pvt Ltd',
      invoiceNo: 'GC-2026-881',
    },
    {
      id: 'acc-2',
      type: 'expense',
      category: 'Transportation',
      description: 'Campus collection pickup van fuel & driver fee',
      amountPaise: 120000, // ₹1,200.00
      date: '2026-09-24',
      partnerName: 'City Logistics Express',
      invoiceNo: 'CL-0924',
    },
    {
      id: 'acc-3',
      type: 'expense',
      category: 'Bin Maintenance',
      description: 'Replacement heavy-duty liner bags and QR plate laminates',
      amountPaise: 65000, // ₹650.00
      date: '2026-09-18',
      partnerName: 'Campus Hardware Store',
      invoiceNo: 'CHS-109',
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [formType, setFormType] = useState<'sale' | 'expense'>('sale');
  const [description, setDescription] = useState('');
  const [partner, setPartner] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [amountRupees, setAmountRupees] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const showBanner = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amountRupees) return;

    const newRecord: AccountingRecord = {
      id: `acc-${Date.now()}`,
      type: formType,
      category: formType === 'sale' ? 'Plastic Material Sale' : 'Operational Expense',
      description,
      partnerName: partner || 'Direct Vendor',
      weightKg: weightKg ? parseFloat(weightKg) : undefined,
      amountPaise: Math.round(parseFloat(amountRupees) * 100),
      date: new Date().toISOString().split('T')[0],
      invoiceNo: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    setRecords([newRecord, ...records]);
    setShowAddModal(false);
    setDescription('');
    setPartner('');
    setWeightKg('');
    setAmountRupees('');
    showBanner(`Logged ${formType} transaction of ₹${parseFloat(amountRupees).toLocaleString()}`);
  };

  const totalCollectedKg = 168.7;
  const totalSoldKg = records
    .filter((r) => r.type === 'sale')
    .reduce((sum, r) => sum + (r.weightKg || 0), 0);
  const stockRemainingKg = Math.max(0, totalCollectedKg - totalSoldKg);

  const totalRevenuePaise = records
    .filter((r) => r.type === 'sale')
    .reduce((sum, r) => sum + r.amountPaise, 0);

  const totalExpensePaise = records
    .filter((r) => r.type === 'expense')
    .reduce((sum, r) => sum + r.amountPaise, 0);

  const netBalancePaise = totalRevenuePaise - totalExpensePaise;

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
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-ink tracking-tight">Recycler Accounting</h1>
              <p className="text-xs text-ink-muted">
                Plastic sales ledger, logistics expenses, and physical stock balance
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary-strong text-white font-bold text-xs shadow-xs hover:opacity-95"
        >
          <Plus className="w-4 h-4" />
          <span>Record Transaction</span>
        </button>
      </div>

      {/* Balance Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stock in Bins */}
        <div className="bg-surface rounded-2xl border border-line p-5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-brand-primary-soft text-brand-primary-strong flex items-center justify-center mb-3">
            <Package className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">
            Stock On Campus
          </span>
          <div className="text-2xl font-black text-ink tabular-nums mt-0.5">
            {stockRemainingKg.toFixed(1)}{' '}
            <span className="text-sm font-bold text-ink-muted">kg</span>
          </div>
          <span className="text-[11px] text-ink-muted mt-1 block">Ready for recycler pickup</span>
        </div>

        {/* Sold to Recycler */}
        <div className="bg-surface rounded-2xl border border-line p-5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-3">
            <Truck className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">
            Sold To Recycler
          </span>
          <div className="text-2xl font-black text-ink tabular-nums mt-0.5">
            {totalSoldKg.toFixed(1)} <span className="text-sm font-bold text-ink-muted">kg</span>
          </div>
          <span className="text-[11px] text-ink-muted mt-1 block">Authorized EPR recyclers</span>
        </div>

        {/* Total Revenue */}
        <div className="bg-surface rounded-2xl border border-line p-5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">
            Sales Revenue
          </span>
          <div className="text-2xl font-black text-emerald-900 tabular-nums mt-0.5">
            ₹{(totalRevenuePaise / 100).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-800 font-semibold mt-1 block">
            Avg ₹35/kg PET
          </span>
        </div>

        {/* Net Cash Position */}
        <div className="bg-surface rounded-2xl border border-line p-5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-3">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">
            Net Surplus
          </span>
          <div className="text-2xl font-black text-ink tabular-nums mt-0.5">
            ₹{(netBalancePaise / 100).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-ink-muted mt-1 block">
            After ₹{(totalExpensePaise / 100).toLocaleString('en-IN')} ops expenses
          </span>
        </div>
      </div>

      {/* Transaction Feed */}
      <div className="bg-surface rounded-2xl border border-line p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-base text-ink">Transaction History</h2>
          <span className="text-xs text-ink-muted">Integer paise precision</span>
        </div>

        <div className="divide-y divide-line/60">
          {records.map((r) => (
            <div
              key={r.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    r.type === 'sale'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {r.type === 'sale' ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <DollarSign className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="font-extrabold text-sm text-ink">{r.description}</div>
                  <div className="text-[11px] text-ink-muted mt-0.5 flex items-center gap-2">
                    <span>{r.partnerName}</span>
                    <span>•</span>
                    <span>{r.date}</span>
                    {r.invoiceNo && (
                      <>
                        <span>•</span>
                        <span className="font-mono">{r.invoiceNo}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right self-end sm:self-auto">
                <div
                  className={`text-base font-black tabular-nums ${
                    r.type === 'sale' ? 'text-emerald-800' : 'text-rose-700'
                  }`}
                >
                  {r.type === 'sale' ? '+' : '-'}₹{(r.amountPaise / 100).toLocaleString('en-IN')}
                </div>
                {r.weightKg && (
                  <span className="text-[11px] text-ink-muted">{r.weightKg} kg material</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-line shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-primary-soft text-brand-primary-strong flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-ink">Record Accounting Entry</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-ink-muted hover:text-ink p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="space-y-4 mt-4 text-xs">
              {/* Type Switcher */}
              <div className="flex rounded-xl bg-surface-alt p-1 border border-line font-bold">
                <button
                  type="button"
                  onClick={() => setFormType('sale')}
                  className={`flex-1 py-1.5 rounded-lg transition-colors ${
                    formType === 'sale' ? 'bg-surface shadow-xs text-ink' : 'text-ink-muted'
                  }`}
                >
                  Sale (Plastic Inflow)
                </button>
                <button
                  type="button"
                  onClick={() => setFormType('expense')}
                  className={`flex-1 py-1.5 rounded-lg transition-colors ${
                    formType === 'expense' ? 'bg-surface shadow-xs text-ink' : 'text-ink-muted'
                  }`}
                >
                  Expense (Operations)
                </button>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sale of baled PET / Van transport fuel"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-line bg-surface text-ink text-xs focus-visible:outline-2 focus-visible:outline-brand-primary-strong"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Partner / Recycler Name</label>
                <input
                  type="text"
                  placeholder="e.g. GreenCycle Polymers"
                  value={partner}
                  onChange={(e) => setPartner(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-line bg-surface text-ink text-xs focus-visible:outline-2 focus-visible:outline-brand-primary-strong"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink block mb-1">Amount (₹ INR)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 3500.00"
                    value={amountRupees}
                    onChange={(e) => setAmountRupees(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-line bg-surface text-ink text-xs focus-visible:outline-2 focus-visible:outline-brand-primary-strong font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Weight (kg, optional)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 100"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-line bg-surface text-ink text-xs focus-visible:outline-2 focus-visible:outline-brand-primary-strong font-mono"
                  />
                </div>
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
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
