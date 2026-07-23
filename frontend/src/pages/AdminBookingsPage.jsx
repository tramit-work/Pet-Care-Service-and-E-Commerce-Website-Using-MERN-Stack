import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAdminBookings, updateBooking, deleteBooking } from '../api/adminBookingService';
import { useAdminToast } from '../context/AdminToastContext';
import { BOOKING_STATUS_LABELS, SERVICE_TYPES } from '../utils/adminConstants';
import { buildBookingCodeMap } from '../utils/bookingCode';
import AdminPageHeader from '../components/admin/AdminPageHeader';
import AdminToolbar from '../components/admin/AdminToolbar';
import AdminDataTable from '../components/admin/AdminDataTable';
import AdminPagination from '../components/admin/AdminPagination';
import AdminErrorState from '../components/admin/AdminErrorState';
import ConfirmDialog from '../components/admin/ConfirmDialog';
import BookingFormModal from '../components/admin/bookings/BookingFormModal';
import BookingDetailModal from '../components/admin/bookings/BookingDetailModal';
import BookingTableRow from '../components/admin/bookings/BookingTableRow';

const HEADERS = ['STT', 'Mã Booking', 'Khách hàng', 'SĐT', 'Dịch vụ', 'Ngày đặt', 'Giờ', 'Trạng thái', ''];

const FETCH_LIMIT = 200;

const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: 'Ngày tạo (mới nhất)' },
  { value: 'createdAt_asc', label: 'Ngày tạo (cũ nhất)' },
  { value: 'bookingDate_desc', label: 'Ngày đặt (mới nhất)' },
  { value: 'bookingDate_asc', label: 'Ngày đặt (cũ nhất)' },
  { value: 'status', label: 'Trạng thái' },
];

const STATUS_ORDER = { pending: 0, confirmed: 1, completed: 2, cancelled: 3 };

function AdminBookingsPage() {
  const { showToast } = useAdminToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('createdAt_desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [editTarget, setEditTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { booking, nextStatus, label, tone }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { items: data } = await getAdminBookings({ limit: FETCH_LIMIT, sort: 'newest' });
      setItems(data);
    } catch (err) {
      const message = err.response?.data?.message || 'Không tải được danh sách đặt lịch.';
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
  }, [search, statusFilter, serviceFilter, dateFrom, dateTo, sortBy, pageSize]);

  const codeMap = useMemo(() => buildBookingCodeMap(items), [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;

    const result = items.filter((b) => {
      if (statusFilter && b.status !== statusFilter) return false;
      if (serviceFilter && b.serviceType !== serviceFilter) return false;
      if (q) {
        const code = (codeMap.get(b._id) || '').toLowerCase();
        const hay = `${b.customerName} ${b.phone} ${b.email || ''} ${code}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (from || to) {
        const bookingDate = new Date(b.bookingDate);
        if (from && bookingDate < from) return false;
        if (to && bookingDate > to) return false;
      }
      return true;
    });

    const sorted = [...result];
    if (sortBy === 'createdAt_desc') sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortBy === 'createdAt_asc') sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sortBy === 'bookingDate_desc') sorted.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
    else if (sortBy === 'bookingDate_asc') sorted.sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate));
    else if (sortBy === 'status') sorted.sort((a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9));

    return sorted;
  }, [items, search, statusFilter, serviceFilter, dateFrom, dateTo, sortBy, codeMap]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);
  const isFiltering = Boolean(search.trim() || statusFilter || serviceFilter || dateFrom || dateTo);

  async function handleStatusChange() {
    setBusy(true);
    try {
      await updateBooking(confirmAction.booking._id, { status: confirmAction.nextStatus });
      showToast(`${confirmAction.label} thành công.`);
      setConfirmAction(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể cập nhật trạng thái.', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function handleEditSubmit(payload) {
    await updateBooking(editTarget._id, payload);
    showToast('Cập nhật đặt lịch thành công.');
    setEditTarget(null);
    load();
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await deleteBooking(deleteTarget._id);
      showToast('Xóa đặt lịch thành công.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể xóa đặt lịch.', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <AdminPageHeader title="Đặt lịch" description="Quản lý lịch đặt dịch vụ của khách hàng." />

      <AdminToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm theo tên, SĐT, email, mã booking..."
        filters={
          <>
            <select className="admin-toolbar-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              {Object.entries(BOOKING_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select className="admin-toolbar-select" value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}>
              <option value="">Tất cả dịch vụ</option>
              {SERVICE_TYPES.map((s) => (
                <option key={s} value={s}>
                  {s}
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
            emptyMessage={isFiltering ? 'Không tìm thấy lịch đặt phù hợp.' : 'Chưa có lịch đặt nào.'}
          >
            {pageItems.map((booking, index) => (
              <BookingTableRow
                key={booking._id}
                stt={(page - 1) * pageSize + index + 1}
                code={codeMap.get(booking._id)}
                booking={booking}
                onTransition={(nextStatus, label, tone) => setConfirmAction({ booking, nextStatus, label, tone })}
                onViewDetail={() => setDetailTarget(booking)}
                onEdit={() => setEditTarget(booking)}
                onDelete={() => setDeleteTarget(booking)}
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

      {editTarget && <BookingFormModal initialData={editTarget} onClose={() => setEditTarget(null)} onSubmit={handleEditSubmit} />}

      {detailTarget && (
        <BookingDetailModal
          booking={detailTarget}
          stt={pageItems.findIndex((b) => b._id === detailTarget._id) + (page - 1) * pageSize + 1}
          code={codeMap.get(detailTarget._id)}
          onClose={() => setDetailTarget(null)}
        />
      )}

      {confirmAction && (
        <ConfirmDialog
          title={confirmAction.label}
          message={`Bạn có chắc muốn ${confirmAction.label.toLowerCase()} của khách "${confirmAction.booking.customerName}"?`}
          confirmText={confirmAction.label}
          tone={confirmAction.tone}
          loading={busy}
          onConfirm={handleStatusChange}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Xóa đặt lịch"
          message={`Bạn có chắc muốn xóa lịch đặt của "${deleteTarget.customerName}"? Hành động này không thể hoàn tác.`}
          confirmText="Xóa"
          tone="danger"
          loading={busy}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default AdminBookingsPage;
