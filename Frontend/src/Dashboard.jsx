import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL=import.meta.env.VITE_API_URL;
export default function Dashboard() {
  const [brand, setBrand] = useState("");
  const [item, setItem] = useState("");
  const [results, setResults] = useState({ blinkit: [], swiggy: [], zepto: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
    const navigate = useNavigate();


  const parsePrice = (price) => {
    if (!price) return Infinity;
    return Number(price.toString().replace(/[^0-9.]/g, "")) || Infinity;
  };

 
  const getCheapestPrice = (data) => {
    const allPrices = [
      ...data.blinkit.map((p) => parsePrice(p.price)),
      ...data.swiggy.map((p) => parsePrice(p.price)),
      ...data.zepto.map((p) => parsePrice(p.price)),
    ];
    return allPrices.length ? Math.min(...allPrices) : Infinity;
  };

  const handleSearch = async () => {
    if (!brand && !item) {
      setError("⚠️ Please enter at least a brand or an item");
      return;
    }

    setLoading(true);
    setError("");
    setResults({ blinkit: [], swiggy: [], zepto: [] });

    try {
      
      const res = await fetch(
        `${API_URL}/search?brand=${brand || ""}&item=${item || ""}`,
        {
          credentials: "include",
        }
      );

      const data = await res.json();

      if (res.ok) {
        setResults(data);
      } else {
        setError(data.error || "Failed to fetch products");
      }
    } catch (err) {
      console.error(err);
      setError("⚠️ Server unreachable. Make sure backend is running.");
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/logout`, {
        method: "POST",
        credentials: "include",
      });
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const cheapestPrice = getCheapestPrice(results);

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6">
      {/* Header with logout */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center sm:text-left">🔍 ZapCompare</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          🚪 Logout
        </button>
      </div>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-4 text-gray-900">
        🔍 ZapCompare
      </h1>
       <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto text-sm sm:text-base">
        Compare grocery prices across <span className="font-semibold">Blinkit</span>, 
        <span className="font-semibold"> Swiggy Instamart</span>, and 
        <span className="font-semibold"> Zepto</span> instantly. 
        <br />
        Enter a <span className="italic">brand</span> (e.g. Amul) and/or an 
        <span className="italic"> item</span> (e.g. Milk) to get started.
      </p>

      {/* Search bar */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 bg-white rounded-2xl shadow-lg p-4 sm:p-6 w-full max-w-3xl mx-auto mb-10">
        {/* Brand field */}
        <div className="flex-1 w-full">
          <label className="block text-gray-600 font-medium mb-1">Brand</label>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="w-full bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 outline-none transition"
            placeholder="e.g. Amul"
            onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
          />
        </div>

        {/* Item field */}
        <div className="flex-1 w-full">
          <label className="block text-gray-600 font-medium mb-1">Item</label>
          <input
            type="text"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            className="w-full bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 outline-none transition"
            placeholder="e.g. Milk"
            onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
          />
        </div>

        {/* Search button */}
        <div className="w-full sm:w-auto">
          <label className="block invisible mb-1">Search</label>
          <button
            onClick={handleSearch}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition"
          >
            Search
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center my-6">
          <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        </div>
      )}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* 3-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Blinkit Column */}
        <div>
          <div className="flex items-center justify-center mb-6">
            <img
              src="https://d2chhaxkq6tvay.cloudfront.net/platforms/blinkit.webp"
              alt="Blinkit"
              className="w-28 h-12 object-contain drop-shadow-md"
            />
          </div>
          <div className="grid gap-6">
            {results.blinkit.map((p, i) => (
              <a
                key={i}
                href={p.link || "https://blinkit.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="block no-underline text-gray-800 hover:no-underline hover:text-gray-800"
              >
                <div className="bg-white/80 backdrop-blur-lg border border-gray-200 p-4 rounded-2xl shadow hover:shadow-lg transition transform hover:-translate-y-1">
                  <img
                    src={p.image || "https://via.placeholder.com/150"}
                    alt={p.name}
                    className="w-full h-36 sm:h-44 object-contain rounded-lg"
                  />
                  <h2 className="font-semibold mt-3 text-gray-800">{p.name}</h2>
                  <p className="text-green-600 font-bold text-lg">{p.price}</p>
                  {parsePrice(p.price) === cheapestPrice && (
                    <span className="inline-block mt-2 px-3 py-1 bg-yellow-400 text-black text-xs font-bold rounded-full">
                      💰 Cheapest
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Swiggy Column */}
        <div>
          <div className="flex items-center justify-center mb-6">
            <img
              src="https://d2chhaxkq6tvay.cloudfront.net/platforms/swiggy.webp"
              alt="Swiggy"
              className="w-28 h-12 object-contain drop-shadow-md"
            />
          </div>
          <div className="grid gap-6">
            {results.swiggy.map((p, i) => (
              <a
                key={i}
                href={p.link || "https://www.swiggy.com/instamart"}
                target="_blank"
                rel="noopener noreferrer"
                className="block no-underline text-gray-800 hover:no-underline hover:text-gray-800"
              >
                <div className="bg-white/80 backdrop-blur-lg border border-gray-200 p-4 rounded-2xl shadow hover:shadow-lg transition transform hover:-translate-y-1">
                  <img
                    src={p.image || "https://via.placeholder.com/150"}
                    alt={p.name}
                    className="w-full h-44 object-contain rounded-lg"
                  />
                  <h2 className="font-semibold mt-3 text-gray-800">{p.name}</h2>
                  <p className="text-orange-600 font-bold text-lg">₹{p.price}</p>
                  {parsePrice(p.price) === cheapestPrice && (
                    <span className="inline-block mt-2 px-3 py-1 bg-yellow-400 text-black text-xs font-bold rounded-full">
                      💰 Cheapest
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Zepto Column */}
        <div>
          <div className="flex items-center justify-center mb-6">
            <img
              src="https://d2chhaxkq6tvay.cloudfront.net/platforms/zepto.webp"
              alt="Zepto"
              className="w-28 h-12 object-contain drop-shadow-md"
            />
          </div>
          <div className="grid gap-6">
            {results.zepto.map((p, i) => (
              <a
                key={i}
                href={p.link || "https://www.zeptonow.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="block no-underline text-gray-800 hover:no-underline hover:text-gray-800"
              >
                <div className="bg-white/80 backdrop-blur-lg border border-gray-200 p-4 rounded-2xl shadow hover:shadow-lg transition transform hover:-translate-y-1">
                  <img
                    src={p.image || "https://via.placeholder.com/150"}
                    alt={p.name}
                    className="w-full h-44 object-contain rounded-lg"
                  />
                  <h2 className="font-semibold mt-3 text-gray-800">{p.name}</h2>
                  <p className="text-purple-600 font-bold text-lg">{p.price}</p>
                  {parsePrice(p.price) === cheapestPrice && (
                    <span className="inline-block mt-2 px-3 py-1 bg-yellow-400 text-black text-xs font-bold rounded-full">
                      💰 Cheapest
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
