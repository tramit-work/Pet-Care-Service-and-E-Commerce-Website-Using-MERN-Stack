export function buildBookingCodeMap(bookings) {
  const sorted = [...bookings].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const map = new Map();
  sorted.forEach((booking, index) => {
    map.set(booking._id, `BK${String(index + 1).padStart(6, '0')}`);
  });
  return map;
}
