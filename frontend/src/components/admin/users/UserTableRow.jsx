import DropdownActionMenu from '../DropdownActionMenu';
import { formatDate } from '../../../utils/formatDate';
import { USER_ROLE_LABELS } from '../../../utils/adminConstants';

function UserTableRow({ stt, user, isSelf, onChangeRole, onToggleStatus, onViewDetail }) {
  return (
    <tr>
      <td>{stt}</td>
      <td>
        {user.avatar ? (
          <img src={user.avatar} alt={user.fullName} className="admin-table-thumb" style={{ borderRadius: '50%' }} />
        ) : (
          <div className="admin-table-thumb" style={{ borderRadius: '50%' }}></div>
        )}
      </td>
      <td>{user.fullName}</td>
      <td>{user.email}</td>
      <td>{user.phone || '—'}</td>
      <td>
        <span className={`active-badge${user.isVerified ? ' active' : ' locked'}`}>
          {user.isVerified ? 'Verified' : 'Not Verified'}
        </span>
      </td>
      <td>
        <select
          className="admin-toolbar-select"
          value={user.role}
          disabled={isSelf}
          title={isSelf ? 'Không thể tự đổi vai trò của chính mình' : undefined}
          onChange={(e) => onChangeRole(user, e.target.value)}
        >
          {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </td>
      <td>
        <label
          className="admin-toggle-switch"
          title={isSelf ? 'Không thể tự khóa/mở khóa chính mình' : user.isActive ? 'Đang hoạt động — bấm để khóa' : 'Đã khóa — bấm để mở'}
        >
          <input type="checkbox" checked={user.isActive} disabled={isSelf} onChange={() => onToggleStatus(user)} />
          <span className="admin-toggle-slider"></span>
        </label>
      </td>
      <td>{formatDate(user.createdAt)}</td>
      <td className="admin-table-actions-cell">
        <DropdownActionMenu items={[{ label: 'Xem chi tiết', icon: 'bx-show', onClick: onViewDetail }]} />
      </td>
    </tr>
  );
}

export default UserTableRow;
