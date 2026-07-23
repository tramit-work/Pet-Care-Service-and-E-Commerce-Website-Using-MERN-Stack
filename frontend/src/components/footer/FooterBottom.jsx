function FooterBottom() {
  const year = new Date().getFullYear();
  return (
    <div className="footer-bottom">
      <p>© {year} Cuc Pet. Đã đăng ký bản quyền.</p>
    </div>
  );
}

export default FooterBottom;
