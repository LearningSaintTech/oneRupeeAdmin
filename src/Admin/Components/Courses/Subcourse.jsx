import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaSearch, FaBell, FaPlus, FaVideo } from "react-icons/fa";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import profilePic from "../../../assets/images/Profile Picture (1).svg";
import rectangleImg from "../../../assets/images/classrom.svg";
import {
  fetchSubCoursesByCourseId,
  addSubCourse,
  updateSubCourse,
  deleteSubCourse,
  searchSubCourse,
} from "../../apis/SubCourseApi";
import { jwtDecode } from "jwt-decode";
import toast, { Toaster } from "react-hot-toast";

// Debounce utility to limit API calls
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Helper function to parse duration
const parseDuration = (durationStr) => {
  console.log("📜 Parsing duration:", durationStr);
  if (!durationStr) {
    console.warn("⚠️ Duration is empty or undefined, returning default");
    return { hours: "00", minutes: "00", seconds: "00" };
  }

  // Normalize the input by replacing "hours" with "h", "minutes" with "min", etc.
  const normalizedStr = durationStr
    .toLowerCase()
    .replace("hours", "h")
    .replace("hour", "h")
    .replace("minutes", "min")
    .replace("minute", "min")
    .replace("seconds", "sec")
    .replace("second", "sec");

  // Regex to match formats like "Xh Ymin Zsec", "Xh Ymin", or "Xh"
  const match = normalizedStr.match(/(\d+)\s*h\s*(?:(\d+)\s*min)?\s*(?:(\d+)\s*sec)?/);
  if (!match) {
    console.warn("⚠️ Invalid duration format, returning default:", durationStr);
    return { hours: "00", minutes: "00", seconds: "00" };
  }

  const hours = parseInt(match[1] || 0).toString().padStart(2, "0");
  const minutes = parseInt(match[2] || 0).toString().padStart(2, "0");
  const seconds = parseInt(match[3] || 0).toString().padStart(2, "0");

  const result = { hours, minutes, seconds };
  console.log("✅ Parsed duration result:", result);
  return result;
};

const SubCourses = () => {
  const location = useLocation();
  const courseId = location.state?.courseId || "";
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddContentModalOpen, setIsAddContentModalOpen] = useState(false);
  const [subCourses, setSubCourses] = useState([]);
  const [selectedSubCourse, setSelectedSubCourse] = useState(null);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [formData, setFormData] = useState({
    courseId: "",
    name: "",
    description: "",
    price: "",
    lessons: "",
    durationHours: "00",
    durationMinutes: "00",
    durationSeconds: "00",
    certificateDescription: "",
    introVideo: null,
  });
  const [contentFormData, setContentFormData] = useState({
    contentName: "",
    description: "",
    link: "",
    isPaid: false,
    price: "",
  });
  const [token] = useState(localStorage.getItem("authToken") || "");

  // Log location state and courseId
  console.log("📍 Location state:", location.state);
  console.log("📍 Course ID from state:", courseId);

  // Validate courseId and update formData
  useEffect(() => {
    if (!courseId) {
      console.error("❌ Course ID is missing or undefined");
      setError("Course ID is missing. Please select a course.");
      toast.error("Course ID is missing. Please select a course.");
      navigate("/courses");
    } else {
      console.log("✅ Course ID is valid:", courseId);
      setFormData((prev) => ({ ...prev, courseId }));
    }
  }, [courseId, navigate]);

  // Validate token on mount
  useEffect(() => {
    console.log("🔑 Checking token:", token ? token.slice(0, 10) + "..." : "No token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("🔍 Decoded token:", decoded);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          console.error("❌ Token expired:", new Date(decoded.exp * 1000));
          localStorage.removeItem("authToken");
          setError("Session expired. Please log in again.");
          toast.error("Session expired. Please log in again.");
          navigate("/login");
        } else {
          console.log("✅ Token valid until:", new Date(decoded.exp * 1000));
        }
      } catch (error) {
        console.error("❌ Invalid token:", error.message);
        setError("Invalid token. Please log in again.");
        toast.error("Invalid token. Please log in again.");
        navigate("/login");
      }
    } else {
      console.error("❌ No token found");
      setError("Please log in to access subcourses.");
      toast.error("Please log in to access subcourses.");
      navigate("/login");
    }
  }, [token, navigate]);

  // Fetch subcourses by courseId
  useEffect(() => {
    const loadSubCourses = async () => {
      console.log("📡 Fetching subcourses for courseId:", courseId);
      if (!token || !courseId) {
        console.error("❌ Missing token or courseId. Redirecting...");
        setError("Please log in or select a course.");
        toast.error("Please log in or select a course.");
        navigate(!token ? "/login" : "/courses");
        return;
      }

      try {
        console.log("📡 Calling fetchSubCoursesByCourseId with token:", token.slice(0, 10) + "...");
        const response = await fetchSubCoursesByCourseId(courseId, token);
        console.log("✅ Fetched subcourses:", response.data);
        const mappedCourses = response.data.map((course, index) => {
          const { hours, minutes, seconds } = parseDuration(course.totalDuration);
          const mappedCourse = {
            sn: (index + 1).toString().padStart(2, "0"),
            id: course._id,
            name: course.subcourseName,
            duration: `${hours}:${minutes}:${seconds}`,
            price: `₹${course.price}`,
            description: course.subCourseDescription,
          };
          console.log("🔍 Mapped course:", mappedCourse);
          return mappedCourse;
        });
        setSubCourses(mappedCourses);
        setError(null);
        console.log("✅ Updated subCourses state:", mappedCourses);
        console.log("📊 Total subcourses fetched:", mappedCourses.length);
      } catch (error) {
        console.error("❌ Error fetching subcourses:", error.message, error.stack);
        setError(`Failed to fetch subcourses: ${error.message}`);
        toast.error(`Failed to fetch subcourses: ${error.message}`);
        setSubCourses([]);
      }
    };
    if (!searchQuery && courseId) {
      loadSubCourses();
    }
  }, [token, navigate, searchQuery, courseId]);

  // Debounced search function
  const performSearch = useCallback(
    debounce(async (query) => {
      if (!query) {
        setIsSearching(false);
        return;
      }
      if (!token || !courseId) {
        console.error("❌ Missing token or courseId for search");
        setError("Please log in or select a course.");
        toast.error("Please log in or select a course.");
        navigate(!token ? "/login" : "/courses");
        return;
      }

      try {
        setIsSearching(true);
        console.log("🔍 Searching subcourses with query:", query, "for courseId:", courseId);
        const response = await searchSubCourse(query, token, courseId);
        console.log("✅ Search results:", response.data);
        const mappedCourses = response.data.map((course, index) => {
          const { hours, minutes, seconds } = parseDuration(course.totalDuration);
          return {
            sn: (index + 1).toString().padStart(2, "0"),
            id: course._id,
            name: course.subcourseName,
            duration: `${hours}:${minutes}:${seconds}`,
            price: `₹${course.price}`,
            description: course.subCourseDescription,
          };
        });
        setSubCourses(mappedCourses);
        setError(null);
        console.log("✅ Updated subCourses state after search:", mappedCourses);
      } catch (error) {
        console.error("❌ Error searching subcourses:", error.response?.data, error.message);
        setError(`Failed to search subcourses: ${error.response?.data?.message || error.message}`);
        toast.error(`Failed to search subcourses: ${error.message}`);
        setSubCourses([]);
      } finally {
        setIsSearching(false);
      }
    }, 500),
    [token, navigate, courseId]
  );

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    console.log("🔍 Search query updated:", query);
    performSearch(query);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    console.log("🧹 Search query cleared");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    console.log("📝 Form data updated:", { [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, introVideo: file }));
    console.log("📁 Intro video file selected:", file?.name);
  };

  const handleAddSubCourse = async () => {
    console.log("➕ Attempting to add subcourse with formData:", formData);
    if (!token) {
      setError("Please log in to add a subcourse.");
      toast.error("Please log in to add a subcourse.");
      navigate("/login");
      return;
    }

    const cleanPrice = formData.price.replace("₹", "").trim();
    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !cleanPrice ||
      isNaN(cleanPrice) ||
      parseFloat(cleanPrice) <= 0 ||
      !formData.lessons ||
      isNaN(formData.lessons) ||
      parseInt(formData.lessons) <= 0 ||
      !formData.courseId
    ) {
      setError("Please fill in all required fields with valid values (name, description, price, lessons, courseId).");
      toast.error("Please fill in all required fields with valid values.");
      console.error("❌ Validation failed for adding subcourse");
      return;
    }

    const formDataToSend = new FormData();
    const duration = `${formData.durationHours}h ${formData.durationMinutes}min ${formData.durationSeconds}sec`;

    formDataToSend.append("courseId", formData.courseId);
    formDataToSend.append("subcourseName", formData.name.trim());
    formDataToSend.append("subCourseDescription", formData.description.trim());
    formDataToSend.append("price", cleanPrice);
    formDataToSend.append("certificatePrice", formData.certificatePrice || "0");
    formDataToSend.append("certificateDescription", formData.certificateDescription || "");
    formDataToSend.append("totalLessons", formData.lessons.toString());
    formDataToSend.append("totalDuration", duration);
    if (formData.introVideo) {
      formDataToSend.append("introVideoUrl", formData.introVideo);
    }

    try {
      console.log("📡 Sending addSubCourse request with formData:", formDataToSend);
      const response = await addSubCourse(formDataToSend, token);
      console.log("✅ Subcourse added successfully:", response);
      setIsAddModalOpen(false);
      toast.success("Subcourse added successfully.");
      const refreshedResponse = await fetchSubCoursesByCourseId(courseId, token);
      const mappedCourses = refreshedResponse.data.map((course, index) => {
        const { hours, minutes, seconds } = parseDuration(course.totalDuration);
        return {
          sn: (index + 1).toString().padStart(2, "0"),
          id: course._id,
          name: course.subcourseName,
          duration: `${hours}:${minutes}:${seconds}`,
          price: `₹${course.price}`,
          description: course.subCourseDescription,
        };
      });
      setSubCourses(mappedCourses);
      setError(null);
      console.log("✅ Refreshed subCourses state:", mappedCourses);
    } catch (error) {
      console.error("❌ Error adding subcourse:", error.response?.data, error.message);
      setError(`Failed to add subcourse: ${error.response?.data?.message || error.message}`);
      toast.error(`Failed to add subcourse: ${error.message}`);
    }
  };

  const handleEditSubCourse = async () => {
    console.log("✏️ Attempting to edit subcourse with formData:", formData);
    if (!token) {
      setError("Please log in to edit a subcourse.");
      toast.error("Please log in to edit a subcourse.");
      navigate("/login");
      return;
    }

    const cleanPrice = formData.price.replace("₹", "").trim();
    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !cleanPrice ||
      isNaN(cleanPrice) ||
      parseFloat(cleanPrice) <= 0 ||
      !formData.lessons ||
      isNaN(formData.lessons) ||
      parseInt(formData.lessons) <= 0
    ) {
      setError("Please fill in all required fields with valid values (name, description, price, lessons).");
      toast.error("Please fill in all required fields with valid values.");
      console.error("❌ Validation failed for editing subcourse");
      return;
    }

    const formDataToSend = new FormData();
    const duration = `${formData.durationHours}h ${formData.durationMinutes}min ${formData.durationSeconds}sec`;
    formDataToSend.append("subcourseName", formData.name.trim());
    formDataToSend.append("subCourseDescription", formData.description.trim());
    formDataToSend.append("price", cleanPrice);
    formDataToSend.append("totalLessons", formData.lessons.toString());
    formDataToSend.append("totalDuration", duration);
    formDataToSend.append("certificateDescription", formData.certificateDescription);
    if (formData.introVideo) {
      formDataToSend.append("introVideoUrl", formData.introVideo);
    }

    try {
      console.log("📡 Sending updateSubCourse request for subCourseId:", selectedSubCourse.id);
      const response = await updateSubCourse(selectedSubCourse.id, formDataToSend, token);
      console.log("✅ Subcourse updated successfully:", response);
      setIsEditModalOpen(false);
      setFormData({
        courseId: courseId || "",
        name: "",
        description: "",
        price: "",
        lessons: "",
        durationHours: "00",
        durationMinutes: "00",
        durationSeconds: "00",
        certificateDescription: "",
        introVideo: null,
      });
      toast.success("Subcourse updated successfully.");
      const refreshedResponse = await fetchSubCoursesByCourseId(courseId, token);
      const mappedCourses = refreshedResponse.data.map((course, index) => {
        const { hours, minutes, seconds } = parseDuration(course.totalDuration);
        return {
          sn: (index + 1).toString().padStart(2, "0"),
          id: course._id,
          name: course.subcourseName,
          duration: `${hours}:${minutes}:${seconds}`,
          price: `₹${course.price}`,
          description: course.subCourseDescription,
        };
      });
      setSubCourses(mappedCourses);
      setError(null);
      console.log("✅ Refreshed subCourses state:", mappedCourses);
    } catch (error) {
      console.error("❌ Error updating subcourse:", error.response?.data, error.message);
      setError(`Failed to update subcourse: ${error.response?.data?.message || error.message}`);
      toast.error(`Failed to update subcourse: ${error.message}`);
    }
  };

  const handleDeleteSubCourse = async () => {
    console.log("🗑 Attempting to delete subcourse with id:", selectedSubCourse?.id);
    if (!token) {
      setError("Please log in to delete a subcourse.");
      toast.error("Please log in to delete a subcourse.");
      navigate("/login");
      return;
    }

    try {
      console.log("📡 Sending deleteSubCourse request for subCourseId:", selectedSubCourse.id);
      const response = await deleteSubCourse(selectedSubCourse.id, token);
      console.log("✅ Subcourse deleted successfully:", response);
      setIsDeleteModalOpen(false);
      toast.success("Subcourse deleted successfully.");
      const refreshedResponse = await fetchSubCoursesByCourseId(courseId, token);
      const mappedCourses = refreshedResponse.data.map((course, index) => {
        const { hours, minutes, seconds } = parseDuration(course.totalDuration);
        return {
          sn: (index + 1).toString().padStart(2, "0"),
          id: course._id,
          name: course.subcourseName,
          duration: `${hours}:${minutes}:${seconds}`,
          price: `₹${course.price}`,
          description: course.subCourseDescription,
        };
      });
      setSubCourses(mappedCourses);
      setError(null);
      console.log("✅ Refreshed subCourses state:", mappedCourses);
    } catch (error) {
      console.error("❌ Error deleting subcourse:", error.response?.data, error.message);
      setError(`Failed to delete subcourse: ${error.response?.data?.message || error.message}`);
      toast.error(`Failed to delete subcourse: ${error.message}`);
    }
  };

  const openEditModal = (course) => {
    console.log("✏️ Opening edit modal for course:", course);
    const { hours, minutes, seconds } = parseDuration(course.totalDuration);
    setSelectedSubCourse(course);
    setFormData({
      courseId: courseId || "",
      name: course.name,
      description: course.description,
      price: course.price.replace("₹", ""),
      lessons: course.lessons || "",
      durationHours: hours,
      durationMinutes: minutes,
      durationSeconds: seconds,
      certificateDescription: course.certificateDescription || "",
      introVideo: null,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (course) => {
    console.log("🗑 Opening delete modal for course:", course);
    setSelectedSubCourse(course);
    setIsDeleteModalOpen(true);
  };

  const openAddContentModal = (course) => {
    console.log("➕ Opening add content modal for course:", course);
    setSelectedSubCourse(course);
    setContentFormData({
      contentName: course.name || "",
      description: "",
      link: "",
      isPaid: false,
      price: "",
    });
    setIsAddContentModalOpen(true);
  };

  const handleContentInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setContentFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    console.log("📝 Content form data updated:", { [name]: type === "checkbox" ? checked : value });
  };

  const handleAddContent = async () => {
    console.log("➕ Adding content with formData:", contentFormData);
    setIsAddContentModalOpen(false);
    setContentFormData({
      contentName: "",
      description: "",
      link: "",
      isPaid: false,
      price: "",
    });
    toast.success("Content added successfully (placeholder).");
  };

  const handleRowClick = (course) => {
    console.log("📋 Subcourse row clicked:", course);
    if (!courseId) {
      console.error("❌ Course ID is missing");
      setError("Course ID is missing.");
      toast.error("Course ID is missing.");
      return;
    }
    if (!course.id) {
      console.error("❌ Subcourse ID is missing");
      setError("Subcourse ID is missing.");
      toast.error("Subcourse ID is missing.");
      return;
    }
    console.log("➡️ Navigating to lesson with:", {
      courseId,
      subCourseId: course.id,
    });
    navigate("/lesson", {
      state: {
        courseId,
        subCourseId: course.id,
      },
    });
  };

  return (
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      <Toaster position="top-right" reverseOrder={false} />
      {/* Header with Sub Courses title, time, bell, and profile */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Sub Courses</h1>
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-sm text-gray-700 whitespace-nowrap">
            Wed, <span className="font-semibold">12:31 PM IST</span>
          </span>
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-10 py-2 border border-gray-300 rounded-md w-40 sm:w-48 md:w-64 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          <div className="relative">
            {/* <FaBell className="text-gray-600 text-xl cursor-pointer" /> */}

            <FaBell 
                          className="w-6 h-6 text-gray-500 cursor-pointer" 
                          onClick={() => navigate("/notifications")} 
                        />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></div>
          </div>
          <img src={profilePic} alt="profile" className="w-8 sm:w-10 h-8 sm:h-10 rounded-full object-cover" />
        </div>
      </div>

      {/* Action bar */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate("/courses")}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition whitespace-nowrap bg-white"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="relative flex-1 min-w-[180px]">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Name, Role, Serial..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-10 py-3 border border-gray-300 rounded-md w-full bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-[#003E54] to-[#0090b2] text-white px-4 sm:px-6 py-3 rounded-md flex items-center gap-2 hover:from-[#002a3a] hover:to-[#007a94] transition whitespace-nowrap font-medium"
          >
            Add Sub Course <FaPlus />
          </button>
        </div>
      </div>

      {/* Table with heading */}
      <div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {isSearching && <p className="text-gray-600 mb-4">Searching...</p>}
        <h2 className="text-lg font-medium mb-3">Sub Courses</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-yellow-400 py-4 px-4 text-center text-white font-semibold text-sm">S.N.</th>
                <th className="bg-yellow-400 py-4 px-4 text-center text-white font-semibold text-sm">
                  Sub Course Name
                </th>
                <th className="bg-yellow-400 py-4 px-4 text-center text-white font-semibold text-sm">Duration</th>
                <th className="bg-yellow-400 py-4 px-4 text-center text-white font-semibold text-sm">
                  Sub Course Price
                </th>
                <th className="bg-yellow-400 py-4 px-4 text-center text-white font-semibold text-sm">
                  Sub Course Description
                </th>
                <th className="bg-yellow-400 py-4 px-4 text-center text-white font-semibold text-sm">Edit</th>
              </tr>
            </thead>
            <tbody>
              {subCourses.length === 0 && !error && !isSearching && (
                <tr>
                  <td colSpan="6" className="py-4 px-4 text-center text-sm text-gray-600">
                    No subcourses available.
                  </td>
                </tr>
              )}
              {subCourses.map((course) => (
                <tr
                  key={course.id}
                  onClick={() => handleRowClick(course)}
                  className="hover:bg-gray-50 transition border-b border-gray-100 cursor-pointer"
                >
                  <td className="py-4 px-4 text-center text-sm font-medium">{course.sn}</td>
                  <td className="py-4 px-4 text-center text-sm">{course.name}</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-600">{course.duration}</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-600">{course.price}</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-600">{course.description}</td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(course);
                        }}
                        className="bg-[#FF8800] p-2.5 rounded text-white hover:bg-[#e67a00] transition shadow-sm"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteModal(course);
                        }}
                        className="bg-[#FF8800] p-2.5 rounded text-white hover:bg-[#e67a00] transition shadow-sm"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Sub Course Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex justify-center items-center z-50 p-4 sm:p-0">
          <div className="bg-white w-full max-w-[95%] sm:max-w-[90%] md:max-w-[80%] lg:max-w-[600px] xl:max-w-[700px] 2xl:max-w-[800px] h-auto max-h-[90vh] p-4 sm:p-6 md:p-8 rounded-xl shadow-xl overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">Add New Sub Course</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-lg sm:text-xl md:text-2xl transition"
              >
                ✕
              </button>
            </div>
            <div className="mb-4 sm:mb-6">
              <div className="relative w-full overflow-hidden rounded-md">
                <img
                  src={rectangleImg}
                  alt="intro"
                  className="w-full h-32 sm:h-40 md:h-48 lg:h-56 object-cover"
                />
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 bg-black/60 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-md flex items-center gap-2"
                />
              </div>
            </div>
            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  SUB COURSE NAME
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Foundations of Modern Finance"
                    className="w-full pr-10 px-3 py-2 sm:py-2.5 border border-orange-500 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                  />
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#FF8800]"
                    aria-label="edit name"
                  >
                    <FiEdit />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  SUB COURSE DESCRIPTION
                </label>
                <div className="relative">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="In this course you will learn how to build..."
                    rows="3"
                    className="w-full pr-10 px-3 py-2 sm:py-2.5 border border-orange-500 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                  />
                  <button
                    className="absolute right-2 top-3 text-[#FF8800]"
                    aria-label="edit description"
                  >
                    <FiEdit />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  PRICE
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="₹1000"
                    className="w-full pr-10 px-3 py-2 sm:py-2.5 border border-orange-500 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                  />
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#FF8800]"
                    aria-label="edit price"
                  >
                    <FiEdit />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  NO. OF LESSONS
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="lessons"
                    value={formData.lessons}
                    onChange={handleInputChange}
                    placeholder="24"
                    className="w-full pr-10 px-3 py-2 sm:py-2.5 border border-orange-500 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                  />
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#FF8800]"
                    aria-label="edit lessons"
                  >
                    <FiEdit />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  COURSE DURATION
                </label>
                <div className="flex items-center border border-orange-500 rounded-md">
                  <select
                    name="durationHours"
                    value={formData.durationHours}
                    onChange={handleInputChange}
                    className="flex-1 p-2 sm:p-2.5 border-r border-orange-500 focus:outline-none text-xs sm:text-sm"
                  >
                    {Array.from({ length: 24 }, (_, i) => i).map((hr) => (
                      <option key={hr} value={hr.toString().padStart(2, "0")}>
                        {hr.toString().padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                  <span className="px-1 sm:px-2 border-r border-orange-500 text-xs sm:text-sm">
                    :
                  </span>
                  <select
                    name="durationMinutes"
                    value={formData.durationMinutes}
                    onChange={handleInputChange}
                    className="flex-1 p-2 sm:p-2.5 border-r border-orange-500 focus:outline-none text-xs sm:text-sm"
                  >
                    {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                      <option key={m} value={m.toString().padStart(2, "0")}>
                        {m.toString().padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                  <span className="px-1 sm:px-2 border-r border-orange-500 text-xs sm:text-sm">
                    :
                  </span>
                  <select
                    name="durationSeconds"
                    value={formData.durationSeconds}
                    onChange={handleInputChange}
                    className="flex-1 p-2 sm:p-2.5 border-r border-orange-500 focus:outline-none text-xs sm:text-sm"
                  >
                    {Array.from({ length: 60 }, (_, i) => i).map((s) => (
                      <option key={s} value={s.toString().padStart(2, "0")}>
                        {s.toString().padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  CERTIFICATE DESCRIPTION
                </label>
                <div className="relative">
                  <textarea
                    name="certificateDescription"
                    value={formData.certificateDescription}
                    onChange={handleInputChange}
                    placeholder="In this course you will learn how to build..."
                    rows="3"
                    className="w-full pr-10 px-3 py-2 sm:py-2.5 border border-orange-500 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                  />
                  <button
                    className="absolute right-2 top-3 text-[#FF8800]"
                    aria-label="edit certificate description"
                  >
                    <FiEdit />
                  </button>
                </div>
              </div>
              <div className="flex justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition text-xs sm:text-sm md:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSubCourse}
                  className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition text-xs sm:text-sm md:text-base"
                >
                  Save Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Sub Course Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex justify-center items-center z-50 p-4 sm:p-0">
          <div className="bg-white w-full max-w-[95%] sm:max-w-[90%] md:max-w-[80%] lg:max-w-[600px] xl:max-w-[700px] h-auto max-h-[90vh] p-4 sm:p-6 md:p-8 rounded-xl shadow-xl overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">Edit Sub Course</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-lg sm:text-xl md:text-2xl transition"
              >
                ✕
              </button>
            </div>
            <div className="mb-4 sm:mb-6">
              <div className="relative w-full overflow-hidden rounded-md">
                <img
                  src={rectangleImg}
                  alt="intro"
                  className="w-full h-32 sm:h-40 md:h-48 lg:h-56 object-cover"
                />
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 bg-black/60 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-md flex items-center gap-2"
                />
              </div>
            </div>
            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  SUB COURSE NAME
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Foundations of Modern Finance"
                    className="w-full pr-10 px-3 py-2 sm:py-2.5 border border-orange-500 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                  />
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#FF8800]"
                    aria-label="edit name"
                  >
                    <FiEdit />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  SUB COURSE DESCRIPTION
                </label>
                <div className="relative">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="In this course you will learn how to build..."
                    rows="3"
                    className="w-full pr-10 px-3 py-2 sm:py-2.5 border border-orange-500 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                  />
                  <button
                    className="absolute right-2 top-3 text-[#FF8800]"
                    aria-label="edit description"
                  >
                    <FiEdit />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  PRICE
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="₹1000"
                    className="w-full pr-10 px-3 py-2 sm:py-2.5 border border-orange-500 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                  />
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#FF8800]"
                    aria-label="edit price"
                  >
                    <FiEdit />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  NO. OF LESSONS
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="lessons"
                    value={formData.lessons}
                    onChange={handleInputChange}
                    placeholder="24"
                    className="w-full pr-10 px-3 py-2 sm:py-2.5 border border-orange-500 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                  />
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#FF8800]"
                    aria-label="edit lessons"
                  >
                    <FiEdit />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  COURSE DURATION
                </label>
                <div className="flex items-center border border-orange-500 rounded-md">
                  <select
                    name="durationHours"
                    value={formData.durationHours}
                    onChange={handleInputChange}
                    className="flex-1 p-2 sm:p-2.5 border-r border-orange-500 focus:outline-none text-xs sm:text-sm"
                  >
                    {Array.from({ length: 24 }, (_, i) => i).map((hr) => (
                      <option key={hr} value={hr.toString().padStart(2, "0")}>
                        {hr.toString().padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                  <span className="px-1 sm:px-2 border-r border-orange-500 text-xs sm:text-sm">
                    :
                  </span>
                  <select
                    name="durationMinutes"
                    value={formData.durationMinutes}
                    onChange={handleInputChange}
                    className="flex-1 p-2 sm:p-2.5 border-r border-orange-500 focus:outline-none text-xs sm:text-sm"
                  >
                    {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                      <option key={m} value={m.toString().padStart(2, "0")}>{m.toString().padStart(2, "0")}</option>
                    ))}
                  </select>
                  <span className="px-1 sm:px-2 border-r border-orange-500 text-xs sm:text-sm">
                    :
                  </span>
                  <select
                    name="durationSeconds"
                    value={formData.durationSeconds}
                    onChange={handleInputChange}
                    className="flex-1 p-2 sm:p-2.5 border-r border-orange-500 focus:outline-none text-xs sm:text-sm"
                  >
                    {Array.from({ length: 60 }, (_, i) => i).map((s) => (
                      <option key={s} value={s.toString().padStart(2, "0")}>{s.toString().padStart(2, "0")}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  CERTIFICATE DESCRIPTION
                </label>
                <div className="relative">
                  <textarea
                    name="certificateDescription"
                    value={formData.certificateDescription}
                    onChange={handleInputChange}
                    placeholder="In this course you will learn how to build..."
                    rows="3"
                    className="w-full pr-10 px-3 py-2 sm:py-2.5 border border-orange-500 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                  />
                  <button
                    className="absolute right-2 top-3 text-[#FF8800]"
                    aria-label="edit certificate description"
                  >
                    <FiEdit />
                  </button>
                </div>
              </div>
              <div className="flex justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition text-xs sm:text-sm md:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSubCourse}
                  className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition text-xs sm:text-sm md:text-base"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Sub Course Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-[90%] sm:w-[400px] p-4 sm:p-6 rounded-xl shadow-xl">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Delete Sub Course</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete the subcourse <strong>{selectedSubCourse?.name}</strong>? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 sm:px-6 py-2 sm:py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubCourse}
                className="bg-red-500 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-md hover:bg-red-600 transition text-sm sm:text-base"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Content Modal */}
      {isAddContentModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-[95%] max-w-[1000px] p-6 rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Add Content</h3>
              <button
                onClick={() => setIsAddContentModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl transition"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content Name</label>
                    <input
                      type="text"
                      name="contentName"
                      value={contentFormData.contentName}
                      onChange={handleContentInputChange}
                      placeholder="Typography"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={contentFormData.description}
                      onChange={handleContentInputChange}
                      placeholder="In this course you will learn how to build a space"
                      rows="3"
                      className="w-full px-3 py-2 border border-orange-500 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
                    <input
                      type="url"
                      name="link"
                      value={contentFormData.link}
                      onChange={handleContentInputChange}
                      placeholder="https://zoom.us/j/1234?pwd=abcdghi"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="isPaid"
                          id="free"
                          checked={!contentFormData.isPaid}
                          onChange={() =>
                            setContentFormData((prev) => ({ ...prev, isPaid: false, price: "" }))
                          }
                          className="text-orange-500 focus:ring-orange-500"
                        />
                        <label htmlFor="free" className="text-sm text-gray-700">Free</label>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="isPaid"
                          id="paid"
                          checked={contentFormData.isPaid}
                          onChange={() => setContentFormData((prev) => ({ ...prev, isPaid: true }))}
                          className="text-orange-500 focus:ring-orange-500"
                        />
                        <label htmlFor="paid" className="text-sm text-gray-700">Paid</label>
                        {contentFormData.isPaid && (
                          <input
                            type="text"
                            name="price"
                            value={contentFormData.price}
                            onChange={handleContentInputChange}
                            placeholder="Rs 99/-"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="pt-4">
                    <button
                      onClick={handleAddContent}
                      className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-600 hover:to-yellow-600 transition"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Content Added</h4>
                <div className="space-y-3">
                  <div className="bg-gray-100 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h5 className="text-orange-500 font-semibold text-lg">Typography</h5>
                      <p className="text-gray-600 text-sm">Free</p>
                    </div>
                    <button className="text-orange-500 hover:text-orange-600">
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h5 className="text-orange-500 font-semibold text-lg">Typography</h5>
                      <p className="text-gray-600 text-sm">Paid</p>
                    </div>
                    <button className="text-orange-500 hover:text-orange-600">
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h5 className="text-orange-500 font-semibold text-lg">User Feedback</h5>
                      <p className="text-gray-600 text-sm">Free</p>
                    </div>
                    <button className="text-orange-500 hover:text-orange-600">
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h5 className="text-orange-500 font-semibold text-lg">Typography</h5>
                      <p className="text-gray-600 text-sm">Paid</p>
                    </div>
                    <button className="text-orange-500 hover:text-orange-600">
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h5 className="text-orange-500 font-semibold text-lg">Color Scheme</h5>
                      <p className="text-gray-600 text-sm">Free</p>
                    </div>
                    <button className="text-orange-500 hover:text-orange-600">
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h5 className="text-orange-500 font-semibold text-lg">Button Styles</h5>
                      <p className="text-gray-600 text-sm">Paid</p>
                    </div>
                    <button className="text-orange-500 hover:text-orange-600">
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubCourses;