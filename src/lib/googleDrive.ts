import fs from 'fs';
import path from 'path';

const LOCAL_STORAGE_DIR = path.join(process.cwd(), 'public', 'uploads', 'meter-images');

/**
 * Upload image to local file system
 */
export const uploadImageToDrive = async (
    base64Image: string,
    fileName: string
): Promise<{ fileId: string; webViewLink: string; webContentLink: string }> => {
    try {
        // Ensure upload directory exists
        if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
            fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
        }

        // Remove base64 prefix if exists
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Save to local file
        const filePath = path.join(LOCAL_STORAGE_DIR, fileName);
        fs.writeFileSync(filePath, buffer);

        // Generate public URL (accessible via /uploads/meter-images/filename.jpg)
        const publicUrl = `/uploads/meter-images/${fileName}`;
        const fullUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${publicUrl}`;

        return {
            fileId: fileName,
            webViewLink: fullUrl,
            webContentLink: fullUrl,
        };
    } catch {
        throw new Error('Failed to save image to local file system');
    }
};

/**
 * Delete image from local file system
 */
export const deleteImageFromDrive = async (fileId: string): Promise<void> => {
    try {
        const filePath = path.join(LOCAL_STORAGE_DIR, fileId);
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch {
        throw new Error('Failed to delete image from local storage');
    }
};

/**
 * Get direct image URL from Google Drive
 */
export const getDirectImageUrl = (fileId: string): string => {
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
};

/**
 * Generate unique filename for meter image
 */
export const generateMeterImageFileName = (
    rentalId: string,
    meterType: 'electric' | 'water',
    roomCode: string
): string => {
    const timestamp = new Date().getTime();
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return `meter_${meterType}_${roomCode}_${rentalId}_${date}_${timestamp}.jpg`;
};
