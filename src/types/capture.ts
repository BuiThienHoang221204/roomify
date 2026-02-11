// Capture token interface for meter photo capture system
export interface CaptureToken {
  token: string;
  rental_id: string;
  meter_type: string;
  room_code: string;
  created_at: string;
  expires_at: string;
  used: boolean;
}

// Watermark data embedded in captured images
export interface WatermarkData {
  room_code: string;
  rental_id: string;
  meter_type: string;
  captured_at: string;
  verified_at: string;
}

// Meter types supported by the system
export type MeterType = 'electric' | 'water';

// User roles for authentication
export type UserRole = 'admin' | 'tenant' | 'owner';