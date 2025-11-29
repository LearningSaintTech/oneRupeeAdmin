import { requestJson,requestFormData } from "../Services/ApiConnector";

// ✅ Get Promo List
export const getPromos = async (token = null) => {
  try {
    const response = await requestJson(
      "GET",
      "/api/promo/get-promo",
      null,
      {}, // no query params
      token
    );
    console.log("✅ Promos fetched:", response);
    return response.data; // returning just promo data array
  } catch (error) {
    console.error("❌ Error fetching promos:", error);
    throw error;
  }
};

// ✅ Upload Promo Image
export const uploadPromo = async (formData, token) => {
  console.log("🚀 [API] uploadPromo called with token:", token);

  return await requestFormData(
    "POST",
    "/api/promo/upload-promo",
    formData,  // must contain { promo: File }
    {},
    token
  );
};

// ✅ Delete Promo
export const deletePromo = async (promoId, token) => {
  try {
    const response = await requestJson(
      "DELETE",
      `/api/promo/delete-promo/${promoId}`,
      null, // no body needed
      {},   // no query params
      token
    );
    console.log("🗑️ Promo deleted:", response);
    return response;
  } catch (error) {
    console.error("❌ Error deleting promo:", error);
    throw error;
  }
};


// ✅ Get Activities List
export const getActivities = async (token = null) => {
  try {
    const response = await requestJson(
      "GET",
      "/api/admin/activities/get-activities", // adjust endpoint if needed
      null,
      {}, // no query params
      token
    );
    console.log("✅ Activities fetched:", response);
    return response.data; // returning just activities array
  } catch (error) {
    console.error("❌ Error fetching activities:", error);
    throw error;
  }
};

// ✅ Create Activity
export const createActivity = async (activityData, token) => {
  const formData = new FormData();
  formData.append("activityTitle", activityData.activityTitle);
  formData.append("activityHeading", activityData.activityHeading);
  formData.append("activityDescription", activityData.activityDescription);
  formData.append("activityLink", activityData.activityLink);
  if (activityData.activityImage) {
    formData.append("activityImage", activityData.activityImage);
  }

  return await requestFormData(
    "POST",
    "/api/admin/activities/post-activities",
    formData,
    {},
    token
  );
};

// ✅ Update Activity
export const updateActivity = async (activityId, activityData, token) => {
  const formData = new FormData();
  formData.append("activityTitle", activityData.activityTitle);
  formData.append("activityHeading", activityData.activityHeading);
  formData.append("activityDescription", activityData.activityDescription);
  formData.append("activityLink", activityData.activityLink);
  if (activityData.activityImage) {
    formData.append("activityImage", activityData.activityImage);
  }

  return await requestFormData(
    "PUT", // Use PUT for updates
    `/api/admin/activities/update-activities/${activityId}`, // adjust endpoint if needed
    formData,
    {},
    token
  );
};


// ✅ Delete Activity
// ✅ Delete Activity
export const deleteActivity = async (activityId, token) => {
  try {
    const response = await requestJson(
      "DELETE",
      `/api/admin/activities/delete-activities/${activityId}`, // ✅ corrected endpoint
      null, // no body needed
      {},
      token
    );
    console.log("🗑️ Activity deleted:", response);
    return response;
  } catch (error) {
    console.error("❌ Error deleting activity:", error);
    throw error;
  }
};
