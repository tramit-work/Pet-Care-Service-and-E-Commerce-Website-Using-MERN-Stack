export const ADMIN_ROLES = { ADMIN: 'admin', EDITOR: 'editor', USER: 'user' };

export const ADMIN_NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: 'bx-grid-alt', roles: [ADMIN_ROLES.ADMIN] },
  { to: '/admin/products', label: 'Sản phẩm', icon: 'bx-package', roles: [ADMIN_ROLES.ADMIN, ADMIN_ROLES.EDITOR] },
  { to: '/admin/categories', label: 'Danh mục', icon: 'bx-category', roles: [ADMIN_ROLES.ADMIN, ADMIN_ROLES.EDITOR] },
  { to: '/admin/pets', label: 'Thú cưng', icon: 'bx-paw', roles: [ADMIN_ROLES.ADMIN, ADMIN_ROLES.EDITOR] },
  { to: '/admin/bookings', label: 'Đặt lịch', icon: 'bx-calendar-check', roles: [ADMIN_ROLES.ADMIN, ADMIN_ROLES.EDITOR] },
  { to: '/admin/orders', label: 'Đơn hàng', icon: 'bx-cart-alt', roles: [ADMIN_ROLES.ADMIN] },
  { to: '/admin/reviews', label: 'Đánh giá', icon: 'bx-star', roles: [ADMIN_ROLES.ADMIN] },
  { to: '/admin/users', label: 'Người dùng', icon: 'bx-user', roles: [ADMIN_ROLES.ADMIN] },
];
