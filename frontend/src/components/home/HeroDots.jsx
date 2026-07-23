function HeroDots({ total, activeIndex, onSelect }) {
  return (
    <div className="dots" id="dotsContainer">
      {Array.from({ length: total }).map((_, index) => (
        <div
          key={index}
          className={`dot${index === activeIndex ? ' active' : ''}`}
          role="button"
          aria-label={`Chuyển tới slide ${index + 1}`}
          tabIndex={0}
          onClick={() => onSelect(index)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onSelect(index);
          }}
        />
      ))}
    </div>
  );
}

export default HeroDots;
