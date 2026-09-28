import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const webhookUrl =
      process.env.GOOGLE_SHEETS_WEBHOOK_URL || body.webhookUrl;

    if (!webhookUrl) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Google Sheets Webhook URL not configured. Set GOOGLE_SHEETS_WEBHOOK_URL in environment or pass webhookUrl in payload.',
        },
        { status: 400 }
      );
    }

    // Format row payload for Google Apps Script doPost(e)
    const payload = {
      timestamp: new Date().toISOString(),
      eventType: body.eventType || 'entry_created',
      data: body.data || body,
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        {
          success: false,
          status: response.status,
          error: `Google Sheets Webhook returned error: ${errText}`,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully synchronized real-time data to Google Sheets!',
      syncedAt: payload.timestamp,
    });
  } catch (error) {
    console.error('Error syncing to Google Sheets:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
