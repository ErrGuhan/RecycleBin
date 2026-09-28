import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { BinPlatePDF } from '@/lib/pdf/plate';
import { generateQrDataUrl, isValidBinCode } from '@/lib/qr';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;

  if (!isValidBinCode(code)) {
    return new NextResponse('Invalid bin code format', { status: 400 });
  }

  // Determine base URL
  const origin = request.nextUrl.origin || 'http://localhost:3000';
  const dropUrl = `${origin}/b/${code}`;

  try {
    const qrDataUrl = await generateQrDataUrl(dropUrl, 400);

    const plateElement = React.createElement(BinPlatePDF, {
      plate: {
        binName: `Campus Station ${code.slice(0, 4)}`,
        locationLabel: 'St. Xavier’s College - Official Drop Station',
        code: code.toUpperCase(),
        appUrl: origin,
        qrDataUrl,
      },
    });

    // Generate PDF buffer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(plateElement as any);

    const uint8Array = new Uint8Array(buffer);

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="bin-plate-${code}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating bin plate PDF:', error);
    return new NextResponse('Error generating PDF', { status: 500 });
  }
}
