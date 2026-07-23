function HeroNavigation({ direction, onClick }) {
  const isPrev = direction === 'prev';

  return (
    <button
      className="nav-arrow"
      aria-label={isPrev ? 'Trang trước' : 'Trang tiếp theo'}
      id={isPrev ? 'prevBtn' : 'nextBtn'}
      onClick={onClick}
    >
      <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <polyline points={isPrev ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} />
      </svg>
    </button>
  );
}

export default HeroNavigation;
