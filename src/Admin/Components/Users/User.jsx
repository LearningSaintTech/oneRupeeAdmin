import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaBell, FaDownload, FaUser } from "react-icons/fa";
import { useSelector } from "react-redux";
import { selectToken, selectProfile } from "../../redux/GlobalSlice";
import { getUsers, searchUsers, exportUsersToCsv } from "../../apis/UserApi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import defaultAvatar from "../../../assets/images/Profile Picture (1).svg";

const Adminuser = () => {
  const token = useSelector(selectToken);
  const profile = useSelector(selectProfile);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [exportError, setExportError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // Update current date and time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch users based on selected date, search query, and current page
  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("🔄 Fetching users:", { token, currentPage, limit, selectedDate, search });

        if (!token) {
          throw new Error("No token found. Please log in again.");
        }

        let response;
        if (search.trim()) {
          console.log("🔍 Performing search with query:", search);
          response = await searchUsers(search, token, currentPage, limit); // Pass page and limit
        } else if (selectedDate) {
          const formattedDate = selectedDate.toISOString().split("T")[0];
          console.log("📅 Fetching users for date:", formattedDate);
          response = await searchUsersByDate(formattedDate, token, currentPage, limit); // Pass page and limit
        } else {
          console.log("📋 Fetching all users for page:", currentPage);
          response = await getUsers(currentPage, limit, token);
        }

        console.log("✅ API response:", response);

        if (isMounted) {
          // Standardize response parsing
          const usersData = Array.isArray(response.data?.users)
            ? response.data.users
            : Array.isArray(response.data)
            ? response.data
            : [];
          const totalPagesData = response.data?.pagination?.totalPages || response.pagination?.totalPages || 1;

          setUsers(usersData);
          setTotalPages(totalPagesData);
          setLoading(false);
          console.log("📊 Updated state:", { users: usersData, totalPages: totalPagesData });
        }
      } catch (err) {
        console.error("❌ Fetch error:", err);
        if (isMounted) {
          setError(err.message || "Failed to fetch users. Please try again.");
          setLoading(false);
        }
      }
    };

    fetchUsers();
    return () => {
      isMounted = false;
    };
  }, [token, selectedDate, search, currentPage, limit]);

  // Handle search input change
  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearch(value);
    setCurrentPage(1); // Reset to first page on search
    console.log("✏️ Search query changed:", value);
  };

  // Handle CSV export
  const handleExportCsv = async () => {
    try {
      console.log("📤 Initiating CSV export");
      if (!token) {
        throw new Error("No token found. Please log in again.");
      }
      await exportUsersToCsv(token);
      console.log("✅ CSV export successful");
      setExportError(null);
    } catch (err) {
      console.error("❌ CSV export error:", err);
      setExportError(err.message || "Failed to export users to CSV.");
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      console.log("📄 Changing page to:", newPage);
      setCurrentPage(newPage);
    } else {
      console.warn("⚠️ Invalid page change attempt:", { newPage, totalPages });
    }
  };

  // Status color function
  const getStatusColor = (status) => {
    switch (status) {
      case "Certified Learner":
        return "bg-green-100 text-green-800";
      case "Course Pending":
        return "bg-red-100 text-red-800";
      case "Course Completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <p className="text-gray-600">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Top Header Section */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Users</h1>
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

      {/* Filters Section */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by Name, Role, Serial..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
        </div>
        
        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors"
          style={{
            backgroundColor: "transparent",
            borderColor: "#010F1399",
            color: "black",
          }}
        >
          <FaDownload className="text-sm" />
          Export CSV
        </button>
      </div>

      {exportError && (
        <div className="mb-4 text-red-600 text-center">{exportError}</div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F6B800] text-white">
                <th className="px-6 py-3 text-left text-sm font-medium">S.N.</th>
                <th className="px-6 py-3 text-left text-sm font-medium">User Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Course</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Contact</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Email ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Course Status</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(users) && users.length > 0 ? (
                users.map((user, index) => (
                  <tr
                    key={user._id || index}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {(currentPage - 1) * limit + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.profileImageUrl || defaultAvatar}
                          alt={user.name || "User"}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {user.name || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{user.courseName || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{user.contact || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{user.email || "-"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          user.status
                        )}`}
                      >
                        {user.status || "N/A"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-600">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg ${
            currentPage === 1
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-[#F6B800] text-white hover:bg-[#e0a700]"
          }`}
        >
          Previous
        </button>
        <span className="text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg ${
            currentPage === totalPages
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

export default Adminuser;