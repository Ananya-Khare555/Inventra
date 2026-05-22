import { useEffect, useState } from "react";
import { getDashboard } from "../api/api";
import "./Dashboard.css";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = ({ setPage }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    getDashboard().then(setData);
  }, []);

  if (!data) return <h2>Loading...</h2>;

  const cards = [
    {
      title: "Assets in Stock",
      value: data.available_assets,
      gradient: "linear-gradient(135deg, #1d4ed8 0%, #60a5fa 100%)",
    },
    {
      title: "Assets Assigned",
      value: data.assigned_assets,
      gradient: "linear-gradient(135deg, #7c3aed 0%, #c084fc 100%)",
    },
    {
      title: "Total Assets",
      value: data.total_assets,
      gradient: "linear-gradient(135deg, #059669 0%, #34d399 100%)",
    },
  ];

  // Dummy chart data (do not connect backend yet)
  const assignedOverTime = {
    labels:
      data.assigned_over_time?.map((d) =>
        new Date(d.date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        })
      ) || [],

    datasets: [
      {
        label: "Assigned Assets",
        data: data.assigned_over_time?.map((d) => Number(d.count)) || [],
        borderColor: "rgba(99, 102, 241, 1)",
        backgroundColor: "rgba(99, 102, 241, 0.18)",
        pointBackgroundColor: "rgba(59, 130, 246, 1)",
        pointBorderColor: "#fff",
        pointRadius: 4,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const lowStockAssets = {
    labels: ["Mouse", "Keyboard", "Headset", "Laptop Stand", "Adapter"],
    datasets: [
      {
        label: "Low Stock",
        data: data.low_stock?.map((d) => Number(d.count)) || [],
        backgroundColor: [
          "rgba(59, 130, 246, 0.75)",
          "rgba(99, 102, 241, 0.75)",
          "rgba(139, 92, 246, 0.75)",
          "rgba(37, 99, 235, 0.75)",
          "rgba(147, 51, 234, 0.75)",
        ],
        borderRadius: 10,
        barThickness: 18,
      },
    ],
  };

  const inStockAssets = {
    labels: ["Mouse", "Keyboard", "Headset", "Laptop", "Monitor"],
    datasets: [
      {
        label: "In-stock",
        data: data.in_stock_assets?.map((d) => Number(d.count)) || [],
        backgroundColor: "rgba(59, 130, 246, 0.75)",
        hoverBackgroundColor: "rgba(99, 102, 241, 0.85)",
        borderRadius: 10,
        maxBarThickness: 38,
      },
    ],
  };

  const assignedByType = {
    labels: data.assigned_by_type?.map((d) => d.asset_type) || [],
    datasets: [
      {
        label: "Assigned Assets",
        data: data.assigned_by_type?.map((d) => Number(d.count)) || [],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(99, 102, 241, 0.8)",
          "rgba(139, 92, 246, 0.8)",
          "rgba(168, 85, 247, 0.8)",
          "rgba(59, 130, 246, 0.6)",
        ],
        borderWidth: 0,
      },
    ],
  };

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#334155",
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.92)",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 10,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(148, 163, 184, 0.25)" },
        ticks: { color: "#475569" },
      },
      y: {
        grid: { color: "rgba(148, 163, 184, 0.25)" },
        ticks: { color: "#475569" },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      ...baseOptions.plugins,
      legend: {
        position: "bottom",
        labels: {
          ...baseOptions.plugins.legend.labels,
          padding: 16,
        },
      },
    },
    layout: {
      padding: {
        top: 8,
        right: 8,
        bottom: 0,
        left: 8,
      },
    },
  };

  return (
    <div className="page">
      <h2 className="page-title">Dashboard</h2>

      <div className="dashboard-stat-grid">
        {cards.map((c) => (
          <div
            key={c.title}
            className="dashboard-stat-card"
            style={{
              borderRadius: 14,
              padding: 16,
              color: "#fff",
              background: c.gradient,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              minHeight: 110,
            }}
          >
            <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1 }}>
              {c.value}
            </div>
            <div style={{ fontSize: 13, opacity: 0.92, fontWeight: 600 }}>
              {c.title}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button type="button" onClick={() => setPage?.("assign")}>
          + Assign Asset
        </button>
      </div>

      <div className="dashboard-charts-grid">
        <div
          style={{
            borderRadius: 14,
            border: "1px solid #d7dbe2",
            background: "#fff",
            boxShadow: "0 8px 18px rgba(15, 23, 42, 0.08)",
            padding: 14,
            minHeight: 330,
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 10, color: "#1f2a44" }}>
            Assigned Assets over time
          </div>
          <div style={{ height: 270 }}>
            <Line data={assignedOverTime} options={baseOptions} />
          </div>
        </div>

        <div
          style={{
            borderRadius: 14,
            border: "1px solid #d7dbe2",
            background: "#fff",
            boxShadow: "0 8px 18px rgba(15, 23, 42, 0.08)",
            padding: 14,
            minHeight: 330,
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 10, color: "#1f2a44" }}>
            Low stock assets
          </div>
          <div style={{ height: 270 }}>
            <Bar
              data={lowStockAssets}
              options={{
                ...baseOptions,
                indexAxis: "y",
                plugins: {
                  ...baseOptions.plugins,
                  legend: { display: false },
                },
              }}
            />
          </div>
        </div>

        <div
          style={{
            gridColumn: "1 / -1",
            borderRadius: 14,
            border: "1px solid #d7dbe2",
            background: "#fff",
            boxShadow: "0 8px 18px rgba(15, 23, 42, 0.08)",
            padding: 14,
            minHeight: 330,
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 10, color: "#1f2a44" }}>
            In-stock assets
          </div>
          <div style={{ height: 270 }}>
            <Bar
              data={inStockAssets}
              options={{
                ...baseOptions,
                plugins: {
                  ...baseOptions.plugins,
                  legend: { display: false },
                },
              }}
            />
          </div>
        </div>

        <div className="dashboard-pie-card">
          <div className="dashboard-pie-title">
            Assigned Assets by Type
          </div>
          <div className="dashboard-pie-content">
            <div className="dashboard-pie-chart-wrap">
              <Pie data={assignedByType} options={pieOptions} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;