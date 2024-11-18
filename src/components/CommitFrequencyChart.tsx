import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { fetchCommitActivity } from "../services/githubApi";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface CommitFrequencyChartProps {
  token: string | null;
}

const CommitFrequencyChart: React.FC<CommitFrequencyChartProps> = ({
  token,
}) => {
  const [commitActivity, setCommitActivity] = useState<number[]>(
    Array(12).fill(0)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getMonths = () => {
    const now = new Date();
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
    let dynamicMonths = [];
    for (let i = 0; i < 12; i++) {
      dynamicMonths.push(months[(now.getMonth() - i + 12) % 12]);
    }
    return dynamicMonths.reverse();
  };

  const months = getMonths();

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError("No token provided");
        setIsLoading(false);
        return;
      }

      try {
        const data = await fetchCommitActivity(token);
        setCommitActivity(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching commit activity:", error);
        setError("Failed to fetch commit data.");
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

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

  const options = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        suggestedMax: Math.max(...commitActivity) + 1,
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
      y: {
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

  const SkeletonLoader = () => (
    <div className="h-full w-full bg-gray-200 animate-pulse rounded-lg">
      <div className="h-[20px] mb-4 w-1/3 bg-gray-300 rounded"></div>
      <div className="h-[300px] bg-gray-300 rounded"></div>
    </div>
  );

  return (
    <div className="w-full max-w-[600px] mx-auto mt-4 sm:mt-8 p-3 sm:p-6 bg-gray-100 rounded-xl shadow-lg">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-4 text-center">
        Commit Frequency
      </h3>
      <div style={{ height: "400px" }}>
        {isLoading ? (
          <SkeletonLoader />
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : (
          <Bar data={data} options={options as any} />
        )}
      </div>
    </div>
  );
};

export default CommitFrequencyChart;
