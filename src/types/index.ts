export * from './user';
export * from './room';
export * from './rental';
export * from './meter';
export * from './invoice';
export * from './issue';

// API Response type
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Meta record for auto increment
export interface MetaRecord {
  table_name: string;
  last_id: number;
}

// Auth context
export interface AuthContext {
  user_id: number;
  phone: string;
  role: string;
}
