import React, { useState, useEffect } from "react";
import { FaSearch, FaBell, FaDownload, FaUser } from "react-icons/fa";
import { useSelector } from "react-redux";
import { selectToken } from "../../redux/GlobalSlice";
import { getUsers, searchUsers, exportUsersToCsv } from "../../apis/UserApi";
import DatePicker from "react-datepicker"; // ✅ Import react-datepicker
import "react-datepicker/dist/react-datepicker.css"; // ✅ Import datepicker CSS
// import { useSelector } from "react-redux";
import {  selectProfile } from "../../redux/GlobalSlice"; 
import defaultAvatar from "../../../assets/images/Profile Picture (1).svg"; 
// ✅ include selectProfile


const Adminuser = () => {
  const token = useSelector(selectToken);
  const profile = useSelector(selectProfile);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [exportError, setExportError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null); // ✅ State for date picker
  const [currentDateTime, setCurrentDateTime] = useState(new Date()); // ✅ State for dynamic date and time

  // Update current date and time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer); // Cleanup interval on component unmount
  }, []);

  // Fetch users based on selected date
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log("🔄 Fetching all users with token:", token);
        if (!token) {
          throw new Error("No token found. Please log in again.");
        }

        let response;
        if (selectedDate) {
          // Format date for API (e.g., YYYY-MM-DD)
          const formattedDate = selectedDate.toISOString().split("T")[0];
          console.log("🔍 Fetching users for date:", formattedDate);
          response = await searchUsersByDate(formattedDate, token); // Assume this API exists
        } else {
          response = await getUsers(token);
        }
        console.log("✅ Users data from API:", response);
        setUsers(response.data || response);
      } catch (err) {
        console.error("❌ Failed to fetch users:", err);
        setError(err.message || "Failed to fetch users. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token, selectedDate]);

  // Handle search input change
  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearch(value);
    console.log("✏️ Search input changed:", value);

    if (value.trim() === "") {
      console.log("🔄 Empty search, fetching all users again...");
      try {
        const response = await getUsers(token);
        console.log("✅ Users data from API (after reset):", response);
        setUsers(response.data || response);
      } catch (err) {
        console.error("❌ Failed to fetch users on reset:", err);
        setError(err.message || "Failed to fetch users. Please try again.");
      }
      return;
    }

    try {
      console.log("🔍 Searching users with query:", value);
      const response = await searchUsers(value, token);
      console.log("✅ Search results from API:", response);
      setUsers(response.data || response);
    } catch (err) {
      console.error("❌ Failed to search users:", err);
      setError(err.message || "Failed to search users. Please try again.");
    }
  };

  // Handle CSV export
  const handleExportCsv = async () => {
    try {
      console.log("📤 Initiating CSV export with token:", token);
      if (!token) {
        throw new Error("No token found. Please log in again.");
      }
      await exportUsersToCsv(token);
      console.log("✅ CSV export successful");
      setExportError(null);
    } catch (err) {
      console.error("❌ Failed to export CSV:", err);
      setExportError(err.message || "Failed to export users to CSV. Please try again.");
    }
  };

  // Function to determine status color
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

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <p className="text-gray-600">Loading users...</p>
      </div>
    );
  }

  // Render error state
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
            <FaBell className="text-xl text-gray-600 cursor-pointer" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></div>
          </div>
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            {/* <FaUser className="text-gray-600 text-xl" /> */}
            <img
  // src={profile?.image || "/default-avatar.png"}
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

      {/* Export Error Display */}
      {exportError && (
        <div className="mb-4 text-red-600 text-center">
          {exportError}
        </div>
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
              {users.map((user, index) => (
                <tr
                  key={user._id || index}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-white"} hover:bg-gray-100`}
                >
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    {index + 1}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Adminuser;