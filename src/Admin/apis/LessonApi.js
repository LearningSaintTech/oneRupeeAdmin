import { requestJson, requestFormData } from "../../Admin/Services/ApiConnector";

// ✅ Fetch all lessons
export const fetchAllLessons = async (token) => {
  return await requestJson(
    "GET",
    "/api/admin/lesson/get-all-lesson",
    null,
    {},
    token
  );
};

// ✅ Add a lesson
export const addLesson = async (formData, token) => {
  console.log("🚀 [API] addLesson called with token:", token);

  return await requestFormData(
    "POST",
    "/api/admin/lesson/add-lesson",
    formData,
    { headers: {} }, // keep empty so default Authorization will be set
    token
  );
};

// ✅ Update a lesson
export const updateLesson = async (lessonId, formData, token) => {
  return await requestFormData(
    "PUT",
    `/api/admin/lesson/update-lesson/${lessonId}`,
    formData,
    { headers: {} },
    token
  );
};

// ✅ Delete a lesson
export const deleteLesson = async (lessonId, token) => {
  return await requestJson(
    "DELETE",
    `/api/admin/lesson/delete-lesson/${lessonId}`,
    null,
    {},
    token
  );
};

// ✅ Search lessons by query
export const searchLesson = async (query, token) => {
  return await requestJson(
    "GET",
    `/api/admin/lesson/search-lesson?q=${encodeURIComponent(query)}`,
    null,
    {},
    token
  );
};

// ✅ Fetch all lessons by course/module Id
// ✅ Fetch all lessons by course/module Id with pagination
export const fetchAllLessonsById = async (id, token, page = 1, limit = 5) => {
  return await requestJson(
    "GET",
    `/api/admin/lesson/get-allLessonsById/${id}?page=${page}&limit=${limit}`,
    null,
    {},
    token
  );
};

// ✅ Add recorded lessons
// ✅ Add recorded lessons
export const addRecordedLessons = async (subcourseId, data, token) => {
  return await requestJson(
    "POST",
    `/api/admin/subcourse/add-recorded-lessons/${subcourseId}`,
    data,
    {},
    token
  );
};

// ✅ Update recorded lessons
export const updateRecordedLessons = async (subcourseId, data, token) => {
  return await requestJson(
    "PUT",
    `/api/admin/subcourse/update-recorded-lessons/${subcourseId}`,
    data,
    {},
    token
  );
};
