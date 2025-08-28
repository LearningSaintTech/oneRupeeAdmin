import React, { useEffect, useState } from "react";
import {
  FaSearch,
  FaBell,
  FaStar,
  FaCloudDownloadAlt,
  FaStarHalfAlt,
} from "react-icons/fa";
import { getRatings, searchRatings, exportRatings } from "../../apis/ReviewApi";
import { useSelector } from "react-redux";
import { selectToken, selectProfile } from "../../redux/GlobalSlice"; // ✅ import profile

const defaultAvatar = "https://via.placeholder.com/150?text=Profile"; // fallback

const Review = () => {
  const token = useSelector(selectToken);
  const profile = useSelector(selectProfile); // ✅ get profile from Redux
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");

  // Update current date and time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ⭐ Fetch ratings from API (all or search)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let data;
        if (searchTerm.trim()) {
          console.log("🔍 Searching ratings with:", searchTerm);
          data = await searchRatings(searchTerm, token);
        } else {
          data = await getRatings(token);
        }

        // Add serial numbers dynamically
        const formatted = (data || []).map((item, index) => ({
          ...item,
          SNo: index + 1,
        }));

        setRatings(formatted);
      } catch (err) {
        console.error("Error fetching ratings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, searchTerm]);

  // ⭐ Render stars
  const renderStars = (rating) => {
    const stars = [];
    const maxStars = 5;

    for (let i = 1; i <= Math.floor(rating); i++) {
      stars.push(
        <FaStar key={i} className="text-yellow-400 text-sm md:text-base" />
      );
    }

    if (rating % 1 !== 0 && stars.length < maxStars) {
      stars.push(
        <FaStarHalfAlt
          key="half"
          className="text-yellow-400 text-sm md:text-base"
        />
      );
    }

    return stars;
  };

  // ⭐ Handle Export CSV
  const handleExport = async () => {
    try {
      await exportRatings(token);
    } catch (error) {
      console.error("❌ Error exporting ratings:", error);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen w-full">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
          Review
        </h1>

        {/* Right Side */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <span className="text-xs sm:text-sm text-gray-700">
            {currentDateTime.toLocaleString("en-US", {
              weekday: "short",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
              timeZone: "Asia/Kolkata",
            })}
          </span>

          <div className="relative">
            <FaBell className="text-gray-600 text-lg sm:text-xl cursor-pointer" />
            <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-orange-500 rounded-full"></div>
          </div>

          {/* ✅ Dynamic Profile Image from Redux */}
          <img
            src={profile?.profileImageUrl || defaultAvatar}
            alt="profile"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
          />
        </div>
      </div>

      {/* Top Control Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 sm:gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Name, Role, Serial..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 h-[50px] border border-gray-300 rounded-md w-full bg-white text-sm sm:text-base"
          />
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3 sm:px-4 h-[50px] bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition text-sm sm:text-base shrink-0 justify-center"
        >
          <FaCloudDownloadAlt />
          Export CSV
        </button>
      </div>

      {/* Learners Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
          Learners
        </h2>

        {loading ? (
          <p className="text-gray-500">Loading ratings...</p>
        ) : ratings.length === 0 ? (
          <p className="text-gray-500">No ratings available</p>
        ) : (
          <div className="w-full">
            {/* Table Header */}
            <div className="flex mb-4">
              <div className="w-16 bg-yellow-400 py-2 sm:py-3 px-4 text-center text-white font-semibold rounded-l-lg text-sm sm:text-base">
                S.N.
              </div>
              <div className="flex-1 min-w-0 bg-yellow-400 py-2 sm:py-3 px-4 text-center text-white font-semibold text-sm sm:text-base">
                Courses
              </div>
              <div className="w-32 sm:w-48 bg-yellow-400 py-2 sm:py-3 px-4 text-center text-white font-semibold rounded-r-lg text-sm sm:text-base">
                Course Reviews
              </div>
            </div>

            {/* Table Body */}
            <div className="space-y-2 sm:space-y-3">
              {ratings.map((item) => (
                <div key={item._id} className="flex items-center py-2 sm:py-3">
                  <div className="w-16 text-center text-[#010F13B2]/[0.8] font-medium text-sm sm:text-base">
                    {item.SNo}
                  </div>
                  <div className="flex-1 min-w-0 text-center text-[#010F13B2]/[0.8] text-sm sm:text-base break-words">
                    {item.subcourseName}
                  </div>
                  <div className="w-32 sm:w-48 flex justify-center gap-1">
                    {renderStars(item.avgRating)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Review;
