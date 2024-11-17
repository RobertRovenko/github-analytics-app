import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

type DonutChartProps = {
  token: string;
};

const DonutChart: React.FC<DonutChartProps> = ({ token }) => {
  const [languageData, setLanguageData] = useState<any>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Responsive resize listener
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchLanguages = async () => {
    try {
      // Fetch the authenticated user's repositories
      const response = await fetch(
        `https://api.github.com/user/repos?per_page=100`,
        {
          headers: {
            Authorization: `token ${token}`,
          },
        }
      );

      const repos = await response.json();
      const languageCount: { [key: string]: number } = {};

      // Fetch languages in parallel for each repository
      await Promise.all(
        repos.map(async (repo: any) => {
          const languagesResponse = await fetch(repo.languages_url, {
            headers: {
              Authorization: `token ${token}`,
            },
          });
          const languages = await languagesResponse.json();
          for (let language in languages) {
            languageCount[language] =
              (languageCount[language] || 0) + languages[language];
          }
        })
      );

      // Sort and limit the languages based on window size
      const sortedLanguages = Object.entries(languageCount)
        .sort(([, a], [, b]) => b - a) // Sort by usage count descending
        .slice(0, windowWidth > 768 ? 10 : 5); // Show fewer languages on smaller screens

      const languageNames = sortedLanguages.map(([name]) => name);
      const languageValues = sortedLanguages.map(([, value]) => value);

      setLanguageData({
        labels: languageNames,
        datasets: [
          {
            data: languageValues,
            backgroundColor: [
              "#ff6384",
              "#36a2eb",
              "#cc65fe",
              "#ffce56",
              "#4caf50",
              "#8bc34a",
            ],
            hoverBackgroundColor: [
              "#ff4f6d",
              "#0095ff",
              "#ab5bff",
              "#ffc400",
              "#42b333",
              "#7ea82f",
            ],
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching language data:", error);
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, [token, windowWidth]);

  // Skeleton loader for the donut chart
  const SkeletonLoader = () => (
    <div className="h-full w-full bg-gray-200 animate-pulse rounded-xl flex items-center justify-center">
      <div className="w-40 h-40 bg-gray-300 rounded-full"></div>
    </div>
  );

  return (
    <div
      className="bg-gray-100 p-8 rounded-xl shadow-xl mt-8"
      style={{ width: "100%", maxWidth: "500px", margin: "0 auto" }}
    >
      {languageData ? (
        <Pie
          data={languageData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            cutout: "50%", // Creates a donut hole in the middle of the chart
            plugins: { tooltip: { enabled: true } },
          }}
          style={{ height: "400px", width: "400px" }} // Adjust size
        />
      ) : (
        <SkeletonLoader />
      )}
    </div>
  );
};

export default DonutChart;
