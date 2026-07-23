import { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

function GoogleLoginButton({ onError }) {
  const buttonRef = useRef(null);
  const { googleLogin } = useAuth();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return undefined;

    function renderButton() {
      if (!window.google?.accounts?.id || !buttonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            await googleLogin(response.credential);
          } catch (err) {
            onError?.(err.message || 'Đăng nhập Google thất bại');
          }
        },
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
        text: 'continue_with',
      });
    }

    // Script Google (async/defer ở index.html) có thể chưa sẵn sàng lúc
    // component này mount — thử lại bằng interval ngắn thay vì chỉ chạy
    // đúng 1 lần khi mount.
    if (window.google?.accounts?.id) {
      renderButton();
      return undefined;
    }

    const interval = setInterval(() => {
      if (window.google?.accounts?.id) {
        renderButton();
        clearInterval(interval);
      }
    }, 300);
    return () => clearInterval(interval);
  }, [clientId, googleLogin, onError]);

  if (!clientId) {
    return (
      <p className="auth-google-not-configured">
        <i className="bx bx-info-circle"></i>
        Google Login chưa được cấu hình.
      </p>
    );
  }

  return (
    <div className="auth-google-btn-wrap">
      <div ref={buttonRef}></div>
    </div>
  );
}

export default GoogleLoginButton;
