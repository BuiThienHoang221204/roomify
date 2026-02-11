'use client';

import { useState } from 'react';
import MeterCapture from '@/components/MeterCapture';
import { WatermarkData } from '@/types';

export default function MeterCapturePage() {
  const [showCapture, setShowCapture] = useState(false);
  const [result, setResult] = useState<{
    imageUrl: string;
    watermarkData: WatermarkData;
  } | null>(null);

  const handleSuccess = (imageUrl: string, watermarkData: WatermarkData) => {
    setResult({ imageUrl, watermarkData });
    setShowCapture(false);
    alert('Chụp ảnh thành công!');
  };

  const handleCancel = () => {
    setShowCapture(false);
  };

  if (showCapture) {
    return (
      <MeterCapture
        rentalId="rental_1"
        meterType="electric"
        userId="user_demo"
        userRole="tenant"
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          📸 Meter Capture Demo
        </h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Capture System</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setShowCapture(true)}
              className="bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              ⚡ Chụp đồng hồ Điện
            </button>
            <button
              onClick={() => setShowCapture(true)}
              className="bg-indigo-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              💧 Chụp đồng hồ Nước
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-600">
              ✅ Kết quả chụp
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Image URL:
                </label>
                <p className="text-sm text-gray-600 break-all bg-gray-50 p-3 rounded mt-1">
                  {result.imageUrl}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Watermark Data:
                </label>
                <pre className="text-sm text-gray-600 bg-gray-50 p-3 rounded mt-1 overflow-auto">
                  {JSON.stringify(result.watermarkData, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-6">
          <div className="flex">
            <div className="shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Lưu ý:</strong> Bạn cần cấp quyền camera cho trình
                duyệt. Hệ thống sẽ tự động mở camera và yêu cầu chụp ảnh
                realtime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
