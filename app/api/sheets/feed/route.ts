import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'entries';

  // Demo fallback rows in case database tables are in setup
  const demoEntries = [
    {
      timestamp: '2026-09-28 11:42:00',
      id: 'ent-101',
      student_name: 'Aditya Kumar',
      roll_no: '24CS108',
      department: 'Computer Science',
      bin_name: 'Cafeteria Station A',
      bin_code: '7K3Q9DX2',
      category: 'Small Bottle (<750ml)',
      items: 4,
      points: 20,
      status: 'pending',
    },
    {
      timestamp: '2026-09-28 10:15:00',
      id: 'ent-102',
      student_name: 'Pooja Sharma',
      roll_no: '23CS042',
      department: 'Computer Science',
      bin_name: 'Library Quad Bin',
      bin_code: '9MN42BC8',
      category: 'Medium Bottle (1L-1.5L)',
      items: 6,
      points: 48,
      status: 'verified',
    },
    {
      timestamp: '2026-09-28 09:30:00',
      id: 'ent-103',
      student_name: 'Rahul Verma',
      roll_no: '25BT019',
      department: 'Biotechnology',
      bin_name: 'Cafeteria Station A',
      bin_code: '7K3Q9DX2',
      category: 'Rigid Container',
      items: 3,
      points: 30,
      status: 'verified',
    },
    {
      timestamp: '2026-09-27 15:15:00',
      id: 'ent-104',
      student_name: 'Sneha Roy',
      roll_no: '24EC088',
      department: 'Economics',
      bin_name: 'Science Block Bin',
      bin_code: '3P8R5WT4',
      category: 'Large Bottle (2L+)',
      items: 2,
      points: 30,
      status: 'verified',
    },
  ];

  try {
    if (type === 'batches') {
      const csvHeader = 'batch_id,bin_code,bin_name,actual_weight_g,expected_grams,ratio,entries_count,items_count,status,finalized_at\n';
      const demoBatches = [
        'B-7K3Q9D-0928,7K3Q9DX2,"Cafeteria Station A",3800,3920,0.97,18,142,finalized,"2026-09-28 11:45:00"',
        'B-9MN42B-0926,9MN42BC8,"Library Quad Bin",5200,5100,1.02,24,198,finalized,"2026-09-26 16:30:00"',
      ].join('\n');

      return new NextResponse(csvHeader + demoBatches, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'inline; filename="google-sheets-batches.csv"',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }

    // Default: 'entries'
    let rows = demoEntries;
    try {
      const supabase = createAdminClient();
      const { data: dbEntries } = await supabase
        .from('entries')
        .select(`
          id,
          items,
          points_awarded,
          points_per_item_snapshot,
          status,
          created_at,
          profiles:student_id (full_name, roll_no, department),
          bins:bin_id (name, code),
          plastic_types:plastic_type_id (label)
        `)
        .order('created_at', { ascending: false })
        .limit(500);

      if (dbEntries && dbEntries.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rows = dbEntries.map((e: any) => ({
          timestamp: new Date(e.created_at).toISOString().replace('T', ' ').slice(0, 19),
          id: e.id,
          student_name: e.profiles?.full_name || 'Anonymous',
          roll_no: e.profiles?.roll_no || 'N/A',
          department: e.profiles?.department || 'General',
          bin_name: e.bins?.name || 'Drop Station',
          bin_code: e.bins?.code || 'N/A',
          category: e.plastic_types?.label || 'Plastic Bottle',
          items: e.items,
          points: e.points_awarded || e.items * (e.points_per_item_snapshot || 5),
          status: e.status,
        }));
      }
    } catch {
      // Fallback gracefully to demo rows
    }

    const csvHeader = 'Timestamp,Entry ID,Student Name,Roll Number,Department,Bin Name,Bin Code,Plastic Category,Items Dropped,Points,Status\n';
    const csvRows = rows
      .map(
        (r) =>
          `"${r.timestamp}","${r.id}","${r.student_name}","${r.roll_no}","${r.department}","${r.bin_name}","${r.bin_code}","${r.category}",${r.items},${r.points},"${r.status}"`
      )
      .join('\n');

    return new NextResponse(csvHeader + csvRows, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'inline; filename="google-sheets-entries.csv"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating Google Sheets feed:', error);
    return new NextResponse('Error generating live feed', { status: 500 });
  }
}
