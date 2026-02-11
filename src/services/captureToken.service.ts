import crypto from 'crypto';
import { CaptureToken, MeterType } from '@/types';

const TOKEN_EXPIRY_SECONDS = 60;

// Lưu trữ token trong memory (tạm thời)
// Trong development, dùng global để không bị mất khi hot reload
declare global {
  var __captureTokenStore: Map<string, CaptureToken> | undefined;
}

const tokenStore: Map<string, CaptureToken> = globalThis.__captureTokenStore ?? new Map<string, CaptureToken>();

// Lưu vào global để persist across hot reloads (chỉ trong dev)
if (typeof globalThis !== 'undefined') {
  globalThis.__captureTokenStore = tokenStore;
}

/**
 * Tạo token mới để chụp ảnh
 */
export const generateCaptureToken = async (
  rentalId: string,
  meterType: MeterType,
  roomCode: string
): Promise<{ token: string; expires_at: string }> => {
  // Tạo chuỗi token ngẫu nhiên
  const token = crypto.randomBytes(32).toString('hex');

  // Tính thời gian hết hạn
  const now = new Date();
  const expiresAt = new Date(now.getTime() + TOKEN_EXPIRY_SECONDS * 1000);

  // Tạo object token
  const tokenData: CaptureToken = {
    token,
    rental_id: rentalId,
    meter_type: meterType,
    room_code: roomCode,
    created_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    used: false,
  };

  // Lưu vào bộ nhớ
  tokenStore.set(token, tokenData);

  return {
    token,
    expires_at: expiresAt.toISOString(),
  };
};

/**
 * Kiểm tra token có hợp lệ không (không đánh dấu đã dùng)
 */
export const validateToken = async (token: string): Promise<CaptureToken | null> => {
  const tokenData = tokenStore.get(token);

  if (!tokenData) return null;

  if (tokenData.used) return null;

  // Token đã hết hạn
  const now = new Date();
  const expiresAt = new Date(tokenData.expires_at);
  if (now > expiresAt) {
    tokenStore.delete(token); // Xóa token hết hạn
    return null;
  }
  return tokenData;
};

/**
 * Đánh dấu token đã được sử dụng (chỉ gọi sau khi upload thành công)
 */
export const markTokenAsUsed = (token: string): void => {
  const tokenData = tokenStore.get(token);
  if (tokenData) {
    tokenData.used = true;
    tokenStore.set(token, tokenData);
  }
};

/**
 * Lấy thông tin token (không thay đổi trạng thái)
 */
export const getTokenInfo = (token: string): CaptureToken | null => {
  return tokenStore.get(token) || null;
};

/**
 * Xóa các token đã hết hạn (có thể gọi định kỳ)
 */
export const cleanupExpiredTokens = (): void => {
  const now = new Date();
  for (const [token, data] of tokenStore.entries()) {
    const expiresAt = new Date(data.expires_at);
    if (now > expiresAt) {
      tokenStore.delete(token);
    }
  }
};
