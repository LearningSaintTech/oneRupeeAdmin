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
