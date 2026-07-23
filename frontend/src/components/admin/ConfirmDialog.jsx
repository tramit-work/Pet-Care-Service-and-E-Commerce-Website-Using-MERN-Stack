import Modal from './Modal';

function ConfirmDialog({
  title = 'Xác nhận',
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  tone = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      size="sm"
      loading={loading}
      footer={
        <>
          <button type="button" className="admin-btn admin-btn-secondary" onClick={onCancel} disabled={loading}>
            {cancelText}
          </button>
          <button
            type="button"
            className={`admin-btn ${tone === 'danger' ? 'admin-btn-danger' : 'admin-btn-primary'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : confirmText}
          </button>
        </>
      }
    >
      <div className={`admin-confirm-icon ${tone}`}>
        <i className={`bx ${tone === 'danger' ? 'bx-error' : 'bx-info-circle'}`}></i>
      </div>
      <p className="admin-confirm-message">{message}</p>
    </Modal>
  );
}

export default ConfirmDialog;
