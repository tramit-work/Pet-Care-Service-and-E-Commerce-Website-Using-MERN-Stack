import { heroContent } from '../../mock/contact.mock';
function ContactHero() {
  return (
    <section className="contact-section">
      <div className="image-overlay"></div>
      <div className="text-container">
        <h1>{heroContent.title}</h1>
        <p>{heroContent.subtitle}</p>
      </div>
      <div className="wave">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path
            fill="#F3F4F6"
            d="M0 36L48 40.3C96 44.7 192 53.3 288 69.7C384 86 480 110 576 110.7C672 111 768 97 864 88.8C960 80.7 1056 78.3 1152 86.5C1248 94.7 1344 113.3 1392 122.2L1440 131V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V36Z"
          />
        </svg>
      </div>
    </section>
  );
}

export default ContactHero;
