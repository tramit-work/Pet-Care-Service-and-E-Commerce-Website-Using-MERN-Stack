import { useState } from 'react';

import spaIcon from '/images/card-service/spa.png';
import vaccinationIcon from '/images/card-service/vaccination.png';
import checkupIcon from '/images/card-service/calendar.png';
import transportIcon from '/images/card-service/shipping.png';
import trainingIcon from '/images/card-service/training.png';

const ICONS = {
  spa: spaIcon,
  vaccination: vaccinationIcon,
  checkup: checkupIcon,
  transport: transportIcon,
  training: trainingIcon,
};

const FLASH_DURATION_MS = 150;

function ServiceFeatureCard({ id, title, description, onBook, isBooked }) {
  const [isFlashing, setIsFlashing] = useState(false);

  function handleCardClick() {
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), FLASH_DURATION_MS);
  }

  return (
    <section
      className="feature-card"
      onClick={handleCardClick}
      style={
        isFlashing
          ? {
              transition: 'box-shadow 0.1s ease',
              boxShadow: '0 0 0 4px #000 inset',
            }
          : {
              transition: 'box-shadow 0.3s ease',
            }
      }
    >
      {isBooked && (
        <span className="service-booked-badge">
          <i className="bx bx-check-circle"></i>
          Đã đặt lịch
        </span>
      )}

      <div className="icon-container">
        <img
          src={ICONS[id]}
          alt={title}
          className="service-icon"
        />
      </div>

      <h3 className="feature-title">{title}</h3>

      <p className="feature-desc">{description}</p>

      <button
        className={`open-booking-btn${isBooked ? ' booked' : ''}`}
        onClick={() => onBook(title)}
        disabled={isBooked}
      >
        {isBooked ? 'Đã đặt lịch' : 'ĐẶT LỊCH NGAY'}
      </button>
    </section>
  );
}

export default ServiceFeatureCard;