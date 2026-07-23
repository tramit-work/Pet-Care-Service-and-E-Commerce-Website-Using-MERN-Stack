import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAdminOrders, updateOrderStatus } from '../api/adminOrderService';
import { useAdminToast } from '../context/AdminToastContext';
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '../utils/adminConstants';
import AdminPageHeader from '../components/admin/AdminPageHeader';
import AdminToolbar from '../components/admin/AdminToolbar';
import AdminDataTable from '../components/admin/AdminDataTable';
import AdminPagination from '../components/admin/AdminPagination';
import AdminErrorState from '../components/admin/AdminErrorState';
import ConfirmDialog from '../components/admin/ConfirmDialog';
import OrderTableRow from '../components/admin/orders/OrderTableRow';
import OrderDetailModal from '../components/admin/orders/OrderDetailModal';

const HEADERS = ['STT', 'Mã đơn', 'Khách hàng', 'Email', 'SĐT', 'Tổng tiền', 'Thanh toán', 'Trạng thái', 'Ngày tạo', ''];

const FETCH_LIMIT = 200;

const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: 'Ngày tạo (mới nhất)' },
  { value: 'createdAt_asc', label: 'Ngày tạo (cũ nhất)' },
  { value: 'total_desc', label: 'Tổng tiền (cao nhất)' },
  { value: 'total_asc', label: 'Tổng tiền (thấp nhất)' },
  { value: 'status', label: 'Trạng thái' },
];

const STATUS_ORDER = { pending: 0, confirmed: 1, shipping: 2, completed: 3, cancelled: 4 };

function AdminOrdersPage() {
  const { showToast } = useAdminToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('createdAt_desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [detailTarget, setDetailTarget] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { order, nextStatus, label, tone }
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { items: data } = await getAdminOrders({ limit: FETCH_LIMIT, sort: 'newest' });
      setItems(data);
    } catch (err) {
      const message = err.response?.data?.message || 'Không tải được danh sách đơn hàng.';
      setLoadError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, paymentFilter, dateFrom, dateTo, sortBy, pageSize]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;

    const result = items.filter((o) => {
      if (statusFilter && o.orderStatus !== statusFilter) return false;
      if (paymentFilter && o.paymentMethod !== paymentFilter) return false;
      if (q) {
        const hay = `${o.orderCode} ${o.receiverName} ${o.user?.email || ''} ${o.phone}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (from || to) {
        const createdAt = new Date(o.createdAt);
        if (from && createdAt < from) return false;
        if (to && createdAt > to) return false;
      }
      return true;
    });

    const sorted = [...result];
    if (sortBy === 'createdAt_desc') sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortBy === 'createdAt_asc') sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sortBy === 'total_desc') sorted.sort((a, b) => b.finalAmount - a.finalAmount);
    else if (sortBy === 'total_asc') sorted.sort((a, b) => a.finalAmount - b.finalAmount);
    else if (sortBy === 'status') sorted.sort((a, b) => (STATUS_ORDER[a.orderStatus] ?? 9) - (STATUS_ORDER[b.orderStatus] ?? 9));

    return sorted;
  }, [items, search, statusFilter, paymentFilter, dateFrom, dateTo, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);
  const isFiltering = Boolean(search.trim() || statusFilter || paymentFilter || dateFrom || dateTo);

  async function handleStatusChange() {
    setBusy(true);
    try {
      await updateOrderStatus(confirmAction.order._id, confirmAction.nextStatus);
      showToast(`${confirmAction.label} thành công.`);
      setConfirmAction(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể cập nhật trạng thái.', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <AdminPageHeader title="Đơn hàng" description="Quản lý đơn hàng của khách hàng." />

      <AdminToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm theo mã đơn, tên khách hàng, email..."
        filters={
          <>
            <select className="admin-toolbar-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select className="admin-toolbar-select" value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
              <option value="">Tất cả thanh toán</option>
              {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <input type="date" className="admin-toolbar-date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <span style={{ color: '#9ca3af', fontSize: 12 }}>đến</span>
            <input type="date" className="admin-toolbar-date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            <select className="admin-toolbar-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Sắp xếp: {opt.label}
                </option>
              ))}
            </select>
          </>
        }
      />

      {loadError && items.length === 0 && !loading ? (
        <AdminErrorState message={loadError} onRetry={load} />
      ) : (
        <>
          <AdminDataTable
            headers={HEADERS}
            loading={loading}
            isEmpty={!loading && pageItems.length === 0}
            emptyMessage={isFiltering ? 'Không tìm thấy đơn hàng phù hợp.' : 'Chưa có đơn hàng nào.'}
          >
            {pageItems.map((order, index) => (
              <OrderTableRow
                key={order._id}
                stt={(page - 1) * pageSize + index + 1}
                order={order}
                onTransition={(nextStatus, label, tone) => setConfirmAction({ order, nextStatus, label, tone })}
                onViewDetail={() => setDetailTarget(order)}
              />
            ))}
          </AdminDataTable>

          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalItems={filtered.length}
            onPageChange={setPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
          />
        </>
      )}

      {detailTarget && (
        <OrderDetailModal
          order={detailTarget}
          stt={pageItems.findIndex((o) => o._id === detailTarget._id) + (page - 1) * pageSize + 1}
          onClose={() => setDetailTarget(null)}
        />
      )}

      {confirmAction && (
        <ConfirmDialog
          title={confirmAction.label}
          message={`Bạn có chắc muốn ${confirmAction.label.toLowerCase()} "${confirmAction.order.orderCode}"?`}
          confirmText={confirmAction.label}
          tone={confirmAction.tone}
          loading={busy}
          onConfirm={handleStatusChange}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}

export default AdminOrdersPage;
