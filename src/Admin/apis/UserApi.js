import { requestJson } from "../Services/ApiConnector";
// ✅ Get users with pagination (auto or manual token)
export const getUsers = async (page = 1, limit = 10, token = null) => {
  return await requestJson("GET", "/api/admin/users/get-users", null, { page, limit }, token);
};

// ✅ Search users
export const searchUsers = async (search, token = null) => {
  return await requestJson("GET", "/api/admin/users/search-user", null, { search }, token);
};

// ✅ Export users to CSV
export const exportUsersToCsv = async (token = null) => {
  try {
    const API_URL = import.meta.env.VITE_API_URL;
    const authToken = token || selectToken(store.getState());

    const response = await fetch(`${API_URL}/api/admin/users/get-usersToCsv`, {
      method: "GET",
      headers: {
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error("❌ Failed to export users to CSV");
    }

    const blob = await response.blob();
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
