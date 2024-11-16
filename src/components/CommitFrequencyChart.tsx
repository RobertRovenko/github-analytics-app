import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface CommitFrequencyChartProps {
  commitActivity: number[];
}

const CommitFrequencyChart: React.FC<CommitFrequencyChartProps> = ({
  commitActivity,
}) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const data = {
    labels: months,
    datasets: [
      {
        label: "Commits",
        data: commitActivity,
        backgroundColor: "rgba(41, 128, 185, 0.7)",
        borderColor: "rgba(41, 128, 185, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        suggestedMin: 0,
        suggestedMax: Math.max(...commitActivity) + 1,
        stepSize: 1,
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.1)",
          borderDash: [5, 5],
        },
        ticks: {
          font: {
            size: 10,
            family: "Poppins, sans-serif",
            weight: "500",
          },
          padding: 5,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 10,
            family: "Poppins, sans-serif",
            weight: "500",
          },
        },
      },
    },
    plugins: {
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        titleFont: {
          size: 12,
          family: "Poppins, sans-serif",
        },
        bodyFont: {
          size: 10,
          family: "Poppins, sans-serif",
        },
      },
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="max-w-[500px] mx-auto mt-8 p-6 bg-gray-100 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
        Commit Frequency
      </h3>
      <div style={{ height: "300px" }}>
        <Bar data={data} options={options as any} />
      </div>
    </div>
  );
};

export default CommitFrequencyChart;
