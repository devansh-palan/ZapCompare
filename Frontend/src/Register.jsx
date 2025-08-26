import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
const API_URL=import.meta.env.VITE_API_URL;
function Register() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();
  const otpInputRef = useRef(null);

  const isValidEmail = (email) =>
    /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);

  const maskEmail = (email) => {
    if (!email.includes("@")) return email;
    const [name, domain] = email.split("@");
    return name.slice(0, 4) + "***@" + domain;
  };

  
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  
  useEffect(() => {
    if (otpSent && otpInputRef.current) otpInputRef.current.focus();
  }, [otpSent]);

  
  const sendOtp = async () => {
    if (!isValidEmail(email)) {
      toast.error("❌ Please enter a valid Gmail address");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("✅ OTP sent to " + maskEmail(email));
        setOtpSent(true);
        setTimer(30);
      } else {
        toast.error(data.message || "❌ Error sending OTP");
      }
    } catch (err) {
      console.error(err);
      toast.error("⚠️ Something went wrong");
    }
    setLoading(false);
  };

  
  const verifyOtp = async () => {
    if (!otp) {
      toast.error("❌ Please enter OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/check-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok && data.valid) {
        toast.success("🎉 Registration successful!");
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        toast.error(data.message || "❌ Invalid OTP");
      }
    } catch (err) {
      console.error(err);
      toast.error("⚠️ Something went wrong");
    }
    setLoading(false);
  };

  return (
    <>
      <div className="flex justify-center items-center min-h-[80vh] px-4">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-md">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 text-gray-800">
            Register
          </h2>

          {!otpSent ? (
            <>
              <div className="mb-4">
                <label className="block text-gray-600 mb-1">Email Address</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 bg-slate-100 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="Enter Gmail Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendOtp();
                  }}
                />
              </div>
              <button
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition flex items-center justify-center"
                onClick={sendOtp}
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Send OTP"
                )}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4 text-center">
                OTP sent to <b>{maskEmail(email)}</b>
              </p>
              <div className="mb-4">
                <label className="block text-gray-600 mb-1">Enter OTP</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  ref={otpInputRef}
                  className="w-full px-4 py-2 border border-gray-300 bg-slate-100 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
                  placeholder="OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") verifyOtp();
                  }}
                />
              </div>
              <button
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium transition flex items-center justify-center mb-3"
                onClick={verifyOtp}
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Verify & Register"
                )}
              </button>

              <button
                onClick={sendOtp}
                disabled={timer > 0 || loading}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-medium transition"
              >
                {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
              </button>
            </>
          )}
        </div>
      </div>

      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}

export default Register;
