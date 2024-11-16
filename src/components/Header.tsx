import React, { useState, useEffect } from "react";
import { fetchUserData } from "../services/githubApi";

const Header = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const userData = await fetchUserData();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    getUserData();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("githubToken");
    sessionStorage.removeItem("githubUsername");
    window.location.href = "/login";
  };

  return (
    <header className="bg-[#041e42] text-white p-4 flex items-center justify-between w-full relative">
      <div className="flex-1">
        <h1 className="text-2xl font-semibold ml-4 mt-4">GitHub Analytics</h1>
      </div>

      <button
        onClick={handleLogout}
        className="absolute mt-4 mr-4 right-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
      >
        Logout
      </button>
    </header>
  );
};

export default Header;
