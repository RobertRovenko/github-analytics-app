import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

type DonutChartProps = {
  username: string;
};

const DonutChart: React.FC<DonutChartProps> = ({ username }) => {
  const [languageData, setLanguageData] = useState<any>(null);

  const fetchLanguages = async () => {
    try {
      const response = await fetch(
        `https://api.github.com/users/${username}/repos?per_page=100`
      );
      const repos = await response.json();

      const languageCount: { [key: string]: number } = {};

      for (let repo of repos) {
        const languagesResponse = await fetch(repo.languages_url);
        const languages = await languagesResponse.json();

        for (let language in languages) {
          if (languageCount[language]) {
            languageCount[language] += languages[language];
          } else {
            languageCount[language] = languages[language];
          }
        }
      }

      const languageNames = Object.keys(languageCount);
      const languageValues = Object.values(languageCount);

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
  }, [username]);

  return (
    <div className="bg-gray-100 p-8 rounded-xl shadow-xl mt-8">
      <h3 className="text-2xl font-semibold text-gray-800 text-center mb-6">
        Programming Languages Used
      </h3>
      {languageData ? (
        <Pie
          data={languageData}
          options={{ plugins: { tooltip: { enabled: true } } }}
        />
      ) : (
        <p className="text-center text-gray-600">Loading language data...</p>
      )}
    </div>
  );
};

export default DonutChart;
