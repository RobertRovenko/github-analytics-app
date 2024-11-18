import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { fetchLanguages } from "../services/githubApi";

ChartJS.register(ArcElement, Tooltip, Legend);

type DonutChartProps = {
  token: string;
};

const DonutChart: React.FC<DonutChartProps> = ({ token }) => {
  const [languageData, setLanguageData] = useState<any>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchLanguages(token, windowWidth);
        setLanguageData(data);
      } catch (error) {
        console.error("Error fetching language data:", error);
      }
    };

    fetchData();
  }, [token, windowWidth]);

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
            cutout: "50%",
            plugins: { tooltip: { enabled: true } },
          }}
          style={{ height: "400px", width: "400px" }}
        />
      ) : (
        <SkeletonLoader />
      )}
    </div>
  );
};

export default DonutChart;
