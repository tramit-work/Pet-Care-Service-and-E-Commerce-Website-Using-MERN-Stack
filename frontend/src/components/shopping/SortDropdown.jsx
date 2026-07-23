import { sortOptions } from '../../mock/shopping.mock';

function SortDropdown({ value, onChange }) {
  return (
    <div className="sort-options">
      <label htmlFor="sort-select" className="visually-hidden">
        Sắp xếp sản phẩm
      </label>
      <select
        id="sort-select"
        aria-controls="products-grid"
        aria-label="Sắp xếp sản phẩm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {sortOptions.map((option) => (
          <option value={option.value} key={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SortDropdown;
