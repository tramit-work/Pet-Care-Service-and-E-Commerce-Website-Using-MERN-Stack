import Hero from '../components/home/Hero';
import ServicesPreview from '../components/home/ServicesPreview';
import PromotionBanner from '../components/home/PromotionBanner';
import FeaturedProducts from '../components/home/FeaturedProducts';
import BlogPreview from '../components/home/BlogPreview';

function HomePage() {
  return (
    <>
      <Hero />
      <ServicesPreview />
      <PromotionBanner />
      <FeaturedProducts />
      <BlogPreview />
    </>
  );
}

export default HomePage;
