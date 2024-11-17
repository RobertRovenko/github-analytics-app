import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
  const [filteredCommits, setFilteredCommits] = useState<Commit[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const navigate = useNavigate();

  const fetchCommits = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `https://api.github.com/user/repos?per_page=100`,
        {
          headers: {
            Authorization: `token ${token}`,
          },
        }
      );
      const repos = await response.json();

      const allCommits: Commit[] = [];
      for (let repo of repos) {
        const commitsResponse = await fetch(
          `https://api.github.com/repos/${repo.owner.login}/${repo.name}/commits?per_page=100`,
          {
            headers: {
              Authorization: `token ${token}`,
            },
          }
        );
        const commits = await commitsResponse.json();
        allCommits.push(...commits);
      }

      allCommits.sort(
        (a, b) =>
          new Date(b.commit.author.date).getTime() -
          new Date(a.commit.author.date).getTime()
      );

      setCommits(allCommits);
      setFilteredCommits(allCommits);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching commits:", error);
      setLoading(false);
    }
  };

  const groupCommitsByDay = (commits: Commit[]) => {
    const grouped: { [key: string]: Commit[] } = {};

    commits.forEach((commit) => {
      const commitDate = new Date(commit.commit.author.date);
      const dayKey = commitDate.toLocaleDateString();
      if (!grouped[dayKey]) {
        grouped[dayKey] = [];
      }
      grouped[dayKey].push(commit);
    });

    return grouped;
  };

  const filterCommitsByMonth = (commits: Commit[], month: Date) => {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    return commits.filter((commit) => {
      const commitDate = new Date(commit.commit.author.date);
      return commitDate >= startOfMonth && commitDate <= endOfMonth;
    });
  };

  const goToNextMonth = () => {
    const nextMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1
    );
    setCurrentMonth(nextMonth);
  };

  const goToPreviousMonth = () => {
    const prevMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      1
    );
    setCurrentMonth(prevMonth);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value === "") {
      setFilteredCommits(commits);
    } else {
      const lowercasedSearchTerm = e.target.value.toLowerCase();
      const filtered = commits.filter(
        (commit) =>
          commit.commit.message.toLowerCase().includes(lowercasedSearchTerm) ||
          commit.commit.author.date.includes(lowercasedSearchTerm)
      );
      setFilteredCommits(filtered);
    }
  };

  useEffect(() => {
    fetchCommits();
  }, [token]);

  const monthlyCommits = filterCommitsByMonth(commits, currentMonth);
  const groupedCommits = groupCommitsByDay(monthlyCommits);

  const isCurrentMonth =
    currentMonth.getMonth() === new Date().getMonth() &&
    currentMonth.getFullYear() === new Date().getFullYear();

  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <div className="absolute top-0 left-0 w-full h-full bg-[#041e42] bg-opacity-60 flex justify-center items-center z-50">
      <div className="flex flex-col space-y-4 w-full max-w-lg">
        <div className="w-full h-10 bg-gray-300 animate-pulse rounded-md"></div>
        <div className="w-full h-10 bg-gray-300 animate-pulse rounded-md"></div>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-left text-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-2 w-1/2 bg-gray-300 animate-pulse rounded-md"></th>
                <th className="px-4 py-2 w-1/2 bg-gray-300 animate-pulse rounded-md"></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-2 bg-gray-200 animate-pulse"></td>
                <td className="px-4 py-2 bg-gray-200 animate-pulse"></td>
              </tr>
              <tr>
                <td className="px-4 py-2 bg-gray-200 animate-pulse"></td>
                <td className="px-4 py-2 bg-gray-200 animate-pulse"></td>
              </tr>
              <tr>
                <td className="px-4 py-2 bg-gray-200 animate-pulse"></td>
                <td className="px-4 py-2 bg-gray-200 animate-pulse"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div className="bg-[#041e42] min-h-screen p-8">
      <div className="w-full max-w-7xl mx-auto bg-white p-8 rounded-2xl shadow-2xl relative">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Commit List
        </h2>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search commits by message or date"
            value={searchTerm}
            onChange={handleSearch}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="overflow-x-auto mb-6">
          <table className="min-w-full table-auto text-left text-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-2">Commit Message</th>
                <th className="px-4 py-2">Date</th>
              </tr>
            </thead>

            <tbody>
              {Object.keys(groupedCommits).map((day) => (
                <React.Fragment key={day}>
                  {groupedCommits[day].map((commit) => (
                    <tr
                      key={commit.sha}
                      className="border-b cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <td
                        className="px-4 py-2 text-left hover:opacity-70"
                        onClick={() => window.open(commit.html_url, "_blank")}
                      >
                        {commit.commit.message}
                      </td>
                      <td
                        className="px-4 py-2 text-left hover:opacity-70"
                        onClick={() => window.open(commit.html_url, "_blank")}
                      >
                        {new Date(commit.commit.author.date).toLocaleDateString(
                          "default",
                          { weekday: "short", month: "short", day: "numeric" }
                        )}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={goToPreviousMonth}
            className="text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors"
          >
            Previous Month
          </button>

          {!isCurrentMonth && (
            <button
              onClick={goToNextMonth}
              className="text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors"
            >
              Next Month
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommitList;
