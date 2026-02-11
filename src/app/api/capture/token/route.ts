import { NextRequest } from 'next/server';
import { generateCaptureToken } from '@/services/captureToken.service';
import { getRentalById } from '@/services/rental.service';
import { getRoomById } from '@/services/room.service';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rental_id, meter_type } = body;

    // Validate required fields
    if (!rental_id || !meter_type) {
      return errorResponse('Missing required fields: rental_id, meter_type');
    }

    // Validate meter_type
    if (!['electric', 'water'].includes(meter_type)) {
      return errorResponse('meter_type must be "electric" or "water"');
    }

    // Get rental to verify it exists and get room info
    const rental = await getRentalById(rental_id);
    if (!rental) {
      return errorResponse('Rental not found', 404);
    }

    // Get room info for watermark
    const room = await getRoomById(rental.room_id);
    if (!room) {
      return errorResponse('Room not found', 404);
    }

    // Generate capture token
    const tokenData = await generateCaptureToken(
      rental_id,
      meter_type,
      room.room_code
    );

    return successResponse({
      token: tokenData.token,
      expires_at: tokenData.expires_at,
      room_code: room.room_code,
      meter_type,
      rental_id,
    }, 'Capture token generated. Valid for 60 seconds.');
  } catch {
    return serverErrorResponse();
  }
}
