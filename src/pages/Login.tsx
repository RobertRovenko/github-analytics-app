import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [username, setUsername] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchUserData = async () => {
    try {
      const config = token
        ? { headers: { Authorization: `token ${token}` } }
        : undefined;

      const endpoint = token
        ? "https://api.github.com/user"
        : `https://api.github.com/users/${username}`;

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
          throw new Error("User not found. Please check your username.");
        }
      }
      console.error("Error fetching user data", error);
      throw new Error("Invalid GitHub credentials or user not found.");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token && !username) {
      setError("Please provide either a GitHub username or token.");
      return;
    }

    try {
      const userData = await fetchUserData();
      if (!userData) {
        throw new Error("User data could not be loaded.");
      }

      if (token) {
        sessionStorage.setItem("githubToken", token);
        sessionStorage.removeItem("githubUsername");
      } else {
        sessionStorage.setItem("githubUsername", username);
        sessionStorage.removeItem("githubToken");
      }

      navigate("/dashboard");
    } catch (error: any) {
      setError(
        error.message || "Login failed. Invalid credentials or user not found."
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Login to GitHub
        </h2>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-600"
            >
              GitHub Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter GitHub Username"
              className="w-full px-4 py-2 mt-1 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-700"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="token"
              className="block text-sm font-medium text-gray-600"
            >
              GitHub Personal Access Token (optional)
            </label>
            <input
              type="text"
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter Personal Access Token"
              className="w-full px-4 py-2 mt-1 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-700"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
          >
            Login
          </button>
        </form>

        {error && (
          <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
        )}
      </div>
    </div>
  );
};

export default Login;
