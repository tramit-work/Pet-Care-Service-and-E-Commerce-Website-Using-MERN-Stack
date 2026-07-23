import { useEffect } from 'react';

function Modal({ title, onClose, children, footer, size = 'md', loading = false }) {
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className={`admin-modal admin-modal-${size}`} onClick={(e) => e.stopPropagation()}>
        {loading && <div className="admin-modal-loading-bar"></div>}
        <div className="admin-modal-header">
          <h2 className="admin-modal-title">{title}</h2>
          <button type="button" className="admin-modal-close" onClick={onClose} aria-label="Đóng">
            ×
          </button>
        </div>
        <div className="admin-modal-body">{children}</div>
        {footer && <div className="admin-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export default Modal;
