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

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface Repo {
  name: string;
  owner: {
    login: string;
  };
}

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

  // Dynamically calculate the months array based on the current month
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
    return dynamicMonths.reverse(); // Reverse to make the current month last
  };

  const months = getMonths();

  const fetchCommitActivity = async () => {
    const commitCounts = Array(12).fill(0);
    const now = new Date();
    const oneYearAgo = new Date(
      now.getFullYear() - 1,
      now.getMonth() + 1, // Set to start of last year's current month
      1
    );

    if (!token) {
      setError("No token provided");
      setIsLoading(false);
      return;
    }

    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };

      // Fetch user's repositories
      const reposResponse = await fetch(
        `https://api.github.com/user/repos?per_page=100`,
        { headers }
      );

      if (!reposResponse.ok) {
        throw new Error(
          `Failed to fetch repositories: ${reposResponse.status}`
        );
      }

      const repos: Repo[] = await reposResponse.json();

      if (repos.length === 0) {
        setError(`User has no active repositories.`);
        setIsLoading(false);
        return;
      }

      // Function to handle pagination for commits
      const fetchAllCommits = async (repo: Repo) => {
        let allCommits: any[] = [];
        let page = 1;
        let commits: any[];

        do {
          const commitsResponse = await fetch(
            `https://api.github.com/repos/${repo.owner.login}/${repo.name}/commits?since=${oneYearAgo.toISOString()}&page=${page}&per_page=100`,
            { headers }
          );
          if (!commitsResponse.ok) return [];

          commits = await commitsResponse.json();
          allCommits = [...allCommits, ...commits];
          page++;
        } while (commits.length > 0);

        return allCommits;
      };

      const commitPromises = repos.map(fetchAllCommits);
      const allCommits = await Promise.all(commitPromises);

      // Filter and count commits from the last 12 months
      allCommits.flat().forEach((commit) => {
        const commitDate = new Date(commit.commit.author.date);
        if (commitDate >= oneYearAgo) {
          const monthsSinceOneYearAgo =
            (now.getFullYear() - commitDate.getFullYear()) * 12 +
            now.getMonth() -
            commitDate.getMonth();
          if (monthsSinceOneYearAgo >= 0 && monthsSinceOneYearAgo < 12) {
            commitCounts[11 - monthsSinceOneYearAgo] += 1;
          }
        }
      });

      setCommitActivity(commitCounts);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching commit activity:", error);
      setError("Failed to fetch commit data.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommitActivity();
  }, [token]);

  const data = {
    labels: months, // Use the dynamic months array
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
