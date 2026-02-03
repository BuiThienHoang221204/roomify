import { NextRequest } from 'next/server';
import { getAllMeters, getMeterById, getMetersByRentalId, createMeter } from '@/services/meter.service';
import {
  successResponse,
  createdResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/response';
import { CreateMeterDTO } from '@/types/meter';

/**
 * GET /api/meters - Get meters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rentalId = searchParams.get('rental_id');
    const meterId = searchParams.get('meter_id');

    if (meterId) {
      const meter = await getMeterById(meterId);
      return successResponse(meter);
    }

    if (rentalId) {
      const meters = await getMetersByRentalId(rentalId);
      return successResponse(meters);
    }

    const meters = await getAllMeters();
    return successResponse(meters);
  } catch (error) {
    console.error('Error fetching meters:', error);
    return serverErrorResponse();
  }
}

/**
 * POST /api/meters - Create a new meter reading
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateMeterDTO = await request.json();

    // Validate required fields
    if (!body.rental_id || !body.type || !body.month || body.old_value === undefined) {
      return errorResponse('Missing required fields: rental_id, type, month, old_value');
    }

    const meter = await createMeter(body);
    return createdResponse(meter, 'Meter reading created successfully');
  } catch (error) {
    console.error('Error creating meter:', error);
    if (error instanceof Error) {
      return errorResponse(error.message);
    }
    return serverErrorResponse();
  }
}

