import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image
                src="/globe.svg"
                alt="Roomify Logo"
                width={40}
                height={40}
              />
              <h1 className="text-2xl font-bold text-gray-900">Roomify</h1>
            </div>
            <div className="flex space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Đăng nhập
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Quản Lý Trọ Thông Minh
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Hệ thống quản lý phòng trọ toàn diện cho chủ trọ và người thuê.
            Tự động hóa quy trình thanh toán, theo dõi điện nước và quản lý hợp đồng.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
              Bắt đầu với Roomify
            </button>
            <button className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors">
              Tìm hiểu thêm
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Tính năng chính
          </h3>

          {/* User Features */}
          <div className="mb-16">
            <h4 className="text-2xl font-semibold text-blue-600 mb-8 text-center">
              🏠 Cho Người Thuê Trọ
            </h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-3xl mb-4">📱</div>
                <h5 className="font-semibold text-gray-900 mb-2">Đăng nhập đơn giản</h5>
                <p className="text-gray-600 text-sm">Chỉ cần nhập số điện thoại để truy cập hệ thống</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-3xl mb-4">👤</div>
                <h5 className="font-semibold text-gray-900 mb-2">Quản lý thông tin</h5>
                <p className="text-gray-600 text-sm">Upload CCCD, cập nhật thông tin cá nhân</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-3xl mb-4">⚡</div>
                <h5 className="font-semibold text-gray-900 mb-2">Ghi điện & nước</h5>
                <p className="text-gray-600 text-sm">Upload ảnh hoặc nhập thủ công, xem thống kê tiêu thụ</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-3xl mb-4">💳</div>
                <h5 className="font-semibold text-gray-900 mb-2">Thanh toán online</h5>
                <p className="text-gray-600 text-sm">Quét QR code để thanh toán qua Momo, ZaloPay</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-3xl mb-4">🔔</div>
                <h5 className="font-semibold text-gray-900 mb-2">Thông báo tự động</h5>
                <p className="text-gray-600 text-sm">Nhận nhắc nhở thanh toán qua Zalo OA</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-3xl mb-4">🔧</div>
                <h5 className="font-semibold text-gray-900 mb-2">Báo cáo sự cố</h5>
                <p className="text-gray-600 text-sm">Gửi yêu cầu sửa chữa với ảnh/video minh chứng</p>
              </div>
            </div>
          </div>

          {/* Admin Features */}
          <div>
            <h4 className="text-2xl font-semibold text-green-600 mb-8 text-center">
              👨‍💼 Cho Chủ Trọ
            </h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-3xl mb-4">👥</div>
                <h5 className="font-semibold text-gray-900 mb-2">Quản lý người thuê</h5>
                <p className="text-gray-600 text-sm">Xem danh sách, thông tin cá nhân và trạng thái thuê</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-3xl mb-4">🏢</div>
                <h5 className="font-semibold text-gray-900 mb-2">Quản lý phòng</h5>
                <p className="text-gray-600 text-sm">Thêm/sửa/xóa phòng, cấu hình giá cả</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-3xl mb-4">📊</div>
                <h5 className="font-semibold text-gray-900 mb-2">Theo dõi điện nước</h5>
                <p className="text-gray-600 text-sm">Xem và duyệt số liệu từ người thuê</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-3xl mb-4">📄</div>
                <h5 className="font-semibold text-gray-900 mb-2">Quản lý hóa đơn</h5>
                <p className="text-gray-600 text-sm">Theo dõi thanh toán và trạng thái hóa đơn</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-3xl mb-4">📈</div>
                <h5 className="font-semibold text-gray-900 mb-2">Báo cáo thống kê</h5>
                <p className="text-gray-600 text-sm">Thống kê tài chính, xuất báo cáo Excel/PDF</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-3xl mb-4">⚙️</div>
                <h5 className="font-semibold text-gray-900 mb-2">Quản lý dịch vụ</h5>
                <p className="text-gray-600 text-sm">Xử lý yêu cầu sửa chữa và dịch vụ</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Công nghệ sử dụng
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🎨</div>
              <h5 className="font-semibold text-gray-900">Figma</h5>
              <p className="text-gray-600 text-sm">Thiết kế UI/UX</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">⚛️</div>
              <h5 className="font-semibold text-gray-900">Next.js</h5>
              <p className="text-gray-600 text-sm">Frontend & Backend</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h5 className="font-semibold text-gray-900">Google Sheets</h5>
              <p className="text-gray-600 text-sm">Database</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🤖</div>
              <h5 className="font-semibold text-gray-900">Google Vision API</h5>
              <p className="text-gray-600 text-sm">OCR Engine</p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Quy trình hoạt động
          </h3>
          <div className="grid md:grid-cols-5 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h5 className="font-semibold text-gray-900 mb-2">Upload ảnh</h5>
              <p className="text-gray-600 text-sm">Người thuê chụp ảnh đồng hồ điện/nước</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h5 className="font-semibold text-gray-900 mb-2">OCR xử lý</h5>
              <p className="text-gray-600 text-sm">Hệ thống tự động nhận diện số liệu</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h5 className="font-semibold text-gray-900 mb-2">Xác nhận</h5>
              <p className="text-gray-600 text-sm">Người dùng kiểm tra và xác nhận số liệu</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">4</div>
              <h5 className="font-semibold text-gray-900 mb-2">Tính hóa đơn</h5>
              <p className="text-gray-600 text-sm">Tự động tính tiền điện/nước</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">5</div>
              <h5 className="font-semibold text-gray-900 mb-2">Thanh toán</h5>
              <p className="text-gray-600 text-sm">Quét QR code để thanh toán</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Image
              src="/globe.svg"
              alt="Roomify Logo"
              width={30}
              height={30}
            />
            <h4 className="text-xl font-bold">Roomify</h4>
          </div>
          <p className="text-gray-400 mb-4">
            Hệ thống quản lý trọ thông minh cho tương lai
          </p>
          <p className="text-sm text-gray-500">
            🚧 Backend đang được phát triển - Sẽ ra mắt sớm
          </p>
        </div>
      </footer>
    </div>
  );
}
