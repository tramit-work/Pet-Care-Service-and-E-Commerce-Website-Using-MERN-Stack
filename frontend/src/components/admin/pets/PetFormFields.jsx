import ImageUploadField from '../ImageUploadField';
import GalleryUploadField from '../GalleryUploadField';
import { PET_SPECIES, PET_GENDER, ADOPTION_STATUS, GENDER_LABELS, ADOPTION_STATUS_LABELS } from '../../../utils/adminConstants';

function PetFormFields({ form, errors, updateField }) {
  return (
    <>
      <div className="admin-form-group">
        <label className="admin-form-label">
          Tên thú cưng<span className="required">*</span>
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
          Giống loài<span className="required">*</span>
        </label>
        <select className="admin-form-select" value={form.species} onChange={(e) => updateField('species', e.target.value)}>
          <option value={PET_SPECIES.DOG}>Chó</option>
          <option value={PET_SPECIES.CAT}>Mèo</option>
        </select>
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">Giống</label>
        <input type="text" className="admin-form-input" value={form.breed} onChange={(e) => updateField('breed', e.target.value)} />
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">Giới tính</label>
        <select className="admin-form-select" value={form.gender} onChange={(e) => updateField('gender', e.target.value)}>
          <option value="">-- Chọn --</option>
          {Object.values(PET_GENDER).map((g) => (
            <option key={g} value={g}>
              {GENDER_LABELS[g]}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">Tuổi (tháng)</label>
        <input type="number" className="admin-form-input" value={form.age} onChange={(e) => updateField('age', e.target.value)} />
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">Cân nặng (kg)</label>
        <input type="number" className="admin-form-input" value={form.weight} onChange={(e) => updateField('weight', e.target.value)} />
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">Màu sắc</label>
        <input type="text" className="admin-form-input" value={form.color} onChange={(e) => updateField('color', e.target.value)} />
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

      <ImageUploadField value={form.image} onChange={(v) => updateField('image', v)} error={errors.image} required />

      <GalleryUploadField value={form.gallery} onChange={(v) => updateField('gallery', v)} />

      <div className="admin-form-group full">
        <label className="admin-form-label">Mô tả</label>
        <textarea className="admin-form-textarea" value={form.description} onChange={(e) => updateField('description', e.target.value)} />
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">Tình trạng sức khỏe</label>
        <input
          type="text"
          className="admin-form-input"
          value={form.healthStatus}
          onChange={(e) => updateField('healthStatus', e.target.value)}
        />
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">Trạng thái nhận nuôi</label>
        <select
          className="admin-form-select"
          value={form.adoptionStatus}
          onChange={(e) => updateField('adoptionStatus', e.target.value)}
        >
          {Object.values(ADOPTION_STATUS).map((s) => (
            <option key={s} value={s}>
              {ADOPTION_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">Trạng thái hiển thị</label>
        <select className="admin-form-select" value={form.status} onChange={(e) => updateField('status', e.target.value)}>
          <option value="active">Hoạt động</option>
          <option value="inactive">Ngừng hoạt động</option>
        </select>
      </div>

      <div className="admin-form-group full admin-form-checkboxes">
        <div className="admin-form-checkbox-row">
          <input
            type="checkbox"
            id="pet-vaccination"
            checked={form.vaccination}
            onChange={(e) => updateField('vaccination', e.target.checked)}
          />
          <label htmlFor="pet-vaccination">Đã tiêm phòng</label>
        </div>
        <div className="admin-form-checkbox-row">
          <input
            type="checkbox"
            id="pet-featured"
            checked={form.isFeatured}
            onChange={(e) => updateField('isFeatured', e.target.checked)}
          />
          <label htmlFor="pet-featured">Thú cưng nổi bật</label>
        </div>
      </div>
    </>
  );
}

export default PetFormFields;
