import { NextRequest } from 'next/server';
import { getAllMeters, getMeterById, getMetersByRentalId, createMeter, updateMeter, confirmMeter } from '@/services/meter.service';
import {
  successResponse,
  createdResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/response';
import { CreateMeterDTO, UpdateMeterDTO } from '@/types/meter';

/**
 * GET /api/meters - Get meters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rentalId = searchParams.get('rental_id');
    const meterId = searchParams.get('meter_id');

    if (meterId) {
      const meter = await getMeterById(parseInt(meterId, 10));
      return successResponse(meter);
    }

    if (rentalId) {
      const meters = await getMetersByRentalId(parseInt(rentalId, 10));
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

/**
 * PUT /api/meters - Update/confirm meter reading
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const meterId = searchParams.get('meter_id');

    if (!meterId) {
      return errorResponse('meter_id is required');
    }

    const body: UpdateMeterDTO = await request.json();
    const id = parseInt(meterId, 10);

    // If confirming the meter reading
    if (body.confirmed && body.new_value !== undefined) {
      const meter = await confirmMeter(id, body.new_value);
      return successResponse(meter, 'Meter reading confirmed successfully');
    }

    const meter = await updateMeter(id, body);
    return successResponse(meter, 'Meter reading updated successfully');
  } catch (error) {
    console.error('Error updating meter:', error);
    return serverErrorResponse();
  }
}
