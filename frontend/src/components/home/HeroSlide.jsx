import HeroDots from './HeroDots';

function HeroSlide({ slide, fading, flashIn, total, activeIndex, onSelectDot, onShopClick }) {
  return (
    <>
      <section className="text-content" id="promoText" style={{ opacity: fading ? 0 : 1 }}>
        {slide.badge && <span className="hero-badge">{slide.badge}</span>}
        <h1 id="titleText" dangerouslySetInnerHTML={{ __html: slide.title }} />
        <h2 id="subtitleText">{slide.subtitle}</h2>
        <p id="discountText">{slide.discount}</p>
        <button className="btn-shop" id="shopBtn" onClick={onShopClick}>
          MUA NGAY
        </button>
        <HeroDots total={total} activeIndex={activeIndex} onSelect={onSelectDot} />
      </section>

      <section className="circle-bg" aria-label="Hình ảnh thú cưng">
        <img
          src={slide.image}
          alt={slide.alt}
          className={`dog-image${flashIn ? ' flash-in' : ''}`}
          id="dogImage"
          style={{ opacity: fading ? 0 : 1 }}
        />
      </section>
    </>
  );
}

export default HeroSlide;
