import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [token, setToken] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchUserData = async () => {
    try {
      const config = token
        ? { headers: { Authorization: `token ${token}` } }
        : undefined;

      const endpoint = "https://api.github.com/user";

      const response = await axios.get(endpoint, config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const remaining = error.response.headers["x-ratelimit-remaining"];

        if (status === 403 && remaining === "0") {
          throw new Error("Rate limit exceeded. Please try again later.");
        }

        if (status === 404) {
          throw new Error("User not found. Please check your token.");
        }
      }
      console.error("Error fetching user data", error);
      throw new Error("Invalid GitHub credentials or user not found.");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Please provide a GitHub personal access token.");
      return;
    }

    try {
      const userData = await fetchUserData();
      if (!userData) {
        throw new Error("User data could not be loaded.");
      }

      sessionStorage.setItem("githubToken", token);
      sessionStorage.removeItem("githubUsername");

      navigate("/dashboard");
    } catch (error: any) {
      setError(
        error.message || "Login failed. Invalid credentials or user not found."
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#041e42] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-700 rounded-full opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-500 rounded-full opacity-25"></div>
        <div className="absolute top-60 right-0 w-96 h-48 bg-blue-700 opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-32 bg-blue-500 opacity-20"></div>
      </div>

      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 tracking-wide text-center">
        GitHub Dashboard
      </h1>

      <div className="w-full max-w-md sm:max-w-sm md:max-w-md p-4 sm:p-6 md:p-8 bg-white rounded-lg shadow-xl z-10">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-center text-gray-800 mb-6">
          Sign In
        </h2>

        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label
              htmlFor="token"
              className="block text-sm sm:text-base font-medium text-gray-700"
            >
              GitHub Personal Access Token
            </label>
            <input
              type="password"
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter Personal Access Token"
              className="w-full px-4 py-2 mt-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 text-sm sm:text-base"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold text-lg sm:text-base hover:bg-indigo-700 transition duration-150 ease-in-out"
          >
            Login
          </button>
        </form>

        {error && (
          <p className="mt-4 text-center text-sm sm:text-base text-red-500">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
