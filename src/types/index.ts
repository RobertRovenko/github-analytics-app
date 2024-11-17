// src/types/index.ts

// GitHub User Data - Fetched from /users/{username}
export interface GitHubUser {
  login: string;
  id: number;
  name: string;
  bio: string;
  followers: number;
  following: number;
  public_repos: number;
  avatar_url: string;
  html_url: string;
}

