import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

export function successResponse<T>(data: T, message?: string, status = 200) {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  return NextResponse.json(response, { status });
}

export function errorResponse(error: string, status = 400) {
  const response: ApiResponse = {
    success: false,
    error,
  };
  return NextResponse.json(response, { status });
}

export function createdResponse<T>(data: T, message = 'Created successfully') {
  return successResponse(data, message, 201);
}

export function notFoundResponse(message = 'Resource not found') {
  return errorResponse(message, 404);
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return errorResponse(message, 401);
}

export function forbiddenResponse(message = 'Forbidden') {
  return errorResponse(message, 403);
}

export function serverErrorResponse(message = 'Internal server error') {
  return errorResponse(message, 500);
}
