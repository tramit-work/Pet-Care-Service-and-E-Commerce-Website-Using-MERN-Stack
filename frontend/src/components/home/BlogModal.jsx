import { useEffect } from 'react';

function BlogModal({ article, onClose }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && article) onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [article, onClose]);

  return (
    <div id="articleModal" className={`modal${article ? '' : ' hidden'}`}>
      {article && (
        <div className="modal-content">
          <span className="close-button" onClick={onClose}>
            &times;
          </span>
          <h2 id="modalTitle">{article.modalTitle}</h2>
          <p id="modalContent" dangerouslySetInnerHTML={{ __html: article.content.join('<br/><br/>') }} />
        </div>
      )}
    </div>
  );
}

export default BlogModal;
