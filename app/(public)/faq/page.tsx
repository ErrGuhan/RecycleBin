import React from 'react';
import Link from 'next/link';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import en from '@/messages/en.json';

export default function FAQPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary-strong hover:underline mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="mt-3 text-base text-ink-muted max-w-2xl leading-relaxed">
          Common questions about logging clean plastic, batch verification, credit point calculations, and certificate issuance.
        </p>
      </div>

      <div className="space-y-4">
        {en.faq.map((item, idx) => (
          <div
            key={idx}
            className="bg-surface rounded-xl p-6 border border-line shadow-xs space-y-2.5"
          >
            <h2 className="font-bold text-base text-ink flex items-start gap-2.5">
              <HelpCircle className="w-5 h-5 text-brand-primary-strong shrink-0 mt-0.5" />
              <span>{item.q}</span>
            </h2>
            <p className="text-sm text-ink-muted leading-relaxed pl-7.5">
              {item.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
