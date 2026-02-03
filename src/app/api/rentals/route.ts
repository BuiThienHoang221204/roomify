import { NextRequest } from 'next/server';
import { getAllRentals, getRentalsByUserId, getRentalsByRoomId, getActiveRentals, createRental } from '@/services/rental.service';
import {
  successResponse,
  createdResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/response';
import { CreateRentalDTO } from '@/types/rental';

/**
 * GET /api/rentals - Get all rentals
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const roomId = searchParams.get('room_id');
    const status = searchParams.get('status');

    let rentals;

    if (userId) {
      rentals = await getRentalsByUserId(userId);
    } else if (roomId) {
      rentals = await getRentalsByRoomId(roomId);
    } else if (status === 'active') {
      rentals = await getActiveRentals();
    } else {
      rentals = await getAllRentals();
    }

    return successResponse(rentals);
  } catch (error) {
    console.error('Error fetching rentals:', error);
    return serverErrorResponse();
  }
}

/**
 * POST /api/rentals - Create a new rental (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateRentalDTO = await request.json();

    // Validate required fields
    if (!body.user_id || !body.room_id || !body.start_date) {
      return errorResponse('Missing required fields: user_id, room_id, start_date');
    }

    const rental = await createRental(body);
    return createdResponse(rental, 'Rental created successfully');
  } catch (error) {
    console.error('Error creating rental:', error);
    if (error instanceof Error) {
      return errorResponse(error.message);
    }
    return serverErrorResponse();
  }
}
