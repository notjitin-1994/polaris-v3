/**
 * Health Check API
 * Simple endpoint to check if the server is reachable
 */

import { NextResponse } from 'next/server';

export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}

export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
}
