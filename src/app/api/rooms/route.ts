import { NextRequest } from 'next/server';
import { getAllRooms, getRoomsByAdminId, getVacantRooms, createRoom } from '@/services/room.service';
import {
  successResponse,
  createdResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/response';
import { CreateRoomDTO } from '@/types/room';

/**
 * GET /api/rooms - Get all rooms
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('admin_id');
    const status = searchParams.get('status');

    let rooms;

    if (adminId) {
      rooms = await getRoomsByAdminId(parseInt(adminId, 10));
    } else if (status === 'vacant') {
      rooms = await getVacantRooms();
    } else {
      rooms = await getAllRooms();
    }

    return successResponse(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return serverErrorResponse();
  }
}

/**
 * POST /api/rooms - Create a new room (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateRoomDTO = await request.json();

    // Validate required fields
    if (!body.room_code || !body.price || !body.electric_price || !body.water_price || !body.admin_id) {
      return errorResponse('Missing required fields: room_code, price, electric_price, water_price, admin_id');
    }

    const room = await createRoom(body);
    return createdResponse(room, 'Room created successfully');
  } catch (error) {
    console.error('Error creating room:', error);
    if (error instanceof Error) {
      return errorResponse(error.message);
    }
    return serverErrorResponse();
  }
}
