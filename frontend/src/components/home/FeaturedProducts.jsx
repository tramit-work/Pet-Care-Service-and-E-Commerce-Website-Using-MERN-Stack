import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../shared/ProductCard';
import { getProducts } from '../../api/productService';

// Giữ đúng số lượng hiển thị theo thiết kế hiện tại (mock/home.mock.js
// `featuredProducts` trước đây có đúng 10 sản phẩm).
const DISPLAY_LIMIT = 10;

/**
 * Section "SẢN PHẨM MỚI" (.product-home).
 *
 * Step 16.5: KHÔNG còn dùng mock/home.mock.js (`featuredProducts` tĩnh) —
 * lấy trực tiếp từ MongoDB qua GET /api/products (productService.js đã có
 * sẵn, dùng chung với ShoppingPage), sort=newest (createdAt giảm dần,
 * khớp buildProductSort ở product.controller.js), giới hạn đúng
 * DISPLAY_LIMIT sản phẩm — giữ nguyên layout/markup gốc, chỉ đổi nguồn dữ
 * liệu. Bản gốc chỉ có 1 grid duy nhất gộp chung cả pet và product — giữ
 * đúng như vậy, không tách thành 2 section riêng.
 */
function FeaturedProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { items } = await getProducts({ sort: 'newest', limit: DISPLAY_LIMIT });
        if (!cancelled) setProducts(items.slice(0, DISPLAY_LIMIT));
      } catch (err) {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="product-home">
      <h1>SẢN PHẨM MỚI</h1>
      <span className="product-home-subtitle">Những sản phẩm mới nhất dành cho thú cưng của bạn</span>

      {loading ? (
        <p className="product-home-status">Đang tải sản phẩm...</p>
      ) : products.length === 0 ? (
        <p className="product-home-status">Chưa có sản phẩm nào.</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              title={product.name}
              image={product.image}
              alt={product.alt}
              price={product.price}
              isNew={product.isNew}
              isSale={product.isSale}
              rating={product.rating}
              numReviews={product.numReviews}
            />
          ))}
        </div>
      )}

      <button className="btn-all-products" onClick={() => navigate('/shopping')}>
        TẤT CẢ SẢN PHẨM
      </button>
    </section>
  );
}

export default FeaturedProducts;
