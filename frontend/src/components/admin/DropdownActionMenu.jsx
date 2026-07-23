import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

function DropdownActionMenu({ items }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, openUpward: false });
  const wrapperRef = useRef(null);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  function computePosition() {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const estimatedMenuHeight = items.length * 42 + 12;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < estimatedMenuHeight && rect.top > estimatedMenuHeight;

    setCoords({
      top: openUpward ? rect.top - 6 : rect.bottom + 6,
      left: rect.right,
      openUpward,
    });
  }

  useLayoutEffect(() => {
    if (open) computePosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    function handleClickOutside(e) {
      const clickedTrigger = wrapperRef.current && wrapperRef.current.contains(e.target);
      const clickedMenu = menuRef.current && menuRef.current.contains(e.target);
      if (!clickedTrigger && !clickedMenu) setOpen(false);
    }
    // Đóng khi cuộn (bảng cuộn nội bộ hoặc cuộn cả trang) — đơn giản và an
    // toàn hơn là cố gắng cập nhật vị trí liên tục theo mọi sự kiện cuộn.
    function handleScroll() {
      setOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [open]);

  return (
    <div className="admin-dropdown" ref={wrapperRef}>
      <button
        ref={triggerRef}
        type="button"
        className="admin-btn admin-btn-ghost admin-btn-sm"
        onClick={() => setOpen((v) => !v)}
        aria-label="Mở menu hành động"
      >
        <i className="bx bx-dots-vertical-rounded"></i>
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            className="admin-dropdown-menu admin-dropdown-menu-portal"
            style={{
              top: coords.openUpward ? 'auto' : coords.top,
              bottom: coords.openUpward ? window.innerHeight - coords.top : 'auto',
              right: window.innerWidth - coords.left,
            }}
          >
            {items.map((item, index) => (
              <button
                key={index}
                type="button"
                className={`admin-dropdown-item${item.danger ? ' danger' : ''}`}
                disabled={item.disabled}
                title={item.title}
                onClick={() => {
                  if (item.disabled) return;
                  setOpen(false);
                  item.onClick();
                }}
              >
                <i className={`bx ${item.icon}`}></i>
                <span>{item.label}</span>
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}

export default DropdownActionMenu;
