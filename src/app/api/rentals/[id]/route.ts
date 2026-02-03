import { NextRequest } from 'next/server';
import { getRentalById, updateRental, endRental } from '@/services/rental.service';
import {
  successResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/response';
import { UpdateRentalDTO } from '@/types/rental';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/rentals/[id] - Get rental by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const rental = await getRentalById(id);

    if (!rental) {
      return notFoundResponse('Rental not found');
    }

    return successResponse(rental);
  } catch (error) {
    console.error('Error fetching rental:', error);
    return serverErrorResponse();
  }
}

/**
 * PUT /api/rentals/[id] - Update rental (Admin only)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const body: UpdateRentalDTO = await request.json();
    const rental = await updateRental(id, body);

    if (!rental) {
      return notFoundResponse('Rental not found');
    }

    return successResponse(rental, 'Rental updated successfully');
  } catch (error) {
    console.error('Error updating rental:', error);
    return serverErrorResponse();
  }
}

/**
 * DELETE /api/rentals/[id] - End rental (Admin only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // End rental instead of deleting
    const rental = await endRental(id);

    if (!rental) {
      return notFoundResponse('Rental not found');
    }

    return successResponse(rental, 'Rental ended successfully');
  } catch (error) {
    console.error('Error ending rental:', error);
    return serverErrorResponse();
  }
}
