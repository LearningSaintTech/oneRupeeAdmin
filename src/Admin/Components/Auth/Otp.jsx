import React, { useState, useRef } from "react";
import Verify from "../../../assets/images/Verify OTP.svg";
import Lock from "../../../assets/images/Lock .svg";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setToken } from "../../redux/GlobalSlice"; 
import { verifyOtpApi } from "../../apis/loginApi";

const OtpForm = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef([]);
  const dispatch = useDispatch();

  // Get mobileNumber from previous page
  const mobileNumber = location.state?.mobileNumber;
  console.log("📞 Mobile Number from state:", mobileNumber);

  // Handle OTP input
  const handleChange = (value, index) => {
    console.log(`🔢 Input changed at index ${index}:`, value);
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 3) {
        console.log("➡️ Moving focus to next input");
        inputRefs.current[index + 1].focus();
      }
    }
  };

  // Handle backspace
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      console.log("⬅️ Backspace pressed, moving focus back");
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle Verify OTP
  const handleVerify = async () => {
    const enteredOtp = otp.join("");
    console.log("✅ Entered OTP:", enteredOtp);

    if (enteredOtp.length !== 4) {
      setError("Please enter a valid 4-digit OTP.");
      console.warn("⚠️ Invalid OTP length");
      return;
    }

    try {
      console.log("📡 Calling verifyOtpApi with:", {
        mobileNumber,
        otp: enteredOtp,
      });
      const data = await verifyOtpApi(mobileNumber, enteredOtp);
      console.log("📩 API Response:", data);

      if (data.success) {
        const token = data.data?.token || data.token;
        console.log("🔑 Extracted token:", token);

        if (token) {
          console.log("📥 Dispatching token to Redux");
          dispatch(setToken(token));

          console.log("💾 Saving token in localStorage");
          localStorage.setItem("authToken", token);
        } else {
          console.warn("⚠️ Token not found in API response");
        }

        console.log("➡️ Navigating to dashboard");
        navigate("/dashboard");
      } else {
        console.error("❌ OTP Verification failed:", data.message);
        setError(data.message || "Invalid OTP, please try again.");
      }
    } catch (err) {
      console.error("🔥 Verify OTP Error:", err);
      setError("Something went wrong, please try again later.");
    }
  };

  return (
    <div className="relative w-full h-screen mx-auto overflow-hidden">
      {/* Background Banner */}
      <img
        src={Verify}
        alt="Login Background"
        className="w-full h-full object-cover"
      />

      {/* OTP Form */}
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-[#FF8800]/[0.1] backdrop-blur-lg p-6 rounded-2xl shadow-2xl text-center text-black w-[350px] h-[580px] flex flex-col items-center">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center">
          <img src={Lock} alt="Lock Icon" className="w-12 h-12" />
        </div>

        <div className="mt-4">
          <h2
            className="text-xl font-bold mb-0"
            style={{ lineHeight: "52px", color: "#003E54E5" }}
          >
            OTP Verification
          </h2>
          <p className="text-xs opacity-80 mb-6 px-2">
            Enter the 4 digit OTP code sent to your number.
          </p>
        </div>

        <div className="flex-1 w-full flex items-center justify-center">
          <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => (inputRefs.current[index] = el)}
                className="w-[60px] h-[60px] text-center text-lg border border-[#F6B800] rounded-lg bg-gradient-to-r from-[#F6B800]/[0.5] to-[#FF8800]/[0.5] text-gray-800 outline-none focus:border-purple-500 transition-all duration-200"
                placeholder="0"
              />
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

        <div className="w-full mt-auto space-y-4">
          <button
            onClick={handleVerify}
            className="bg-gradient-to-r from-[#F6B800] to-[#FF8800] text-white py-3 px-8 rounded-xl font-bold text-base w-full mb-1 hover:opacity-90 transition-colors duration-200"
          >
            Verify OTP
          </button>
          <button className="border border-[#F6B800] text-[#F6B800] py-3 px-8 rounded-xl text-sm w-full hover:bg-gray-100 transition-colors duration-200">
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpForm;
