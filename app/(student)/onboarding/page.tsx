'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { createClient } from '@/lib/supabase/client';
import {
  User,
  GraduationCap,
  Calendar,
  Clock,
  Hash,
  Phone,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

function OnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next');
  const safeRedirect = nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')
    ? nextParam
    : '/home';

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [semester, setSemester] = useState('Sem 4');
  const [year, setYear] = useState('2nd Year');
  const [rollNo, setRollNo] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const isAdult = true;
  const [consented, setConsented] = useState(true);

  // Status state
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const departments = [
    'Computer Science',
    'Electronics & Comm',
    'Mechanical Engg',
    'Civil Engineering',
    'Biotechnology',
    'Commerce & Mgmt',
    'Chemistry & Sciences',
    'Arts & Humanities',
  ];

  const semesters = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'];
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  // ONE-TIME ACCESS CHECK: If profile is already filled, immediately bypass to /home
  useEffect(() => {
    async function checkExistingProfile() {
      try {
        // 1. Check local session cache first for instant one-time bypass
        if (typeof window !== 'undefined') {
          const cached = localStorage.getItem('recyclebin_student_profile');
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (parsed?.roll_no && parsed?.status === 'active') {
                router.replace(safeRedirect);
                return;
              }
            } catch {
              // ignore parse errors
            }
          }
        }

        // 2. Check Supabase profiles table
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('roll_no, status, first_name, last_name')
            .eq('id', user.id)
            .maybeSingle();

          if (profile?.roll_no && profile?.status === 'active') {
            // Already completed: redirect immediately, no re-entry
            router.replace(safeRedirect);
            return;
          }

          // Pre-populate if partial data exists
          if (profile?.first_name) setFirstName(profile.first_name);
          if (profile?.last_name) setLastName(profile.last_name);
        }
      } catch (err) {
        console.warn('Profile check error, continuing to form:', err);
      } finally {
        setIsLoading(false);
      }
    }

    checkExistingProfile();
  }, [router, safeRedirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter both your First Name and Last Name.');
      return;
    }

    if (!rollNo.trim()) {
      setError('Please provide your College Roll / Registration Number.');
      return;
    }

    if (!contactNumber.trim()) {
      setError('Please provide your Contact Number.');
      return;
    }

    if (!consented) {
      setError('Please agree to the DPDP Consent for issuing verified certificates.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const cleanRoll = rollNo.trim().toUpperCase();
    const cleanPhone = contactNumber.trim();

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Save to Supabase profiles
        const { error: dbError } = await supabase.from('profiles').upsert({
          id: user.id,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          full_name: fullName,
          department,
          semester,
          year,
          roll_no: cleanRoll,
          phone: cleanPhone,
          status: 'active',
          is_adult: isAdult,
          consent_version: '1.0',
          consented_at: new Date().toISOString(),
        });

        if (dbError) {
          console.warn('Supabase profile save warning (fallback to local state):', dbError.message);
        }
      }

      // Persist to local cache so user never has to re-fill this on this device
      const profileData = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        full_name: fullName,
        department,
        semester,
        year,
        roll_no: cleanRoll,
        phone: cleanPhone,
        status: 'active',
        completed_at: new Date().toISOString(),
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('recyclebin_student_profile', JSON.stringify(profileData));
      }

      // Redirect immediately to home or scanned bin
      router.replace(safeRedirect);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save profile. Please try again.';
      setError(message);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-brand-primary-strong border-t-transparent animate-spin" />
        <p className="text-xs text-ink-muted font-medium">Checking profile status...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-5">
      {/* Brand Header */}
      <div className="text-center space-y-1.5">
        <div className="flex justify-center mb-1">
          <BrandLogo href="/" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary-soft text-brand-primary-strong text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>One-Time Student Registration</span>
        </div>
        <h1 className="text-xl font-black text-ink tracking-tight">Student Profile Setup</h1>
        <p className="text-xs text-ink-muted">
          Your credentials are required once to authenticate your recycling credits and issue verified certificates.
        </p>
      </div>

      {/* Main Registration Card */}
      <div className="bg-surface rounded-3xl border border-line p-5 shadow-sm space-y-4">
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Section 1: Name (First Name + Last Name) */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
              <User className="w-4 h-4 text-brand-primary-strong" />
              <span>Full Name</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label htmlFor="first-name" className="block text-[11px] font-semibold text-ink-muted mb-1">
                  First Name *
                </label>
                <input
                  id="first-name"
                  type="text"
                  placeholder="e.g. Aditya"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-line bg-surface text-ink text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary-strong"
                  required
                />
              </div>
              <div>
                <label htmlFor="last-name" className="block text-[11px] font-semibold text-ink-muted mb-1">
                  Last Name *
                </label>
                <input
                  id="last-name"
                  type="text"
                  placeholder="e.g. Kumar"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-line bg-surface text-ink text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary-strong"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: College Roll Number */}
          <div className="space-y-1.5">
            <label htmlFor="roll-no" className="flex items-center gap-1.5 font-bold text-ink">
              <Hash className="w-4 h-4 text-brand-primary-strong" />
              <span>Roll / Registration Number *</span>
            </label>
            <input
              id="roll-no"
              type="text"
              placeholder="e.g. 24CS108"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value.toUpperCase())}
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-line bg-surface text-ink text-sm font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-brand-primary-strong tracking-wider"
              required
            />
          </div>

          {/* Section 3: Department */}
          <div className="space-y-1.5">
            <label htmlFor="department" className="flex items-center gap-1.5 font-bold text-ink">
              <GraduationCap className="w-4 h-4 text-brand-primary-strong" />
              <span>Department / Major *</span>
            </label>
            <select
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full min-h-[44px] px-3 rounded-xl border border-line bg-surface text-ink text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary-strong"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Section 4: Semester & Year Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1.5">
              <label htmlFor="semester" className="flex items-center gap-1.5 font-bold text-ink">
                <Calendar className="w-4 h-4 text-brand-primary-strong" />
                <span>Semester *</span>
              </label>
              <select
                id="semester"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full min-h-[44px] px-3 rounded-xl border border-line bg-surface text-ink text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary-strong"
              >
                {semesters.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="year" className="flex items-center gap-1.5 font-bold text-ink">
                <Clock className="w-4 h-4 text-brand-primary-strong" />
                <span>Year *</span>
              </label>
              <select
                id="year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full min-h-[44px] px-3 rounded-xl border border-line bg-surface text-ink text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary-strong"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 5: Contact Number */}
          <div className="space-y-1.5">
            <label htmlFor="contact-number" className="flex items-center gap-1.5 font-bold text-ink">
              <Phone className="w-4 h-4 text-brand-primary-strong" />
              <span>Contact Number (Mobile / WhatsApp) *</span>
            </label>
            <input
              id="contact-number"
              type="tel"
              placeholder="+91 98765 43210"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-line bg-surface text-ink text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary-strong"
              required
            />
          </div>

          {/* Icon-Driven Consent Badge */}
          <div className="p-3 rounded-2xl bg-surface-alt border border-line space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-primary-strong shrink-0" />
              <span className="font-bold text-ink text-[11px]">Privacy & Certificate Policy</span>
            </div>
            <label className="flex items-start gap-2.5 cursor-pointer text-[11px] leading-relaxed text-ink-muted">
              <input
                type="checkbox"
                checked={consented}
                onChange={(e) => setConsented(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-line text-brand-primary-strong accent-brand-primary-strong shrink-0"
              />
              <span>
                I confirm I am 18+ and consent to registering my roll number for certificate issuance under the DPDP Act.
              </span>
            </label>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-[48px] rounded-2xl bg-brand-primary-strong text-white font-bold text-sm shadow-sm hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-3"
          >
            <span>{isSubmitting ? 'Saving Profile...' : 'Complete Profile & Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Security Footnote */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-ink-muted">
        <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary-strong" />
        <span>One-time setup • Stored securely on campus database</span>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-2">
          <div className="w-7 h-7 rounded-full border-2 border-brand-primary-strong border-t-transparent animate-spin" />
          <p className="text-xs text-ink-muted">Loading profile setup...</p>
        </div>
      }
    >
      <OnboardingForm />
    </Suspense>
  );
}
