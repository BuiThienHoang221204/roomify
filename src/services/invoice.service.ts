import { googleSheet } from '@/lib/googleSheet';
import { getNextId } from '@/lib/autoIncrement';
import { SheetName, PaymentStatus, PaymentMethod, MeterType } from '@/constants/enums';
import { Invoice, CreateInvoiceDTO, UpdateInvoiceDTO } from '@/types/invoice';
import { getRentalById } from './rental.service';
import { getRoomById } from './room.service';
import { getMeterByRentalTypeMonth, calculateConsumption } from './meter.service';

const SHEET = SheetName.INVOICES;
const ID_FIELD = 'invoice_id';

/**
 * Get all invoices
 */
export const getAllInvoices = async (): Promise<Invoice[]> => {
  return googleSheet.getAll<Invoice>(SHEET);
};

/**
 * Get invoice by ID
 */
export const getInvoiceById = async (id: number): Promise<Invoice | null> => {
  return googleSheet.getById<Invoice>(SHEET, ID_FIELD, id);
};

/**
 * Get invoices by rental ID
 */
export const getInvoicesByRentalId = async (rentalId: number): Promise<Invoice[]> => {
  return googleSheet.getByField<Invoice>(SHEET, 'rental_id', rentalId);
};

/**
 * Get invoice by rental and month
 */
export const getInvoiceByRentalAndMonth = async (rentalId: number, month: string): Promise<Invoice | null> => {
  const invoices = await getInvoicesByRentalId(rentalId);
  return invoices.find((inv) => inv.month === month) || null;
};

/**
 * Get unpaid invoices
 */
export const getUnpaidInvoices = async (): Promise<Invoice[]> => {
  return googleSheet.getByField<Invoice>(SHEET, 'payment_status', PaymentStatus.UNPAID);
};

/**
 * Get overdue invoices (unpaid and past due date)
 */
export const getOverdueInvoices = async (): Promise<Invoice[]> => {
  const unpaidInvoices = await getUnpaidInvoices();
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  return unpaidInvoices.filter((inv) => inv.month < currentMonth);
};

/**
 * Create a new invoice
 */
export const createInvoice = async (data: CreateInvoiceDTO): Promise<Invoice> => {
  // Check if invoice already exists for this rental/month
  const existing = await getInvoiceByRentalAndMonth(data.rental_id, data.month);
  if (existing) {
    throw new Error(`Invoice for ${data.month} already exists`);
  }

  const invoiceId = await getNextId(SHEET);
  const total = data.room_price + data.electric_cost + data.water_cost + (data.extra_fee || 0);

  const invoice: Invoice = {
    invoice_id: invoiceId,
    rental_id: data.rental_id,
    month: data.month,
    room_price: data.room_price,
    electric_cost: data.electric_cost,
    water_cost: data.water_cost,
    extra_fee: data.extra_fee || 0,
    total,
    payment_method: null,
    payment_status: PaymentStatus.UNPAID,
    transaction_id: '',
    paid_at: null,
  };

  await googleSheet.append(SHEET, invoice);
  return invoice;
};

/**
 * Generate invoice for a rental
 */
export const generateInvoice = async (rentalId: number, month: string): Promise<Invoice> => {
  // Get rental and room info
  const rental = await getRentalById(rentalId);
  if (!rental) {
    throw new Error('Rental not found');
  }

  const room = await getRoomById(rental.room_id);
  if (!room) {
    throw new Error('Room not found');
  }

  // Get meter readings
  const electricMeter = await getMeterByRentalTypeMonth(rentalId, MeterType.ELECTRIC, month);
  const waterMeter = await getMeterByRentalTypeMonth(rentalId, MeterType.WATER, month);

  // Calculate costs
  const electricConsumption = electricMeter ? calculateConsumption(electricMeter) : 0;
  const waterConsumption = waterMeter ? calculateConsumption(waterMeter) : 0;

  const electricCost = electricConsumption * room.electric_price;
  const waterCost = waterConsumption * room.water_price;

  return createInvoice({
    rental_id: rentalId,
    month,
    room_price: room.price,
    electric_cost: electricCost,
    water_cost: waterCost,
    extra_fee: room.extra_fee,
  });
};

/**
 * Update invoice
 */
export const updateInvoice = async (id: number, data: UpdateInvoiceDTO): Promise<Invoice | null> => {
  return googleSheet.update<Invoice>(SHEET, ID_FIELD, id, data);
};

/**
 * Mark invoice as paid
 */
export const markInvoiceAsPaid = async (
  id: number,
  paymentMethod: PaymentMethod,
  transactionId: string
): Promise<Invoice | null> => {
  const now = new Date().toISOString();
  return updateInvoice(id, {
    payment_method: paymentMethod,
    payment_status: PaymentStatus.PAID,
    transaction_id: transactionId,
    paid_at: now,
  });
};

/**
 * Mark invoice as failed
 */
export const markInvoiceAsFailed = async (id: number): Promise<Invoice | null> => {
  return updateInvoice(id, {
    payment_status: PaymentStatus.FAILED,
  });
};

/**
 * Delete invoice
 */
export const deleteInvoice = async (id: number): Promise<boolean> => {
  return googleSheet.delete(SHEET, ID_FIELD, id);
};
