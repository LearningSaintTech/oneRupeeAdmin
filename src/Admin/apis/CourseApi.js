// src/apis/CourseApi.js
import { requestJson, requestFormData } from "../../Admin/Services/ApiConnector";

// ✅ Fetch all courses
export const fetchAllCourses = async (token) => {
  return await requestJson(
    "GET",
    "/api/admin/course/get-all-courses",
    null,
    {},
    token
  );
};

// ✅ Add a course (form-data: courseName, coverImage, certificateDescription)
export const addCourse = async (formData, token) => {
  return await requestFormData(
    "POST",
    "/api/admin/course/add-course",
    formData,
    {},
    token
  );
};

// ✅ Update a course
export const updateCourse = async (courseId, formData, token) => {
  return await requestFormData(
    "PUT",
    `/api/admin/course/update-course/${courseId}`,
    formData,
    {},
    token
  );
};

// ✅ Delete a course
export const deleteCourse = async (courseId, token) => {
  return await requestJson(
    "DELETE",
    `/api/admin/course/delete-course/${courseId}`,
    null,
    {},
    token
  );
};

// ✅ Search courses by query
export const searchCourses = async (query, token) => {
  try {
    const response = await requestJson(
      "GET",
      `/api/admin/course/search-course?q=${encodeURIComponent(query)}`,
      null,
      {},
      token
    );
    console.log(`🔍 Search results for "${query}":`, response);
    return response?.data || []; // ensure array fallback
  } catch (error) {
    console.error(`❌ Error searching courses with query "${query}":`, error);
    throw error;
  }
};
// ✅ Fetch subcourses by Course ID
export const fetchAllSubCoursesByCourseId = async (courseId, token) => {
  try {
    const response = await requestJson(
      "GET",
      `/api/admin/subcourse/get-subCoursesById/${courseId}`,
      null,
      {},
      token
    );
    console.log(`📚 Subcourses for courseId=${courseId}:`, response);
    return response?.data || []; // always return array fallback
  } catch (error) {
    console.error(`❌ Error fetching subcourses for courseId=${courseId}:`, error);
    throw error;
  }
};
