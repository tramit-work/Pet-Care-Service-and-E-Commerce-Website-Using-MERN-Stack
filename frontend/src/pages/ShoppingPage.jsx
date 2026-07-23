import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ShoppingBanner from '../components/shopping/ShoppingBanner';
import ShoppingPromoBanner from '../components/shopping/ShoppingPromoBanner';
import PromoLine from '../components/shopping/PromoLine';
import CollectionShowcase from '../components/shopping/CollectionShowcase';
import FilterSidebar from '../components/shopping/FilterSidebar';
import SortDropdown from '../components/shopping/SortDropdown';
import ViewToggle from '../components/shopping/ViewToggle';
import ProductGrid from '../components/shopping/ProductGrid';
import Pagination from '../components/shopping/Pagination';
import QuickViewModal from '../components/shopping/QuickViewModal';
import Snackbar from '../components/shopping/Snackbar';
import { getProducts } from '../api/productService';
import { getCategoriesForShopping } from '../api/categoryService';
import { useWishlist } from '../context/WishlistContext';
import { useAddToCartFeedback } from '../utils/useAddToCartFeedback';
import {
  shoppingProducts,
  collectionCards as mockCollectionCards,
  categoryNavList as mockCategoryNavList,
  subcategoryNavList as mockSubcategoryNavList,
  sortOptions,
  PRODUCTS_PER_PAGE,
} from '../mock/shopping.mock';

function ShoppingPage() {
  const navigate = useNavigate();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { handleAddToCart } = useAddToCartFeedback(showSnackbar);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchKeyword = (searchParams.get('search') || '').trim();

  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const [categoryData, setCategoryData] = useState({
    collectionCards: mockCollectionCards,
    categoryNavList: mockCategoryNavList,
    subcategoryNavList: mockSubcategoryNavList,
  });

  const [activeCategory, setActiveCategory] = useState(null);

  const [activeRating, setActiveRating] = useState(null);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('display-3');
  const [currentPage, setCurrentPage] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState(null);

  function showSnackbar(message) {
    setSnackbarMessage(message);
  }

  async function handleToggleWishlist(productId) {
    const result = await toggleWishlist(productId);

    if (!result.success && result.reason === 'unauthenticated') {
      showSnackbar('Vui lòng đăng nhập để thêm vào yêu thích.');
      setTimeout(() => {
        navigate('/login', { state: { from: '/shopping' } });
      }, 1200);
      return;
    }

    if (!result.success) {
      showSnackbar('Có lỗi xảy ra, vui lòng thử lại.');
      return;
    }

    showSnackbar(result.added ? 'Đã thêm vào yêu thích!' : 'Đã bỏ khỏi yêu thích.');
  }

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const { items } = await getProducts();
        if (!cancelled) setProducts(items);
      } catch (err) {
        if (!cancelled) {
          setProducts(shoppingProducts);
          showSnackbar('Không thể tải dữ liệu từ máy chủ — đang hiển thị dữ liệu mẫu.');
        }
      } finally {
        if (!cancelled) setIsLoadingProducts(false);
      }
    }

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const shapes = await getCategoriesForShopping();
        if (!cancelled) setCategoryData(shapes);
      } catch (err) {
      }
    }

    loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activeRating, sortBy, searchKeyword]);

  const searchResults = useMemo(() => {
    if (!searchKeyword) return null;
    const keyword = searchKeyword.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(keyword));
  }, [products, searchKeyword]);

  const { visibleProducts, totalPages, showPagination } = useMemo(() => {
    if (searchResults !== null) {
      return {
        visibleProducts: searchResults.slice(0, PRODUCTS_PER_PAGE),
        totalPages: 1,
        showPagination: false,
      };
    }

    const filtered = products
      .filter((p) => (activeCategory ? p.category === activeCategory : true))
      .filter((p) => (activeRating ? p.rating >= activeRating : true));

    const sorted = [...filtered];
    if (sortBy === 'price-low') {
      sorted.sort((a, b) => a.priceValue - b.priceValue);
    } else if (sortBy === 'price-high') {
      sorted.sort((a, b) => b.priceValue - a.priceValue);
    } else if (sortBy === 'newest') {
      sorted.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    }

    const pages = Math.max(1, Math.ceil(sorted.length / PRODUCTS_PER_PAGE));
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;

    return {
      visibleProducts: sorted.slice(start, start + PRODUCTS_PER_PAGE),
      totalPages: pages,
      showPagination: true,
    };
  }, [products, searchResults, activeCategory, activeRating, sortBy, currentPage]);

  function handleSelectCategory(category) {
    if (searchKeyword) {
      setSearchParams({});
    }
    setActiveCategory(category);
    showSnackbar(`Đã chọn danh mục: ${category}`);
  }

  function handleSelectRating(stars) {
    setActiveRating((prev) => (prev === stars ? null : stars));
    showSnackbar(`Đã lọc từ ${stars} sao trở lên`);
  }

  function handleSortChange(value) {
    setSortBy(value);
    const label = sortOptions.find((o) => o.value === value)?.label || value;
    showSnackbar(`Đã sắp xếp theo: ${label}`);
  }

  function handleClearSearch() {
    setSearchParams({});
  }

  return (
    <>
      <ShoppingBanner />
      <ShoppingPromoBanner />
      <PromoLine onShowSnackbar={showSnackbar} />
      <CollectionShowcase cards={categoryData.collectionCards} onSelectCategory={handleSelectCategory} />

      <div className="content-wrapper site-container" role="main">
        <FilterSidebar
          categoryList={categoryData.categoryNavList}
          subcategoryList={categoryData.subcategoryNavList}
          activeCategory={activeCategory}
          activeRating={activeRating}
          onSelectCategory={handleSelectCategory}
          onSelectRating={handleSelectRating}
          onShowSnackbar={showSnackbar}
        />

        <section className="primary-content" id="shopping-product-grid" aria-label="Khu vực sản phẩm mới">
          <div className="content-header">
            <h1 className="content-title">SẢN PHẨM</h1>
            <div className="view-sort-options" role="region" aria-label="Tùy chọn hiển thị và sắp xếp">
              <span>Hiển thị dạng</span>
              <ViewToggle value={viewMode} onChange={setViewMode} />
              <SortDropdown value={sortBy} onChange={handleSortChange} />
            </div>
          </div>

          {searchKeyword && (
            <p
              style={{
                margin: '0 0 1rem',
                fontSize: '0.95rem',
                color: '#555',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              Kết quả tìm kiếm cho "{searchKeyword}" ({searchResults.length} sản phẩm)
              <button type="button" className="btn-quick-view" onClick={handleClearSearch}>
                Xoá tìm kiếm
              </button>
            </p>
          )}

          {isLoadingProducts ? (
            <p style={{ padding: '2rem 0', color: '#555' }}>Đang tải sản phẩm...</p>
          ) : (
            <>
              <ProductGrid
                products={visibleProducts}
                viewMode={viewMode}
                onQuickView={setQuickViewProduct}
                isInWishlist={isInWishlist}
                onToggleWishlist={handleToggleWishlist}
                onAddToCart={handleAddToCart}
              />

              {showPagination && (
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              )}
            </>
          )}
        </section>
      </div>

      <Snackbar message={snackbarMessage} onHide={() => setSnackbarMessage(null)} />
      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} showSnackbar={showSnackbar} />
    </>
  );
}

export default ShoppingPage;
