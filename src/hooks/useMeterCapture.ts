import { useRef, useState, useCallback, useEffect } from 'react';
import { CaptureToken, WatermarkData, MeterType } from '@/types';

interface UseMeterCaptureProps {
  rentalId: string;
  meterType: MeterType;
  userId: string;
  userRole: string;
  onSuccess?: (imageUrl: string, watermarkData: WatermarkData) => void;
}

export const useMeterCapture = ({ 
  rentalId, 
  meterType, 
  userId, 
  userRole, 
  onSuccess 
}: UseMeterCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captureToken, setCaptureToken] = useState<CaptureToken | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!captureToken) return;
    
    const interval = setInterval(() => {
      const remaining = Math.max(0, 
        Math.floor((new Date(captureToken.expires_at).getTime() - Date.now()) / 1000)
      );
      setCountdown(remaining);
      
      if (remaining === 0) {
        setCaptureToken(null);
        setError('Token đã hết hạn. Vui lòng bấm "Chuẩn bị chụp" lại.');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [captureToken]);

  // Start camera
  const startCamera = async () => {
    try {
      setIsLoading(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          setIsCameraReady(true);
          setIsLoading(false);
        };
      }
      setStream(mediaStream);
      setError(null);
    } catch {
      setError('Không thể truy cập camera. Vui lòng cấp quyền camera cho ứng dụng.');
      setIsLoading(false);
    }
  };

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraReady(false);
    }
  }, [stream]);

  // Request capture token
  const requestCaptureToken = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/capture/token', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': userId,
          'x-user-role': userRole,
        },
        body: JSON.stringify({
          rental_id: rentalId,
          meter_type: meterType,
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }

      setCaptureToken(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tạo token');
    } finally {
      setIsLoading(false);
    }
  };

  // Add watermark to canvas
  const addWatermark = (
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement,
    data: { roomCode: string; meterType: string; timestamp: Date }
  ) => {
    const { roomCode, meterType, timestamp } = data;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'left';

    const dateStr = timestamp.toLocaleDateString('vi-VN');
    const timeStr = timestamp.toLocaleTimeString('vi-VN');
    const meterLabel = meterType === 'electric' ? 'ĐIỆN' : 'NƯỚC';

    ctx.fillText(`Phòng: ${roomCode}`, 30, canvas.height - 65);
    ctx.fillText(`${meterLabel} - ${dateStr} ${timeStr}`, 30, canvas.height - 30);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 32px Arial';
    ctx.fillText('✓ REALTIME', canvas.width - 30, canvas.height - 45);
  };

  // Capture image - chỉ chụp và preview, chưa upload
  const captureImage = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !captureToken) {
      setError('Vui lòng bấm "Chuẩn bị chụp" trước');
      return;
    }

    setError(null);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Canvas context not available');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.drawImage(video, 0, 0);

      const captureTime = new Date();
      addWatermark(ctx, canvas, {
        roomCode: captureToken.room_code,
        meterType: captureToken.meter_type,
        timestamp: captureTime,
      });

      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      
      // Lưu ảnh preview thay vì upload ngay
      setCapturedImage(imageData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi chụp ảnh');
    }
  }, [captureToken]);

  // Chụp lại - xóa ảnh preview, quay lại camera
  const retake = useCallback(() => {
    setCapturedImage(null);
    setError(null);
  }, []);

  // Xác nhận upload ảnh đã chụp
  const confirmUpload = useCallback(async () => {
    if (!capturedImage || !captureToken) {
      setError('Không có ảnh để upload');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/capture/upload', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': userId,
          'x-user-role': userRole,
        },
        body: JSON.stringify({
          token: captureToken.token,
          image: capturedImage,
          capture_timestamp: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setCaptureToken(null);
      setCapturedImage(null);
      stopCamera();
      
      if (onSuccess) {
        onSuccess(data.data.image_url, data.data.watermark_data);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi upload ảnh');
    } finally {
      setIsLoading(false);
    }
  }, [capturedImage, captureToken, onSuccess, userId, userRole, stopCamera]);

  // Reset token
  const resetToken = () => {
    setCaptureToken(null);
    setError(null);
  };

  return {
    // Refs
    videoRef,
    canvasRef,
    
    // State
    isLoading,
    error,
    countdown,
    isCameraReady,
    captureToken,
    capturedImage,
    
    // Actions
    requestCaptureToken,
    captureImage,
    confirmUpload,
    retake,
    stopCamera,
    resetToken,
  };
};