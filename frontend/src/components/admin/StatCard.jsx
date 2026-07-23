function StatCard({ icon, title, value, color }) {
  return (
    <div className="stat-card" style={{ '--stat-color': color }}>
      <div className="stat-card-icon">
        <i className={`bx ${icon}`}></i>
      </div>
      <div className="stat-card-body">
        <p className="stat-card-title">{title}</p>
        <p className="stat-card-value">{value}</p>
      </div>
    </div>
  );
}

export default StatCard;
