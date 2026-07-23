import { useState } from 'react';

function StarRating({ value = 0, size = 16, interactive = false, onChange }) {
  const [hoverValue, setHoverValue] = useState(0);

  if (interactive) {
    const shown = hoverValue || value;
    return (
      <div className="star-rating star-rating-interactive" role="radiogroup" aria-label="Chọn số sao">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star-rating-btn${star <= shown ? ' filled' : ''}`}
            style={{ fontSize: size }}
            onMouseEnter={() => setHoverValue(star)}
            onMouseLeave={() => setHoverValue(0)}
            onClick={() => onChange?.(star)}
            aria-label={`${star} sao`}
          >
            ★
          </button>
        ))}
      </div>
    );
  }

  return (
    <span className="star-rating" style={{ fontSize: size }} aria-label={`${value.toFixed(1)} trên 5 sao`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const fillPercent = Math.max(0, Math.min(1, value - (star - 1))) * 100;
        return (
          <span className="star-rating-item" key={star}>
            <span className="star-rating-base">★</span>
            <span className="star-rating-fill" style={{ width: `${fillPercent}%` }}>
              ★
            </span>
          </span>
        );
      })}
    </span>
  );
}

export default StarRating;
