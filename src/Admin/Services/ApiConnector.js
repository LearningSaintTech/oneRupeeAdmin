const API_BASE_URL = "https://main.learningsaint.com";

/**
 * JSON-based API request handler with auto-token and enhanced error handling
 */
export const requestJson = async (
  method,
  endpoint,
  data = null,
  queryParams = {},
  token = null
) => {
  // ✅ Auto-use token from parameter or localStorage
  const authToken = token || localStorage.getItem("token");

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
      // ✅ Handle 401 separately
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
 * Multipart/form-data request handler with auto-token
 */
export const requestFormData = async (
  method,
  endpoint,
  data,
  config = {},
  token = null
) => {
  const authToken = token || localStorage.getItem("token");

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
