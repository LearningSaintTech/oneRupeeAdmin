import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useSelector } from "react-redux";
import { selectToken } from "../../redux/Appstore";
import { fetchCompletedPayments } from "../../apis/PaymentApi";
import { useNavigate } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import { selectProfile } from "../../redux/GlobalSlice";
import defaultAvatar from "../../../assets/images/Profile Picture (1).svg";

const formatDateParam = (date) => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const Payment = () => {
  const token = useSelector(selectToken);
  const profile = useSelector(selectProfile);
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 0, totalItems: 0, limit: 20 });

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const formattedStart = useMemo(() => formatDateParam(startDate), [startDate]);
  const formattedEnd = useMemo(() => formatDateParam(endDate), [endDate]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchCompletedPayments(token, {
        page,
        limit,
        startDate: formattedStart,
        endDate: formattedEnd,
      });
      setPayments(Array.isArray(data?.payments) ? data.payments : []);
      setPagination(data?.pagination || { currentPage: 1, totalPages: 0, totalItems: 0, limit });
    } catch (err) {
      setError(err?.message || "Failed to load payments");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page, limit, formattedStart, formattedEnd]);

  // Clock like Users page
  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const resetFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Top Header Section - match Users */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Payments</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 font-medium">
            {currentDateTime.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })}
          </span>
          <div className="relative">
            <FaBell
              className="w-6 h-6 text-gray-500 cursor-pointer"
              onClick={() => navigate("/notifications")}
            />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></div>
          </div>
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <img
              src={profile?.profileImageUrl || defaultAvatar}
              alt={profile?.name || "User"}
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Filters Section - styled similar to Users */}
      <div className="flex items-end gap-3 mb-6 flex-wrap">
        <div className="flex flex-col w-48">
          <label className="text-sm text-gray-600 mb-1">Start Date</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => {
              setStartDate(date);
              if (endDate && date && date > endDate) setEndDate(null);
              setPage(1);
            }}
            dateFormat="yyyy-MM-dd"
            placeholderText="YYYY-MM-DD"
            className="h-10 border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white w-full"
            maxDate={endDate || undefined}
            isClearable
          />
        </div>
        <div className="flex flex-col w-48">
          <label className="text-sm text-gray-600 mb-1">End Date</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => {
              setEndDate(date);
              setPage(1);
            }}
            dateFormat="yyyy-MM-dd"
            placeholderText="YYYY-MM-DD"
            className="h-10 border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white w-full"
            minDate={startDate || undefined}
            isClearable
          />
        </div>

        <button
          onClick={loadPayments}
          className={`h-10 px-4 rounded-lg font-semibold text-white shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
            loading ? "bg-gray-400" : "bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
          }`}
          disabled={loading}
        >
          {loading ? "Loading..." : "Apply"}
        </button>
        <button
          onClick={resetFilters}
          className="h-10 px-4 rounded-lg font-medium border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          Reset
        </button>

        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm text-gray-600">Per Page</label>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(parseInt(e.target.value) || 20);
              setPage(1);
            }}
            className="h-10 border border-gray-300 rounded-lg px-2 bg-white text-sm"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 text-red-600 text-center">{error}</div>
      )}

      {/* Table Card - match Users */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">Payments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F6B800] text-white">
                <th className="px-6 py-3 text-left text-sm font-medium">S.N.</th>
                <th className="px-6 py-3 text-left text-sm font-medium">User Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Contact</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Currency</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Payment Date</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Razorpay ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Apple Txn</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(payments) && payments.length > 0 ? (
                payments.map((p, index) => (
                  <tr
                    key={p.razorpayPaymentId || p.appleTransactionId || index}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {(pagination.currentPage - 1) * pagination.limit + index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{p.fullName || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{p.mobileNumber || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{p.paymentAmount != null ? `₹${p.paymentAmount}` : "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{p.paymentCurrency || "INR"}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{p.paymentDate ? new Date(p.paymentDate).toLocaleString("en-IN") : "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{p.razorpayPaymentId || p.razorpayOrderId || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{p.appleTransactionId || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-600">
                    {loading ? "Loading payments..." : "No payments found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls - match Users */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={pagination.currentPage === 1 || loading}
          className={`px-4 py-2 rounded-lg ${
            pagination.currentPage === 1 || loading
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-[#F6B800] text-white hover:bg-[#e0a700]"
          }`}
        >
          Previous
        </button>
        <span className="text-gray-600">
          Page {pagination.currentPage} of {Math.max(1, pagination.totalPages)}
        </span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={loading || (pagination.totalPages && pagination.currentPage >= pagination.totalPages)}
          className={`px-4 py-2 rounded-lg ${
            loading || (pagination.totalPages && pagination.currentPage >= pagination.totalPages)
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-[#F6B800] text-white hover:bg-[#e0a700]"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Payment;


