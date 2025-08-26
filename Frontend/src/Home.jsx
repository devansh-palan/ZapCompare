import React from "react";
import logo from "./logo.png";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="bg-white/80 backdrop-blur-md shadow-xl rounded-3xl p-10 text-center max-w-lg w-full border border-gray-100">
        {/* Logo */}
        <img
          src={logo}
          alt="ZapCompare Logo"
          className="w-28 sm:w-36 mx-auto mb-6 animate-bounce"
        />

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-4">
          Zap<span className="text-blue-600">Compare</span>
        </h1>

        {/* Tagline */}
        <p className="text-lg text-gray-600 mb-8">
          ⚡ Smart grocery price comparisons at your fingertips
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/register")}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg transform hover:-translate-y-1 transition"
          >
            🚀 Register
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-8 py-3 rounded-full bg-gray-800 hover:bg-gray-900 text-white font-semibold shadow-lg transform hover:-translate-y-1 transition"
          >
            🔑 Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
