import Modal from './Modal';

function GalleryPreviewModal({ title, images, onClose }) {
  return (
    <Modal title={title} onClose={onClose} size="lg">
      {images.length === 0 ? (
        <p className="admin-form-hint">Chưa có ảnh nào.</p>
      ) : (
        <div className="admin-gallery-preview-grid">
          {images.map((url, index) => (
            <img key={`${url}-${index}`} src={url} alt={`Ảnh ${index + 1}`} />
          ))}
        </div>
      )}
    </Modal>
  );
}

export default GalleryPreviewModal;
