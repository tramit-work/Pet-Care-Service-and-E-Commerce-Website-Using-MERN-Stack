import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const AdminToastContext = createContext(null);

let idCounter = 0;

export function AdminToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'success') => {
      idCounter += 1;
      const id = idCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => dismissToast(id), 3500);
    },
    [dismissToast]
  );

  const value = useMemo(() => ({ toasts, showToast, dismissToast }), [toasts, showToast, dismissToast]);

  return <AdminToastContext.Provider value={value}>{children}</AdminToastContext.Provider>;
}

export function useAdminToast() {
  const context = useContext(AdminToastContext);
  if (!context) {
    throw new Error('useAdminToast phải được dùng bên trong AdminToastProvider');
  }
  return context;
}
