import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAdminProducts, createProduct, updateProduct, softDeleteProduct } from '../api/adminProductService';
import { getAdminCategories } from '../api/adminCategoryService';
import { useAdminToast } from '../context/AdminToastContext';
import useDebouncedValue from '../utils/useDebouncedValue';
import AdminPageHeader from '../components/admin/AdminPageHeader';
import AdminToolbar from '../components/admin/AdminToolbar';
import AdminDataTable from '../components/admin/AdminDataTable';
import AdminPagination from '../components/admin/AdminPagination';
import AdminErrorState from '../components/admin/AdminErrorState';
import ConfirmDialog from '../components/admin/ConfirmDialog';
import GalleryPreviewModal from '../components/admin/GalleryPreviewModal';
import ProductFormModal from '../components/admin/products/ProductFormModal';
import ProductTableRow from '../components/admin/products/ProductTableRow';
import ProductBulkBar from '../components/admin/products/ProductBulkBar';

const BASE_HEADERS = ['Ảnh', 'Tên sản phẩm', 'Danh mục', 'Giá', 'Tồn kho', 'Ảnh', 'Nhãn', 'Trạng thái', ''];

function AdminProductsPage() {
  const { showToast } = useAdminToast();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalMode, setModalMode] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [previewProduct, setPreviewProduct] = useState(null);

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);

  useEffect(() => {
    getAdminCategories({ status: 'active' })
      .then(setCategories)
      .catch(() => showToast('Không tải được danh sách danh mục để lọc.', 'error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { items: data, pagination: p } = await getAdminProducts({
        page,
        limit: pageSize,
        search: debouncedSearch || undefined,
        category: categoryFilter || undefined,
        sort,
      });
      setItems(data);
      setPagination(p);
    } catch (err) {
      const message = err.response?.data?.message || 'Không tải được danh sách sản phẩm.';
      setLoadError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, debouncedSearch, categoryFilter, sort]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [debouncedSearch, categoryFilter, sort, pageSize]);

  const editingCategory =
    modalMode && modalMode !== 'create' && modalMode.category && typeof modalMode.category === 'object'
      ? modalMode.category
      : null;
  const categoryOptions =
    editingCategory && !categories.some((c) => c._id === editingCategory._id)
      ? [...categories, editingCategory]
      : categories;

  const allOnPageSelected = items.length > 0 && items.every((p) => selectedIds.has(p._id));

  function toggleSelect(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      if (allOnPageSelected) return new Set();
      return new Set(items.map((p) => p._id));
    });
  }

  const headers = useMemo(
    () => [
      <input
        type="checkbox"
        className="admin-table-checkbox"
        checked={allOnPageSelected}
        onChange={toggleSelectAll}
        aria-label="Chọn tất cả"
      />,
      ...BASE_HEADERS,
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allOnPageSelected, items]
  );

  async function handleSubmit(payload) {
    if (modalMode === 'create') {
      await createProduct(payload);
      showToast('Tạo sản phẩm thành công.');
    } else {
      await updateProduct(modalMode._id, payload);
      showToast('Cập nhật sản phẩm thành công.');
    }
    setModalMode(null);
    load();
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await softDeleteProduct(deleteTarget._id);
      showToast('Đã ẩn sản phẩm khỏi cửa hàng.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể xóa sản phẩm.', 'error');
    } finally {
      setDeleting(false);
    }
  }

  async function handleDuplicate(product) {
    try {
      await createProduct({
        name: `${product.name} (Copy)`,
        category: product.category?._id || product.category,
        brand: product.brand || '',
        price: product.price,
        originalPrice: product.originalPrice ?? null,
        stock: product.stock || 0,
        description: product.description || '',
        image: product.image,
        gallery: product.gallery || [],
        isNewArrival: product.isNewArrival,
        isSale: product.isSale,
        featured: false,
        status: 'active',
      });
      showToast('Nhân bản sản phẩm thành công.');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể nhân bản sản phẩm.', 'error');
    }
  }

  async function handleToggleActive(product) {
    const nextStatus = product.status === 'active' ? 'inactive' : 'active';
    try {
      await updateProduct(product._id, { status: nextStatus });
      showToast(nextStatus === 'active' ? 'Đã bật hoạt động sản phẩm.' : 'Đã ẩn sản phẩm khỏi cửa hàng.');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể đổi trạng thái sản phẩm.', 'error');
    }
  }

  async function handleBulkDelete() {
    setBulkBusy(true);
    const ids = Array.from(selectedIds);
    const results = await Promise.allSettled(ids.map((id) => softDeleteProduct(id)));
    const failed = results.filter((r) => r.status === 'rejected').length;
    setBulkBusy(false);
    setBulkConfirmOpen(false);
    setSelectedIds(new Set());
    if (failed === 0) {
      showToast(`Đã ẩn ${ids.length} sản phẩm khỏi cửa hàng.`);
    } else {
      showToast(`Đã ẩn ${ids.length - failed}/${ids.length} sản phẩm — ${failed} sản phẩm lỗi.`, 'error');
    }
    load();
  }

  const isFiltering = Boolean(search.trim() || categoryFilter);

  return (
    <div>
      <AdminPageHeader
        title="Sản phẩm"
        description="Quản lý sản phẩm đang bán tại cửa hàng."
        actions={
          <button type="button" className="admin-btn admin-btn-primary" onClick={() => setModalMode('create')}>
            <i className="bx bx-plus"></i>
            Thêm sản phẩm
          </button>
        }
      />

      <AdminToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm theo tên sản phẩm..."
        filters={
          <>
            <select
              className="admin-toolbar-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select className="admin-toolbar-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
              <option value="rating">Đánh giá cao</option>
              <option value="featured">Nổi bật</option>
            </select>
          </>
        }
      />

      {selectedIds.size > 0 && (
        <ProductBulkBar
          count={selectedIds.size}
          onClear={() => setSelectedIds(new Set())}
          onBulkDelete={() => setBulkConfirmOpen(true)}
        />
      )}

      {loadError && items.length === 0 && !loading ? (
        <AdminErrorState message={loadError} onRetry={load} />
      ) : (
        <>
          <AdminDataTable
            headers={headers}
            loading={loading}
            isEmpty={!loading && items.length === 0}
            emptyMessage={isFiltering ? 'Không tìm thấy sản phẩm phù hợp.' : 'Chưa có sản phẩm nào.'}
          >
            {items.map((product) => (
              <ProductTableRow
                key={product._id}
                product={product}
                selected={selectedIds.has(product._id)}
                onToggleSelect={toggleSelect}
                onEdit={() => setModalMode(product)}
                onDuplicate={() => handleDuplicate(product)}
                onToggleActive={handleToggleActive}
                onPreviewGallery={setPreviewProduct}
                onDelete={() => setDeleteTarget(product)}
              />
            ))}
          </AdminDataTable>

          <AdminPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            onPageChange={setPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
          />
        </>
      )}

      {modalMode && (
        <ProductFormModal
          initialData={modalMode === 'create' ? null : modalMode}
          categories={categoryOptions}
          onClose={() => setModalMode(null)}
          onSubmit={handleSubmit}
        />
      )}

      {previewProduct && (
        <GalleryPreviewModal
          title={`Thư viện ảnh — ${previewProduct.name}`}
          images={[previewProduct.image, ...(previewProduct.gallery || [])].filter(Boolean)}
          onClose={() => setPreviewProduct(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Xóa sản phẩm"
          message={`Xóa "${deleteTarget.name}"? Sản phẩm sẽ bị ẩn khỏi cửa hàng và khỏi danh sách này (dữ liệu vẫn được giữ lại, không xóa vĩnh viễn khỏi hệ thống).`}
          confirmText="Xóa"
          tone="danger"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {bulkConfirmOpen && (
        <ConfirmDialog
          title="Xóa nhiều sản phẩm"
          message={`Xóa ${selectedIds.size} sản phẩm đã chọn? Các sản phẩm này sẽ bị ẩn khỏi cửa hàng (không xóa vĩnh viễn).`}
          confirmText="Xóa"
          tone="danger"
          loading={bulkBusy}
          onConfirm={handleBulkDelete}
          onCancel={() => setBulkConfirmOpen(false)}
        />
      )}
    </div>
  );
}

export default AdminProductsPage;
