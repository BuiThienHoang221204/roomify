'use client';

import { useMeterCapture } from '@/hooks/useMeterCapture';
import { WatermarkData, MeterType } from '@/types';
import Image from 'next/image';

interface MeterCaptureProps {
  rentalId: string;
  meterType: MeterType;
  userId: string;
  userRole: string;
  onSuccess?: (imageUrl: string, watermarkData: WatermarkData) => void;
  onCancel?: () => void;
}

export default function MeterCapture({ 
  rentalId, 
  meterType,
  userId,
  userRole,
  onSuccess,
  onCancel
}: MeterCaptureProps) {
  const {
    videoRef,
    canvasRef,
    isLoading,
    error,
    countdown,
    isCameraReady,
    captureToken,
    capturedImage,
    requestCaptureToken,
    captureImage,
    confirmUpload,
    retake,
    stopCamera,
    resetToken,
  } = useMeterCapture({
    rentalId,
    meterType,
    userId,
    userRole,
    onSuccess,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <h2 className="text-2xl font-bold text-center">
            📸 Chụp ảnh đồng hồ {meterType === 'electric' ? 'Điện ⚡' : 'Nước 💧'}
          </h2>
          <p className="text-center text-blue-100 mt-2 text-sm">
            Realtime Capture - Chống gian lận
          </p>
        </div>

        {/* Camera View / Image Preview */}
        <div className="relative aspect-[3/4] bg-black">
          {/* Hiển thị ảnh đã chụp (preview) */}
          {capturedImage ? (
            <Image 
              src={capturedImage} 
              alt="Ảnh đã chụp" 
              className="w-full h-full object-cover"
              layout="fill"
            />
          ) : (
            <>
              {!isCameraReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Đang khởi động camera...</p>
                  </div>
                </div>
              )}
              
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </>
          )}
          
          {/* Token Countdown Overlay */}
          {captureToken && countdown > 0 && !capturedImage && (
            <div className="absolute top-6 right-6 flex items-center gap-3">
              <div className="bg-green-500 text-white px-4 py-2 rounded-full font-bold text-xl shadow-lg animate-pulse">
                {countdown}s
              </div>
              <div className="bg-white text-green-600 px-3 py-2 rounded-full font-bold text-sm shadow-lg">
                ✓ Sẵn sàng
              </div>
            </div>
          )}

          {/* Preview Badge */}
          {capturedImage && (
            <div className="absolute top-6 left-6">
              <div className="bg-yellow-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                👁️ Xem trước
              </div>
            </div>
          )}

          {/* Camera Guide Overlay */}
          {isCameraReady && !captureToken && !capturedImage && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="border-4 border-white border-dashed rounded-lg w-4/5 h-3/5 flex items-center justify-center">
                <p className="text-white text-lg font-bold bg-black bg-opacity-50 px-4 py-2 rounded">
                  Hướng camera vào đồng hồ
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            <div className="flex items-start">
              <span className="text-2xl mr-3">⚠️</span>
              <div>
                <p className="font-semibold">Có lỗi xảy ra</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="px-6 py-4 bg-blue-50">
          {capturedImage ? (
            <div className="text-center">
              <p className="text-yellow-600 font-semibold text-sm">
                👁️ Xem trước ảnh đã chụp
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Kiểm tra ảnh rõ nét rồi bấm <strong>&quot;Gửi ảnh&quot;</strong> hoặc <strong>&quot;Chụp lại&quot;</strong>
              </p>
            </div>
          ) : !captureToken ? (
            <div className="text-center text-gray-700">
              <p className="text-sm">
                🔹 Bấm <strong>&quot;Chuẩn bị chụp&quot;</strong> để bắt đầu
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Bạn sẽ có 60 giây để chụp ảnh
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-green-600 font-semibold text-sm">
                ✅ Đã sẵn sàng! Hướng camera vào đồng hồ
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Bấm &quot;CHỤP NGAY&quot; trong <strong>{countdown} giây</strong>
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-6 space-y-3">
          {capturedImage ? (
            /* Preview mode - Gửi ảnh hoặc Chụp lại */
            <>
              <button
                onClick={confirmUpload}
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Đang upload...
                  </>
                ) : (
                  <>
                    ✅ Gửi ảnh
                  </>
                )}
              </button>
              <button
                onClick={retake}
                disabled={isLoading}
                className="w-full py-3 bg-yellow-500 text-white rounded-xl font-semibold hover:bg-yellow-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                🔄 Chụp lại
              </button>
            </>
          ) : !captureToken ? (
            <button
              onClick={requestCaptureToken}
              disabled={isLoading || !isCameraReady}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  📷 Chuẩn bị chụp
                </>
              )}
            </button>
          ) : (
            <button
              onClick={captureImage}
              disabled={isLoading || countdown === 0}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 animate-pulse"
            >
              {error ? (
                <>
                  🔄 THỬ LẠI ({countdown}s)
                </>
              ) : (
                <>
                  📸 CHỤP NGAY
                </>
              )}
            </button>
          )}

          {/* Reset button khi có lỗi và muốn request token mới */}
          {captureToken && error && countdown > 0 && !capturedImage && (
            <button
              onClick={resetToken}
              disabled={isLoading}
              className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-all disabled:opacity-50"
            >
              🔄 Request token mới
            </button>
          )}

          {onCancel && (
            <button
              onClick={() => {
                stopCamera(); // Tắt camera khi hủy
                onCancel();
              }}
              disabled={isLoading}
              className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all disabled:opacity-50"
            >
              Hủy
            </button>
          )}
        </div>

        {/* Security Badge */}
        <div className="px-6 pb-6">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🔒</div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-purple-900">
                  Bảo mật tối đa
                </p>
                <p className="text-xs text-purple-700 mt-1">
                  Ảnh được xác thực realtime với token mã hóa. Không thể sử dụng ảnh cũ hoặc giả mạo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
