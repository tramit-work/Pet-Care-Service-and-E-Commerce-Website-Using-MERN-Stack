import { useEffect, useState } from 'react';
import { getSessions, revokeSession, revokeAllSessions } from '../../api/accountService';
import { formatDateTime } from '../../utils/formatDate';

function SessionList({ onLogoutCurrent, onSuccess, onError }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [revokingAll, setRevokingAll] = useState(false);

  function load() {
    setLoading(true);
    getSessions()
      .then(setSessions)
      .catch(() => onError?.('Không tải được danh sách phiên đăng nhập.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleRevoke(session) {
    if (session.isCurrent) {
      onLogoutCurrent();
      return;
    }
    setBusyId(session.id);
    try {
      await revokeSession(session.id);
      onSuccess?.('Đã đăng xuất thiết bị.');
      load();
    } catch (err) {
      onError?.(err.response?.data?.message || 'Không thể đăng xuất thiết bị này.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleRevokeAll() {
    setRevokingAll(true);
    try {
      await revokeAllSessions();
      onLogoutCurrent();
    } catch (err) {
      onError?.(err.response?.data?.message || 'Không thể đăng xuất tất cả thiết bị.');
      setRevokingAll(false);
    }
  }

  if (loading) {
    return <p className="profile-form-label">Đang tải danh sách phiên đăng nhập...</p>;
  }

  if (sessions.length === 0) {
    return <p className="profile-form-label">Không có phiên đăng nhập nào.</p>;
  }

  return (
    <div>
      <div className="profile-session-list">
        {sessions.map((session) => (
          <div className="profile-session-item" key={session.id}>
            <div>
              <p className="profile-session-device">
                {session.browser} — {session.os}
                {session.isCurrent && <span className="profile-session-current-tag">Thiết bị hiện tại</span>}
              </p>
              <p className="profile-session-meta">
                Đăng nhập lúc {formatDateTime(session.createdAt)}
                {session.ipAddress ? ` — IP: ${session.ipAddress}` : ''}
              </p>
            </div>
            <button
              type="button"
              className="profile-btn-secondary profile-session-logout-btn"
              onClick={() => handleRevoke(session)}
              disabled={busyId === session.id}
            >
              {busyId === session.id ? 'Đang xử lý...' : session.isCurrent ? 'Đăng xuất' : 'Đăng xuất thiết bị này'}
            </button>
          </div>
        ))}
      </div>

      <button type="button" className="profile-btn-secondary profile-logout-all-btn" onClick={handleRevokeAll} disabled={revokingAll}>
        {revokingAll ? 'Đang xử lý...' : 'Đăng xuất tất cả thiết bị'}
      </button>
    </div>
  );
}

export default SessionList;
