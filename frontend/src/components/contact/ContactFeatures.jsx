import { contactFeatures } from '../../mock/contact.mock';

const ICONS = {
  grooming: '/images/contact-icon/grooming.png',
  veterinary: '/images/contact-icon/veterinary.png',
  daycamp: '/images/contact-icon/daycamp.png',
  training: '/images/contact-icon/training.png',
};

function ContactFeatures() {
  return (
    <main className="info-main">
      <div className="content-grid">
        <div
          className="image-container"
          aria-label="Woman sitting cross-legged holding her French Bulldog dog"
          role="img"
        >
          <div className="organic-shape" aria-hidden="true"></div>

          <img
            src="/images/contact/catanddog.png"
            alt="Happy young woman with French Bulldog"
          />
        </div>

        <div className="features-list" aria-label="List of pet services">
          {contactFeatures.map((feature) => (
            <article className="feature-item" tabIndex={0} key={feature.id}>
              <div className={`feature-icon ${feature.id}`}>
                <img
                  src={ICONS[feature.id]}
                  alt={feature.title}
                  className="contact-feature-icon"
                />
              </div>

              <div className="feature-content">
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

export default ContactFeatures;