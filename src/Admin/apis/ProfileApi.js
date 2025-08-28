// src/apis/adminProfileApi.js
import { requestJson, requestFormData } from "../Services/ApiConnector";

// ✅ Fetch Admin Profile
export const fetchAdminProfile = async (token) => {
  try {
    const response = await requestJson(
      "GET",
      "/api/admin/profile/get-profile",
      null,
      {},
      token
    );
    console.log("✅ Admin Profile fetched:", response);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching Admin Profile:", error);
    throw error;
  }
};

// ✅ Update Admin Profile (form-data: for image + text fields)
export const updateAdminProfile = async (profileData, token) => {
  try {
    // profileData should be FormData if it contains file
    const response = await requestFormData(
      "PUT",
      "/api/admin/profile/update-profile",
      profileData,
      {},
      token
    );
    console.log("✅ Admin Profile updated:", response);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating Admin Profile:", error);
    throw error;
  }
};
