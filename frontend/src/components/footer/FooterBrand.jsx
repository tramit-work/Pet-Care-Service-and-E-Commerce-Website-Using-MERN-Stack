import { Link } from 'react-router-dom';
function FooterBrand() {
  return (
    <section aria-labelledby="footer-brand" className="footer-brand">
      <div className="logo-box">
        <Link to="/" aria-label="Trang chủ">
          <img
            src="/images/home/logo-text.png"
            alt="Cuc Pet"
            className="footer-logo"
          />
        </Link>
      </div>

      <p className="footer-brand-slogan">
        Người bạn đồng hành tin cậy cho thú cưng của bạn.
      </p>

      <div className="social-icons" aria-label="Mạng xã hội">
        <a href="#" aria-label="Facebook">
          <img
            src="/images/footer/facebook.png"
            alt="Facebook"
            className="social-icon"
          />
        </a>

        <a href="#" aria-label="TikTok">
          <img
            src="/images/footer/tiktok.png"
            alt="TikTok"
            className="social-icon"
          />
        </a>

        <a href="#" aria-label="YouTube">
          <img
            src="/images/footer/youtube.png"
            alt="YouTube"
            className="social-icon"
          />
        </a>
      </div>
    </section>
  );
}

export default FooterBrand;