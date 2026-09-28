import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { CertificatePDF } from '@/lib/pdf/certificate';
import { generateQrDataUrl } from '@/lib/qr';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const origin = request.nextUrl.origin || 'http://localhost:3000';
  const verifyUrl = `${origin}/verify/${id}`;

  try {
    const qrDataUrl = await generateQrDataUrl(verifyUrl, 250);

    const certElement = React.createElement(CertificatePDF, {
      data: {
        certificateNo: id,
        studentName: 'Aditya Kumar',
        tierName: 'Bronze',
        campusName: "St. Xavier's College - Main Campus",
        itemsCount: 120,
        estimatedKg: 2.8,
        issueDate: '2026-09-28',
        qrDataUrl,
        signatoryName: 'Dr. S. Mukherjee',
        signatoryTitle: 'Dean of Student Affairs & Sustainability',
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(certElement as any);
    const uint8Array = new Uint8Array(buffer);

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="certificate-${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating certificate PDF:', error);
    return new NextResponse('Error generating PDF', { status: 500 });
  }
}
