import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Filler } from 'chart.js';
import { formatPrice } from '../../utils/formatPrice';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Filler);

const TABS = [
  { key: 'days7', label: '7 ngày' },
  { key: 'days30', label: '30 ngày' },
  { key: 'months12', label: '12 tháng' },
];

function RevenueChart({ data, todayRevenue, weekRevenue, monthRevenue }) {
  const [activeTab, setActiveTab] = useState('days7');
  const series = data[activeTab] || [];

  const chartData = {
    labels: series.map((s) => s.label),
    datasets: [
      {
        label: 'Doanh thu',
        data: series.map((s) => s.value),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.08)',
        tension: 0.35,
        fill: true,
        pointRadius: series.length > 20 ? 0 : 3,
        pointBackgroundColor: '#2563eb',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${formatPrice(ctx.parsed.y)}đ`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (val) => formatPrice(val) },
      },
    },
  };

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h2>Doanh thu</h2>
        <div className="chart-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`chart-tab${activeTab === tab.key ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="revenue-mini-stats">
        <span>
          Hôm nay <strong>{formatPrice(todayRevenue)}đ</strong>
        </span>
        <span>
          Tuần này <strong>{formatPrice(weekRevenue)}đ</strong>
        </span>
        <span>
          Tháng này <strong>{formatPrice(monthRevenue)}đ</strong>
        </span>
      </div>
      <div className="chart-canvas-wrapper" style={{ height: 300 }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

export default RevenueChart;
