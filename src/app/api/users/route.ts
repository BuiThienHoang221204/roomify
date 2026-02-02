import { NextRequest } from 'next/server';
import { getAllUsers, createUser } from '@/services/user.service';
import {
  successResponse,
  createdResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/response';
import { CreateUserDTO } from '@/types/user';

/**
 * GET /api/users - Get all users
 */
export async function GET() {
  try {
    const users = await getAllUsers();
    return successResponse(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return serverErrorResponse();
  }
}

/**
 * POST /api/users - Create a new user
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateUserDTO = await request.json();

    // Validate required fields
    if (!body.phone || !body.full_name || !body.role) {
      return errorResponse('Missing required fields: phone, full_name, role');
    }

    const user = await createUser(body);
    return createdResponse(user, 'User created successfully');
  } catch (error) {
    console.error('Error creating user:', error);
    if (error instanceof Error) {
      return errorResponse(error.message);
    }
    return serverErrorResponse();
  }
}
