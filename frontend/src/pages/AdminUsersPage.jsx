import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAdminUsers, updateUserRole, updateUserStatus } from '../api/adminUserService';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAdminToast } from '../context/AdminToastContext';
import { USER_ROLE_LABELS } from '../utils/adminConstants';
import AdminPageHeader from '../components/admin/AdminPageHeader';
import AdminToolbar from '../components/admin/AdminToolbar';
import AdminDataTable from '../components/admin/AdminDataTable';
import AdminPagination from '../components/admin/AdminPagination';
import AdminErrorState from '../components/admin/AdminErrorState';
import ConfirmDialog from '../components/admin/ConfirmDialog';
import UserTableRow from '../components/admin/users/UserTableRow';
import UserDetailModal from '../components/admin/users/UserDetailModal';

const HEADERS = ['STT', 'Avatar', 'Họ và tên', 'Email', 'Số điện thoại', 'Xác thực', 'Vai trò', 'Trạng thái', 'Ngày đăng ký', ''];

const FETCH_LIMIT = 200;

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'name_asc', label: 'Họ tên A → Z' },
  { value: 'name_desc', label: 'Họ tên Z → A' },
];

function AdminUsersPage() {
  const { user: currentAdmin } = useAdminAuth();
  const { showToast } = useAdminToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [detailUserId, setDetailUserId] = useState(null);
  const [roleConfirm, setRoleConfirm] = useState(null); // { user, nextRole }
  const [statusConfirm, setStatusConfirm] = useState(null); // { user, nextActive }
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { items: data } = await getAdminUsers({ limit: FETCH_LIMIT });
      setItems(data);
    } catch (err) {
      const message = err.response?.data?.message || 'Không tải được danh sách người dùng.';
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
  }, [search, roleFilter, statusFilter, verifiedFilter, dateFrom, dateTo, sortBy, pageSize]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;

    const result = items.filter((u) => {
      if (roleFilter && u.role !== roleFilter) return false;
      if (statusFilter === 'active' && !u.isActive) return false;
      if (statusFilter === 'locked' && u.isActive) return false;
      if (verifiedFilter === 'verified' && !u.isVerified) return false;
      if (verifiedFilter === 'unverified' && u.isVerified) return false;
      if (q) {
        const hay = `${u.fullName} ${u.email} ${u.phone || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (from || to) {
        const createdAt = new Date(u.createdAt);
        if (from && createdAt < from) return false;
        if (to && createdAt > to) return false;
      }
      return true;
    });

    const sorted = [...result];
    if (sortBy === 'newest') sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortBy === 'oldest') sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sortBy === 'name_asc') sorted.sort((a, b) => a.fullName.localeCompare(b.fullName));
    else if (sortBy === 'name_desc') sorted.sort((a, b) => b.fullName.localeCompare(a.fullName));

    return sorted;
  }, [items, search, roleFilter, statusFilter, verifiedFilter, dateFrom, dateTo, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);
  const isFiltering = Boolean(search.trim() || roleFilter || statusFilter || verifiedFilter || dateFrom || dateTo);

  async function handleRoleConfirm() {
    setBusy(true);
    try {
      await updateUserRole(roleConfirm.user._id, roleConfirm.nextRole);
      showToast('Đã cập nhật vai trò.');
      setRoleConfirm(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể đổi vai trò.', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function handleStatusConfirm() {
    setBusy(true);
    try {
      await updateUserStatus(statusConfirm.user._id, statusConfirm.nextActive);
      showToast(statusConfirm.nextActive ? 'Đã mở khóa tài khoản.' : 'Đã khóa tài khoản.');
      setStatusConfirm(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể đổi trạng thái.', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <AdminPageHeader title="Người dùng" description="Quản lý tài khoản người dùng." />

      <AdminToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm theo họ tên, email, số điện thoại..."
        filters={
          <>
            <select className="admin-toolbar-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">Tất cả vai trò</option>
              {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select className="admin-toolbar-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="locked">Đã khóa</option>
            </select>
            <select className="admin-toolbar-select" value={verifiedFilter} onChange={(e) => setVerifiedFilter(e.target.value)}>
              <option value="">Tất cả xác thực</option>
              <option value="verified">Verified</option>
              <option value="unverified">Not Verified</option>
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
            emptyMessage={isFiltering ? 'Không tìm thấy người dùng phù hợp.' : 'Chưa có người dùng nào.'}
          >
            {pageItems.map((u, index) => (
              <UserTableRow
                key={u._id}
                stt={(page - 1) * pageSize + index + 1}
                user={u}
                isSelf={currentAdmin && String(u._id) === String(currentAdmin._id)}
                onChangeRole={(user, nextRole) => setRoleConfirm({ user, nextRole })}
                onToggleStatus={(user) => setStatusConfirm({ user, nextActive: !user.isActive })}
                onViewDetail={() => setDetailUserId(u._id)}
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

      {detailUserId && <UserDetailModal userId={detailUserId} onClose={() => setDetailUserId(null)} />}

      {roleConfirm && (
        <ConfirmDialog
          title="Đổi vai trò"
          message={`Đổi vai trò của "${roleConfirm.user.fullName}" thành "${USER_ROLE_LABELS[roleConfirm.nextRole]}"?`}
          confirmText="Xác nhận"
          tone="info"
          loading={busy}
          onConfirm={handleRoleConfirm}
          onCancel={() => setRoleConfirm(null)}
        />
      )}

      {statusConfirm && (
        <ConfirmDialog
          title={statusConfirm.nextActive ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
          message={`Bạn có chắc muốn ${statusConfirm.nextActive ? 'mở khóa' : 'khóa'} tài khoản "${statusConfirm.user.fullName}"?`}
          confirmText="Xác nhận"
          tone={statusConfirm.nextActive ? 'info' : 'danger'}
          loading={busy}
          onConfirm={handleStatusConfirm}
          onCancel={() => setStatusConfirm(null)}
        />
      )}
    </div>
  );
}

export default AdminUsersPage;
