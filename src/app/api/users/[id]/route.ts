import { NextRequest } from 'next/server';
import { getUserById, updateUser, deleteUser } from '@/services/user.service';
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/response';
import { UpdateUserDTO } from '@/types/user';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/users/[id] - Get user by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return errorResponse('Invalid user ID');
    }

    const user = await getUserById(userId);

    if (!user) {
      return notFoundResponse('User not found');
    }

    return successResponse(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return serverErrorResponse();
  }
}

/**
 * PUT /api/users/[id] - Update user
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return errorResponse('Invalid user ID');
    }

    const body: UpdateUserDTO = await request.json();
    const user = await updateUser(userId, body);

    if (!user) {
      return notFoundResponse('User not found');
    }

    return successResponse(user, 'User updated successfully');
  } catch (error) {
    console.error('Error updating user:', error);
    return serverErrorResponse();
  }
}

/**
 * DELETE /api/users/[id] - Delete user
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return errorResponse('Invalid user ID');
    }

    const deleted = await deleteUser(userId);

    if (!deleted) {
      return notFoundResponse('User not found');
    }

    return successResponse(null, 'User deleted successfully');
  } catch (error) {
    console.error('Error deleting user:', error);
    return serverErrorResponse();
  }
}
