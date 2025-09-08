import React, { useState, useEffect } from "react";
import Logins from "../../../assets/images/Login.svg";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginApi } from "../../apis/LoginApi";
import { setError, setLoading } from "../../redux/GlobalSlice";

const Login = () => {
  const [mobileNumber, setMobileNumber] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => state.global);

  useEffect(() => {
    console.log("🔄 Redux global state updated:", { loading, error });
  }, [loading, error]);

  // Step 1: Send OTP
  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("🟡 handleLogin triggered");

    dispatch(setError(null));
    dispatch(setLoading(true));

    try {
      // ✅ Always send with +91
      const fullNumber = `+91${mobileNumber}`;
      console.log("📩 Sending login request with mobileNumber:", fullNumber);

      const response = await loginApi(fullNumber);
      console.log("✅ loginApi response:", response);

      if (response?.success) {
        console.log("🎯 OTP sent successfully, redirecting to OTP page");
        localStorage.setItem("mobileNumber", fullNumber);

        navigate("/otp", { state: { mobileNumber: fullNumber } });
      } else {
        console.warn("⚠️ loginApi did not return success:", response);
        dispatch(setError(response?.message || "Failed to send OTP"));
      }
    } catch (err) {
      console.error("❌ Login failed:", err);
      dispatch(setError(err.message || "Something went wrong!"));
    } finally {
      dispatch(setLoading(false));
      console.log("🔚 handleLogin finished");
    }
  };

  return (
    <div className="relative w-full h-full mx-auto overflow-hidden">
      <img src={Logins} alt="Login Background" className="w-full h-full object-cover" />

      <div className="absolute right-5 top-0 h-[952px] mt-10 w-full md:w-[450px] flex items-center justify-center bg-[#FF88000D]/[0.5] rounded-[24px]">
        <div className="w-full px-8 py-10">
          <h2 className="text-3xl font-semibold mb-2">Login to your Account</h2>

          <p className="text-sm mb-6">See what is going on with your business</p>

          {error && <p className="text-red-500 text-sm mb-4">❌ {error}</p>}

          <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
            <div>
              <label className="block text-sm text-white mb-1">Mobile No.</label>
              <div className="flex items-center border border-[#F6B800] rounded-md bg-transparent">
                <span className="px-3 text-black font-semibold">+91</span>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => {
                    // ✅ Only digits allowed
                    const val = e.target.value.replace(/\D/g, "");
                    if (val.length <= 10) setMobileNumber(val);
                  }}
                  className="flex-1 px-3 py-3 bg-transparent text-black focus:outline-none"
                  placeholder="Enter 10-digit number"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#F6B800] to-[#FF8800] text-white font-semibold"
            >
              {loading ? "Sending OTP..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
