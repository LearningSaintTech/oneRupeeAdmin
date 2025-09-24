import { requestJson, requestFormData } from "../../Admin/Services/ApiConnector";

// ✅ Fetch all courses with pagination and optional date filter
export const fetchAllCourses = async (token, page = 1, limit = 5, formattedDate = null) => {
  try {
    if (!token) throw new Error("No authentication token provided");
    if (page < 1 || limit < 1) throw new Error("Page and limit must be positive numbers");

    // Construct URL with optional date parameter
    const url = formattedDate
      ? `/api/admin/course/get-all-courses?page=${page}&limit=${limit}&date=${formattedDate}`
      : `/api/admin/course/get-all-courses?page=${page}&limit=${limit}`;

    const response = await requestJson("GET", url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log(`📚 Courses fetched (page=${page}, limit=${limit}, date=${formattedDate || 'none'}):`, response);
    if (!response.success) throw new Error(response.message || "API request failed");
    return response; // Return full response to match component's expectations
  } catch (error) {
    console.error(`❌ Error fetching courses (page=${page}, limit=${limit}, date=${formattedDate || 'none'}):`, error);
    throw new Error(`Failed to load courses: ${error.message}`);
  }
};

// ✅ Add a course (form-data: courseName, coverImage, certificateDescription)
export const addCourse = async (formData, token) => {
  try {
    const response = await requestFormData("POST", "/api/admin/course/add-course", formData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("📡 Add course response:", response);
    return response;
  } catch (error) {
    console.error("❌ Error adding course:", error);
    throw new Error(`Failed to add course: ${error.message}`);
  }
};

// ✅ Update a course
export const updateCourse = async (courseId, formData, token) => {
  try {
    const response = await requestFormData("PUT", `/api/admin/course/update-course/${courseId}`, formData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("📡 Update course response:", response);
    return response;
  } catch (error) {
    console.error(`❌ Error updating course (id=${courseId}):`, error);
    throw new Error(`Failed to update course: ${error.message}`);
  }
};

// ✅ Delete a course
export const deleteCourse = async (courseId, token) => {
  try {
    const response = await requestJson("DELETE", `/api/admin/course/delete-course/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`🗑 Course deleted (id=${courseId}):`, response);
    return response;
  } catch (error) {
    console.error(`❌ Error deleting course (id=${courseId}):`, error);
    throw new Error(`Failed to delete course: ${error.message}`);
  }
};

// ✅ Search courses by query
export const searchCourses = async (query, token, page = 1, limit = 5) => {
  try {
    if (!token) throw new Error("No authentication token provided");
    const response = await requestJson(
      "GET",
      `/api/admin/course/search-course?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log(`🔍 Search results for "${query}":`, response);
    return response?.data || { courses: [], pagination: {} };
  } catch (error) {
    console.error(`❌ Error searching courses with query "${query}":`, error);
    throw new Error(`Failed to search courses: ${error.message}`);
  }
};

// ✅ Fetch subcourses by Course ID
export const fetchAllSubCoursesByCourseId = async (courseId, token) => {
  try {
    if (!token) throw new Error("No authentication token provided");
    const response = await requestJson(
      "GET",
      `/api/admin/subcourse/get-subCoursesById/${courseId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log(`📚 Subcourses for courseId=${courseId}:`, response);
    return response?.data || [];
  } catch (error) {
    console.error(`❌ Error fetching subcourses for courseId=${courseId}:`, error);
    throw new Error(`Failed to fetch subcourses: ${error.message}`);
  }
};