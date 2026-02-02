import { NextRequest } from 'next/server';
import { loginByPhone } from '@/services/user.service';
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from '@/lib/response';

/**
 * POST /api/users/login - Login by phone number
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return errorResponse('Phone number is required');
    }

    const user = await loginByPhone(phone);

    if (!user) {
      return notFoundResponse('User not found with this phone number');
    }

    // Return user info (in production, you would generate a JWT token here)
    return successResponse({
      user,
      // Mock token for development
      token: `mock_token_${user.user_id}_${Date.now()}`,
    }, 'Login successful');
  } catch (error) {
    console.error('Error during login:', error);
    return serverErrorResponse();
  }
}
