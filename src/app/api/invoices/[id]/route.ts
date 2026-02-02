import { NextRequest } from 'next/server';
import { getInvoiceById, updateInvoice, deleteInvoice } from '@/services/invoice.service';
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/response';
import { UpdateInvoiceDTO } from '@/types/invoice';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/invoices/[id] - Get invoice by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const invoiceId = parseInt(id, 10);

    if (isNaN(invoiceId)) {
      return errorResponse('Invalid invoice ID');
    }

    const invoice = await getInvoiceById(invoiceId);

    if (!invoice) {
      return notFoundResponse('Invoice not found');
    }

    return successResponse(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return serverErrorResponse();
  }
}

/**
 * PUT /api/invoices/[id] - Update invoice payment status
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const invoiceId = parseInt(id, 10);

    if (isNaN(invoiceId)) {
      return errorResponse('Invalid invoice ID');
    }

    const body: UpdateInvoiceDTO = await request.json();
    const invoice = await updateInvoice(invoiceId, body);

    if (!invoice) {
      return notFoundResponse('Invoice not found');
    }

    return successResponse(invoice, 'Invoice updated successfully');
  } catch (error) {
    console.error('Error updating invoice:', error);
    return serverErrorResponse();
  }
}

/**
 * DELETE /api/invoices/[id] - Delete invoice
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const invoiceId = parseInt(id, 10);

    if (isNaN(invoiceId)) {
      return errorResponse('Invalid invoice ID');
    }

    const deleted = await deleteInvoice(invoiceId);

    if (!deleted) {
      return notFoundResponse('Invoice not found');
    }

    return successResponse(null, 'Invoice deleted successfully');
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return serverErrorResponse();
  }
}
