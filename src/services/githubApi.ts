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

export const fetchAllCommits = async (repo: { owner: { login: string }; name: string }, token: string, oneYearAgo: Date) => {
  let allCommits: any[] = [];
  let page = 1;
  let commits: any[];

  do {
    const commitsResponse = await fetch(
      `https://api.github.com/repos/${repo.owner.login}/${repo.name}/commits?since=${oneYearAgo.toISOString()}&page=${page}&per_page=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!commitsResponse.ok) return [];

    commits = await commitsResponse.json();
    allCommits = [...allCommits, ...commits];
    page++;
  } while (commits.length > 0);

  return allCommits;
};

export const fetchCommitActivity = async (token: string) => {
  const commitCounts = Array(12).fill(0);
  const now = new Date();
  const oneYearAgo = new Date(
    now.getFullYear() - 1,
    now.getMonth() + 1, // Set to start of last year's current month
    1
  );

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  // Fetch user's repositories
  const reposResponse = await fetch(
    `https://api.github.com/user/repos?per_page=100`,
    { headers }
  );

  if (!reposResponse.ok) {
    throw new Error(`Failed to fetch repositories: ${reposResponse.status}`);
  }

  const repos = await reposResponse.json();

  // Map through repositories to get commits
  const commitPromises = repos.map((repo: any) => fetchAllCommits(repo, token, oneYearAgo));
  const allCommits = await Promise.all(commitPromises);

  // Filter and count commits from the last 12 months
  allCommits.flat().forEach((commit) => {
    const commitDate = new Date(commit.commit.author.date);
    if (commitDate >= oneYearAgo) {
      const monthsSinceOneYearAgo =
        (now.getFullYear() - commitDate.getFullYear()) * 12 +
        now.getMonth() -
        commitDate.getMonth();
      if (monthsSinceOneYearAgo >= 0 && monthsSinceOneYearAgo < 12) {
        commitCounts[11 - monthsSinceOneYearAgo] += 1;
      }
    }
  });

  return commitCounts;
};

export const fetchLanguages = async (token: string, windowWidth: number) => {
  try {
    const headers = { Authorization: `token ${token}` };
    const reposResponse = await fetch(`https://api.github.com/user/repos?per_page=100`, { headers });
    const repos = await reposResponse.json();

    const languageCount: { [key: string]: number } = {};

    await Promise.all(
      repos.map(async (repo: any) => {
        const languagesResponse = await fetch(repo.languages_url, { headers });
        const languages = await languagesResponse.json();
        for (let language in languages) {
          languageCount[language] = (languageCount[language] || 0) + languages[language];
        }
      })
    );

    const sortedLanguages = Object.entries(languageCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, windowWidth > 768 ? 10 : 5);

    const languageNames = sortedLanguages.map(([name]) => name);
    const languageValues = sortedLanguages.map(([, value]) => value);

    return {
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
    };
  } catch (error) {
    console.error("Error fetching language data:", error);
    throw error;
  }
};

// New function to fetch the user profile
export const fetchUserProfile = async (token: string) => {
  try {
    const response = await api.get('/user', {
      headers: { Authorization: `token ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// New function to fetch commits for each repository
export const fetchCommits = async (token: string) => {
  try {
    const reposResponse = await api.get('/user/repos?per_page=100', {
      headers: { Authorization: `token ${token}` },
    });
    const repos = reposResponse.data;

    const commitRequests = repos.map((repo: any) =>
      api.get(`/repos/${repo.owner.login}/${repo.name}/commits?per_page=100`, {
        headers: { Authorization: `token ${token}` },
      }).then(res => res.data)
    );

    const commitsData = await Promise.all(commitRequests);
    const allCommits = commitsData.flat();

    allCommits.sort(
      (a, b) =>
        new Date(b.commit.author.date).getTime() -
        new Date(a.commit.author.date).getTime()
    );

    return allCommits;
  } catch (error) {
    console.error("Error fetching commits:", error);
    throw error;
  }
};