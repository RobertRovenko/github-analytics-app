import React, { useState, useEffect } from "react";
import { FiLogOut } from "react-icons/fi"; // Import the logout icon

const Header = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Update mobile state based on screen width
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize); // Update on resize

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("githubToken");
    sessionStorage.removeItem("githubUsername");
    window.location.href = "/login";
  };

  return (
    <header className="bg-[#041e42] text-white p-4 flex items-center justify-between w-full relative pb-20">
      <div className="flex-1">
        <h1 className="text-2xl font-semibold ml-4 mt-4">
          {isMobile ? "GHA" : "GitHub Analytics"}
        </h1>
      </div>

      <button
        onClick={handleLogout}
        className="absolute mt-4 mr-4 right-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out flex items-center space-x-2"
      >
        <FiLogOut size={20} /> {/* Logout icon */}
        {!isMobile && <span>Logout</span>} {/* Show text only on non-mobile */}
      </button>
    </header>
  );
};

export default Header;
