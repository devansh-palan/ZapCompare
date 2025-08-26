import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isValidEmail = (email) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);

  const handleLogin = async () => {
    if (!isValidEmail(email)) {
      toast.error("❌ Please enter a valid Gmail address");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include", // ✅ include cookies
      });
      const data = await res.json();

      if (data.success) {
        toast.success("✅ Login successful!");
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        toast.error("❌ Email not found. Please register first.");
        setTimeout(() => navigate("/register"), 2000);
      }
    } catch (error) {
      console.error(error);
      toast.error("⚠️ Something went wrong. Try again later.");
    }
    setLoading(false);
  };

  return (
    <>
      <div className="flex justify-center items-center min-h-[80vh] px-4">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-md">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 text-gray-800">Login</h2>
          
          {/* ✅ Wrap input + button in a form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <div className="mb-4">
              <label className="block text-gray-600 mb-1">Email Address</label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-300 bg-slate-100 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Enter Gmail Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              type="submit" // ✅ Enter will now trigger form submit
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>
      </div>
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}

export default Login;
