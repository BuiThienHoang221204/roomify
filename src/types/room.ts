import { RoomStatus } from '@/constants/enums';

export interface Room {
  room_id: number;
  room_code: string;
  price: number;
  electric_price: number;
  water_price: number;
  extra_fee: number;
  status: RoomStatus;
  admin_id: number;
  created_at: string;
  [key: string]: unknown;
}

export interface CreateRoomDTO {
  room_code: string;
  price: number;
  electric_price: number;
  water_price: number;
  extra_fee?: number;
  admin_id: number;
  [key: string]: unknown;
}

export interface UpdateRoomDTO {
  room_code?: string;
  price?: number;
  electric_price?: number;
  water_price?: number;
  extra_fee?: number;
  status?: RoomStatus;
  [key: string]: unknown;
}
