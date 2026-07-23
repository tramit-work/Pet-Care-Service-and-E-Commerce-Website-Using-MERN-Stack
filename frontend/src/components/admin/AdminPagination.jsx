const PAGE_SIZE_OPTIONS = [10, 20, 50];

function AdminPagination({ page, totalPages, totalItems, onPageChange, pageSize, onPageSizeChange }) {
  const pages = [];
  if (totalPages > 1) {
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    for (let p = start; p <= end; p += 1) {
      pages.push(p);
    }
  }

  return (
    <div className="admin-pagination">
      <div className="admin-pagination-left">
        <span className="admin-pagination-info">Tổng {totalItems} bản ghi</span>
        {onPageSizeChange && (
          <label className="admin-pagination-size">
            Hiển thị
            <select
              className="admin-toolbar-select"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            dòng/trang
          </label>
        )}
      </div>

      {totalPages > 1 && (
        <div className="admin-pagination-controls">
          <button
            type="button"
            className="admin-pagination-btn"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Trang trước"
          >
            <i className="bx bx-chevron-left"></i>
          </button>
          {pages.map((p) => (
            <button
              key={p}
              type="button"
              className={`admin-pagination-btn${p === page ? ' active' : ''}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            className="admin-pagination-btn"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Trang sau"
          >
            <i className="bx bx-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminPagination;
