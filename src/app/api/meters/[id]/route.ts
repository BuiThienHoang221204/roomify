import { NextRequest } from 'next/server';
import { getMeterById, updateMeter, deleteMeter, confirmMeter } from '@/services/meter.service';
import {
  successResponse,
  notFoundResponse,
  serverErrorResponse,
  errorResponse,
} from '@/lib/response';
import { UpdateMeterDTO } from '@/types/meter';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/meters/[id] - Get meter by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const meter = await getMeterById(id);

    if (!meter) {
      return notFoundResponse('Meter not found');
    }

    return successResponse(meter);
  } catch (error) {
    console.error('Error fetching meter:', error);
    return serverErrorResponse();
  }
}

/**
 * PUT /api/meters/[id] - Update meter
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Check if confirming or just updating
    const body: UpdateMeterDTO = await request.json();

    // If confirming the meter reading
    if (body.confirmed && body.new_value !== undefined) {
      const meter = await confirmMeter(id, body.new_value);
      if (!meter) {
        return errorResponse('Meter reading confirmed failed or not found');
      }
      return successResponse(meter, 'Meter reading confirmed successfully');
    }

    const meter = await updateMeter(id, body);

    if (!meter) {
      return notFoundResponse('Meter not found');
    }

    return successResponse(meter, 'Meter updated successfully');
  } catch (error) {
    console.error('Error updating meter:', error);
    return serverErrorResponse();
  }
}

/**
 * DELETE /api/meters/[id] - Delete meter
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const result = await deleteMeter(id);

    if (!result) {
      return notFoundResponse('Meter not found');
    }

    return successResponse(null, 'Meter deleted successfully');
  } catch (error) {
    console.error('Error deleting meter:', error);
    return serverErrorResponse();
  }
}
