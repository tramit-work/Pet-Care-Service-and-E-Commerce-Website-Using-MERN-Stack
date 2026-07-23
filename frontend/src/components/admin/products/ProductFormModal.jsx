import { useState } from 'react';
import Modal from '../Modal';
import ProductFormFields from './ProductFormFields';

const EMPTY_FORM = {
  name: '',
  category: '',
  brand: '',
  price: '',
  originalPrice: '',
  stock: 0,
  description: '',
  image: '',
  gallery: [],
  isNewArrival: false,
  isSale: false,
  featured: false,
  status: 'active',
};

function ProductFormModal({ initialData, categories, onClose, onSubmit }) {
  const isEdit = Boolean(initialData);
  const [form, setForm] = useState(() =>
    initialData
      ? {
          name: initialData.name || '',
          category: initialData.category?._id || initialData.category || '',
          brand: initialData.brand || '',
          price: initialData.price ?? '',
          originalPrice: initialData.originalPrice ?? '',
          stock: initialData.stock ?? 0,
          description: initialData.description || '',
          image: initialData.image || '',
          gallery: initialData.gallery || [],
          isNewArrival: Boolean(initialData.isNewArrival),
          isSale: Boolean(initialData.isSale),
          featured: Boolean(initialData.featured),
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
    if (!form.name.trim()) nextErrors.name = 'Tên sản phẩm là bắt buộc';
    if (!form.category) nextErrors.category = 'Danh mục là bắt buộc';
    if (form.price === '' || Number(form.price) < 0) nextErrors.price = 'Giá là bắt buộc, không được âm';
    if (!form.image.trim()) nextErrors.image = 'Ảnh sản phẩm là bắt buộc';
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
        category: form.category,
        brand: form.brand.trim(),
        price: Number(form.price),
        originalPrice: form.originalPrice === '' ? null : Number(form.originalPrice),
        stock: Number(form.stock) || 0,
        description: form.description.trim(),
        image: form.image.trim(),
        gallery: form.gallery,
        isNewArrival: form.isNewArrival,
        isSale: form.isSale,
        featured: form.featured,
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
      title={isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
      onClose={onClose}
      size="lg"
      loading={submitting}
      footer={
        <>
          <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose} disabled={submitting}>
            Hủy
          </button>
          <button type="submit" form="product-form" className="admin-btn admin-btn-primary" disabled={submitting}>
            {submitting ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
          </button>
        </>
      }
    >
      <form id="product-form" onSubmit={handleSubmit} className="admin-form-grid">
        {serverError && (
          <div className="admin-form-group full">
            <span className="admin-form-error">{serverError}</span>
          </div>
        )}
        <ProductFormFields form={form} errors={errors} categories={categories} updateField={updateField} />
      </form>
    </Modal>
  );
}

export default ProductFormModal;
