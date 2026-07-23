import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const STATUS_COLORS = {
  pending: '#f6ad55',
  confirmed: '#4299e1',
  shipping: '#667eea',
  completed: '#48bb78',
  cancelled: '#dc2626',
};

function OrderStatusChart({ data }) {
  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        data: data.map((d) => d.count),
        backgroundColor: data.map((d) => STATUS_COLORS[d.status] || '#ccc'),
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12 } },
    },
  };

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h2>Trạng thái đơn hàng</h2>
      </div>
      <div className="chart-canvas-wrapper" style={{ height: 300 }}>
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
}

export default OrderStatusChart;
