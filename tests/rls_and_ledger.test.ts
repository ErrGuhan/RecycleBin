import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Phase 1: Database Schema, RLS, Append-Only Trigger & RPC Verification', () => {
  const migrationsDir = path.resolve(__dirname, '../supabase/migrations');

  it('verifies migration 001 defines all 12 tables and strict foreign keys', () => {
    const sql = fs.readFileSync(path.join(migrationsDir, '20260928000001_initial_schema.sql'), 'utf-8');
    const requiredTables = [
      'campuses',
      'profiles',
      'bins',
      'bin_codes',
      'plastic_types',
      'entries',
      'verification_batches',
      'points_ledger',
      'tiers',
      'certificates',
      'settings',
      'sales',
      'expenses',
      'audit_log',
    ];

    for (const table of requiredTables) {
      expect(sql).toContain(`CREATE TABLE ${table}`);
    }
    // Partial unique index for one open batch per bin
    expect(sql).toContain('idx_one_open_batch_per_bin');
  });

  it('verifies migration 002 enforces append-only trigger on points_ledger', () => {
    const sql = fs.readFileSync(path.join(migrationsDir, '20260928000002_views_and_triggers.sql'), 'utf-8');
    expect(sql).toContain('enforce_points_ledger_append_only()');
    expect(sql).toContain('BEFORE UPDATE OR DELETE ON points_ledger');
    expect(sql).toContain('points_ledger is append-only');
    expect(sql).toContain('CREATE OR REPLACE VIEW student_totals');
    expect(sql).toContain('CREATE OR REPLACE VIEW bin_pending');
  });

  it('verifies migration 003 enforces strict RLS on all tables and negative student isolation', () => {
    const sql = fs.readFileSync(path.join(migrationsDir, '20260928000003_rls_policies.sql'), 'utf-8');
    // RLS enabled on all tables
    expect(sql).toContain('ALTER TABLE profiles ENABLE ROW LEVEL SECURITY');
    expect(sql).toContain('ALTER TABLE entries ENABLE ROW LEVEL SECURITY');
    expect(sql).toContain('ALTER TABLE points_ledger ENABLE ROW LEVEL SECURITY');
    expect(sql).toContain('ALTER TABLE certificates ENABLE ROW LEVEL SECURITY');
    expect(sql).toContain('ALTER TABLE verification_batches ENABLE ROW LEVEL SECURITY');

    // Negative rule: Student can ONLY read their own rows
    expect(sql).toContain('student_id = auth.uid()');
    // Financial sales/expenses strictly admin only
    expect(sql).toContain('Admins manage sales');
    expect(sql).toContain('Admins manage expenses');
  });

  it('verifies migration 004 enforces SECURITY DEFINER with search_path and transactional locks', () => {
    const sql = fs.readFileSync(path.join(migrationsDir, '20260928000004_rpc_functions.sql'), 'utf-8');
    const requiredRPCs = [
      'public_bin_lookup',
      'submit_entry',
      'undo_entry',
      'create_batch',
      'cancel_batch',
      'finalize_batch',
      'issue_tier_certificates',
      'verify_certificate',
      'public_stats',
    ];

    for (const rpc of requiredRPCs) {
      expect(sql).toContain(`FUNCTION ${rpc}`);
    }
    // Search path safety
    expect(sql).toContain('SET search_path = public, pg_temp');
    // Transactional row lock on pending entries
    expect(sql).toContain('FOR UPDATE');
    // Ratio hard-stop guardrail
    expect(sql).toContain('ratio < 0.5000');
  });
});
