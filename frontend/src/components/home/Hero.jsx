import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroNavigation from './HeroNavigation';
import HeroSlide from './HeroSlide';
import { heroSlides } from '../../mock/home.mock';

const AUTO_INTERVAL_MS = 4000;
const FADE_DURATION_MS = 400;
const FLASH_DURATION_MS = 500;

function Hero() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [flashIn, setFlashIn] = useState(false);

  const currentIndexRef = useRef(0);
  const intervalRef = useRef(null);
  const timeoutRefsRef = useRef([]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  function clearPendingTimeouts() {
    timeoutRefsRef.current.forEach(clearTimeout);
    timeoutRefsRef.current = [];
  }

  function goToSlide(index) {
    setFading(true);
    clearPendingTimeouts();

    const fadeTimeout = setTimeout(() => {
      setCurrentIndex(index);
      setFading(false);
      setFlashIn(true);

      const flashTimeout = setTimeout(() => setFlashIn(false), FLASH_DURATION_MS);
      timeoutRefsRef.current.push(flashTimeout);
    }, FADE_DURATION_MS);

    timeoutRefsRef.current.push(fadeTimeout);
  }

  function startAutoRotate() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const next = (currentIndexRef.current + 1) % heroSlides.length;
      goToSlide(next);
    }, AUTO_INTERVAL_MS);
  }

  useEffect(() => {
    startAutoRotate();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearPendingTimeouts();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleManualNavigate(index) {
    goToSlide(index);
    startAutoRotate();
  }

  function handlePrev() {
    const prevIndex = (currentIndexRef.current - 1 + heroSlides.length) % heroSlides.length;
    handleManualNavigate(prevIndex);
  }

  function handleNext() {
    const nextIndex = (currentIndexRef.current + 1) % heroSlides.length;
    handleManualNavigate(nextIndex);
  }

  function handleShopClick() {
    // Khắc phục bug gốc: script.js gọi encodeURIComponent(query) với `query`
    // chưa từng được khai báo trong scope đó (ReferenceError khi bấm nút).
    // Ý định ban đầu chỉ là điều hướng sang trang mua sắm.
    navigate('/shopping');
  }

  return (
    <main className="container" role="main">
      <HeroNavigation direction="prev" onClick={handlePrev} />
      <HeroSlide
        slide={heroSlides[currentIndex]}
        fading={fading}
        flashIn={flashIn}
        total={heroSlides.length}
        activeIndex={currentIndex}
        onSelectDot={handleManualNavigate}
        onShopClick={handleShopClick}
      />
      <HeroNavigation direction="next" onClick={handleNext} />
    </main>
  );
}

export default Hero;
