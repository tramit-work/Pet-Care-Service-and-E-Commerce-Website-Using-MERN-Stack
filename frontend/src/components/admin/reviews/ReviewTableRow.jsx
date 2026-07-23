import DropdownActionMenu from '../DropdownActionMenu';
import StarRating from '../../shared/StarRating';
import { formatDate } from '../../../utils/formatDate';

function ReviewTableRow({ stt, review, onViewDetail, onToggleStatus }) {
  const isActive = review.status === 'active';

  return (
    <tr>
      <td>{stt}</td>
      <td>{review.user?.fullName || '—'}</td>
      <td>{review.product?.name || '—'}</td>
      <td>
        <StarRating value={review.rating} size={14} />
      </td>
      <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {review.comment}
      </td>
      <td>{formatDate(review.createdAt)}</td>
      <td>
        <span className={`active-badge${isActive ? ' active' : ' locked'}`}>{isActive ? 'Hiển thị' : 'Đã ẩn'}</span>
      </td>
      <td className="admin-table-actions-cell">
        <DropdownActionMenu
          items={[
            { label: 'Xem chi tiết', icon: 'bx-show', onClick: onViewDetail },
            {
              label: isActive ? 'Ẩn đánh giá' : 'Hiện đánh giá',
              icon: isActive ? 'bx-hide' : 'bx-show-alt',
              danger: isActive,
              onClick: onToggleStatus,
            },
          ]}
        />
      </td>
    </tr>
  );
}

export default ReviewTableRow;
