const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};
const STATUS_VALUES = Object.values(BOOKING_STATUS);

const SERVICE_TYPES = {
  SPA: 'Spa Cho Thú Cưng',
  VACCINATION: 'Đăng Ký Tiêm Phòng',
  CHECKUP: 'Khám Bệnh Đúng Hẹn',
  TRANSPORT: 'Dịch Vụ Vận Chuyển',
  TRAINING: 'Lên Lịch Huấn Luyện',
};
const SERVICE_VALUES = Object.values(SERVICE_TYPES);

module.exports = { BOOKING_STATUS, STATUS_VALUES, SERVICE_TYPES, SERVICE_VALUES };
