import { requestJson } from "../Services/ApiConnector";

// ✅ Get all users who purchased main courses
export const getUsers = async (token = null) => {
  try {
    const response = await requestJson(
      "GET",
      "/api/admin/users/get-users",
      null,
      {},
      token
    );
    console.log("✅ Users fetched successfully:", response);
    return response;
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    throw error;
  }
};

// ✅ Search users by name/email/contact
export const searchUsers = async (search, token = null) => {
  try {
    const response = await requestJson(
      "GET",
      "/api/admin/users/search-user",
      null,
      { search }, // 🔑 Query param
      token
    );
    console.log("✅ Search results:", response);
    return response;
  } catch (error) {
    console.error("❌ Error searching users:", error);
    throw error;
  }
};

// ✅ Export users to CSV
export const exportUsersToCsv = async (token = null) => {
  try {
    const API_URL = import.meta.env.VITE_API_URL; // 🔑 Use Vite env variable

    const response = await fetch(`${API_URL}/api/admin/users/get-usersToCsv`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error("❌ Failed to export users to CSV");
    }

    const blob = await response.blob();
    console.log("✅ CSV blob fetched:", blob);

    // Trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "users.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("❌ Error exporting users to CSV:", error);
    throw error;
  }
};
