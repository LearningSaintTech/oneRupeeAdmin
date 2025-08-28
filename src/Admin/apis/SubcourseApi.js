// src/apis/SubCourseApi.js
import { requestJson, requestFormData } from "../../Admin/Services/ApiConnector";

// ✅ Fetch all subcourses
export const fetchAllSubCourses = async (token) => {
  return await requestJson(
    "GET",
    "/api/admin/subcourse/get-all-subcourses",
    null,
    {},
    token
  );
};

// ✅ Add a subcourse
export const addSubCourse = async (formData, token) => {
  try {
    const response = await requestFormData(
      "POST",
      "/api/admin/subcourse/add-subcourse",
      formData,
      {}, // query params if any
      token
    );
    console.log("✅ Subcourse added:", response);
    return response;
  } catch (error) {
    console.error("❌ Error adding subcourse:", error);
    throw error;
  }
};

// ✅ Update a subcourse
export const updateSubCourse = async (subCourseId, formData, token) => {
  return await requestFormData(
    "PUT",
    `/api/admin/subcourse/update-subcourse/${subCourseId}`,
    formData,
    {},
    token
  );
};

// ✅ Delete a subcourse
export const deleteSubCourse = async (subCourseId, token) => {
  return await requestJson(
    "DELETE",
    `/api/admin/subcourse/delete-subcourse/${subCourseId}`,
    null,
    {},
    token
  );
};

// ✅ Search subcourses
export const searchSubCourse = async (query, token) => {
  return await requestJson(
    "GET",
    `/api/admin/subcourse/search-subcourse`,
    null,
    { q: query }, // query parameter
    token
  );
};

export const fetchSubCoursesByCourseId = async (courseId, token) => {
  try {
    const res = await requestJson(
      "GET",
      `/api/admin/subcourse/get-subCoursesById/${courseId}`,
      null,   // body
      {},     // query params
      token
    );
    return res;
  } catch (error) {
    console.error("❌ Error fetching subcourses:", error);
    return null;
  }
};

