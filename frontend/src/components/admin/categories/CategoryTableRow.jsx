import DropdownActionMenu from '../DropdownActionMenu';
import { formatDate } from '../../../utils/formatDate';

function CategoryTableRow({ category, onEdit, onDelete }) {
  const inUse = (category.productCount ?? 0) > 0;

  return (
    <tr>
      <td>
        {category.image ? (
          <img src={category.image} alt={category.name} className="admin-table-thumb" />
        ) : (
          <div className="admin-table-thumb"></div>
        )}
      </td>
      <td>{category.name}</td>
      <td>{category.slug}</td>
      <td>{category.displayOrder}</td>
      <td>{category.productCount ?? 0}</td>
      <td>
        <span className={`active-badge${category.isFeatured ? ' active' : ' locked'}`}>
          {category.isFeatured ? 'Có' : 'Không'}
        </span>
      </td>
      <td>
        <span className={`active-badge${category.status === 'active' ? ' active' : ' locked'}`}>
          {category.status === 'active' ? 'Hoạt động' : 'Ngừng hoạt động'}
        </span>
      </td>
      <td>{formatDate(category.createdAt)}</td>
      <td>{formatDate(category.updatedAt)}</td>
      <td className="admin-table-actions-cell">
        <DropdownActionMenu
          items={[
            { label: 'Sửa', icon: 'bx-edit', onClick: onEdit },
            {
              label: 'Xóa',
              icon: 'bx-trash',
              danger: true,
              disabled: inUse,
              title: inUse ? 'Không thể xóa — danh mục đang có sản phẩm sử dụng' : undefined,
              onClick: onDelete,
            },
          ]}
        />
      </td>
    </tr>
  );
}

export default CategoryTableRow;
