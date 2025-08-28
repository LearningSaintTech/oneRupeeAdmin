// src/apis/StatsApi.js 
import { requestJson } from "../Services/ApiConnector";

// ✅ Get Admin Stats (count values)
export const getAdminStats = async (token = null) => {
  try {
    const response = await requestJson(
      "GET",
      "/api/admin/stats/get-count",
      null,   // no body
      {},     // no query params
      token   // auth token if needed
    );
    console.log("📊 Admin Stats fetched:", response);
    return response.data; // { totalCourses, verifiedUsers, certifiedLearners }
  } catch (error) {
    console.error("❌ Error fetching admin stats:", error);
    throw error;
  }
};

// ✅ Get Recent Courses
export const getRecentCourses = async (token = null) => {
  try {
    const response = await requestJson(
      "GET",
      "/api/admin/stats/get-recentCourses",
      null,   // no body
      {},     // no query params
      token   // auth token if needed
    );
    console.log("📚 Recent Courses fetched:", response);
    return response.data; // returns [{ _id, courseName, CoverImageUrl, createdAt }]
  } catch (error) {
    console.error("❌ Error fetching recent courses:", error);
    throw error;
  }
};

// ✅ Get Course Status Count
export const getCourseStatusCount = async (token = null) => {
  try {
    const response = await requestJson(
      "GET",
      "/api/admin/stats/get-status-count",
      null,   // no body
      {},     // no query params
      token   // auth token if needed
    );
    console.log("📈 Course Status Count fetched:", response);
    return response.data; // { coursePending, certifiedLearner, courseCompleted }
  } catch (error) {
    console.error("❌ Error fetching course status count:", error);
    throw error;
  }
};
