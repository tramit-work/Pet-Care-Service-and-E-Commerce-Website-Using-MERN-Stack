import DashboardTable from './DashboardTable';
import DashboardEmpty from './DashboardEmpty';

function AdminDataTable({ headers, loading, isEmpty, emptyMessage, skeletonRows = 5, children }) {
  if (loading) {
    return (
      <DashboardTable headers={headers}>
        {Array.from({ length: skeletonRows }).map((_, i) => (
          <tr key={i}>
            {headers.map((h, j) => (
              <td key={j} className="admin-skeleton-cell">
                <div className="skeleton-block" style={{ width: j === 0 ? '80%' : '60%' }}></div>
              </td>
            ))}
          </tr>
        ))}
      </DashboardTable>
    );
  }

  if (isEmpty) {
    return <DashboardEmpty message={emptyMessage || 'Chưa có dữ liệu.'} />;
  }

  return <DashboardTable headers={headers}>{children}</DashboardTable>;
}

export default AdminDataTable;
