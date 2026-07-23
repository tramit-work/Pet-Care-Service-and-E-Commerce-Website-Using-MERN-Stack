import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAdminCategories, createCategory, updateCategory, deleteCategory } from '../api/adminCategoryService';
import { useAdminToast } from '../context/AdminToastContext';
import AdminPageHeader from '../components/admin/AdminPageHeader';
import AdminToolbar from '../components/admin/AdminToolbar';
import AdminDataTable from '../components/admin/AdminDataTable';
import AdminPagination from '../components/admin/AdminPagination';
import AdminErrorState from '../components/admin/AdminErrorState';
import ConfirmDialog from '../components/admin/ConfirmDialog';
import CategoryFormModal from '../components/admin/categories/CategoryFormModal';
import CategoryTableRow from '../components/admin/categories/CategoryTableRow';

const HEADERS = ['Ảnh', 'Tên danh mục', 'Slug', 'Thứ tự', 'Sản phẩm', 'Nổi bật', 'Trạng thái', 'Ngày tạo', 'Cập nhật', ''];

function AdminCategoriesPage() {
  const { showToast } = useAdminToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalMode, setModalMode] = useState(null); // null | 'create' | editing category object
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getAdminCategories(statusFilter ? { status: statusFilter } : {});
      setItems(data);
    } catch (err) {
      const message = err.response?.data?.message || 'Không tải được danh sách danh mục.';
      setLoadError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, pageSize]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((c) => c.name.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q));
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);
  const isFiltering = Boolean(search.trim() || statusFilter);

  async function handleSubmit(payload) {
    if (modalMode === 'create') {
      await createCategory(payload);
      showToast('Tạo danh mục thành công.');
    } else {
      await updateCategory(modalMode._id, payload);
      showToast('Cập nhật danh mục thành công.');
    }
    setModalMode(null);
    load();
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteCategory(deleteTarget._id);
      showToast('Xóa danh mục thành công.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể xóa danh mục.', 'error');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Danh mục"
        description="Quản lý danh mục sản phẩm."
        actions={
          <button type="button" className="admin-btn admin-btn-primary" onClick={() => setModalMode('create')}>
            <i className="bx bx-plus"></i>
            Thêm danh mục
          </button>
        }
      />

      <AdminToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm theo tên danh mục..."
        filters={
          <select
            className="admin-toolbar-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
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
            emptyMessage={isFiltering ? 'Không tìm thấy danh mục phù hợp.' : 'Chưa có danh mục nào.'}
          >
            {pageItems.map((cat) => (
              <CategoryTableRow
                key={cat._id}
                category={cat}
                onEdit={() => setModalMode(cat)}
                onDelete={() => setDeleteTarget(cat)}
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

      {modalMode && (
        <CategoryFormModal
          initialData={modalMode === 'create' ? null : modalMode}
          onClose={() => setModalMode(null)}
          onSubmit={handleSubmit}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Xóa danh mục"
          message={`Bạn có chắc muốn xóa danh mục "${deleteTarget.name}"? Hành động này không thể hoàn tác.`}
          confirmText="Xóa"
          tone="danger"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default AdminCategoriesPage;
