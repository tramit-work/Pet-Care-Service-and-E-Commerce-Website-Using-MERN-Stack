function AdminPageHeader({ title, description, actions }) {
  return (
    <div className="admin-page-header">
      <div className="admin-page-header-titles">
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="admin-page-header-actions">{actions}</div>}
    </div>
  );
}

export default AdminPageHeader;
