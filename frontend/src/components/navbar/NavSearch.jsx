import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function NavSearch() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [open]);

  function goToShoppingWithSearch() {
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/shopping?search=${encodeURIComponent(trimmed)}`);
    setOpen(false);
  }

  return (
    <div className="nav-search-wrapper" ref={wrapperRef}>
      <a
        href="#"
        className="search-icon"
        aria-label="Tìm kiếm"
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          setOpen((prev) => !prev);
        }}
      >
        <i className="bx bx-search-alt-2"></i>
      </a>

      <div id="searchContainer" className={`search-container${open ? ' open' : ''}`}>
        <input
          ref={inputRef}
          type="text"
          id="searchInput"
          placeholder="Tìm kiếm..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') goToShoppingWithSearch();
            if (e.key === 'Escape') setOpen(false);
          }}
        />
        <button
          type="button"
          id="closeSearch"
          aria-label="Đóng tìm kiếm"
          onClick={() => setOpen(false)}
        >
          ✖
        </button>
      </div>
    </div>
  );
}

export default NavSearch;
