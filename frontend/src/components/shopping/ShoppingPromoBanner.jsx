import { shoppingPromoBanners } from '../../mock/shopping.mock';

function ShoppingPromoBanner() {
  return (
    <div className="sale-container">
      {shoppingPromoBanners.map((banner) => (
        <div className="frame" key={banner.id}>
          {banner.badge && <span className="promo-badge">{banner.badge}</span>}
          <img src={banner.image} alt={banner.alt} />
        </div>
      ))}
    </div>
  );
}

export default ShoppingPromoBanner;
