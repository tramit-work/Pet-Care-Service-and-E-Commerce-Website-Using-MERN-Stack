import { useState } from 'react';
import ContactHero from '../components/contact/ContactHero';
import ContactFeatures from '../components/contact/ContactFeatures';
import ContactInfo from '../components/contact/ContactInfo';
import ContactForm from '../components/contact/ContactForm';
import { contactDetails } from '../mock/contact.mock';

const EMPTY_FORM = { name: '', email: '', message: '' };

const ADDRESS = contactDetails.find((d) => d.id === 'address')?.text || '';
const MAPS_EMBED_SRC = `https://maps.google.com/maps?q=${encodeURIComponent(ADDRESS)}&output=embed`;
const MAPS_VIEW_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`;

function ContactPage() {
  const [values, setValues] = useState(EMPTY_FORM);

  function handleChange(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    alert('Cảm ơn bạn đã liên hệ, chúng tôi sẽ phản hồi sớm nhất!');
    setValues(EMPTY_FORM);
  }

  return (
    <>
      <ContactHero />
      <ContactFeatures />

      {}
      <section className="contact-info-map-row site-container">
        <div className="contact-info-col">
          <ContactInfo />
        </div>

        <div className="contact-map-col">
          <div className="contact-map-card">
            <iframe
              className="contact-map-iframe"
              src={MAPS_EMBED_SRC}
              title="Bản đồ Cuc Pet trên Google Maps"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <a
            className="contact-map-button"
            href={MAPS_VIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Xem trên Google Maps
          </a>
        </div>
      </section>

      {}
      <section className="contact-form-section site-container">
        <ContactForm values={values} onChange={handleChange} onSubmit={handleSubmit} />
      </section>
    </>
  );
}

export default ContactPage;
