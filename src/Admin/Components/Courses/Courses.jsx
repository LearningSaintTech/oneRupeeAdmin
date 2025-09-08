import React, { useState, useEffect } from "react";
import { FaSearch, FaBell, FaPlus } from "react-icons/fa";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectToken, selectGlobalData } from "../../redux/Appstore";
import { fetchAllCourses, addCourse, updateCourse, deleteCourse, searchCourses } from "../../apis/CourseApi";
import profile from "../../../assets/images/Profile Picture (1).svg";
import toast, { Toaster } from "react-hot-toast";
import DatePicker from "react-datepicker";
import { selectProfile } from "../../redux/GlobalSlice";
import "react-datepicker/dist/react-datepicker.css";

const Courses = () => {
  const navigate = useNavigate();
  const token = useSelector(selectToken);
  const profile=useSelector(selectProfile);
  const globalData = useSelector(selectGlobalData);
  console.log("🔍 Redux Global Data (including courseId):", globalData);

  const [courses, setCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [courseName, setCourseName] = useState("");
  const [internshipPrice, setInternshipPrice] = useState("Rs 99/-");
  const [certificateDescription, setCertificateDescription] = useState("In this course you will learn how to build a space to a 3-dimensional product...");
  const [coverImage, setCoverImage] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    console.log("⏰ Updating current date and time...");
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    console.log("📡 Fetching courses effect triggered, token:", token ? token.slice(0, 10) + "..." : "No token");
    const loadCourses = async () => {
      try {
        console.log("📡 Fetching courses...");
        let res;
        if (selectedDate) {
          const formattedDate = selectedDate.toISOString().split("T")[0];
          console.log("🔍 Fetching courses for date:", formattedDate);
          res = await fetchAllCourses(token);
        } else {
          console.log("🔍 Fetching all courses...");
          res = await fetchAllCourses(token);
        }
        if (res?.success) {
          console.log("✅ Courses fetched:", res.data);
          setCourses(res.data || []);
          setError(null);
        } else {
          console.log("❌ Failed to load courses, response:", res);
          setError("Failed to load courses.");
          toast.error("Failed to load courses.");
        }
      } catch (err) {
        console.error("❌ Error loading courses:", err);
        setError("An error occurred while loading courses.");
        toast.error("An error occurred while loading courses.");
      }
    };

    if (token) {
      console.log("🔑 Token available, proceeding to load courses...");
      loadCourses();
    } else {
      console.log("⚠️ No authentication token available...");
      setError("No authentication token available.");
      toast.error("No authentication token available.");
    }
  }, [token, selectedDate]);

  useEffect(() => {
    console.log("🔍 Search effect triggered, query:", searchQuery);
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim()) {
        console.log(`🔍 Searching courses with query: "${searchQuery}"`);
        try {
          const res = await searchCourses(searchQuery, token);
          console.log("✅ Search results:", res);
          setCourses(res || []);
        } catch (err) {
          console.error("❌ Error searching courses:", err);
          setError("Error occurred while searching courses.");
          toast.error("Error occurred while searching courses.");
        }
      } else if (!selectedDate) {
        console.log("🔄 Search cleared → reloading all courses...");
        const res = await fetchAllCourses(token);
        setCourses(res?.data || []);
      }
    }, 500);

    return () => {
      console.log("🧹 Clearing debounce timeout...");
      clearTimeout(delayDebounce);
    };
  }, [searchQuery, token]);
const openModal = (course = null) => {
  console.log("🌐 Opening modal, course:", course);
  if (course) {
    setCourseName(course.courseName || "");
    setInternshipPrice(
      course.CourseInternshipPrice !== undefined && course.CourseInternshipPrice !== null
        ? `Rs ${course.CourseInternshipPrice}/-`
        : "Rs /-"
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
    setCertificateDescription("In this course you will learn how to build a space to a 3-dimensional product...");
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
    try {
      const res = await deleteCourse(courseToDelete._id, token);
      if (res?.success) {
        console.log("✅ Deleted:", courseToDelete._id);
        setCourses(courses.filter((c) => c._id !== courseToDelete._id));
        toast.success(`"${courseToDelete.courseName}" deleted successfully.`);
        setError(null);
      } else {
        console.log("❌ Failed to delete course, response:", res);
        setError("Failed to delete course.");
        toast.error("Failed to delete course.");
      }
    } catch (err) {
      console.error("❌ Error deleting course:", err);
      setError("An error occurred while deleting the course.");
      toast.error("An error occurred while deleting the course.");
    } finally {
      console.log("🧹 Cleanup after delete operation...");
      closeDeleteModal();
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
    formData.append("CourseInternshipPrice", parseInt(internshipPrice.replace("Rs ", "").replace("/-", "")) || 99);
    if (certificateDescription) {
      formData.append("certificateDescription", certificateDescription);
    }

    if (coverImage && typeof coverImage !== "string") {
      console.log("📤 Uploading cover image:", coverImage.name);
      formData.append("coverImage", coverImage);
    }

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

      if (res?.success) {
        console.log("✅ Save successful, response:", res.data);
        const updatedCourses = selectedCourseId
          ? courses.map((c) => (c._id === selectedCourseId ? res.data : c))
          : [...courses, res.data];
        setCourses(updatedCourses);
        closeModal();
        toast.success(`Course ${selectedCourseId ? "updated" : "added"} successfully.`);
        setError(null);
      } else {
        console.log("❌ Failed to save course, full response:", res);
        setError("Failed to save course. Check server response.");
        toast.error("Failed to save course.");
      }
    } catch (err) {
      console.error("❌ Error saving course:", err);
      setError("An error occurred while saving the course.");
      toast.error("An error occurred while saving the course.");
    }
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
         
          {/* <FaBell className="text-gray-500 text-lg cursor-pointer" /> */}
          <FaBell 
            className="w-6 h-6 text-gray-500 cursor-pointer" 
            onClick={() => navigate("/notifications")} 
          />
          <img
            src={profile?.profileImageUrl || profile}
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

      {/* Table */}
      <div>
        <h2 className="text-lg sm:text-xl font-medium mb-3">Courses</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-yellow-400 py-3 px-4 text-center text-white font-semibold text-sm sm:text-base">S.N.</th>
                <th className="bg-yellow-400 py-3 px-4 text-center text-white font-semibold text-sm sm:text-base">Course Name</th>
                <th className="bg-yellow-400 py-3 px-4 text-center text-white font-semibold text-sm sm:text-base">Thumbnail</th>
                <th className="bg-yellow-400 py-3 px-4 text-center text-white font-semibold text-sm sm:text-base">Delete/Edit</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course, index) => (
                <tr key={course._id} className="hover:bg-gray-50 transition cursor-pointer">
                  <td className="py-3 px-4 text-center text-sm sm:text-base" onClick={() => handleRowClick(course)}>
                    {index + 1}
                  </td>
                  <td className="py-3 px-4 text-center text-sm sm:text-base" onClick={() => handleRowClick(course)}>
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
              {courses.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500 text-sm sm:text-base">
                    No courses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-[90%] sm:max-w-[500px] lg:max-w-[600px] xl:max-w-[700px] rounded-lg shadow-xl p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-5 sticky top-0 bg-white z-10 py-2">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">{selectedCourseId ? "Edit Course" : "Add Course"}</h2>
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
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <span className="text-xs sm:text-sm font-medium tracking-wider text-gray-500">CHOOSE FILE</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setCoverImage(e.target.files[0])} />
              </label>
              <p className="text-xs text-gray-600 mt-2 text-center">The image dimension should be (456 × 216)px</p>
            </div>

            {/* Course Name */}
            <div className="mb-4 sm:mb-5">
              <label className="block text-gray-700 font-semibold mb-1.5 text-xs sm:text-sm">Course Name</label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter category name"
              />
            </div>

            {/* Internship Price */}
            <div className="mb-4 sm:mb-5">
              <label className="block text-gray-700 font-semibold mb-1.5 text-xs sm:text-sm">Internship Price</label>
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
              <label className="block text-gray-700 font-semibold mb-1.5 text-xs sm:text-sm">Certificate Description</label>
              <div className="relative">
                <textarea
                  value={certificateDescription}
                  onChange={(e) => setCertificateDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows="3"
                  placeholder="In this course you will learn how to build a space to a 3-dimensional product..."
                />
                <button className="absolute right-3 top-3 text-orange-500 hover:text-orange-600" type="button" aria-label="edit">
                  <FiEdit className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end">
              <button
                onClick={handleSaveCourse}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 sm:px-6 py-2 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg text-xs sm:text-sm"
                disabled={!courseName || (!coverImage && !selectedCourseId)}
              >
                Save
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
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-red-600 text-xs sm:text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Courses;