import { UserRole } from '@/constants/enums';

export interface User {
  user_id: number;
  phone: string;
  full_name: string;
  cccd: string;
  cccd_image: string;
  role: UserRole;
  created_at: string;
  [key: string]: unknown;
}

export interface CreateUserDTO {
  phone: string;
  full_name: string;
  cccd?: string;
  cccd_image?: string;
  role: UserRole;
  [key: string]: unknown;
}

export interface UpdateUserDTO {
  full_name?: string;
  cccd?: string;
  cccd_image?: string;
  [key: string]: unknown;
}
