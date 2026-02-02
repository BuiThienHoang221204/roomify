import { googleSheet } from '@/lib/googleSheet';
import { getNextId } from '@/lib/autoIncrement';
import { SheetName, RentalStatus, RoomStatus } from '@/constants/enums';
import { Rental, CreateRentalDTO, UpdateRentalDTO } from '@/types/rental';
import { updateRoomStatus } from './room.service';

const SHEET = SheetName.RENTALS;
const ID_FIELD = 'rental_id';

/**
 * Get all rentals
 */
export const getAllRentals = async (): Promise<Rental[]> => {
  return googleSheet.getAll<Rental>(SHEET);
};

/**
 * Get rental by ID
 */
export const getRentalById = async (id: number): Promise<Rental | null> => {
  return googleSheet.getById<Rental>(SHEET, ID_FIELD, id);
};

/**
 * Get rentals by user ID (tenant)
 */
export const getRentalsByUserId = async (userId: number): Promise<Rental[]> => {
  return googleSheet.getByField<Rental>(SHEET, 'user_id', userId);
};

/**
 * Get rentals by room ID
 */
export const getRentalsByRoomId = async (roomId: number): Promise<Rental[]> => {
  return googleSheet.getByField<Rental>(SHEET, 'room_id', roomId);
};

/**
 * Get active rental for a room
 */
export const getActiveRentalByRoomId = async (roomId: number): Promise<Rental | null> => {
  const rentals = await getRentalsByRoomId(roomId);
  return rentals.find((r) => r.status === RentalStatus.RENTING) || null;
};

/**
 * Get active rentals
 */
export const getActiveRentals = async (): Promise<Rental[]> => {
  return googleSheet.getByField<Rental>(SHEET, 'status', RentalStatus.RENTING);
};

/**
 * Create a new rental
 */
export const createRental = async (data: CreateRentalDTO): Promise<Rental> => {
  // Check if room is available
  const activeRental = await getActiveRentalByRoomId(data.room_id);
  if (activeRental) {
    throw new Error('Room is already occupied');
  }

  const rentalId = await getNextId(SHEET);

  const rental: Rental = {
    rental_id: rentalId,
    user_id: data.user_id,
    room_id: data.room_id,
    start_date: data.start_date,
    end_date: null,
    status: RentalStatus.RENTING,
  };

  await googleSheet.append(SHEET, rental);

  // Update room status to occupied
  await updateRoomStatus(data.room_id, RoomStatus.OCCUPIED);

  return rental;
};

/**
 * Update rental
 */
export const updateRental = async (id: number, data: UpdateRentalDTO): Promise<Rental | null> => {
  const updated = await googleSheet.update<Rental>(SHEET, ID_FIELD, id, data);

  // If rental ended, update room status to vacant
  if (updated && data.status === RentalStatus.ENDED) {
    await updateRoomStatus(updated.room_id, RoomStatus.VACANT);
  }

  return updated;
};

/**
 * End rental
 */
export const endRental = async (id: number): Promise<Rental | null> => {
  const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return updateRental(id, {
    end_date: now,
    status: RentalStatus.ENDED,
  });
};

/**
 * Delete rental
 */
export const deleteRental = async (id: number): Promise<boolean> => {
  return googleSheet.delete(SHEET, ID_FIELD, id);
};
