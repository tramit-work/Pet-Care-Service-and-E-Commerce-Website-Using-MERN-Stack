function AdminToolbar({ searchValue, onSearchChange, searchPlaceholder = 'Tìm kiếm...', filters, actions }) {
  return (
    <div className="admin-toolbar">
      <div className="admin-toolbar-left">
        <div className="admin-toolbar-search">
          <i className="bx bx-search"></i>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        {filters && <div className="admin-toolbar-filters">{filters}</div>}
      </div>
      {actions && <div className="admin-toolbar-actions">{actions}</div>}
    </div>
  );
}

export default AdminToolbar;
