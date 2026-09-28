'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  Package,
  Truck,
  Building2,
  TrendingUp,
  X,
  CheckCircle2,
  Inbox,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

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
  const [records, setRecords] = useState<AccountingRecord[]>([]);
  const [totalCollectedKg, setTotalCollectedKg] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    async function loadAccounting() {
      try {
        const supabase = createClient();

        // 1. Fetch Sales
        const { data: salesData } = await supabase
          .from('sales')
          .select('*')
          .order('sale_date', { ascending: false });

        // 2. Fetch Expenses
        const { data: expensesData } = await supabase
          .from('expenses')
          .select('*')
          .order('expense_date', { ascending: false });

        // 3. Fetch Verification Batches for total collected kg
        const { data: batches } = await supabase
          .from('verification_batches')
          .select('weighed_grams, tare_grams')
          .eq('status', 'finalized');

        const netGrams = batches?.reduce(
          (sum, b) => sum + Math.max(0, (b.weighed_grams || 0) - (b.tare_grams || 0)),
          0
        ) || 0;
        setTotalCollectedKg(Number((netGrams / 1000).toFixed(1)));

        const combined: AccountingRecord[] = [];

        salesData?.forEach((s) => {
          combined.push({
            id: s.id,
            type: 'sale',
            category: s.plastic_kind || 'Plastic Material Sale',
            description: s.note || `Sale of ${s.plastic_kind} to ${s.buyer}`,
            weightKg: Number((s.weight_grams / 1000).toFixed(1)),
            amountPaise: Number(s.amount_paise),
            date: s.sale_date,
            partnerName: s.buyer,
            invoiceNo: s.invoice_ref || undefined,
          });
        });

        expensesData?.forEach((e) => {
          combined.push({
            id: e.id,
            type: 'expense',
            category: e.category || 'Operational Expense',
            description: e.note || 'Collection / logistics operational expense',
            amountPaise: Number(e.amount_paise),
            date: e.expense_date,
            partnerName: 'Vendor',
          });
        });

        // Sort descending by date
        combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setRecords(combined);
      } catch (err) {
        console.warn('Could not load live accounting records:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadAccounting();
  }, []);

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amountRupees) return;

    const amtRupees = parseFloat(amountRupees);
    const amountPaise = Math.round(amtRupees * 100);
    const dateStr = new Date().toISOString().split('T')[0];
    const newId = `acc-${Date.now()}`;
    const invRef = `INV-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRecord: AccountingRecord = {
      id: newId,
      type: formType,
      category: formType === 'sale' ? 'Plastic Material Sale' : 'Operational Expense',
      description,
      partnerName: partner || 'Direct Recycler',
      weightKg: weightKg ? parseFloat(weightKg) : undefined,
      amountPaise,
      date: dateStr,
      invoiceNo: invRef,
    };

    setRecords([newRecord, ...records]);
    setShowAddModal(false);
    setDescription('');
    setPartner('');
    setWeightKg('');
    setAmountRupees('');

    try {
      const supabase = createClient();
      if (formType === 'sale') {
        await supabase.from('sales').insert({
          sale_date: dateStr,
          buyer: partner || 'Recycler Partner',
          plastic_kind: 'Mixed Recyclable Plastic',
          weight_grams: Math.round((parseFloat(weightKg) || 1) * 1000),
          rate_paise_per_kg: Math.round(amountPaise / Math.max(1, parseFloat(weightKg) || 1)),
          amount_paise: amountPaise,
          invoice_ref: invRef,
          note: description,
        });
      } else {
        await supabase.from('expenses').insert({
          expense_date: dateStr,
          category: 'Operations',
          amount_paise: amountPaise,
          note: description,
        });
      }
    } catch (err) {
      console.warn('Could not save live accounting transaction:', err);
    }

    showBanner(`Logged ${formType} transaction of ₹${amtRupees.toLocaleString('en-IN')}`);
  };

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
      {/* Toast Notification */}
      {notification && (
        <div className="p-4 rounded-xl bg-brand-primary-soft border border-brand-primary-strong/30 text-ink text-sm font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-primary-strong shrink-0" />
            <span>{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-ink-muted hover:text-ink"
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
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-primary-strong text-white font-bold text-xs shadow-xs hover:opacity-95"
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
            ₹{(totalRevenuePaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-ink-muted mt-1 block">Proceeds from recycled plastic</span>
        </div>

        {/* Net Cash Balance */}
        <div className="bg-surface rounded-2xl border border-line p-5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-surface-alt border border-line text-ink flex items-center justify-center mb-3">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">
            Net Surplus
          </span>
          <div
            className={`text-2xl font-black tabular-nums mt-0.5 ${
              netBalancePaise >= 0 ? 'text-emerald-900' : 'text-rose-900'
            }`}
          >
            ₹{(netBalancePaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-ink-muted mt-1 block">
            Total expenses: ₹{(totalExpensePaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Transaction Feed */}
      <div className="bg-surface rounded-2xl border border-line shadow-xs overflow-hidden">
        <div className="p-4 border-b border-line flex items-center justify-between">
          <h2 className="font-extrabold text-sm text-ink">Recent Sales &amp; Expense Transactions</h2>
          {records.length > 0 && (
            <span className="text-xs text-ink-muted font-bold">{records.length} transactions</span>
          )}
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-xs text-ink-muted space-y-2">
            <div className="w-6 h-6 rounded-full border-2 border-brand-primary-strong border-t-transparent animate-spin mx-auto" />
            <p>Syncing live ledger transactions...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-surface-alt border border-line text-brand-primary-strong mx-auto flex items-center justify-center">
              <Inbox className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-sm font-bold text-ink">No Accounting Transactions Logged</h3>
            <p className="text-xs text-ink-muted max-w-sm mx-auto">
              When plastic is sold to recyclers or logistics expenses occur, click &quot;Record Transaction&quot; to log them.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-line/60">
            {records.map((record) => (
              <div
                key={record.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-alt/40 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      record.type === 'sale'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {record.type === 'sale' ? (
                      <Truck className="w-4 h-4" />
                    ) : (
                      <DollarSign className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-ink">{record.description}</div>
                    <div className="text-xs text-ink-muted flex items-center gap-2 mt-0.5">
                      <span>{record.partnerName}</span>
                      <span>•</span>
                      <span>{record.date}</span>
                      {record.invoiceNo && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-[10px] text-brand-primary-strong">
                            {record.invoiceNo}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right sm:shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                  <div
                    className={`text-base font-black tabular-nums ${
                      record.type === 'sale' ? 'text-emerald-800' : 'text-rose-800'
                    }`}
                  >
                    {record.type === 'sale' ? '+' : '-'}₹
                    {(record.amountPaise / 100).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                  {record.weightKg && (
                    <div className="text-[11px] text-ink-muted font-bold">
                      {record.weightKg} kg material
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl border border-line max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="font-black text-ink text-base">Record Ledger Entry</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-ink-muted hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-ink mb-1">Transaction Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormType('sale')}
                    className={`py-2 rounded-xl border text-center font-bold transition-all ${
                      formType === 'sale'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600'
                        : 'border-line bg-surface text-ink-muted'
                    }`}
                  >
                    Plastic Sale (Income)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('expense')}
                    className={`py-2 rounded-xl border text-center font-bold transition-all ${
                      formType === 'expense'
                        ? 'border-rose-600 bg-rose-50 text-rose-900 ring-1 ring-rose-600'
                        : 'border-line bg-surface text-ink-muted'
                    }`}
                  >
                    Operational Expense
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Description *</label>
                <input
                  type="text"
                  placeholder={
                    formType === 'sale'
                      ? 'e.g. Sale of baled PET bottles to recycler'
                      : 'e.g. Vehicle transport fuel & driver fees'
                  }
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-line bg-surface text-ink text-sm focus-visible:outline-2 focus-visible:outline-brand-primary-strong"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Vendor / Recycler Partner</label>
                <input
                  type="text"
                  placeholder="e.g. GreenCycle Polymers Pvt Ltd"
                  value={partner}
                  onChange={(e) => setPartner(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-line bg-surface text-ink text-sm focus-visible:outline-2 focus-visible:outline-brand-primary-strong"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {formType === 'sale' && (
                  <div>
                    <label className="block font-bold text-ink mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 50"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-line bg-surface text-ink text-sm focus-visible:outline-2 focus-visible:outline-brand-primary-strong"
                    />
                  </div>
                )}
                <div className={formType === 'sale' ? '' : 'col-span-2'}>
                  <label className="block font-bold text-ink mb-1">Amount (₹ Rupees) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 1500.00"
                    value={amountRupees}
                    onChange={(e) => setAmountRupees(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-line bg-surface text-ink text-sm focus-visible:outline-2 focus-visible:outline-brand-primary-strong"
                    required
                  />
                </div>
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
                  Post to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
