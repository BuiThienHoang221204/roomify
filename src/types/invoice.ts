import { PaymentMethod, PaymentStatus } from '@/constants/enums';

export interface Invoice {
  invoice_id: string;
  rental_id: string;
  month: string;
  room_price: number;
  electric_cost: number;
  water_cost: number;
  extra_fee: number;
  total: number;
  payment_method: PaymentMethod | null;
  payment_status: PaymentStatus;
  transaction_id: string;
  paid_at: string | null;
  [key: string]: unknown;
}

export interface CreateInvoiceDTO {
  rental_id: string;
  month: string;
  room_price: number;
  electric_cost: number;
  water_cost: number;
  extra_fee?: number;
  [key: string]: unknown;
}

export interface UpdateInvoiceDTO {
  payment_method?: PaymentMethod;
  payment_status?: PaymentStatus;
  transaction_id?: string;
  paid_at?: string;
  [key: string]: unknown;
}
