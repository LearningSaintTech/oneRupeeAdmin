import { requestJson, requestFormData } from "../Services/ApiConnector";

// ✅ Save FCM Token
export const saveFcmTokenApi = async ({ deviceId, fcmToken, authToken }) => {
  return await requestJson(
    "POST",
    "/api/notification/save-fcm-token",
    { deviceId, fcmToken },
    {},
    authToken
  );
};

// ✅ Get Notifications
export const getNotificationsApi = async (authToken) => {
  return await requestJson(
    "GET",
    "/api/notification/get-notifications",
    null,
    {},
    authToken
  );
};

// ✅ Mark all notifications as read
export const markNotificationReadApi = async (authToken) => {
  return await requestJson(
    "PATCH",
    "/api/notification/read-all",
    null, // no body
    {},
    authToken
  );
};

// ✅ Get Unread Notification Count
export const getUnreadNotificationCountApi = async (authToken) => {
  return await requestJson(
    "GET",
    "/api/notification/unread-count",
    null,
    {},
    authToken
  );
};

// ✅ Upload Internship Letter (using FormData)
export const uploadInternshipLetterApi = async ({ internshipLetterId, file, authToken }) => {
  const formData = new FormData();
  formData.append("internshipLetterId", internshipLetterId);
  formData.append("internshipLetter", file); // must match backend field name

  return await requestFormData(
    "POST",
    "/api/admin/upload/upload-internshipLetter",
    formData,
    {},
    authToken
  );
};
