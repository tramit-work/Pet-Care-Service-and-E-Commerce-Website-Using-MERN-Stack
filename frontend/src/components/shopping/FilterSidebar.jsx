import Breadcrumb from './Breadcrumb';
import {
  categoryNavList as mockCategoryNavList,
  subcategoryNavList as mockSubcategoryNavList,
  ratingBlocks,
  brandOptions,
} from '../../mock/shopping.mock';

function FilterSidebar({
  categoryList = mockCategoryNavList,
  subcategoryList = mockSubcategoryNavList,
  activeCategory,
  activeRating,
  onSelectCategory,
  onSelectRating,
  onShowSnackbar,
}) {
  return (
    <aside className="sidebar-nav" aria-label="Danh mục và Bộ lọc">
      <Breadcrumb />

      <section aria-labelledby="categories-title">
        <h2 id="categories-title">Danh mục chính</h2>
        <ul className="category-nav-list" role="list">
          {categoryList.map((item) => (
            <li
              key={item.category}
              className={activeCategory === item.category ? 'active' : undefined}
              aria-current={activeCategory === item.category ? 'true' : undefined}
              onClick={() => onSelectCategory(item.category)}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="subcategory-title">
        <ul
          className="subcategory-nav-list"
          role="list"
          id="subcategory-title"
          aria-label="Danh mục phụ"
        >
          {subcategoryList.map((item) => (
            <li key={item.category} className={activeCategory === item.category ? 'active' : undefined}>
              <a
                href="#"
                aria-current={activeCategory === item.category ? 'page' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  onSelectCategory(item.category);
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="rating-group" aria-labelledby="rating-title">
        <h2 id="rating-title" style={{ fontWeight: 700 }}>
          Đánh giá
        </h2>
        {ratingBlocks.map((block) => (
          <div
            className={`star-rating-block${activeRating === block.stars ? ' active' : ''}`}
            aria-label={`${block.stars} trên 5 sao`}
            role="button"
            tabIndex={0}
            key={block.stars}
            onClick={() => onSelectRating(block.stars)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onSelectRating(block.stars);
            }}
          >
            <span aria-hidden="true" className={block.stars === 4 ? 'active-stars' : undefined}>
              {block.display}
            </span>
            <span className="rating-count">({block.count})</span>
          </div>
        ))}
      </section>

      <div className="highlight-bar" aria-hidden="true"></div>

      <section className="filter-panel" aria-labelledby="filter-by-title">
        <h2 id="filter-by-title">Lọc theo</h2>
        <label htmlFor="brand-select" className="filter-option-label">
          Thương hiệu
        </label>
        <select
          id="brand-select"
          name="brand"
          aria-controls="products-grid"
          aria-label="Lọc sản phẩm theo thương hiệu"
          onChange={(e) => {
            const selected = brandOptions.find((b) => b.value === e.target.value);
            onShowSnackbar(
              `Filter by brand: ${selected?.value || 'Any Brand'} (filter not implemented in demo)`
            );
          }}
        >
          {brandOptions.map((option) => (
            <option value={option.value} key={option.value || 'all'}>
              {option.label}
            </option>
          ))}
        </select>
      </section>
    </aside>
  );
}

export default FilterSidebar;
