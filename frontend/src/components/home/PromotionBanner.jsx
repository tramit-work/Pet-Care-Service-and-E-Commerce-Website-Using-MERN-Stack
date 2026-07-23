import { saleBanners, bigBanner } from '../../mock/home.mock';

function PromotionBanner() {
  return (
    <>
      <div className="sale-container">
        {saleBanners.map((banner) => (
          <div className="frame" key={banner.id}>
            {banner.badge && <span className="promo-badge">{banner.badge}</span>}
            <img src={banner.image} alt={banner.alt} />
          </div>
        ))}
      </div>
      <div className="big-banner">
        <img src={bigBanner.image} alt={bigBanner.alt} />
      </div>
    </>
  );
}

export default PromotionBanner;
