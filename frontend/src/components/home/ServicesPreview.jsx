import { homeServices } from '../../mock/home.mock';

const ICONS = {
  spa: '/images/highlight/spa.png',
  vaccination: '/images/highlight/vaccination.png',
  healthcare: '/images/highlight/healthcare.png',
  training: '/images/highlight/training.png',
};

function ServicesPreview() {
  return (
    <section className="highlight-section">
      <div className="highlight-grid">
        {homeServices.map((service) => (
          <div className="feature" key={service.id}>
            <div className="icon-container">
              <img
                src={ICONS[service.id]}
                alt={service.title}
                className="service-preview-icon"
              />
            </div>

            <h3 className="feature-title">{service.title}</h3>
            <p className="feature-desc">{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ServicesPreview;