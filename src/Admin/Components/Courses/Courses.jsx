import React, { useState, useEffect } from "react";
import { FaSearch, FaBell, FaPlus } from "react-icons/fa";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectToken, selectGlobalData, selectUser } from "../../redux/Appstore";
import { fetchAllCourses, addCourse, updateCourse, deleteCourse, searchCourses } from "../../apis/CourseApi";
import profile from "../../../assets/images/Profile Picture (1).svg";
import toast, { Toaster } from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Courses = () => {
  const navigate = useNavigate();
  const token = useSelector(selectToken);
  const profileData = useSelector(selectUser);
  const globalData = useSelector(selectGlobalData);

  const [courses, setCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [courseName, setCourseName] = useState("");
  const [internshipPrice, setInternshipPrice] = useState("Rs 99/-");
  const [certificateDescription, setCertificateDescription] = useState(
    "In this course you will learn how to build a space to a 3-dimensional product..."
  );
  const [coverImage, setCoverImage] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = 5; // Courses per page

  // Update current date and time
  useEffect(() => {
    console.log("⏰ Updating current date and time...");
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => {
      console.log("🧹 Clearing date-time interval...");
      clearInterval(timer);
    };
  }, []);

  // Fetch courses
  useEffect(() => {
    console.log("📡 Fetching courses effect triggered, page:", currentPage, "token:", token ? token.slice(0, 10) + "..." : "No token");
    const loadCourses = async () => {
      setLoading(true);
      try {
        if (!token) {
          throw new Error("No authentication token available");
        }
        console.log(`📡 Fetching courses for page ${currentPage}, limit ${limit}, selectedDate:`, selectedDate);
        const res = await fetchAllCourses(
          token,
          currentPage,
          limit,
          selectedDate ? selectedDate.toISOString().split("T")[0] : null
        );
        console.log("📡 FetchAllCourses response:", res);
        if (res?.success && res?.data?.courses && Array.isArray(res.data.courses)) {
          setCourses(res.data.courses);
          setTotalPages(res.data.pagination?.totalPages || 1);
          setError(null);
        } else {
          throw new Error(res?.message || "Invalid response structure from fetchAllCourses");
        }
      } catch (err) {
        console.error("❌ Error loading courses:", err.message, err.stack);
        const errorMessage = err.message.includes("token")
          ? "Authentication error. Please log in again."
          : err.message || "An error occurred while loading courses.";
        setError(errorMessage);
        toast.error(errorMessage);
        if (err.message.includes("token")) {
          console.log("🔄 Redirecting to login due to token error...");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [token, selectedDate, currentPage, navigate]);

  // Search courses with debounce
  useEffect(() => {
    console.log("🔍 Search effect triggered, query:", searchQuery);
    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        if (!token) {
          console.error("❌ No token provided for search");
          throw new Error("No authentication token available");
        }

        if (searchQuery.trim()) {
          console.log(`🔍 Searching courses with query: "${searchQuery}" for page ${currentPage}`);
          const res = await searchCourses(searchQuery, token, currentPage, limit);
          console.log("✅ Search results:", res);

          // Handle both array and object response structures
          if (Array.isArray(res)) {
            console.log("✅ Processing direct array response:", res);
            setCourses(res);
            setTotalPages(1); // Assume no pagination for direct array response
            setError(null);
          } else if (res?.success) {
            if (Array.isArray(res?.data)) {
              console.log("✅ Processing object response with array data:", res.data);
              setCourses(res.data);
              setTotalPages(1); // Search doesn't use pagination
              setError(null);
            } else if (res?.data?.courses && Array.isArray(res.data.courses)) {
              console.log("✅ Processing fetchAllCourses-like response:", res.data.courses);
              setCourses(res.data.courses);
              setTotalPages(res.data.pagination?.totalPages || 1);
              setError(null);
            } else {
              console.error("❌ Invalid data structure in response:", res);
              throw new Error("Invalid search response structure: data is neither an array nor contains courses");
            }
          } else {
            console.error("❌ Search API returned unsuccessful response:", res);
            throw new Error(res?.message || "Search failed. Please try again.");
          }
        } else {
          console.log("🔄 Search cleared → reloading all courses...");
          const res = await fetchAllCourses(
            token,
            currentPage,
            limit,
            selectedDate ? selectedDate.toISOString().split("T")[0] : null
          );
          console.log("📡 Reload all courses response:", res);
          if (res?.success && res?.data?.courses && Array.isArray(res.data.courses)) {
            setCourses(res.data.courses);
            setTotalPages(res.data.pagination?.totalPages || 1);
            setError(null);
          } else {
            console.error("❌ Invalid fetchAllCourses response:", res);
            throw new Error(res?.message || "Failed to load courses.");
          }
        }
      } catch (err) {
        console.error("❌ Error in search effect:", err.message, err.stack);
        const errorMessage = err.message.includes("token")
          ? "Authentication error. Please log in again."
          : err.message || "Error occurred while searching courses.";
        setError(errorMessage);
        toast.error(errorMessage);
        if (err.message.includes("token")) {
          console.log("🔄 Redirecting to login due to token error...");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      console.log("🧹 Clearing debounce timeout...");
      clearTimeout(delayDebounce);
    };
  }, [searchQuery, token, currentPage, selectedDate, navigate]);

  const openModal = (course = null) => {
    console.log("🌐 Opening modal, course:", course);
    if (course) {
      setCourseName(course.courseName || "");
      setInternshipPrice(
        course.CourseInternshipPrice !== undefined && course.CourseInternshipPrice !== null
          ? `Rs ${course.CourseInternshipPrice}/-`
          : "Rs 99/-"
      );
      setCertificateDescription(
        course.certificateDescription ||
        "In this course you will learn how to build a space to a 3-dimensional product..."
      );
      setCoverImage(course.CoverImageUrl || null);
      setSelectedCourseId(course._id);
      console.log("🔧 Editing course, selectedCourseId:", course._id);
    } else {
      setCourseName("");
      setInternshipPrice("Rs 99/-");
      setCertificateDescription(
        "In this course you will learn how to build a space to a 3-dimensional product..."
      );
      setCoverImage(null);
      setSelectedCourseId(null);
      console.log("➕ Adding new course, selectedCourseId cleared...");
    }
    setIsModalOpen(true);
    setError(null);
  };

  const closeModal = () => {
    console.log("❌ Closing modal...");
    setIsModalOpen(false);
    setCourseName("");
    setInternshipPrice("Rs 99/-");
    setCertificateDescription(
      "In this course you will learn how to build a space to a 3-dimensional product..."
    );
    setCoverImage(null);
    setSelectedCourseId(null);
    setError(null);
  };

  const openDeleteModal = (course) => {
    console.log("🗑 Opening delete modal for course:", course);
    setCourseToDelete(course);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    console.log("❌ Closing delete modal...");
    setIsDeleteModalOpen(false);
    setCourseToDelete(null);
  };

  const handleRowClick = (course) => {
    console.log("➡️ Navigating to subcourse with courseId:", course._id);
    navigate(`/subcourse/${course._id}`, {
      state: { courseId: course._id },
    });
    setError(null);
  };

  const handleEdit = (course) => {
    console.log("✏️ Editing course:", course);
    openModal(course);
  };

  const handleDelete = async () => {
    if (!courseToDelete) return;

    console.log("🗑 Deleting course:", courseToDelete);
    setLoading(true);
    try {
      const res = await deleteCourse(courseToDelete._id, token);
      console.log("📡 Delete course response:", res);
      if (res?.success) {
        console.log("✅ Deleted:", courseToDelete._id);
        setCourses(courses.filter((c) => c._id !== courseToDelete._id));
        toast.success(`"${courseToDelete.courseName}" deleted successfully.`);
        setError(null);
        if (courses.length === 1 && currentPage > 1) {
          console.log("🔄 Last course on page deleted, navigating to previous page:", currentPage - 1);
          setCurrentPage(currentPage - 1);
        } else {
          console.log("🔄 Refreshing courses after delete...");
          const fetchRes = await fetchAllCourses(
            token,
            currentPage,
            limit,
            selectedDate ? selectedDate.toISOString().split("T")[0] : null
          );
          console.log("📡 Refresh courses response:", fetchRes);
          setCourses(fetchRes?.data?.courses || []);
          setTotalPages(fetchRes?.data?.pagination?.totalPages || 1);
        }
      } else {
        console.log("❌ Failed to delete course, response:", res);
        setError(res?.message || "Failed to delete course.");
        toast.error(res?.message || "Failed to delete course.");
      }
    } catch (err) {
      console.error("❌ Error deleting course:", err);
      const errorMessage = err.message.includes("token")
        ? "Authentication error. Please log in again."
        : err.message || "An error occurred while deleting the course.";
      setError(errorMessage);
      toast.error(errorMessage);
      if (err.message.includes("token")) {
        console.log("🔄 Redirecting to login due to token error...");
        navigate("/login");
      }
    } finally {
      console.log("🧹 Cleanup after delete operation...");
      closeDeleteModal();
      setLoading(false);
    }
  };

  const handleSaveCourse = async () => {
    console.log("💾 Handling save course, globalData:", globalData);
    if (!courseName) {
      console.log("⚠️ Course name is empty...");
      setError("Please enter a course name.");
      toast.error("Please enter a course name.");
      return;
    }

    const formData = new FormData();
    formData.append("courseName", courseName);
    formData.append(
      "CourseInternshipPrice",
      parseInt(internshipPrice.replace("Rs ", "").replace("/-", "")) || 99
    );
    if (certificateDescription) {
      formData.append("certificateDescription", certificateDescription);
    }

    if (coverImage && typeof coverImage !== "string") {
      console.log("📤 Uploading cover image:", coverImage.name);
      formData.append("coverImage", coverImage);
    }

    setLoading(true);
    try {
      let res;
      if (selectedCourseId) {
        console.log("✏️ Updating course with ID:", selectedCourseId);
        res = await updateCourse(selectedCourseId, formData, token);
      } else {
        if (!coverImage) {
          console.log("⚠️ No cover image for new course...");
          setError("Please upload a cover image for new course.");
          toast.error("Please upload a cover image for new course.");
          return;
        }
        console.log("➕ Adding new course...");
        res = await addCourse(formData, token);
      }
      console.log("📡 Save course response:", res);

      if (res?.success) {
        console.log("✅ Save successful, response:", res.data);
        const updatedCourses = selectedCourseId
          ? courses.map((c) => (c._id === selectedCourseId ? res.data : c))
          : [...courses, res.data];
        setCourses(updatedCourses);
        closeModal();
        toast.success(`Course ${selectedCourseId ? "updated" : "added"} successfully.`);
        setError(null);
        console.log("🔄 Refreshing courses after save...");
        const fetchRes = await fetchAllCourses(
          token,
          currentPage,
          limit,
          selectedDate ? selectedDate.toISOString().split("T")[0] : null
        );
        console.log("📡 Refresh courses response:", fetchRes);
        setCourses(fetchRes?.data?.courses || []);
        setTotalPages(fetchRes?.data?.pagination?.totalPages || 1);
      } else {
        console.log("❌ Failed to save course, full response:", res);
        setError(res?.message || "Failed to save course.");
        toast.error(res?.message || "Failed to save course.");
      }
    } catch (err) {
      console.error("❌ Error saving course:", err);
      const errorMessage = err.message.includes("token")
        ? "Authentication error. Please log in again."
        : err.message || "An error occurred while saving the course.";
      setError(errorMessage);
      toast.error(errorMessage);
      if (err.message.includes("token")) {
        console.log("🔄 Redirecting to login due to token error...");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      console.log("⬅️ Navigating to previous page:", currentPage - 1);
      setCurrentPage(currentPage - 1);
    } else {
      console.log("⚠️ Already on first page, cannot go previous.");
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      console.log("➡️ Navigating to next page:", currentPage + 1);
      setCurrentPage(currentPage + 1);
    } else {
      console.log("⚠️ Already on last page, cannot go next.");
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded-md text-sm ${
            currentPage === i
              ? "bg-gradient-to-r from-[#F6B800] to-[#FF8800] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-lg sm:text-xl font-semibold">Courses</h1>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <span className="text-xs sm:text-sm">
            {currentDateTime.toLocaleString("en-US", {
              weekday: "short",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
              timeZone: "Asia/Kolkata",
            })}
          </span>
          <FaBell
            className="w-6 h-6 text-gray-500 cursor-pointer"
            onClick={() => navigate("/notifications")}
          />
          <img
            src={profileData?.profileImageUrl || profile}
            alt="profile"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
          />
        </div>
      </div>

      {/* Search + DatePicker + Add */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Name, Role, Serial..."
            className="pl-10 pr-4 h-[50px] border border-gray-300 rounded-md w-full bg-white text-sm sm:text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
       
        <button
          onClick={() => openModal()}
          className="bg-gradient-to-r from-[#003E54] to-[#0090B2] text-white px-4 py-2 rounded-md flex items-center gap-2 whitespace-nowrap h-[50px] text-sm sm:text-base"
        >
          Add Course <FaPlus />
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="text-center py-4 text-gray-500 text-sm sm:text-base">
          Loading courses...
        </div>
      )}

      {/* Table */}
      <div>
        <h2 className="text-lg sm:text-xl font-medium mb-3">Courses</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-yellow-300 py-3 px-4 text-center text-white font-semibold text-sm sm:text-base">
                  S.N.
                </th>
                <th className="bg-yellow-300 py-3 px-4 text-center text-white font-semibold text-sm sm:text-base">
                  Course Name
                </th>
                <th className="bg-yellow-300 py-3 px-4 text-center text-white font-semibold text-sm sm:text-base">
                  Thumbnail
                </th>
                <th className="bg-yellow-300 py-3 px-4 text-center text-white font-semibold text-sm sm:text-base">
                  Delete/Edit
                </th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course._id} className="hover:bg-gray-50 transition cursor-pointer">
                  <td
                    className="py-3 px-4 text-center text-sm sm:text-base"
                    onClick={() => handleRowClick(course)}
                  >
                    {course.SNo}
                  </td>
                  <td
                    className="py-3 px-4 text-center text-sm sm:text-base"
                    onClick={() => handleRowClick(course)}
                  >
                    {course.courseName}
                  </td>
                  <td className="py-3 px-4 text-center" onClick={() => handleRowClick(course)}>
                    <img
                      src={course.CoverImageUrl}
                      alt={course.courseName}
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded mx-auto"
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        className="bg-orange-400 p-2 rounded text-white hover:bg-orange-500 transition"
                        onClick={() => handleEdit(course)}
                      >
                        <FiEdit className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        className="bg-orange-400 p-2 rounded text-white hover:bg-orange-500 transition"
                        onClick={() => openDeleteModal(course)}
                      >
                        <FiTrash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && !loading && (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500 text-sm sm:text-base">
                    No courses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1 || loading}
            className={`px-4 py-2 rounded-md text-sm sm:text-base ${
              currentPage === 1 || loading
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-[#F6B800] to-[#FF8800] text-white hover:from-orange-600 hover:to-red-600"
            }`}
          >
            Previous
          </button>
          <div className="flex gap-2">{renderPageNumbers()}</div>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages || loading}
            className={`px-4 py-2 rounded-md text-sm sm:text-base ${
              currentPage === totalPages || loading
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-[#F6B800] to-[#FF8800] text-white hover:from-orange-600 hover:to-red-600"
            }`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Add/Edit Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-[90%] sm:max-w-[500px] lg:max-w-[600px] xl:max-w-[700px] rounded-lg shadow-xl p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-5 sticky top-0 bg-white z-10 py-2">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">
                {selectedCourseId ? "Edit Course" : "Add Course"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-lg sm:text-xl leading-none"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Upload area */}
            <div className="mb-4 sm:mb-5">
              <label className="block w-full border-2 border-gray-300 border-dashed rounded-lg h-36 sm:h-40 lg:h-44 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-gray-400 transition-colors">
                {coverImage ? (
                  <div className="text-center w-full h-full">
                    <img
                      src={typeof coverImage === "string" ? coverImage : URL.createObjectURL(coverImage)}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-lg flex items-center justify-center mb-2 sm:mb-3">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <span className="text-xs sm:text-sm font-medium tracking-wider text-gray-500">
                      CHOOSE FILE
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setCoverImage(e.target.files[0])}
                />
              </label>
              <p className="text-xs text-gray-600 mt-2 text-center">
                The image dimension should be (456 × 216)px
              </p>
            </div>

            {/* Course Name */}
            <div className="mb-4 sm:mb-5">
              <label className="block text-gray-700 font-semibold mb-1.5 text-xs sm:text-sm">
                Course Name
              </label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter course name"
              />
            </div>

            {/* Internship Price */}
            <div className="mb-4 sm:mb-5">
              <label className="block text-gray-700 font-semibold mb-1.5 text-xs sm:text-sm">
                Internship Price
              </label>
              <input
                type="text"
                value={internshipPrice}
                onChange={(e) => setInternshipPrice(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-orange-500 font-medium"
                placeholder="Rs 99/-"
              />
            </div>

            {/* Certificate Description */}
            <div className="mb-5 sm:mb-6">
              <label className="block text-gray-700 font-semibold mb-1.5 text-xs sm:text-sm">
                Certificate Description
              </label>
              <div className="relative">
                <textarea
                  value={certificateDescription}
                  onChange={(e) => setCertificateDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows="3"
                  placeholder="In this course you will learn how to build a space to a 3-dimensional product..."
                />
                <button
                  className="absolute right-3 top-3 text-orange-500 hover:text-orange-600"
                  type="button"
                  aria-label="edit"
                >
                  <FiEdit className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end">
              <button
                onClick={handleSaveCourse}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 sm:px-6 py-2 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg text-xs sm:text-sm"
                disabled={loading || !courseName || (!coverImage && !selectedCourseId)}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
            {error && (
              <div className="mt-4 p-2 bg-red-100 text-red-700 rounded-lg text-xs">{error}</div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-[90%] sm:max-w-[400px] rounded-xl shadow-xl p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold mb-4">Confirm Delete</h2>
            <p className="text-gray-700 mb-4 sm:mb-6 text-xs sm:text-sm">
              Are you sure you want to delete "{courseToDelete?.courseName}"?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={closeDeleteModal}
                className="bg-gray-200 text-gray-700 px-4 sm:px-6 py-2 rounded-lg hover:bg-gray-300 text-xs sm:text-sm"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-red-600 text-xs sm:text-sm"
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;