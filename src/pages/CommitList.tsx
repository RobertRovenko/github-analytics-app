import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserProfile, fetchCommits } from "../services/githubApi";

interface Commit {
  sha: string;
  commit: {
    message: string;
    author: {
      date: string;
    };
  };
  html_url: string;
}

interface CommitListProps {
  token: string;
}

const CommitList: React.FC<CommitListProps> = ({ token }) => {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const userData = await fetchUserProfile(token);
        setAvatarUrl(userData.avatar_url);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    const loadCommits = async () => {
      try {
        const allCommits = await fetchCommits(token);
        setCommits(allCommits);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching commits:", error);
        setLoading(false);
      }
    };

    loadUserProfile();
    loadCommits();
  }, [token, navigate]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredCommits = commits.filter((commit) => {
    const lowercasedSearchTerm = searchTerm.toLowerCase().trim();
    if (!lowercasedSearchTerm) return true;

    return commit.commit.message.toLowerCase().includes(lowercasedSearchTerm);
  });

  const groupCommitsByMonth = (commits: Commit[]) => {
    const grouped: { [key: string]: Commit[] } = {};

    commits.forEach((commit) => {
      const commitDate = new Date(commit.commit.author.date);
      const monthYear = commitDate.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(commit);
    });

    return grouped;
  };

  const groupedCommits = groupCommitsByMonth(filteredCommits);

  return (
    <div className="bg-[#041e42] min-h-screen pt-8">
      <div className="w-full max-w-7xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-2xl relative overflow-x-hidden">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Commit List
        </h2>
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search commits by message"
            value={searchTerm}
            onChange={handleSearch}
            className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
          />
        </div>
        <div className="overflow-x-hidden mb-6">
          <div className="w-full flex flex-col space-y-4">
            {loading ? (
              <>
                {[...Array(5)].map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between space-x-4"
                  >
                    <div className="w-full h-6 bg-gray-300 rounded-full animate-pulse"></div>
                    <div className="w-2/5 h-6 bg-gray-300 rounded-full animate-pulse"></div>
                  </div>
                ))}
              </>
            ) : (
              Object.keys(groupedCommits).map((monthYear) => (
                <div key={monthYear} className="mb-6">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    {monthYear}
                  </h3>
                  {groupedCommits[monthYear].map((commit) => (
                    <div
                      key={commit.sha}
                      className="flex items-start border-b cursor-pointer hover:bg-blue-50 transition-colors p-4"
                    >
                      <div className="flex items-center space-x-4">
                        {avatarUrl && (
                          <img
                            src={avatarUrl}
                            alt="User Avatar"
                            className="w-10 h-10 rounded-full"
                          />
                        )}
                        <div className="flex-1 text-left text-sm sm:text-base text-gray-800">
                          <div
                            onClick={() =>
                              window.open(commit.html_url, "_blank")
                            }
                            className="whitespace-normal break-words"
                          >
                            {commit.commit.message}
                          </div>
                          <div
                            className="mt-2 text-sm sm:text-base text-gray-500 font-medium"
                            onClick={() =>
                              window.open(commit.html_url, "_blank")
                            }
                          >
                            {new Date(
                              commit.commit.author.date
                            ).toLocaleDateString("default", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitList;
