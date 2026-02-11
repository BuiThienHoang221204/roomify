import { NextRequest } from 'next/server';
import { validateToken, markTokenAsUsed } from '@/services/captureToken.service';
import { uploadImageToDrive, generateMeterImageFileName, getDirectImageUrl } from '@/lib/googleDrive';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, image, capture_timestamp } = body;

    // Validate required fields
    if (!token || !image || !capture_timestamp) {
      return errorResponse('Missing required fields: token, image, capture_timestamp');
    }

    // Validate token (WITHOUT consuming it yet)
    const tokenData = await validateToken(token);
    if (!tokenData) {
      return errorResponse('Invalid, expired, or already used token. Please request a new capture token.', 401);
    }

    // Validate capture timestamp
    const captureTime = new Date(capture_timestamp);
    const tokenCreatedAt = new Date(tokenData.created_at);
    const now = new Date();

    // Capture must happen after token was created
    if (captureTime < tokenCreatedAt) {
      return errorResponse('Invalid capture timestamp: before token creation', 400);
    }

    // Upload must happen within 90 seconds of capture (allowing some network delay)
    const maxUploadDelay = 90 * 1000; // 90 seconds
    if (now.getTime() - captureTime.getTime() > maxUploadDelay) {
      return errorResponse('Upload too late: image must be uploaded within 90 seconds of capture', 400);
    }

    // Generate watermark data
    const watermarkData = {
      room_code: tokenData.room_code,
      rental_id: tokenData.rental_id,
      meter_type: tokenData.meter_type,
      captured_at: capture_timestamp,
      verified_at: now.toISOString(),
    };

    // Generate unique filename
    const fileName = generateMeterImageFileName(
      tokenData.rental_id,
      tokenData.meter_type as 'electric' | 'water',
      tokenData.room_code
    );

    // Upload to local storage
    const driveUploadResult = await uploadImageToDrive(image, fileName);

    // Mark token as used ONLY after successful upload
    markTokenAsUsed(token);

    // Get direct image URL for displaying
    const imageUrl = getDirectImageUrl(driveUploadResult.fileId);

    return successResponse({
      image_url: imageUrl,
      file_id: driveUploadResult.fileId,
      web_view_link: driveUploadResult.webViewLink,
      watermark_data: watermarkData,
      token_data: {
        rental_id: tokenData.rental_id,
        meter_type: tokenData.meter_type,
        room_code: tokenData.room_code,
      },
    }, 'Image captured and verified successfully');
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message);
    }
    return serverErrorResponse();
  }
}
