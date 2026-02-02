import { NextResponse } from 'next/server';
import { initializeMetaSheet } from '@/lib/autoIncrement';
import { successResponse, serverErrorResponse } from '@/lib/response';

/**
 * POST /api/init - Initialize the database (META sheet)
 * Run this once to set up the META sheet
 */
export async function POST() {
  try {
    await initializeMetaSheet();
    return successResponse(null, 'Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    return serverErrorResponse();
  }
}

/**
 * GET /api/init - Check initialization status
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Use POST to initialize the database',
    endpoints: {
      users: '/api/users',
      rooms: '/api/rooms',
      rentals: '/api/rentals',
      meters: '/api/meters',
      invoices: '/api/invoices',
      issues: '/api/issues',
      webhooks: '/api/webhooks/sepay',
    },
  });
}
