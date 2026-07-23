function ProductBulkBar({ count, onClear, onBulkDelete }) {
  return (
    <div className="admin-bulk-bar">
      <span className="admin-bulk-bar-label">Đã chọn {count} sản phẩm</span>
      <div className="admin-bulk-actions">
        <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={onClear}>
          Bỏ chọn
        </button>
        <button type="button" className="admin-btn admin-btn-danger admin-btn-sm" onClick={onBulkDelete}>
          <i className="bx bx-trash"></i>
          Xóa đã chọn
        </button>
      </div>
    </div>
  );
}

export default ProductBulkBar;
