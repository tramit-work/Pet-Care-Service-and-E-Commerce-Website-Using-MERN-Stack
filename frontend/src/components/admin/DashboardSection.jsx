function DashboardSection({ title, action, children }) {
  return (
    <section className="dashboard-section">
      <div className="dashboard-section-header">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export default DashboardSection;
