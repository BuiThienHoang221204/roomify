import { NextRequest } from 'next/server';
import { getInvoiceById, markInvoiceAsPaid, markInvoiceAsFailed } from '@/services/invoice.service';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/response';
import { PaymentMethod, PaymentStatus } from '@/constants/enums';

/**
 * Sepay Webhook Data Interface
 */
interface SepayWebhookPayload {
  id: number;
  gateway: string;
  transactionDate: string;
  accountNumber: string;
  code: string | null;
  content: string;
  transferType: 'in' | 'out';
  transferAmount: number;
  accumulated: number;
  subAccount: string | null;
  referenceCode: string;
  description: string;
}

/**
 * POST /api/webhooks/sepay - Handle Sepay payment webhook
 * 
 * This endpoint receives payment notifications from Sepay
 * and updates the corresponding invoice status
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (in production, implement proper verification)
    const signature = request.headers.get('x-sepay-signature');
    
    // TODO: Implement signature verification
    // const isValid = verifySepaySignature(signature, body);
    
    if (!signature) {
      console.warn('Sepay webhook received without signature');
      // In development, continue processing. In production, reject.
    }

    const payload: SepayWebhookPayload = await request.json();

    console.log('Sepay webhook received:', JSON.stringify(payload, null, 2));

    // Only process incoming transfers
    if (payload.transferType !== 'in') {
      return successResponse({ message: 'Ignored outgoing transfer' });
    }

    // Parse invoice ID from transfer content or reference code
    // Expected format: "ROOMIFY_INV_123" or similar
    const invoiceId = parseInvoiceIdFromContent(payload.content || payload.referenceCode);

    if (!invoiceId) {
      console.warn('Could not parse invoice ID from payment:', payload.content);
      return successResponse({ message: 'Invoice ID not found in payment content' });
    }

    // Get the invoice
    const invoice = await getInvoiceById(invoiceId);

    if (!invoice) {
      console.warn('Invoice not found:', invoiceId);
      return errorResponse('Invoice not found', 404);
    }

    // Check if already paid
    if (invoice.payment_status === PaymentStatus.PAID) {
      return successResponse({ message: 'Invoice already paid' });
    }

    // Verify payment amount
    if (payload.transferAmount < invoice.total) {
      console.warn(`Insufficient payment: ${payload.transferAmount} < ${invoice.total}`);
      // Mark as failed or partial (depending on business logic)
      await markInvoiceAsFailed(invoiceId);
      return errorResponse('Insufficient payment amount');
    }

    // Mark invoice as paid
    const updatedInvoice = await markInvoiceAsPaid(
      invoiceId,
      PaymentMethod.SEPAY,
      payload.referenceCode || String(payload.id)
    );

    console.log('Invoice marked as paid:', invoiceId);

    // TODO: Send notification to user via Zalo OA or Web notification
    // await notificationService.sendPaymentSuccess(invoice.rental_id, invoiceId);

    return successResponse({
      message: 'Payment processed successfully',
      invoice: updatedInvoice,
    });
  } catch (error) {
    console.error('Error processing Sepay webhook:', error);
    return serverErrorResponse();
  }
}

/**
 * Parse invoice ID from payment content
 * Expected formats:
 * - "ROOMIFY INV 123"
 * - "ROOMIFY_INV_123"
 * - "INV123"
 * - etc.
 */
function parseInvoiceIdFromContent(content: string): number | null {
  if (!content) return null;

  // Try different patterns
  const patterns = [
    /ROOMIFY[_\s]?INV[_\s]?(\d+)/i,
    /INV[_\s]?(\d+)/i,
    /INVOICE[_\s]?(\d+)/i,
    /HD[_\s]?(\d+)/i, // Vietnamese: Hóa đơn
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
  }

  return null;
}

/**
 * GET /api/webhooks/sepay - Health check endpoint
 */
export async function GET() {
  return successResponse({
    status: 'ok',
    message: 'Sepay webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}
