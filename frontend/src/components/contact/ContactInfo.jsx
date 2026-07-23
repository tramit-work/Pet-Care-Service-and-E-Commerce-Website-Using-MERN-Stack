import { panelIntro, contactDetails, socialLinks } from '../../mock/contact.mock';

const DETAIL_ICONS = {
  address: <path d="M12 2C8 2 4 4 4 8c0 6 8 14 8 14s8-8 8-14c0-4-4-6-8-6z" />,
  email: <path d="M4 4h16v2H4zm0 4h10v2H4zm0 4h7v2H4z" />,
  phone: <path d="M6.6 10.8l1.4-1.4 4 4-1.4 1.4z" />,
};

const SOCIAL_ICONS = {
  facebook: (
    <path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-3h2.5V9a3.5 3.5 0 0 1 3.5-3.5h3v3h-3a1 1 0 0 0-1 1v2h4l-1 3h-3v7A10 10 0 0 0 22 12z" />
  ),
  twitter: (
    <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.3 4.3 0 0 0 1.88-2.37 8.45 8.45 0 0 1-2.71 1.03 4.27 4.27 0 0 0-7.28 3.89A12.1 12.1 0 0 1 3.1 4.8a4.25 4.25 0 0 0 1.32 5.69A4.27 4.27 0 0 1 2.8 9v.05a4.27 4.27 0 0 0 3.43 4.18 4.27 4.27 0 0 1-1.93.07 4.27 4.27 0 0 0 4 2.97 8.56 8.56 0 0 1-5.3 1.83A8.75 8.75 0 0 1 2 19.54a12.09 12.09 0 0 0 6.56 1.92c7.88 0 12.2-6.53 12.2-12.2v-.56A8.64 8.64 0 0 0 24 5.3a8.4 8.4 0 0 1-2.54.7z" />
  ),
  instagram: (
    <path d="M10.9 2.1c-.3 0-.5.2-.5.5v18.8c0 .3.2.5.5.5h2.2c.3 0 .5-.2.5-.5V2.6c0-.3-.2-.5-.5-.5h-2.2zm-4.6 6.1c-.3 0-.5.2-.5.5v12.2c0 .3.2.5.5.5h2.2c.3 0 .5-.2.5-.5V8.7c0-.3-.2-.5-.5-.5H6.3zm9.2 3c-.3 0-.5.2-.5.5v9.2c0 .3.2.5.5.5h2.2c.3 0 .5-.2.5-.5v-9.2c0-.3-.2-.5-.5-.5h-2.2z" />
  ),
};

function ContactInfo() {
  return (
    <div className="details-panel">
      <div>
        <div className="label-subtitle">{panelIntro.subtitle}</div>
        <h1 className="label-title">{panelIntro.title}</h1>
        <p className="text-description">{panelIntro.description}</p>
      </div>

      <div className="detail-items">
        {contactDetails.map((detail) => (
          <div className="detail-row" key={detail.id}>
            <svg className="icon-small" viewBox="0 0 24 24">
              {DETAIL_ICONS[detail.id]}
            </svg>
            {detail.text}
          </div>
        ))}
      </div>

      <div>
        <div className="label-social">Follow us</div>
        <div className="social-links">
          {socialLinks.map((social) => (
            <a href={social.href} key={social.id}>
              <svg viewBox="0 0 24 24">{SOCIAL_ICONS[social.id]}</svg>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ContactInfo;
