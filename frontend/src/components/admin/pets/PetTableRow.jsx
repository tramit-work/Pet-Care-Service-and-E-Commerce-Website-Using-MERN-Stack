import DropdownActionMenu from '../DropdownActionMenu';
import { formatPrice } from '../../../utils/formatPrice';
import { formatDate } from '../../../utils/formatDate';

const ADOPTION_LABELS = { available: 'Còn nhận nuôi', reserved: 'Đã giữ chỗ', adopted: 'Đã nhận nuôi' };

function PetTableRow({ pet, onEdit, onDelete }) {
  const imageCount = (pet.image ? 1 : 0) + (pet.gallery?.length || 0);

  return (
    <tr>
      <td>
        {pet.image ? <img src={pet.image} alt={pet.name} className="admin-table-thumb" /> : <div className="admin-table-thumb"></div>}
      </td>
      <td>{pet.name}</td>
      <td>{pet.species === 'Dog' ? 'Chó' : 'Mèo'}</td>
      <td>{pet.breed || '—'}</td>
      <td>{pet.age} tháng</td>
      <td>
        {pet.gender ? (
          <span className={`admin-gender-badge ${pet.gender}`}>{pet.gender === 'male' ? 'Đực' : 'Cái'}</span>
        ) : (
          '—'
        )}
      </td>
      <td>{formatPrice(pet.price)}đ</td>
      <td>
        <span className="admin-image-count-badge">
          <i className="bx bx-images"></i>
          {imageCount}
        </span>
      </td>
      <td>
        <span className={`active-badge${pet.adoptionStatus === 'available' ? ' active' : ' locked'}`}>
          {ADOPTION_LABELS[pet.adoptionStatus] || pet.adoptionStatus}
        </span>
      </td>
      <td>
        <span className={`active-badge${pet.status === 'active' ? ' active' : ' locked'}`}>
          {pet.status === 'active' ? 'Hoạt động' : 'Ngừng hoạt động'}
        </span>
      </td>
      <td>{formatDate(pet.createdAt)}</td>
      <td className="admin-table-actions-cell">
        <DropdownActionMenu
          items={[
            { label: 'Sửa', icon: 'bx-edit', onClick: onEdit },
            { label: 'Xóa', icon: 'bx-trash', danger: true, onClick: onDelete },
          ]}
        />
      </td>
    </tr>
  );
}

export default PetTableRow;
