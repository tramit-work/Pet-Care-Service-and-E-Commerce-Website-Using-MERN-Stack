import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

function OrderVolumeChart({ data }) {
  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        label: 'Số đơn',
        data: data.map((d) => d.value),
        backgroundColor: '#2563eb',
        borderRadius: 6,
        maxBarThickness: 28,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } },
    },
  };

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h2>Đơn hàng theo tháng</h2>
      </div>
      <div className="chart-canvas-wrapper" style={{ height: 320 }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

export default OrderVolumeChart;
