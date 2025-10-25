import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/adminAuth';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

/**
 * Admin API: Export users data in multiple formats
 * GET /api/admin/users/export
 *
 * Query Parameters:
 * - format: 'csv' | 'excel' | 'pdf' | 'json'
 * - fields: Comma-separated list of fields to include
 * - All filter parameters from main users endpoint
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'csv';
    const fieldsParam = searchParams.get('fields') || '';
    const fields = fieldsParam.split(',').filter(Boolean);

    // Get filter parameters
    const search = searchParams.get('search') || '';
    const roleFilter = searchParams.get('role') || '';
    const tierFilter = searchParams.get('tier') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const supabase = getSupabaseAdminClient();

    // Build query with filters
    let query = supabase.from('user_profiles').select('*');

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    if (roleFilter) {
      query = query.eq('user_role', roleFilter);
    }

    if (tierFilter) {
      query = query.eq('subscription_tier', tierFilter);
    }

    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data: users, error } = await query;

    if (error) {
      console.error('Error fetching users for export:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users', details: error.message },
        { status: 500 }
      );
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'No users found matching the criteria' }, { status: 404 });
    }

    // Filter fields if specified
    const filteredUsers =
      fields.length > 0
        ? users.map((user) => {
            const filtered: Record<string, unknown> = {};
            fields.forEach((field) => {
              if (field in user) {
                filtered[field] = user[field as keyof typeof user];
              }
            });
            return filtered;
          })
        : users;

    // Generate export based on format
    switch (format) {
      case 'csv':
        return generateCSV(filteredUsers, fields);

      case 'json':
        return new NextResponse(JSON.stringify(filteredUsers, null, 2), {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="users-export-${Date.now()}.json"`,
          },
        });

      case 'excel':
      case 'pdf':
        // For now, return CSV for these formats
        // In production, implement proper Excel/PDF generation
        return NextResponse.json(
          { error: `${format.toUpperCase()} export coming soon. Please use CSV or JSON for now.` },
          { status: 501 }
        );

      default:
        return NextResponse.json({ error: `Unsupported format: ${format}` }, { status: 400 });
    }
  } catch (error) {
    console.error('Admin export API error:', error);
    return NextResponse.json(
      { error: 'Unauthorized or internal error' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

/**
 * Generate CSV export
 */
function generateCSV(data: Record<string, unknown>[], fields?: string[]): NextResponse {
  if (data.length === 0) {
    return NextResponse.json({ error: 'No data to export' }, { status: 400 });
  }

  // Get headers from first row or use specified fields
  const headers = fields && fields.length > 0 ? fields : Object.keys(data[0]);

  // Create CSV content
  const csvRows: string[] = [];

  // Add header row
  csvRows.push(headers.map(escapeCSV).join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header];
      if (value === null || value === undefined) {
        return '';
      }
      if (typeof value === 'object') {
        return escapeCSV(JSON.stringify(value));
      }
      return escapeCSV(String(value));
    });
    csvRows.push(values.join(','));
  }

  const csvContent = csvRows.join('\n');

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="users-export-${Date.now()}.csv"`,
    },
  });
}

/**
 * Escape CSV values
 */
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
