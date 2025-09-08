// src/api/authApi.js
import { requestJson } from "../Services/ApiConnector";  // <-- Your provided connector

// LOGIN API (Send OTP)
export const loginApi = async (mobileNumber) => {
  return requestJson(
    "POST",
    "/api/admin/auth/login",
    { mobileNumber }
  );
};

// VERIFY OTP API (to get token after OTP verification, if backend supports it)
export const verifyOtpApi = async (mobileNumber, otp, fcmToken = null, deviceId = null) => {
  const requestBody = { mobileNumber, otp };
  
  // Add FCM token and device ID if available
  if (fcmToken && deviceId) {
    requestBody.fcmToken = fcmToken;
    requestBody.deviceId = deviceId;
  }
  
  return requestJson(
    "POST",
    "/api/admin/auth/verify-otp",
    requestBody
  );
};
