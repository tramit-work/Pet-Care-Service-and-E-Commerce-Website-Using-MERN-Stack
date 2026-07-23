function PromoLine({ onShowSnackbar }) {
  return (
    <section className="promo-line">
      <div className="promo-message">
        NGÀY HỘI SALE - GIẢM GIÁ ĐẾN 40% CÁC PHỤ KIỆN TẠI WEBSITE!
      </div>
      <button
        className="btn-buy-now"
        onClick={() => onShowSnackbar('Đi đến trang mua sắm (chưa triển khai trong demo)')}
      >
        Mua ngay
      </button>
    </section>
  );
}

export default PromoLine;
