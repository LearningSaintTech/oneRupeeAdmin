// src/apis/SubCourseApi.js
import { requestJson, requestFormData } from "../../Admin/Services/ApiConnector";

/**
 * ✅ Fetch all subcourses with pagination
 */
export const fetchAllSubCourses = async (page = 1, limit = 8) => {
  try {
    const response = await requestJson(
      "GET",
      "/api/admin/subcourse/get-all-subcourses",
      null,
      { page, limit } // dynamic pagination params
    );
    console.log("✅ Subcourses fetched:", response);
    return response;
  } catch (error) {
    console.error("❌ Error fetching subcourses:", error);
    throw error;
  }
};

/**
 * ✅ Add a new subcourse (multipart/form-data)
 */
export const addSubCourse = async (formData) => {
  try {
    const response = await requestFormData(
      "POST",
      "/api/admin/subcourse/add-subcourse",
      formData
    );
    console.log("✅ Subcourse added:", response);
    return response;
  } catch (error) {
    console.error("❌ Error adding subcourse:", error);
    throw error;
  }
};

/**
 * ✅ Update an existing subcourse
 */
export const updateSubCourse = async (subCourseId, formData) => {
  try {
    const response = await requestFormData(
      "PUT",
      `/api/admin/subcourse/update-subcourse/${subCourseId}`,
      formData
    );
    console.log("✅ Subcourse updated:", response);
    return response;
  } catch (error) {
    console.error("❌ Error updating subcourse:", error);
    throw error;
  }
};

/**
 * ✅ Delete a subcourse
 */
export const deleteSubCourse = async (subCourseId) => {
  try {
    const response = await requestJson(
      "DELETE",
      `/api/admin/subcourse/delete-subcourse/${subCourseId}`
    );
    console.log("✅ Subcourse deleted:", response);
    return response;
  } catch (error) {
    console.error("❌ Error deleting subcourse:", error);
    throw error;
  }
};

/**
 * ✅ Search subcourses
 */
export const searchSubCourse = async (query) => {
  try {
    const response = await requestJson(
      "GET",
      "/api/admin/subcourse/search-subcourse",
      null,
      { q: query } // query parameter
    );
    console.log("✅ Subcourse search result:", response);
    return response;
  } catch (error) {
    console.error("❌ Error searching subcourse:", error);
    throw error;
  }
};

/**
 * ✅ Fetch subcourses by courseId
 */
export const fetchSubCoursesByCourseId = async (courseId, page = 1, limit = 10) => {
  try {
    const response = await requestJson(
      "GET",
      `/api/admin/subcourse/get-subCoursesById/${courseId}`,
      null,
      { page, limit } // pagination params
    );
    console.log("Subcourses by courseId:", response);
    return response;
  } catch (error) {
    console.error("Error fetching subcourses by courseId:", error);
    throw error;
  }
};
