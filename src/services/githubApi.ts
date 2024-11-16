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
  const username = sessionStorage.getItem('githubUsername');
  const token = sessionStorage.getItem('githubToken');
  
  if (!username && !token) {
    throw new Error('No GitHub username or token provided.');
  }

  try {
    if (token) {
      const response = await api.get(`/users/${username}`);
      return response.data;
    } else if (username) {
      const response = await axios.get(`https://api.github.com/users/${username}`);
      return response.data;
    } else {
      throw new Error('No GitHub username provided.');
    }
  } catch (error) {
    console.error('Error fetching user data', error);
    throw error;
  }
};
