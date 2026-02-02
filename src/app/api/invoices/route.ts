import { NextRequest } from 'next/server';
import { getAllInvoices, getInvoicesByRentalId, getUnpaidInvoices, getOverdueInvoices, generateInvoice } from '@/services/invoice.service';
import {
  successResponse,
  createdResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/response';

/**
 * GET /api/invoices - Get invoices
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rentalId = searchParams.get('rental_id');
    const status = searchParams.get('status');

    let invoices;

    if (rentalId) {
      invoices = await getInvoicesByRentalId(parseInt(rentalId, 10));
    } else if (status === 'unpaid') {
      invoices = await getUnpaidInvoices();
    } else if (status === 'overdue') {
      invoices = await getOverdueInvoices();
    } else {
      invoices = await getAllInvoices();
    }

    return successResponse(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return serverErrorResponse();
  }
}

/**
 * POST /api/invoices - Generate invoice for a rental
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rental_id, month } = body;

    // Validate required fields
    if (!rental_id || !month) {
      return errorResponse('Missing required fields: rental_id, month');
    }

    const invoice = await generateInvoice(rental_id, month);
    return createdResponse(invoice, 'Invoice generated successfully');
  } catch (error) {
    console.error('Error generating invoice:', error);
    if (error instanceof Error) {
      return errorResponse(error.message);
    }
    return serverErrorResponse();
  }
}
