import { useState } from 'react';
import Modal from '../Modal';
import PetFormFields from './PetFormFields';
import { PET_SPECIES, ADOPTION_STATUS } from '../../../utils/adminConstants';

const EMPTY_FORM = {
  name: '',
  species: PET_SPECIES.DOG,
  breed: '',
  gender: '',
  age: 0,
  weight: 0,
  color: '',
  price: '',
  description: '',
  image: '',
  gallery: [],
  vaccination: false,
  healthStatus: '',
  isFeatured: false,
  adoptionStatus: ADOPTION_STATUS.AVAILABLE,
  status: 'active',
};

function PetFormModal({ initialData, onClose, onSubmit }) {
  const isEdit = Boolean(initialData);
  const [form, setForm] = useState(() =>
    initialData
      ? {
          name: initialData.name || '',
          species: initialData.species || PET_SPECIES.DOG,
          breed: initialData.breed || '',
          gender: initialData.gender || '',
          age: initialData.age ?? 0,
          weight: initialData.weight ?? 0,
          color: initialData.color || '',
          price: initialData.price ?? '',
          description: initialData.description || '',
          image: initialData.image || '',
          gallery: initialData.gallery || [],
          vaccination: Boolean(initialData.vaccination),
          healthStatus: initialData.healthStatus || '',
          isFeatured: Boolean(initialData.isFeatured),
          adoptionStatus: initialData.adoptionStatus || ADOPTION_STATUS.AVAILABLE,
          status: initialData.status || 'active',
        }
      : EMPTY_FORM
  );
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: null }));
  }

  function validate() {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Tên thú cưng là bắt buộc';
    if (!form.species) nextErrors.species = 'Giống loài là bắt buộc';
    if (form.price === '' || Number(form.price) < 0) nextErrors.price = 'Giá là bắt buộc, không được âm';
    if (!form.image.trim()) nextErrors.image = 'Ảnh thú cưng là bắt buộc';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError(null);
    try {
      await onSubmit({
        name: form.name.trim(),
        species: form.species,
        breed: form.breed.trim(),
        gender: form.gender || undefined,
        age: Number(form.age) || 0,
        weight: Number(form.weight) || 0,
        color: form.color.trim(),
        price: Number(form.price),
        description: form.description.trim(),
        image: form.image.trim(),
        gallery: form.gallery,
        vaccination: form.vaccination,
        healthStatus: form.healthStatus.trim(),
        isFeatured: form.isFeatured,
        adoptionStatus: form.adoptionStatus,
        status: form.status,
      });
    } catch (err) {
      const details = err.response?.data?.details;
      setServerError(
        Array.isArray(details) && details.length > 0
          ? details.map((d) => d.message).join('; ')
          : err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title={isEdit ? 'Sửa thú cưng' : 'Thêm thú cưng'}
      onClose={onClose}
      size="lg"
      loading={submitting}
      footer={
        <>
          <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose} disabled={submitting}>
            Hủy
          </button>
          <button type="submit" form="pet-form" className="admin-btn admin-btn-primary" disabled={submitting}>
            {submitting ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo thú cưng'}
          </button>
        </>
      }
    >
      <form id="pet-form" onSubmit={handleSubmit} className="admin-form-grid">
        {serverError && (
          <div className="admin-form-group full">
            <span className="admin-form-error">{serverError}</span>
          </div>
        )}
        <PetFormFields form={form} errors={errors} updateField={updateField} />
      </form>
    </Modal>
  );
}

export default PetFormModal;
