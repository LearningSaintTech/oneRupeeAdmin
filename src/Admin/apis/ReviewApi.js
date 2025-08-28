// src/apis/RatingApi.js
import { requestJson } from "../Services/ApiConnector";

// ✅ Get Ratings (all subcourses with avgRating)
export const getRatings = async (token = null) => {
  try {
    const response = await requestJson(
      "GET",
      "/api/admin/ratings/get-ratings",
      null,   // no body
      {},     // no query params
      token   // auth token if needed
    );

    console.log("⭐ Ratings fetched:", response);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching ratings:", error);
    throw error;
  }
};

// ✅ Search Ratings (by keyword)
export const searchRatings = async (keyword, token = null) => {
  try {
    const response = await requestJson(
      "GET",
      `/api/admin/ratings/search-ratings`,
      null,   // no body
      { keyword }, // query params
      token
    );

    console.log(`🔍 Ratings search for "${keyword}" result:`, response);
    return response.data;
  } catch (error) {
    console.error("❌ Error searching ratings:", error);
    throw error;
  }
};

// ✅ Export Ratings (CSV download)
// src/apis/ReviewApi.js
export const exportRatings = async (token = null) => {
  try {
    const baseUrl = import.meta.env.VITE_API_URL; // ✅ use Vite env
    const response = await fetch(`${baseUrl}/api/admin/ratings/export-ratings`, {
      method: "GET",
      headers: {
        "Authorization": token ? `Bearer ${token}` : "",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to export ratings");
    }

    // Get blob (CSV file)
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    // Create a link and download file
    const a = document.createElement("a");
    a.href = url;
    a.download = "ratings.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();

  } catch (error) {
    console.error("❌ Error exporting ratings:", error);
    throw error;
  }
};
