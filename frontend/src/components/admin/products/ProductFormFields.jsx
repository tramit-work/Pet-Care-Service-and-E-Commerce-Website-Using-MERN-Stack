import ImageUploadField from '../ImageUploadField';
import GalleryUploadField from '../GalleryUploadField';

function ProductFormFields({ form, errors, categories, updateField }) {
  return (
    <>
      <div className="admin-form-group">
        <label className="admin-form-label">
          Tên sản phẩm<span className="required">*</span>
        </label>
        <input
          type="text"
          className={`admin-form-input${errors.name ? ' has-error' : ''}`}
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
        />
        {errors.name && <span className="admin-form-error">{errors.name}</span>}
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">
          Danh mục<span className="required">*</span>
        </label>
        <select
          className={`admin-form-select${errors.category ? ' has-error' : ''}`}
          value={form.category}
          onChange={(e) => updateField('category', e.target.value)}
        >
          <option value="">-- Chọn danh mục --</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
              {cat.status === 'inactive' ? ' (ngừng hoạt động)' : ''}
            </option>
          ))}
        </select>
        {errors.category && <span className="admin-form-error">{errors.category}</span>}
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">Thương hiệu</label>
        <input type="text" className="admin-form-input" value={form.brand} onChange={(e) => updateField('brand', e.target.value)} />
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">Tồn kho</label>
        <input type="number" className="admin-form-input" value={form.stock} onChange={(e) => updateField('stock', e.target.value)} />
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">
          Giá<span className="required">*</span>
        </label>
        <input
          type="number"
          className={`admin-form-input${errors.price ? ' has-error' : ''}`}
          value={form.price}
          onChange={(e) => updateField('price', e.target.value)}
        />
        {errors.price && <span className="admin-form-error">{errors.price}</span>}
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">Giá gốc (nếu giảm giá)</label>
        <input
          type="number"
          className="admin-form-input"
          value={form.originalPrice}
          onChange={(e) => updateField('originalPrice', e.target.value)}
        />
      </div>

      <ImageUploadField value={form.image} onChange={(v) => updateField('image', v)} error={errors.image} required />

      <GalleryUploadField value={form.gallery} onChange={(v) => updateField('gallery', v)} />

      <div className="admin-form-group full">
        <label className="admin-form-label">Mô tả</label>
        <textarea
          className="admin-form-textarea"
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
        />
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">Trạng thái</label>
        <select className="admin-form-select" value={form.status} onChange={(e) => updateField('status', e.target.value)}>
          <option value="active">Hoạt động</option>
          <option value="inactive">Ngừng bán</option>
        </select>
      </div>

      <div className="admin-form-group full admin-form-checkboxes">
        <div className="admin-form-checkbox-row">
          <input
            type="checkbox"
            id="prod-new"
            checked={form.isNewArrival}
            onChange={(e) => updateField('isNewArrival', e.target.checked)}
          />
          <label htmlFor="prod-new">Hàng mới về</label>
        </div>
        <div className="admin-form-checkbox-row">
          <input type="checkbox" id="prod-sale" checked={form.isSale} onChange={(e) => updateField('isSale', e.target.checked)} />
          <label htmlFor="prod-sale">Đang giảm giá</label>
        </div>
        <div className="admin-form-checkbox-row">
          <input
            type="checkbox"
            id="prod-featured"
            checked={form.featured}
            onChange={(e) => updateField('featured', e.target.checked)}
          />
          <label htmlFor="prod-featured">Sản phẩm nổi bật</label>
        </div>
      </div>
    </>
  );
}

export default ProductFormFields;
