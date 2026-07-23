const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Pet = require('../models/Pet');
const Booking = require('../models/Booking');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');
const { HTTP_STATUS, RECORD_STATUS } = require('../constants');
const { ORDER_STATUS, ORDER_STATUS_VALUES } = require('../constants/order');
const { BOOKING_STATUS } = require('../constants/booking');

const STATUS_LABELS = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(date) {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d;
}

function startOfMonth(date) {
  const d = startOfDay(date);
  d.setDate(1);
  return d;
}

function formatDayLabel(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}`;
}

function formatMonthLabel(date) {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `Th${m}/${date.getFullYear()}`;
}

function dateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function monthKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

async function sumCompletedRevenue(matchExtra = {}) {
  const result = await Order.aggregate([
    { $match: { orderStatus: ORDER_STATUS.COMPLETED, ...matchExtra } },
    { $group: { _id: null, total: { $sum: '$finalAmount' } } },
  ]);
  return result[0]?.total || 0;
}

async function buildRevenueByDay(numDays) {
  const today = startOfDay(new Date());
  const start = new Date(today);
  start.setDate(start.getDate() - (numDays - 1));

  const raw = await Order.aggregate([
    { $match: { orderStatus: ORDER_STATUS.COMPLETED, createdAt: { $gte: start } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: '$finalAmount' } } },
  ]);
  const map = new Map(raw.map((r) => [r._id, r.total]));

  const series = [];
  for (let i = 0; i < numDays; i += 1) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    series.push({ label: formatDayLabel(d), value: map.get(dateKey(d)) || 0 });
  }
  return series;
}

async function buildRevenueByMonth(numMonths) {
  const today = startOfDay(new Date());
  const start = new Date(today.getFullYear(), today.getMonth() - (numMonths - 1), 1);

  const raw = await Order.aggregate([
    { $match: { orderStatus: ORDER_STATUS.COMPLETED, createdAt: { $gte: start } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, total: { $sum: '$finalAmount' } } },
  ]);
  const map = new Map(raw.map((r) => [r._id, r.total]));

  const series = [];
  for (let i = 0; i < numMonths; i += 1) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    series.push({ label: formatMonthLabel(d), value: map.get(monthKey(d)) || 0 });
  }
  return series;
}

async function buildOrderCountByMonth(numMonths) {
  const today = startOfDay(new Date());
  const start = new Date(today.getFullYear(), today.getMonth() - (numMonths - 1), 1);

  const raw = await Order.aggregate([
    { $match: { createdAt: { $gte: start } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
  ]);
  const map = new Map(raw.map((r) => [r._id, r.count]));

  const series = [];
  for (let i = 0; i < numMonths; i += 1) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    series.push({ label: formatMonthLabel(d), value: map.get(monthKey(d)) || 0 });
  }
  return series;
}

async function buildOrderStatusChart() {
  const raw = await Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]);
  const map = new Map(raw.map((r) => [r._id, r.count]));
  return ORDER_STATUS_VALUES.map((status) => ({
    status,
    label: STATUS_LABELS[status] || status,
    count: map.get(status) || 0,
  }));
}

const getDashboard = asyncHandler(async (req, res) => {
  const today = startOfDay(new Date());
  const weekStart = startOfWeek(new Date());
  const monthStart = startOfMonth(new Date());

  const [
    users,
    products,
    categories,
    pets,
    bookings,
    orders,
    pendingBookings,
    pendingOrders,
    todayRevenue,
    weekRevenue,
    monthRevenue,
    totalRevenue,
    revenueDays7,
    revenueDays30,
    revenueMonths12,
    orderChart,
    statusChart,
    recentOrders,
    recentBookings,
    recentUsers,
  ] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments({ status: RECORD_STATUS.ACTIVE }),
    Category.countDocuments({ status: RECORD_STATUS.ACTIVE }),
    Pet.countDocuments({ status: RECORD_STATUS.ACTIVE }),
    Booking.countDocuments(),
    Order.countDocuments(),
    Booking.countDocuments({ status: BOOKING_STATUS.PENDING }),
    Order.countDocuments({ orderStatus: ORDER_STATUS.PENDING }),
    sumCompletedRevenue({ createdAt: { $gte: today } }),
    sumCompletedRevenue({ createdAt: { $gte: weekStart } }),
    sumCompletedRevenue({ createdAt: { $gte: monthStart } }),
    sumCompletedRevenue(),
    buildRevenueByDay(7),
    buildRevenueByDay(30),
    buildRevenueByMonth(12),
    buildOrderCountByMonth(12),
    buildOrderStatusChart(),
    Order.find().sort({ createdAt: -1 }).limit(10),
    Booking.find().sort({ createdAt: -1 }).limit(10),
    User.find().sort({ createdAt: -1 }).limit(10),
  ]);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      summary: {
        users,
        products,
        categories,
        pets,
        bookings,
        orders,
        pendingBookings,
        pendingOrders,
        todayRevenue,
        weekRevenue,
        monthRevenue,
        totalRevenue,
      },
      revenueChart: {
        days7: revenueDays7,
        days30: revenueDays30,
        months12: revenueMonths12,
      },
      orderChart,
      statusChart,
      recentOrders,
      recentBookings,
      recentUsers,
    },
  });
});

module.exports = { getDashboard };
