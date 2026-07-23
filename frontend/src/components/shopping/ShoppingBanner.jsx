function ShoppingBanner() {
  return (
    <section className="shopping-banner site-container">
      <div className="shopping-image">
        <img src="/images/shopping/banner.png" alt="Pet Image" />
      </div>
      <div className="shopping-text">
        <span className="hero-badge">Hot</span>
        <h1>
          GẶP GỠ NHỮNG NGƯỜI
          <br />
          BẠN 4 CHÂN MỚI!
        </h1>
        <p className="shopping-banner-desc">
          Hàng ngàn sản phẩm chăm sóc thú cưng chất lượng, giá tốt mỗi ngày.
        </p>
        <a href="#shopping-product-grid" className="btn-shop">
          Khám phá ngay
        </a>
      </div>
    </section>
  );
}

export default ShoppingBanner;
