import { RentalStatus } from '@/constants/enums';

export interface Rental {
  rental_id: number;
  user_id: number;
  room_id: number;
  start_date: string;
  end_date: string | null;
  status: RentalStatus;
  [key: string]: unknown;
}

export interface CreateRentalDTO {
  user_id: number;
  room_id: number;
  start_date: string;
  [key: string]: unknown;
}

export interface UpdateRentalDTO {
  end_date?: string;
  status?: RentalStatus;
  [key: string]: unknown;
}
