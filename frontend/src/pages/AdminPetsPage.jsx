import { useCallback, useEffect, useState } from 'react';
import { getAdminPets, createPet, updatePet, deletePet } from '../api/adminPetService';
import { useAdminToast } from '../context/AdminToastContext';
import useDebouncedValue from '../utils/useDebouncedValue';
import AdminPageHeader from '../components/admin/AdminPageHeader';
import AdminToolbar from '../components/admin/AdminToolbar';
import AdminDataTable from '../components/admin/AdminDataTable';
import AdminPagination from '../components/admin/AdminPagination';
import AdminErrorState from '../components/admin/AdminErrorState';
import ConfirmDialog from '../components/admin/ConfirmDialog';
import PetFormModal from '../components/admin/pets/PetFormModal';
import PetTableRow from '../components/admin/pets/PetTableRow';

const HEADERS = ['Ảnh', 'Tên', 'Loài', 'Giống', 'Tuổi', 'Giới tính', 'Giá', 'Ảnh', 'Nhận nuôi', 'Trạng thái', 'Ngày tạo', ''];

function AdminPetsPage() {
  const { showToast } = useAdminToast();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);
  const [species, setSpecies] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalMode, setModalMode] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { items: data, pagination: p } = await getAdminPets({
        page,
        limit: pageSize,
        search: debouncedSearch || undefined,
        species: species || undefined,
      });
      setItems(data);
      setPagination(p);
    } catch (err) {
      const message = err.response?.data?.message || 'Không tải được danh sách thú cưng.';
      setLoadError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, debouncedSearch, species]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, species, pageSize]);

  async function handleSubmit(payload) {
    if (modalMode === 'create') {
      await createPet(payload);
      showToast('Tạo thú cưng thành công.');
    } else {
      await updatePet(modalMode._id, payload);
      showToast('Cập nhật thú cưng thành công.');
    }
    setModalMode(null);
    load();
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deletePet(deleteTarget._id);
      showToast('Xóa thú cưng thành công.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể xóa thú cưng.', 'error');
    } finally {
      setDeleting(false);
    }
  }

  const isFiltering = Boolean(search.trim() || species);

  return (
    <div>
      <AdminPageHeader
        title="Thú cưng"
        description="Quản lý thú cưng đang rao bán/nhận nuôi."
        actions={
          <button type="button" className="admin-btn admin-btn-primary" onClick={() => setModalMode('create')}>
            <i className="bx bx-plus"></i>
            Thêm thú cưng
          </button>
        }
      />

      <AdminToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm theo tên, giống..."
        filters={
          <select className="admin-toolbar-select" value={species} onChange={(e) => setSpecies(e.target.value)}>
            <option value="">Tất cả loài</option>
            <option value="Dog">Chó</option>
            <option value="Cat">Mèo</option>
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
            isEmpty={!loading && items.length === 0}
            emptyMessage={isFiltering ? 'Không tìm thấy thú cưng phù hợp.' : 'Chưa có thú cưng nào.'}
          >
            {items.map((pet) => (
              <PetTableRow key={pet._id} pet={pet} onEdit={() => setModalMode(pet)} onDelete={() => setDeleteTarget(pet)} />
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
        <PetFormModal initialData={modalMode === 'create' ? null : modalMode} onClose={() => setModalMode(null)} onSubmit={handleSubmit} />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Xóa thú cưng"
          message={`Bạn có chắc muốn xóa "${deleteTarget.name}"? Hành động này không thể hoàn tác.`}
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

export default AdminPetsPage;
