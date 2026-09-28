export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'student' | 'staff' | 'admin';
export type UserStatus = 'pending_onboarding' | 'active' | 'suspended' | 'anonymized';
export type BinStatus = 'active' | 'inactive' | 'maintenance';
export type EntryStatus = 'pending' | 'verified' | 'rejected' | 'cancelled';
export type BatchDecision = 'approve_all' | 'scaled' | 'reviewed';
export type BatchStatus = 'open' | 'finalized' | 'cancelled';
export type LedgerKind = 'earn' | 'reversal' | 'adjustment';
export type CertificateStatus = 'issued' | 'revoked';

export interface Database {
  public: {
    Tables: {
      campuses: {
        Row: {
          id: string;
          name: string;
          city: string;
          timezone: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          city: string;
          timezone?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          city?: string;
          timezone?: string;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          campus_id: string | null;
          role: UserRole;
          full_name: string;
          roll_no: string | null;
          department: string | null;
          year: string | null;
          phone: string | null;
          is_adult: boolean;
          show_on_leaderboard: boolean;
          consent_version: string;
          consented_at: string;
          status: UserStatus;
          created_at: string;
        };
        Insert: {
          id: string;
          campus_id?: string | null;
          role?: UserRole;
          full_name: string;
          roll_no?: string | null;
          department?: string | null;
          year?: string | null;
          phone?: string | null;
          is_adult?: boolean;
          show_on_leaderboard?: boolean;
          consent_version?: string;
          consented_at?: string;
          status?: UserStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          campus_id?: string | null;
          role?: UserRole;
          full_name?: string;
          roll_no?: string | null;
          department?: string | null;
          year?: string | null;
          phone?: string | null;
          is_adult?: boolean;
          show_on_leaderboard?: boolean;
          consent_version?: string;
          consented_at?: string;
          status?: UserStatus;
          created_at?: string;
        };
      };
      bins: {
        Row: {
          id: string;
          campus_id: string;
          code: string;
          name: string;
          location_label: string;
          latitude: number | null;
          longitude: number | null;
          status: BinStatus;
          last_verified_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          campus_id: string;
          code: string;
          name: string;
          location_label: string;
          latitude?: number | null;
          longitude?: number | null;
          status?: BinStatus;
          last_verified_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          campus_id?: string;
          code?: string;
          name?: string;
          location_label?: string;
          latitude?: number | null;
          longitude?: number | null;
          status?: BinStatus;
          last_verified_at?: string | null;
          created_at?: string;
        };
      };
      plastic_types: {
        Row: {
          id: string;
          key: string;
          label: string;
          points_per_item: number;
          avg_grams: number;
          active: boolean;
          sort: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          label: string;
          points_per_item: number;
          avg_grams: number;
          active?: boolean;
          sort?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          label?: string;
          points_per_item?: number;
          avg_grams?: number;
          active?: boolean;
          sort?: number;
          created_at?: string;
        };
      };
      entries: {
        Row: {
          id: string;
          student_id: string;
          bin_id: string;
          plastic_type_id: string;
          items: number;
          points_per_item_snapshot: number;
          avg_grams_snapshot: number;
          status: EntryStatus;
          batch_id: string | null;
          points_awarded: number | null;
          flags: string[];
          lat: number | null;
          lng: number | null;
          accuracy_m: number | null;
          idempotency_key: string;
          decision_note: string | null;
          decided_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          bin_id: string;
          plastic_type_id: string;
          items: number;
          points_per_item_snapshot: number;
          avg_grams_snapshot: number;
          status?: EntryStatus;
          batch_id?: string | null;
          points_awarded?: number | null;
          flags?: string[];
          lat?: number | null;
          lng?: number | null;
          accuracy_m?: number | null;
          idempotency_key: string;
          decision_note?: string | null;
          decided_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          bin_id?: string;
          plastic_type_id?: string;
          items?: number;
          points_per_item_snapshot?: number;
          avg_grams_snapshot?: number;
          status?: EntryStatus;
          batch_id?: string | null;
          points_awarded?: number | null;
          flags?: string[];
          lat?: number | null;
          lng?: number | null;
          accuracy_m?: number | null;
          idempotency_key?: string;
          decision_note?: string | null;
          decided_at?: string | null;
          created_at?: string;
        };
      };
      verification_batches: {
        Row: {
          id: string;
          bin_id: string;
          created_by: string;
          cutoff_at: string;
          weighed_grams: number;
          tare_grams: number;
          expected_grams: number;
          ratio: number | null;
          entries_count: number;
          items_count: number;
          decision: BatchDecision | null;
          scale_factor: number;
          status: BatchStatus;
          note: string | null;
          scale_photo_path: string | null;
          finalized_at: string | null;
          created_at: string;
        };
      };
      points_ledger: {
        Row: {
          id: string;
          student_id: string;
          entry_id: string | null;
          batch_id: string | null;
          points: number;
          kind: LedgerKind;
          note: string | null;
          created_by: string | null;
          created_at: string;
        };
      };
      tiers: {
        Row: {
          id: string;
          key: string;
          name: string;
          min_points: number;
          sort: number;
          active: boolean;
          created_at: string;
        };
      };
      certificates: {
        Row: {
          id: string;
          student_id: string;
          tier_id: string;
          certificate_no: string;
          items_at_issue: number;
          points_at_issue: number;
          pdf_path: string | null;
          status: CertificateStatus;
          issued_at: string;
        };
      };
      settings: {
        Row: {
          key: string;
          value: Json;
          is_public: boolean;
          updated_by: string | null;
          updated_at: string;
        };
      };
      sales: {
        Row: {
          id: string;
          sale_date: string;
          buyer: string;
          plastic_kind: string;
          weight_grams: number;
          rate_paise_per_kg: number;
          amount_paise: number;
          invoice_ref: string | null;
          note: string | null;
          created_at: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          expense_date: string;
          category: string;
          amount_paise: number;
          note: string | null;
          created_at: string;
        };
      };
      audit_log: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          target_type: string;
          target_id: string | null;
          before: Json | null;
          after: Json | null;
          created_at: string;
        };
      };
    };
    Functions: {
      public_bin_lookup: {
        Args: { p_code: string };
        Returns: {
          code: string;
          name: string;
          location_label: string;
          status: BinStatus;
        }[];
      };
      submit_entry: {
        Args: {
          p_bin_code: string;
          p_plastic_type_id: string;
          p_items: number;
          p_idempotency_key: string;
          p_lat?: number | null;
          p_lng?: number | null;
          p_accuracy_m?: number | null;
        };
        Returns: string;
      };
      undo_entry: {
        Args: { p_entry_id: string };
        Returns: boolean;
      };
      create_batch: {
        Args: {
          p_bin_id: string;
          p_weighed_grams: number;
          p_tare_grams?: number;
          p_note?: string | null;
          p_scale_photo_path?: string | null;
        };
        Returns: string;
      };
      cancel_batch: {
        Args: { p_batch_id: string };
        Returns: boolean;
      };
      finalize_batch: {
        Args: {
          p_batch_id: string;
          p_decision: BatchDecision;
          p_scale_factor?: number;
          p_note?: string | null;
        };
        Returns: boolean;
      };
      verify_certificate: {
        Args: { p_certificate_no: string };
        Returns: {
          certificate_no: string;
          recipient_masked: string;
          tier_name: string;
          campus_name: string;
          issued_at: string;
          items_at_issue: number;
          points_at_issue: number;
          status: CertificateStatus;
        }[];
      };
      public_stats: {
        Args: Record<PropertyKey, never>;
        Returns: {
          verified_kg: number;
          verified_items: number;
          active_students: number;
          certificates_issued: number;
        };
      };
    };
  };
}
