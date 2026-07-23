import { formatPrice } from '../../../utils/formatPrice';
import DropdownActionMenu from '../DropdownActionMenu';

function ProductTableRow({ product, selected, onToggleSelect, onEdit, onDuplicate, onToggleActive, onPreviewGallery, onDelete }) {
  const imageCount = (product.image ? 1 : 0) + (product.gallery?.length || 0);

  return (
    <tr>
      <td>
        <input
          type="checkbox"
          className="admin-table-checkbox"
          checked={selected}
          onChange={() => onToggleSelect(product._id)}
          aria-label={`Chọn ${product.name}`}
        />
      </td>
      <td>
        {product.image ? (
          <img src={product.image} alt={product.name} className="admin-table-thumb" />
        ) : (
          <div className="admin-table-thumb"></div>
        )}
      </td>
      <td>{product.name}</td>
      <td>{product.category?.name || '—'}</td>
      <td>{formatPrice(product.price)}đ</td>
      <td>{product.stock}</td>
      <td>
        <button type="button" className="admin-image-count-badge" onClick={() => onPreviewGallery(product)}>
          <i className="bx bx-images"></i>
          {imageCount}
        </button>
      </td>
      <td>
        {product.isNewArrival && <span className="active-badge active">Mới</span>}{' '}
        {product.isSale && <span className="active-badge locked">Sale</span>}{' '}
        {product.featured && <span className="role-badge role-admin">Nổi bật</span>}
      </td>
      <td>
        <label className="admin-toggle-switch" title={product.status === 'active' ? 'Đang hoạt động — bấm để ẩn' : 'Đang ẩn'}>
          <input type="checkbox" checked={product.status === 'active'} onChange={() => onToggleActive(product)} />
          <span className="admin-toggle-slider"></span>
        </label>
      </td>
      <td className="admin-table-actions-cell">
        <DropdownActionMenu
          items={[
            { label: 'Sửa', icon: 'bx-edit', onClick: onEdit },
            { label: 'Nhân bản', icon: 'bx-copy', onClick: onDuplicate },
            { label: 'Xóa', icon: 'bx-trash', danger: true, onClick: onDelete },
          ]}
        />
      </td>
    </tr>
  );
}

export default ProductTableRow;
