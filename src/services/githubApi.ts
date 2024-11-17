import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.github.com',
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('githubToken');
  if (token) {
    config.headers.Authorization = `token ${token}`;
  }
  return config;
});

export const fetchUserData = async (): Promise<any> => {
  const token = sessionStorage.getItem("githubToken");

  if (!token) {
    throw new Error("No GitHub token found.");
  }

  try {
    const response = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `token ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch user data.");
  }
};
