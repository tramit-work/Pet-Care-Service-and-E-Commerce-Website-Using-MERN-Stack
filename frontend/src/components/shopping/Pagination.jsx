function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="page-navigation" role="navigation" aria-label="Pagination">
      <button
        className="arrow-btn"
        aria-label="Previous Page"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        &laquo;
      </button>

      {pages.map((page) => (
        <button
          key={page}
          className={`page-btn${page === currentPage ? ' active' : ''}`}
          aria-current={page === currentPage ? 'page' : undefined}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      <button
        className="arrow-btn"
        aria-label="Next Page"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        &raquo;
      </button>
    </nav>
  );
}

export default Pagination;
