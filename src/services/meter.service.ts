import { googleSheet } from '@/lib/googleSheet';
import { getNextId } from '@/lib/autoIncrement';
import { SheetName, MeterType } from '@/constants/enums';
import { Meter, CreateMeterDTO, UpdateMeterDTO } from '@/types/meter';

const SHEET = SheetName.METERS;
const ID_FIELD = 'meter_id';

/**
 * Get all meters
 */
export const getAllMeters = async (): Promise<Meter[]> => {
  return googleSheet.getAll<Meter>(SHEET);
};

/**
 * Get meter by ID
 */
export const getMeterById = async (id: string): Promise<Meter | null> => {
  return googleSheet.getById<Meter>(SHEET, ID_FIELD, id);
};

/**
 * Get meters by rental ID
 */
export const getMetersByRentalId = async (rentalId: string): Promise<Meter[]> => {
  return googleSheet.getByField<Meter>(SHEET, 'rental_id', rentalId);
};

/**
 * Get meter by rental, type, and month
 */
export const getMeterByRentalTypeMonth = async (
  rentalId: string,
  type: MeterType,
  month: string
): Promise<Meter | null> => {
  const meters = await getMetersByRentalId(rentalId);
  return meters.find((m) => m.type === type && m.month === month) || null;
};

/**
 * Get last meter reading for a rental and type
 */
export const getLastMeterReading = async (rentalId: string, type: MeterType): Promise<Meter | null> => {
  const meters = await getMetersByRentalId(rentalId);
  const filteredMeters = meters
    .filter((m) => m.type === type && m.confirmed)
    .sort((a, b) => b.month.localeCompare(a.month));
  return filteredMeters[0] || null;
};

/**
 * Create a new meter reading
 */
export const createMeter = async (data: CreateMeterDTO): Promise<Meter> => {
  // Check if meter reading already exists for this rental/type/month
  const existing = await getMeterByRentalTypeMonth(data.rental_id, data.type, data.month);
  if (existing) {
    throw new Error(`Meter reading for ${data.type} in ${data.month} already exists`);
  }

  const meterId = await getNextId(SHEET);
  const now = new Date().toISOString();

  const meter: Meter = {
    meter_id: meterId,
    rental_id: data.rental_id,
    type: data.type,
    month: data.month,
    old_value: data.old_value,
    new_value: data.new_value || 0,
    ocr_value: data.ocr_value || 0,
    image_url: data.image_url || '',
    confirmed: false,
    created_at: now,
  };

  await googleSheet.append(SHEET, meter);
  return meter;
};

/**
 * Update meter reading
 */
export const updateMeter = async (id: string, data: UpdateMeterDTO): Promise<Meter | null> => {
  return googleSheet.update<Meter>(SHEET, ID_FIELD, id, data);
};

/**
 * Confirm meter reading
 */
export const confirmMeter = async (id: string, newValue: number): Promise<Meter | null> => {
  return updateMeter(id, {
    new_value: newValue,
    confirmed: true,
  });
};

/**
 * Calculate consumption
 */
export const calculateConsumption = (meter: Meter): number => {
  return meter.new_value - meter.old_value;
};

/**
 * Delete meter reading
 */
export const deleteMeter = async (id: string): Promise<boolean> => {
  return googleSheet.delete(SHEET, ID_FIELD, id);
};
