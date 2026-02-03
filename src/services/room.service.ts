import { googleSheet } from '@/lib/googleSheet';
import { getNextId } from '@/lib/autoIncrement';
import { SheetName, RoomStatus } from '@/constants/enums';
import { Room, CreateRoomDTO, UpdateRoomDTO } from '@/types/room';

const SHEET = SheetName.ROOMS;
const ID_FIELD = 'room_id';

/**
 * Get all rooms
 */
export const getAllRooms = async (): Promise<Room[]> => {
  return googleSheet.getAll<Room>(SHEET);
};

/**
 * Get room by ID
 */
export const getRoomById = async (id: string): Promise<Room | null> => {
  return googleSheet.getById<Room>(SHEET, ID_FIELD, id);
};

/**
 * Get rooms by admin ID
 */
export const getRoomsByAdminId = async (adminId: string): Promise<Room[]> => {
  return googleSheet.getByField<Room>(SHEET, 'admin_id', adminId);
};

/**
 * Get rooms by status
 */
export const getRoomsByStatus = async (status: RoomStatus): Promise<Room[]> => {
  return googleSheet.getByField<Room>(SHEET, 'status', status);
};

/**
 * Get vacant rooms
 */
export const getVacantRooms = async (): Promise<Room[]> => {
  return getRoomsByStatus(RoomStatus.VACANT);
};

/**
 * Create a new room
 */
export const createRoom = async (data: CreateRoomDTO): Promise<Room> => {
  const roomId = await getNextId(SHEET);
  const now = new Date().toISOString();

  const room: Room = {
    room_id: roomId,
    room_code: data.room_code,
    price: data.price,
    electric_price: data.electric_price,
    water_price: data.water_price,
    extra_fee: data.extra_fee || 0,
    status: RoomStatus.VACANT,
    admin_id: data.admin_id,
    created_at: now,
  };

  await googleSheet.append(SHEET, room);
  return room;
};

/**
 * Update room
 */
export const updateRoom = async (id: string, data: UpdateRoomDTO): Promise<Room | null> => {
  return googleSheet.update<Room>(SHEET, ID_FIELD, id, data);
};

/**
 * Delete room
 */
export const deleteRoom = async (id: string): Promise<boolean> => {
  return googleSheet.delete(SHEET, ID_FIELD, id);
};

/**
 * Update room status
 */
export const updateRoomStatus = async (id: string, status: RoomStatus): Promise<Room | null> => {
  return updateRoom(id, { status });
};
