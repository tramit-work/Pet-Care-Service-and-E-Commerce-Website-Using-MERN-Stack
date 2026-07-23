import FooterBrand from './FooterBrand';
import FooterNewsletter from './FooterNewsletter';
import FooterContactInfo from './FooterContactInfo';
import FooterLinkList from './FooterLinkList';
import FooterBottom from './FooterBottom';

function Footer() {
  const aboutUsLinks = [
    { label: 'Trang chủ', to: '/' },
    { label: 'Mua sắm', to: '/shopping' },
    { label: 'Dịch vụ', to: '/service' },
    { label: 'Liên hệ', to: '/contact' },
  ];

  const usefulLinks = [
    { label: 'Tuyển dụng' },
    { label: 'Trung tâm hỗ trợ' },
    { label: 'Chính sách hoàn trả' },
    { label: 'Tìm kiếm nâng cao' },
    { label: 'Chính sách bảo mật' },
    { label: 'Điều khoản & điều kiện' },
  ];

  return (
    <footer className="footer-section" role="contentinfo" aria-label="Footer">
      <div className="footer-container">
        <div className="footer-col footer-col-brand">
          <FooterBrand />
        </div>
        <div className="footer-col footer-col-nav">
          <FooterLinkList titleId="about-us" title="Về Chúng Tôi" items={aboutUsLinks} />
        </div>
        <div className="footer-col footer-col-support">
          <FooterLinkList titleId="useful-links" title="Liên Kết Hữu Ích" items={usefulLinks} />
        </div>
        <div className="footer-col footer-col-contact">
          <FooterContactInfo />
          <FooterNewsletter />
        </div>
      </div>
      <FooterBottom />
    </footer>
  );
}

export default Footer;
