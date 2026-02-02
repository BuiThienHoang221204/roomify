// User roles
export enum UserRole {
  ADMIN = 'admin',
  TENANT = 'tenant',
}

// Room status
export enum RoomStatus {
  VACANT = 'vacant',
  OCCUPIED = 'occupied',
}

// Rental status
export enum RentalStatus {
  RENTING = 'renting',
  ENDED = 'ended',
}

// Meter type
export enum MeterType {
  ELECTRIC = 'electric',
  WATER = 'water',
}

// Payment method
export enum PaymentMethod {
  SEPAY = 'Sepay',
  MOMO = 'Momo',
  ZALO = 'Zalo',
  CASH = 'Cash',
}

// Payment status
export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  FAILED = 'failed',
}

// Issue status
export enum IssueStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  DONE = 'done',
}

// Sheet names
export enum SheetName {
  META = 'META',
  USERS = 'USERS',
  ROOMS = 'ROOMS',
  RENTALS = 'RENTALS',
  METERS = 'METERS',
  INVOICES = 'INVOICES',
  ISSUES = 'ISSUES',
}
