export function formatPrice(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '';
  return Math.round(value).toLocaleString('vi-VN');
}
