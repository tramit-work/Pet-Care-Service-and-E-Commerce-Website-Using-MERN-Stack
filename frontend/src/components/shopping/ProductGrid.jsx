import ProductCard from '../shared/ProductCard';

function ProductGrid({ products, viewMode, onQuickView, isInWishlist, onToggleWishlist, onAddToCart }) {
  const gridClassName = `products-grid${viewMode === 'display-2' ? ' products-grid--list' : ''}`;

  return (
    <section
      className="products-section"
      id="products-grid"
      aria-live="polite"
      aria-atomic="true"
      aria-relevant="additions removals"
    >
      <div className={gridClassName}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            variant="shopping"
            title={product.name}
            image={product.image}
            alt={product.alt}
            price={product.price}
            originalPrice={product.originalPrice}
            isNew={product.isNew}
            isSale={product.isSale}
            rating={product.rating}
            numReviews={product.numReviews}
            onClick={() => onQuickView(product)}
            onQuickView={() => onQuickView(product)}
            isWishlisted={isInWishlist?.(product.id)}
            onToggleWishlist={() => onToggleWishlist?.(product.id)}
            onAddToCart={() => onAddToCart?.(product.id)}
          />
        ))}
      </div>
    </section>
  );
}

export default ProductGrid;
