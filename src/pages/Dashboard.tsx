import React, { useEffect, useState } from "react";
import { fetchUserData } from "../services/githubApi";
import { GitHubUser } from "../types";
import { useNavigate } from "react-router-dom";
import CommitFrequencyChart from "../components/CommitFrequencyChart";
import DonutChart from "../components/DonutChart";
import { FaSignOutAlt } from "react-icons/fa";
import CommitList from "./CommitList";

const Dashboard = () => {
  const [userData, setUserData] = useState<GitHubUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("githubToken");

    if (!token) {
      navigate("/login");
      return;
    }

    const getUserData = async () => {
      try {
        setLoading(true);
        const data = await fetchUserData();
        setUserData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading user data:", error);
        setError("Failed to load user data.");
        setLoading(false);
      }
    };

    getUserData();
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("githubToken");
    navigate("/login");
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
      <div className="w-full max-w-7xl mx-auto bg-white p-8 rounded-2xl shadow-2xl relative">
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition duration-300 ease-in-out"
        >
          <FaSignOutAlt />
        </button>

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
                <CommitFrequencyChart
                  token={sessionStorage.getItem("githubToken") || ""}
                />
              </div>

              <div className="bg-gray-100 p-8 rounded-xl shadow-xl">
                <h3 className="text-2xl font-semibold text-gray-800 text-center mb-6">
                  Programming Languages Used
                </h3>
                <DonutChart
                  token={sessionStorage.getItem("githubToken") || ""}
                />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-600">No user data found.</p>
        )}
      </div>
      <CommitList token={sessionStorage.getItem("githubToken") || ""} />
    </div>
  );
};

export default Dashboard;
