import { requestJson } from "../../Admin/Services/ApiConnector";

// Fetch completed payments with optional date range and pagination
export const fetchCompletedPayments = async (
  token,
  { page = 1, limit = 20, startDate = null, endDate = null } = {}
) => {
  if (!token) throw new Error("No authentication token provided");

  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);

  const url = `/api/admin/payments${params.toString() ? `?${params.toString()}` : ""}`;

  const response = await requestJson("GET", url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response?.success) {
    throw new Error(response?.message || "Failed to fetch payments");
  }

  return response?.data || { payments: [], pagination: { currentPage: 1, totalPages: 0, totalItems: 0, limit } };
};


