export const RECORD_STATUS = { ACTIVE: 'active', INACTIVE: 'inactive' };

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const SERVICE_TYPES = [
  'Spa Cho Thú Cưng',
  'Đăng Ký Tiêm Phòng',
  'Khám Bệnh Đúng Hẹn',
  'Dịch Vụ Vận Chuyển',
  'Lên Lịch Huấn Luyện',
];

export const PET_SPECIES = { DOG: 'Dog', CAT: 'Cat' };
export const PET_GENDER = { MALE: 'male', FEMALE: 'female' };
export const ADOPTION_STATUS = { AVAILABLE: 'available', RESERVED: 'reserved', ADOPTED: 'adopted' };

export const BOOKING_STATUS_LABELS = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

export const ADOPTION_STATUS_LABELS = {
  available: 'Còn nhận nuôi',
  reserved: 'Đã giữ chỗ',
  adopted: 'Đã nhận nuôi',
};

export const GENDER_LABELS = { male: 'Đực', female: 'Cái' };

export const USER_ROLE_LABELS = {
  admin: 'Quản trị viên',
  editor: 'Biên tập viên',
  user: 'Khách hàng',
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPING: 'shipping',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const ORDER_STATUS_LABELS = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

export const PAYMENT_METHOD_LABELS = {
  store_pickup: 'Nhận tại cửa hàng',
  cod: 'Thanh toán khi nhận hàng',
  bank_transfer: 'Chuyển khoản ngân hàng',
};

export const ORDER_STATUS_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipping', 'cancelled'],
  shipping: ['completed'],
  completed: [],
  cancelled: [],
};
