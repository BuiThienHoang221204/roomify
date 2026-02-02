import { NextRequest } from 'next/server';
import { getRoomById, updateRoom, deleteRoom } from '@/services/room.service';
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/response';
import { UpdateRoomDTO } from '@/types/room';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/rooms/[id] - Get room by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const roomId = parseInt(id, 10);

    if (isNaN(roomId)) {
      return errorResponse('Invalid room ID');
    }

    const room = await getRoomById(roomId);

    if (!room) {
      return notFoundResponse('Room not found');
    }

    return successResponse(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    return serverErrorResponse();
  }
}

/**
 * PUT /api/rooms/[id] - Update room (Admin only)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const roomId = parseInt(id, 10);

    if (isNaN(roomId)) {
      return errorResponse('Invalid room ID');
    }

    const body: UpdateRoomDTO = await request.json();
    const room = await updateRoom(roomId, body);

    if (!room) {
      return notFoundResponse('Room not found');
    }

    return successResponse(room, 'Room updated successfully');
  } catch (error) {
    console.error('Error updating room:', error);
    return serverErrorResponse();
  }
}

/**
 * DELETE /api/rooms/[id] - Delete room (Admin only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const roomId = parseInt(id, 10);

    if (isNaN(roomId)) {
      return errorResponse('Invalid room ID');
    }

    const deleted = await deleteRoom(roomId);

    if (!deleted) {
      return notFoundResponse('Room not found');
    }

    return successResponse(null, 'Room deleted successfully');
  } catch (error) {
    console.error('Error deleting room:', error);
    return serverErrorResponse();
  }
}
