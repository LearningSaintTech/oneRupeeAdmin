import React from "react";
import { useNavigate } from "react-router-dom"; // ✅ import navigation hook
import Banner from "../../../assets/images/Register.svg";

const RegisterUI = () => {
  const navigate = useNavigate(); // ✅ initialize

  const handleSubmit = (e) => {
    e.preventDefault(); // prevent page reload
    // 👉 Here you can also call API for registration if needed
    navigate("/dashboard"); // ✅ navigate to dashboard after register
  };

  return (
    <div className="relative w-full h-full mx-auto overflow-hidden">
      {/* Background Banner */}
      <img
        src={Banner}
        alt="Register Background"
        className="w-full h-full object-cover"
      />

      {/* Register Card */}
      <div className="absolute right-5 top-0 h-[952px] mt-10 w-full md:w-[450px] flex items-center justify-center bg-[#FF88000D]/[0.9] rounded-[24px]">
        <div className="w-full px-8 py-10">
          <h2
            className="text-3xl font-semibold text-[#003E54] mb-2"
            style={{
              fontFamily: "'Nunito Sans', sans-serif",
              lineHeight: "52px",
            }}
          >
            Register Yourself
          </h2>
          <p
            className="text-sm text-[#C6C5ED] mb-6"
            style={{ fontFamily: "Nunito Sans" }}
          >
            See what is going on with your business
          </p>

          {/* Form */}
          <form className="space-y-4" autoComplete="off" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm text-black mb-1">Full name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                className="w-full px-4 py-3 rounded-md border border-[#F6B800] text-black focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-black mb-1">
                Mobile number
              </label>
              <input
                type="text"
                placeholder="Enter your mobile number"
                className="w-full px-4 py-3 rounded-lg border border-[#F6B800] bg-transparent text-black focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#F6B800] to-[#FF8800] text-white font-semibold"
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterUI;
