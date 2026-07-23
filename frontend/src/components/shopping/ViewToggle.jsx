const VIEW_MODES = ['display-1', 'display-2', 'display-3'];

function ViewToggle({ value, onChange }) {
  return (
    <div className="view-toggle-buttons" role="group" aria-label="Chọn kiểu hiển thị">
      {VIEW_MODES.map((mode, index) => (
        <button
          key={mode}
          id={mode}
          className={value === mode ? 'active' : undefined}
          aria-pressed={value === mode}
          title={`Kiểu hiển thị ${index + 1}`}
          aria-describedby="display-label"
          onClick={() => onChange(mode)}
        >
          {index === 0 && (
            <svg width="14" height="14" fill="none" stroke="currentColor" aria-hidden="true" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
          )}
          {index === 1 && (
            <svg width="14" height="14" fill="none" stroke="currentColor" aria-hidden="true" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="6" rx="1" />
              <rect x="3" y="12" width="18" height="6" rx="1" />
            </svg>
          )}
          {index === 2 && (
            <svg width="14" height="14" fill="none" stroke="currentColor" aria-hidden="true" viewBox="0 0 24 24">
              <rect x="3" y="3" width="6" height="18" rx="1" />
              <rect x="12" y="3" width="9" height="6" rx="1" />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
}

export default ViewToggle;
