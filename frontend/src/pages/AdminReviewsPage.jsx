import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAdminReviews, updateReviewStatus } from '../api/adminReviewService';
import { useAdminToast } from '../context/AdminToastContext';
import AdminPageHeader from '../components/admin/AdminPageHeader';
import AdminToolbar from '../components/admin/AdminToolbar';
import AdminDataTable from '../components/admin/AdminDataTable';
import AdminPagination from '../components/admin/AdminPagination';
import AdminErrorState from '../components/admin/AdminErrorState';
import ConfirmDialog from '../components/admin/ConfirmDialog';
import ReviewTableRow from '../components/admin/reviews/ReviewTableRow';
import ReviewDetailModal from '../components/admin/reviews/ReviewDetailModal';

const HEADERS = ['STT', 'User', 'Sản phẩm', 'Rating', 'Nội dung', 'Ngày tạo', 'Trạng thái', ''];

const FETCH_LIMIT = 200;

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'rating_asc', label: 'Rating tăng dần' },
  { value: 'rating_desc', label: 'Rating giảm dần' },
];

function AdminReviewsPage() {
  const { showToast } = useAdminToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [detailReview, setDetailReview] = useState(null);
  const [statusConfirm, setStatusConfirm] = useState(null); // { review, nextStatus }
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { items: data } = await getAdminReviews({ limit: FETCH_LIMIT });
      setItems(data);
    } catch (err) {
      const message = err.response?.data?.message || 'Không tải được danh sách đánh giá.';
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
  }, [search, ratingFilter, statusFilter, dateFrom, dateTo, sortBy, pageSize]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;

    const result = items.filter((r) => {
      if (ratingFilter && r.rating !== Number(ratingFilter)) return false;
      if (statusFilter && r.status !== statusFilter) return false;
      if (q) {
        const hay = `${r.user?.fullName || ''} ${r.product?.name || ''} ${r.comment}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (from || to) {
        const createdAt = new Date(r.createdAt);
        if (from && createdAt < from) return false;
        if (to && createdAt > to) return false;
      }
      return true;
    });

    const sorted = [...result];
    if (sortBy === 'newest') sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortBy === 'oldest') sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sortBy === 'rating_asc') sorted.sort((a, b) => a.rating - b.rating);
    else if (sortBy === 'rating_desc') sorted.sort((a, b) => b.rating - a.rating);

    return sorted;
  }, [items, search, ratingFilter, statusFilter, dateFrom, dateTo, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);
  const isFiltering = Boolean(search.trim() || ratingFilter || statusFilter || dateFrom || dateTo);

  async function handleStatusConfirm() {
    setBusy(true);
    try {
      await updateReviewStatus(statusConfirm.review._id, statusConfirm.nextStatus);
      showToast(statusConfirm.nextStatus === 'active' ? 'Đã hiện đánh giá.' : 'Đã ẩn đánh giá.');
      setStatusConfirm(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể cập nhật trạng thái.', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <AdminPageHeader title="Đánh giá" description="Quản lý đánh giá sản phẩm của khách hàng." />

      <AdminToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm theo user, sản phẩm, nội dung..."
        filters={
          <>
            <select className="admin-toolbar-select" value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
              <option value="">Tất cả rating</option>
              {[5, 4, 3, 2, 1].map((star) => (
                <option key={star} value={star}>
                  {star} sao
                </option>
              ))}
            </select>
            <select className="admin-toolbar-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              <option value="active">Hiển thị</option>
              <option value="inactive">Đã ẩn</option>
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
            emptyMessage={isFiltering ? 'Không tìm thấy đánh giá phù hợp.' : 'Chưa có đánh giá nào.'}
          >
            {pageItems.map((review, index) => (
              <ReviewTableRow
                key={review._id}
                stt={(page - 1) * pageSize + index + 1}
                review={review}
                onViewDetail={() => setDetailReview(review)}
                onToggleStatus={() =>
                  setStatusConfirm({ review, nextStatus: review.status === 'active' ? 'inactive' : 'active' })
                }
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

      {detailReview && <ReviewDetailModal review={detailReview} onClose={() => setDetailReview(null)} />}

      {statusConfirm && (
        <ConfirmDialog
          title={statusConfirm.nextStatus === 'active' ? 'Hiện đánh giá' : 'Ẩn đánh giá'}
          message={`Bạn có chắc muốn ${statusConfirm.nextStatus === 'active' ? 'hiện lại' : 'ẩn'} đánh giá này?`}
          confirmText="Xác nhận"
          tone={statusConfirm.nextStatus === 'active' ? 'info' : 'danger'}
          loading={busy}
          onConfirm={handleStatusConfirm}
          onCancel={() => setStatusConfirm(null)}
        />
      )}
    </div>
  );
}

export default AdminReviewsPage;
