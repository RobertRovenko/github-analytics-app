import React, { useEffect, useState } from "react";
import { fetchUserData } from "../services/githubApi";
import { GitHubUser } from "../types";
import { useNavigate } from "react-router-dom";
import CommitFrequencyChart from "../components/CommitFrequencyChart";
import DonutChart from "../components/DonutChart";

const Dashboard = () => {
  const [userData, setUserData] = useState<GitHubUser | null>(null);
  const [commitActivity, setCommitActivity] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("githubToken");
    const username = sessionStorage.getItem("githubUsername");

    if (!token && !username) {
      navigate("/login");
      return;
    }

    const getUserData = async () => {
      try {
        setLoading(true);
        const data = await fetchUserData();
        setUserData(data);

        if (username) {
          const commitData = await fetchCommitActivity(username);
          setCommitActivity(commitData);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error loading user data:", error);
        setError("Failed to load user data.");
        setLoading(false);
      }
    };

    getUserData();
  }, [navigate]);

  const fetchCommitActivity = async (username: string): Promise<number[]> => {
    try {
      const response = await fetch(
        `https://api.github.com/users/${username}/events`
      );
      const events = await response.json();

      const commitCounts = Array(12).fill(0);
      const currentDate = new Date();

      events.forEach((event: any) => {
        if (event.type === "PushEvent") {
          const commitDate = new Date(event.created_at);
          const monthDiff =
            (currentDate.getFullYear() - commitDate.getFullYear()) * 12 +
            currentDate.getMonth() -
            commitDate.getMonth();
          if (monthDiff >= 0 && monthDiff < 12) {
            commitCounts[monthDiff] += event.payload.commits.length;
          }
        }
      });

      return commitCounts.reverse();
    } catch (error) {
      console.error("Error fetching commit activity:", error);
      throw new Error("Failed to fetch commit activity.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg font-semibold text-gray-700">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg font-semibold text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#041e42] min-h-screen p-8">
      <div className="w-full max-w-7xl mx-auto bg-white p-8 rounded-2xl shadow-2xl">
        {userData ? (
          <div>
            <div className="flex justify-center mb-4">
              <img
                src={userData.avatar_url}
                alt="Profile Picture"
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
              />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Welcome, {userData.name}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="p-6 bg-gray-50 rounded-lg shadow-lg hover:shadow-2xl transition duration-300 ease-in-out">
                <p className="text-gray-700 font-medium">Username:</p>
                <p className="text-gray-900 font-semibold">{userData.login}</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg shadow-lg hover:shadow-2xl transition duration-300 ease-in-out">
                <p className="text-gray-700 font-medium">Public Repos:</p>
                <p className="text-gray-900 font-semibold">
                  {userData.public_repos}
                </p>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg shadow-lg hover:shadow-2xl transition duration-300 ease-in-out">
                <p className="text-gray-700 font-medium">Followers:</p>
                <p className="text-gray-900 font-semibold">
                  {userData.followers}
                </p>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg shadow-lg hover:shadow-2xl transition duration-300 ease-in-out">
                <p className="text-gray-700 font-medium">Following:</p>
                <p className="text-gray-900 font-semibold">
                  {userData.following}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-100 p-8 rounded-xl shadow-xl">
                <h3 className="text-2xl font-semibold text-gray-800 text-center mb-6">
                  Commit Frequency per Month
                </h3>
                <CommitFrequencyChart commitActivity={commitActivity} />
              </div>

              <div className="bg-gray-100 p-8 rounded-xl shadow-xl">
                <DonutChart username={userData.login} />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-600">No user data found.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
