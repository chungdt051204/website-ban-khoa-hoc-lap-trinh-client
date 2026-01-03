import { Line } from "react-chartjs-2";
// Cần phải đăng ký các thành phần cần thiết cho Chart.js v3+
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
// Đăng ký các thành phần
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
// Định nghĩa Options cho biểu đồ (tùy chọn)
const options = {
  responsive: true,
  plugins: {
    title: {
      display: true,
      text: "Biểu đồ Doanh thu Hàng ngày",
    },
  },
};
export default function DailyRevenueChart({ data }) {
  const label = data.map((value) => value._id);
  const total = data.map((value) => value.totalAmount);
  const chartData = {
    labels: label,
    datasets: [
      {
        label: "Tổng doanh thu",
        data: total,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        tension: 0.3,
      },
    ],
  };
  return (
    <>
      <div style={{ width: "80%", margin: "auto" }}>
        <Line options={options} data={chartData} />
      </div>
    </>
  );
}
