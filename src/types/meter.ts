import { MeterType } from '@/constants/enums';

export interface Meter {
  meter_id: string;
  rental_id: string;
  type: MeterType;
  month: string;
  old_value: number;
  new_value: number;
  ocr_value: number;
  image_url: string;
  confirmed: boolean;
  created_at: string;
  [key: string]: unknown;
}

export interface CreateMeterDTO {
  rental_id: string;
  type: MeterType;
  month: string;
  old_value: number;
  new_value?: number;
  ocr_value?: number;
  image_url?: string;
  [key: string]: unknown;
}

export interface UpdateMeterDTO {
  new_value?: number;
  confirmed?: boolean;
  [key: string]: unknown;
}
