function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton">
      <div className="skeleton-block skeleton-welcome"></div>

      <div className="stat-cards-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div className="skeleton-block skeleton-card" key={i}></div>
        ))}
      </div>

      <div className="dashboard-charts-row">
        <div className="skeleton-block skeleton-chart" style={{ height: 300 }}></div>
        <div className="skeleton-block skeleton-chart" style={{ height: 300 }}></div>
      </div>

      <div className="skeleton-block skeleton-chart" style={{ height: 320 }}></div>

      <div className="skeleton-block skeleton-table"></div>
      <div className="skeleton-block skeleton-table"></div>
      <div className="skeleton-block skeleton-table"></div>
    </div>
  );
}

export default DashboardSkeleton;
