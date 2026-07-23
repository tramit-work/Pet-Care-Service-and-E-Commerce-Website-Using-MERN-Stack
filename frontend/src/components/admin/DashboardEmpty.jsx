function DashboardEmpty({ message = 'Chưa có dữ liệu.' }) {
  return (
    <div className="dashboard-empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 8l2.5-4h13L21 8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 8h18v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12h6" strokeLinecap="round" />
      </svg>
      <p>{message}</p>
    </div>
  );
}

export default DashboardEmpty;
