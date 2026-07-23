function AdminErrorState({ message = 'Không thể tải dữ liệu.', onRetry }) {
  return (
    <div className="admin-error-state">
      <i className="bx bx-error-circle"></i>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="admin-btn admin-btn-secondary" onClick={onRetry}>
          <i className="bx bx-refresh"></i>
          Thử lại
        </button>
      )}
    </div>
  );
}

export default AdminErrorState;
