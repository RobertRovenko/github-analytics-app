import React, { useState } from "react";

const TokenInputOverlay = ({
  onTokenSubmit,
}: {
  onTokenSubmit: (token: string) => void;
}) => {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (token.length === 40) {
      sessionStorage.setItem("githubToken", token);
      onTokenSubmit(token);
    } else {
      setError(
        "Invalid token format. Please enter a valid GitHub Personal Access Token."
      );
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
      <div className="p-6 bg-white shadow-md rounded">
        <h2 className="text-lg font-semibold mb-4">Enter GitHub Token</h2>
        {error && <p className="text-red-500">{error}</p>}
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="GitHub Personal Access Token"
          className="border p-2 rounded mb-4 w-full"
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default TokenInputOverlay;
