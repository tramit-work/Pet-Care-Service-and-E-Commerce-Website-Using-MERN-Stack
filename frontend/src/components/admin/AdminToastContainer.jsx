import { useAdminToast } from '../../context/AdminToastContext';

const ICONS = { success: 'bx-check-circle', error: 'bx-error-circle', info: 'bx-info-circle' };

function AdminToastContainer() {
  const { toasts, dismissToast } = useAdminToast();

  if (toasts.length === 0) return null;

  return (
    <div className="admin-toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`admin-toast ${toast.type}`}>
          <i className={`bx ${ICONS[toast.type] || ICONS.info} admin-toast-icon`}></i>
          <span className="admin-toast-message">{toast.message}</span>
          <button
            type="button"
            className="admin-toast-close"
            onClick={() => dismissToast(toast.id)}
            aria-label="Đóng thông báo"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default AdminToastContainer;
