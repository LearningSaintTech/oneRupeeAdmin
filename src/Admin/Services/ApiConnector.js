import { store } from "../redux/Appstore"; // Your Redux store
import { selectToken } from "../redux/Appstore"; // Selector for token

 const API_BASE_URL = "https://main.learningsaint.com";
  //  const API_BASE_URL = "https://main.learningsaint.com";


/**
 * JSON-based API request handler using Redux token automatically
 */
export const requestJson = async (method, endpoint, data = null, queryParams = {}) => {
  // ✅ Get token from Redux store
  const authToken = selectToken(store.getState());
  // const authToken = selectToken(store.getState());
console.log("Redux token inside requestJson:", authToken);


  console.log("requestJson called with:", {
    method,
    endpoint,
    data,
    queryParams,
    token: authToken,
  });

  try {
    let url = `${API_BASE_URL}${endpoint}`;

    // Handle query params
    if (queryParams && Object.keys(queryParams).length > 0) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(queryParams)) {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, value);
        }
      }
      const queryString = searchParams.toString();
      if (queryString) url += `?${queryString}`;
    }

    const headers = {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    };

    const options = {
      method: method.toUpperCase(),
      headers,
    };

    if (data && ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase())) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      throw new Error("Expected JSON but received non-JSON: " + text);
    }

    const json = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Token may be missing or expired");
      }
      throw new Error(json.message || `API error (Status: ${response.status})`);
    }

    return json;
  } catch (error) {
    console.error("requestJson error:", error.message);
    throw error;
  }
};

/**
 * Multipart/form-data request handler using Redux token automatically
 */
export const requestFormData = async (method, endpoint, data, config = {}) => {
  // ✅ Get token from Redux store
  const authToken = selectToken(store.getState());

  console.log("requestFormData called with:", {
    method,
    endpoint,
    data,
    config,
    token: authToken,
  });

  const url = `${API_BASE_URL}${endpoint}`;

  const options = {
    method: method.toUpperCase(),
    headers: {
      Accept: "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...config.headers,
    },
    body: data,
  };

  try {
    const response = await fetch(url, options);

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      throw new Error(`Expected JSON but received ${contentType}: ${text}`);
    }

    const json = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Token may be missing or expired");
      }
      throw new Error(json.message || `API error (Status: ${response.status})`);
    }

    return json;
  } catch (error) {
    console.error("requestFormData error:", error.message);
    throw error;
  }
};
