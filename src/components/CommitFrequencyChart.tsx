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

  const fetchCommitActivity = async () => {
    const commitCounts = Array(12).fill(0);
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1); // Start of the current year

    if (!token) {
      setError("No token provided");
      setIsLoading(false);
      return;
    }

    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };

      // Fetch user's repositories in parallel
      const reposResponse = await fetch(
        `https://api.github.com/user/repos?per_page=100`,
        { headers }
      );

      if (!reposResponse.ok) {
        throw new Error(
          `Failed to fetch repositories: ${reposResponse.status}`
        );
      }

      const repos: Repo[] = await reposResponse.json(); // Type the repos response

      if (repos.length === 0) {
        setError(`User has no repositories.`);
        setIsLoading(false);
        return;
      }

      // Function to handle pagination for commits
      const fetchAllCommits = async (repo: Repo) => {
        let allCommits: any[] = [];
        let page = 1;
        let commits: any[];

        // Keep fetching commits until no more pages
        do {
          const commitsResponse = await fetch(
            `https://api.github.com/repos/${repo.owner.login}/${repo.name}/commits?since=${startOfYear.toISOString()}&page=${page}&per_page=100`,
            { headers }
          );
          if (!commitsResponse.ok) return [];

          commits = await commitsResponse.json();
          allCommits = [...allCommits, ...commits];
          page++;
        } while (commits.length > 0);

        return allCommits;
      };

      // Fetch commits for all repositories in parallel with pagination
      const commitPromises = repos.map(async (repo: Repo) => {
        return fetchAllCommits(repo);
      });

      // Wait for all commit data to be fetched
      const allCommits = await Promise.all(commitPromises);

      // Count commits by month (last year)
      allCommits.forEach((commits) => {
        commits.forEach((commit: any) => {
          const commitDate = new Date(commit.commit.author.date);
          const commitMonth = commitDate.getMonth(); // Get the month (0-11)
          if (commitDate >= startOfYear) {
            commitCounts[commitMonth] += 1;
          }
        });
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

  const currentMonthIndex = new Date().getMonth();
  const rotatedMonths = [
    ...months.slice(currentMonthIndex + 1),
    ...months.slice(0, currentMonthIndex + 1),
  ];

  const rotatedCommitActivity = [
    ...commitActivity.slice(currentMonthIndex + 1),
    ...commitActivity.slice(0, currentMonthIndex + 1),
  ];

  const data = {
    labels: rotatedMonths,
    datasets: [
      {
        label: "Commits",
        data: rotatedCommitActivity,
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

  // Skeleton loader
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
