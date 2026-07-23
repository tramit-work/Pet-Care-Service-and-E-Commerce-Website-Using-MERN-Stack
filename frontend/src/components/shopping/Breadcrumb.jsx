function Breadcrumb() {
  return (
    <>
      <nav className="nav-breadcrumb" aria-label="Đường dẫn điều hướng">
        SẢN PHẨM <span aria-hidden="true">•</span> CỬA HÀNG <span aria-hidden="true">•</span>
      </nav>
      <div className="highlight-bar" aria-hidden="true"></div>
    </>
  );
}

export default Breadcrumb;
