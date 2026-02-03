import { googleSheet } from '@/lib/googleSheet';
import { getNextId } from '@/lib/autoIncrement';
import { SheetName, UserRole } from '@/constants/enums';
import { User, CreateUserDTO, UpdateUserDTO } from '@/types/user';

const SHEET = SheetName.USERS;
const ID_FIELD = 'user_id';

/**
 * Get all users
 */
export const getAllUsers = async (): Promise<User[]> => {
  return googleSheet.getAll<User>(SHEET);
};

/**
 * Get user by ID
 */
export const getUserById = async (id: string): Promise<User | null> => {
  return googleSheet.getById<User>(SHEET, ID_FIELD, id);
};

/**
 * Get user by phone number
 */
export const getUserByPhone = async (phone: string): Promise<User | null> => {
  const users = await googleSheet.getByField<User>(SHEET, 'phone', phone);
  return users[0] || null;
};

/**
 * Get users by role
 */
export const getUsersByRole = async (role: UserRole): Promise<User[]> => {
  return googleSheet.getByField<User>(SHEET, 'role', role);
};

/**
 * Create a new user
 */
export const createUser = async (data: CreateUserDTO): Promise<User> => {
  // Check if phone already exists
  const existingUser = await getUserByPhone(data.phone);
  if (existingUser) {
    throw new Error('Phone number already registered');
  }

  const userId = await getNextId(SHEET);
  const now = new Date().toISOString();

  const user: User = {
    user_id: userId,
    phone: data.phone,
    full_name: data.full_name,
    cccd: data.cccd || '',
    cccd_image: data.cccd_image || '',
    role: data.role,
    created_at: now,
  };

  await googleSheet.append(SHEET, user);
  return user;
};

/**
 * Update user
 */
export const updateUser = async (id: string, data: UpdateUserDTO): Promise<User | null> => {
  return googleSheet.update<User>(SHEET, ID_FIELD, id, data);
};

/**
 * Delete user
 */
export const deleteUser = async (id: string): Promise<boolean> => {
  return googleSheet.delete(SHEET, ID_FIELD, id);
};

/**
 * Login by phone number
 */
export const loginByPhone = async (phone: string): Promise<User | null> => {
  return getUserByPhone(phone);
};
