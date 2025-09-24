import React, { useState, useEffect } from "react";
import { FaSearch, FaBell, FaPlus } from "react-icons/fa";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import profilePic from "../../../assets/images/Profile Picture (1).svg";
import classroomImage from "../../../assets/images/classrom.svg";
import {
  fetchAllLessonsById,
  addLesson,
  updateLesson,
  deleteLesson,
  searchLesson,
} from "../../apis/LessonApi";

const Lessons = () => {
  const location = useLocation();
  const { courseId, subCourseId } = location.state || {};
  const navigate = useNavigate();

  console.log("Lessons component mounted with:", { courseId, subCourseId });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5; // Items per page

  console.log("Initial token from localStorage:", token);

  const [formData, setFormData] = useState({
    lessonName: "",
    lessonLiveClassLink: "",
    lessonDescription: "",
    date: null,
    startTime: null,
    endTime: null,
    videoLink: "",
    introVideoUrl: null,
    _id: null,
  });

  const convertTo12Hour = (time24) => {
    if (!time24) {
      console.warn("convertTo12Hour: No time provided, returning default '10:00 AM'");
      return "10:00 AM";
    }
    try {
      const [hours, minutes] = time24.split(":").slice(0, 2); // Handle "HH:MM" or "HH:MM:SS"
      const hour = parseInt(hours, 10);
      const period = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${period}`;
    } catch (error) {
      console.error("convertTo12Hour: Error parsing time:", time24, error);
      return "10:00 AM";
    }
  };

  const convertTo24Hour = (time12) => {
    if (!time12) {
      console.warn("convertTo24Hour: No time provided, returning default '10:00'");
      return "10:00";
    }
    try {
      const [time, period] = time12.split(" ");
      let [hours, minutes] = time.split(":");
      hours = parseInt(hours, 10);
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      return `${hours.toString().padStart(2, "0")}:${minutes}`;
    } catch (error) {
      console.error("convertTo24Hour: Error parsing time:", time12, error);
      return "10:00";
    }
  };

  const validateFormData = (formData) => {
    if (!formData.lessonName) return "Lesson name is required";
    if (!formData.lessonDescription) return "Lesson description is required";
    // Add more validations if required by the API
    console.log("Form validation passed:", JSON.stringify(formData, null, 2));
    return null;
  };

  useEffect(() => {
    const fetchLessons = async () => {
      if (!token) {
        console.log("No token found, redirecting to login");
        setError("Please log in to view lessons");
        navigate("/login");
        return;
      }
      if (!subCourseId) {
        console.error("Missing subCourseId, redirecting to subcourses");
        setError("Subcourse ID is missing");
        navigate("/subcourses", { state: { courseId } });
        return;
      }

      setLoading(true);
      try {
        console.log("Fetching lessons for subCourseId:", subCourseId, "Page:", currentPage);
        const data = await fetchAllLessonsById(subCourseId, token, currentPage, limit);
        console.log("Lessons fetched:", JSON.stringify(data, null, 2));
        if (Array.isArray(data.data?.lessons)) {
          setLessons(data.data.lessons);
          setTotalPages(Math.ceil(data.data.pagination?.totalLessons / limit) || 1);
        } else {
          console.warn("fetchAllLessonsById did not return an array:", data.data?.lessons);
          setLessons([]);
          setTotalPages(1);
          toast.info("No lessons found.");
        }
      } catch (err) {
        console.error("Error fetching lessons:", err);
        if (err.message.includes("Invalid token") || err.status === 401) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setError("Failed to fetch lessons");
          toast.error("Failed to fetch lessons. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [token, navigate, subCourseId, courseId, currentPage]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    console.log(`Input changed: ${name} =`, files ? files[0] : value);
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleDateTimeChange = (field, dateTime) => {
    console.log(`DateTime changed: ${field} =`, dateTime);
    setFormData((prev) => ({
      ...prev,
      [field]: dateTime,
    }));
  };

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    console.log("Search query changed:", query);
    setCurrentPage(1); // Reset to first page on search

    if (!token) {
      console.log("No token found, redirecting to login");
      setError("Please log in to search lessons");
      navigate("/login");
      return;
    }

    try {
      if (query.trim() === "") {
        console.log("Fetching all lessons for subCourseId:", subCourseId);
        const data = await fetchAllLessonsById(subCourseId, token, 1, limit);
        console.log("Fetched lessons by subCourseId:", JSON.stringify(data, null, 2));
        if (Array.isArray(data.data?.lessons)) {
          setLessons(data.data.lessons);
          setTotalPages(Math.ceil(data.data.pagination?.totalLessons / limit) || 1);
        } else {
          console.warn("fetchAllLessonsById did not return an array:", data.data?.lessons);
          setLessons([]);
          setTotalPages(1);
          toast.info("No lessons found.");
        }
      } else {
        console.log("Calling searchLesson API with query:", query);
        const response = await searchLesson(query, token, currentPage, limit, subCourseId);
        console.log("Search results:", JSON.stringify(response, null, 2));
        if (Array.isArray(response.data)) {
          setLessons(response.data);
          setTotalPages(Math.ceil(response.data.length / limit) || 1);
        } else {
          console.warn("Search API did not return an array:", response.data);
          setLessons([]);
          setTotalPages(1);
          toast.info("No lessons found for the search query.");
        }
      }
    } catch (err) {
      console.error("Error searching lessons:", err);
      if (err.message.includes("Invalid token") || err.status === 401) {
        console.log("Invalid or expired token, redirecting to login");
        setError("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Failed to search lessons");
        console.error("Search lesson error:", JSON.stringify(err.response?.data || err, null, 2));
        toast.error("Failed to search lessons. Please try again.");
      }
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    console.log("Starting handleAddLesson with token:", token);
    console.log("Form data before validation:", JSON.stringify(formData, null, 2));

    const validationError = validateFormData(formData);
    if (validationError) {
      console.error("Validation error:", validationError);
      setError(validationError);
      toast.error(validationError);
      return;
    }

    if (!token) {
      console.log("No token found, redirecting to login");
      setError("Please log in to add a lesson");
      navigate("/login");
      return;
    }
    if (!courseId || !subCourseId) {
      console.error("Missing courseId or subCourseId:", { courseId, subCourseId });
      setError("Course or subcourse ID is missing");
      toast.error("Course or subcourse ID is missing");
      return;
    }

    try {
      console.log("Preparing FormData for submission");
      const formDataToSend = new FormData();
      formDataToSend.append("lessonName", formData.lessonName || "");
      formDataToSend.append("classLink", formData.lessonLiveClassLink || "");
      formDataToSend.append("description", formData.lessonDescription || "");

      // Always send date, startTime, and endTime, even if empty
      if (formData.date) {
        const formattedDate = `${formData.date.getFullYear()}-${(formData.date.getMonth() + 1).toString().padStart(2, "0")}-${formData.date.getDate().toString().padStart(2, "0")}`;
        formDataToSend.append("date", formattedDate);
        console.log("Formatted date for submission:", formattedDate);
      } else {
        console.log("No date provided, sending empty string for date");
        formDataToSend.append("date", "");
      }

      if (formData.startTime) {
        const formattedStartTime = convertTo24Hour(formData.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
        formDataToSend.append("startTime", formattedStartTime);
        console.log("Formatted startTime for submission:", formattedStartTime);
      } else {
        console.log("No startTime provided, sending empty string for startTime");
        formDataToSend.append("startTime", "");
      }

      if (formData.endTime) {
        const formattedEndTime = convertTo24Hour(formData.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
        formDataToSend.append("endTime", formattedEndTime);
        console.log("Formatted endTime for submission:", formattedEndTime);
      } else {
        console.log("No endTime provided, sending empty string for endTime");
        formDataToSend.append("endTime", "");
      }

      formDataToSend.append("recordedVideoLink", formData.videoLink || "");
      if (formData.introVideoUrl) {
        console.log("Appending introVideoUrl:", formData.introVideoUrl);
        formDataToSend.append("introVideoUrl", formData.introVideoUrl);
      } else {
        console.log("No introVideoUrl provided, sending empty string for introVideoUrl");
        formDataToSend.append("introVideoUrl", "");
      }
      formDataToSend.append("courseId", courseId || "");
      formDataToSend.append("subcourseId", subCourseId || "");

      // Log FormData entries
      console.log("FormData entries:", Object.fromEntries(formDataToSend.entries()));

      console.log("Calling addLesson API");
      const response = await addLesson(formDataToSend, token);
      console.log("Lesson added successfully, response:", JSON.stringify(response, null, 2));

      setLessons((prev) => {
        const updatedLessons = [...prev, response.data];
        const startIndex = (currentPage - 1) * limit;
        return updatedLessons.slice(startIndex, startIndex + limit);
      });
      setTotalPages(Math.ceil((lessons.length + 1) / limit));
      setIsModalOpen(false);
      toast.success("Lesson added successfully!");

      console.log("Resetting form data");
      setFormData({
        lessonName: "",
        lessonLiveClassLink: "",
        lessonDescription: "",
        date: null,
        startTime: null,
        endTime: null,
        videoLink: "",
        introVideoUrl: null,
        _id: null,
      });
    } catch (error) {
      console.error("Error in handleAddLesson:", error);
      if (error.message.includes("Invalid token") || error.status === 401) {
        console.log("Invalid or expired token, redirecting to login");
        setError("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        const errorMessage = error.response?.data?.message || error.message;
        console.error("Add lesson error details:", JSON.stringify(error.response?.data || error, null, 2));
        setError("Failed to add lesson: " + errorMessage);
        toast.error("Failed to add lesson: " + errorMessage);
      }
    }
  };

  const handleUpdateLesson = async (lessonId) => {
    console.log("Starting handleUpdateLesson with ID:", lessonId, "and token:", token);
    console.log("Form data before validation:", JSON.stringify(formData, null, 2));

    const validationError = validateFormData(formData);
    if (validationError) {
      console.error("Validation error:", validationError);
      setError(validationError);
      toast.error(validationError);
      return;
    }

    if (!token) {
      console.log("No token found, redirecting to login");
      setError("Please log in to update a lesson");
      navigate("/login");
      return;
    }

    try {
      console.log("Preparing FormData for update");
      const formDataToSend = new FormData();
      formDataToSend.append("lessonName", formData.lessonName || "");
      formDataToSend.append("classLink", formData.lessonLiveClassLink || "");
      formDataToSend.append("description", formData.lessonDescription || "");

      // Always send date, startTime, and endTime, even if empty
      if (formData.date) {
        const formattedDate = `${formData.date.getFullYear()}-${(formData.date.getMonth() + 1).toString().padStart(2, "0")}-${formData.date.getDate().toString().padStart(2, "0")}`;
        formDataToSend.append("date", formattedDate);
        console.log("Formatted date for update:", formattedDate);
      } else {
        console.log("No date provided, sending empty string for date");
        formDataToSend.append("date", "");
      }

      if (formData.startTime) {
        const formattedStartTime = convertTo24Hour(formData.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
        formDataToSend.append("startTime", formattedStartTime);
        console.log("Formatted startTime for update:", formattedStartTime);
      } else {
        console.log("No startTime provided, sending empty string for startTime");
        formDataToSend.append("startTime", "");
      }

      if (formData.endTime) {
        const formattedEndTime = convertTo24Hour(formData.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
        formDataToSend.append("endTime", formattedEndTime);
        console.log("Formatted endTime for update:", formattedEndTime);
      } else {
        console.log("No endTime provided, sending empty string for endTime");
        formDataToSend.append("endTime", "");
      }

      formDataToSend.append("recordedVideoLink", formData.videoLink || "");
      if (formData.introVideoUrl) {
        console.log("Appending introVideoUrl:", formData.introVideoUrl);
        formDataToSend.append("introVideoUrl", formData.introVideoUrl);
      } else {
        console.log("No introVideoUrl provided, sending empty string for introVideoUrl");
        formDataToSend.append("introVideoUrl", "");
      }

      // Log FormData entries
      console.log("FormData entries for update:", Object.fromEntries(formDataToSend.entries()));

      console.log("Calling updateLesson API");
      const response = await updateLesson(lessonId, formDataToSend, token);
      console.log("Lesson updated successfully:", JSON.stringify(response, null, 2));

      setLessons((prev) => {
        const updatedLessons = prev.map((lesson) =>
          (lesson._id || lesson.lessonId) === lessonId ? response.data : lesson
        );
        const startIndex = (currentPage - 1) * limit;
        return updatedLessons.slice(startIndex, startIndex + limit);
      });
      setIsModalOpen(false);
      toast.success("Lesson updated successfully!");

      console.log("Resetting form data after update");
      setFormData({
        lessonName: "",
        lessonLiveClassLink: "",
        lessonDescription: "",
        date: null,
        startTime: null,
        endTime: null,
        videoLink: "",
        introVideoUrl: null,
        _id: null,
      });
    } catch (err) {
      console.error("Error updating lesson:", err);
      if (err.message.includes("Invalid token") || err.status === 401) {
        console.log("Invalid or expired token, redirecting to login");
        setError("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        const errorMessage = err.response?.data?.message || err.message;
        console.error("Update lesson error details:", JSON.stringify(err.response?.data || err, null, 2));
        setError("Failed to update lesson: " + errorMessage);
        toast.error("Failed to update lesson: " + errorMessage);
      }
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    console.log("Starting handleDeleteLesson with ID:", lessonId, "and token:", token);
    if (!token) {
      console.log("No token found, redirecting to login");
      setError("Please log in to delete a lesson");
      navigate("/login");
      return;
    }
    try {
      console.log("Calling deleteLesson API");
      await deleteLesson(lessonId, token);
      console.log("Lesson deleted successfully:", lessonId);
      setLessons((prev) => {
        const updatedLessons = prev.filter((lesson) => (lesson._id || lesson.lessonId) !== lessonId);
        const startIndex = (currentPage - 1) * limit;
        if (updatedLessons.length <= startIndex && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        }
        setTotalPages(Math.ceil(updatedLessons.length / limit) || 1);
        return updatedLessons.slice(startIndex, startIndex + limit);
      });
      setIsDeleteModalOpen(false);
      toast.success("Lesson deleted successfully!");
    } catch (err) {
      console.error("Error deleting lesson:", err);
      if (err.message.includes("Invalid token") || err.status === 401) {
        console.log("Invalid or expired token, redirecting to login");
        setError("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        const errorMessage = err.response?.data?.message || err.message;
        console.error("Delete lesson error details:", JSON.stringify(err.response?.data || err, null, 2));
        setError("Failed to delete lesson: " + errorMessage);
        toast.error("Failed to delete lesson: " + errorMessage);
      }
    }
  };

  const handleEditLesson = (lesson) => {
    console.log("Editing lesson, raw lesson object:", JSON.stringify(lesson, null, 2));

    // Helper function to parse time strings into Date objects
    const parseTimeToDate = (timeStr) => {
      if (!timeStr) {
        console.warn("parseTimeToDate: No time string provided, returning null");
        return null;
      }
      try {
        let hours, minutes;
        // Handle formats: "HH:MM AM/PM", "HH:MM", "HH:MM:SS"
        if (timeStr.includes(":")) {
          if (timeStr.includes("AM") || timeStr.includes("PM")) {
            const [time, period] = timeStr.split(" ");
            [hours, minutes] = time.split(":").map(Number);
            if (period === "PM" && hours !== 12) hours += 12;
            if (period === "AM" && hours === 12) hours = 0;
          } else {
            [hours, minutes] = timeStr.split(":").slice(0, 2).map(Number);
          }
        } else {
          console.warn("parseTimeToDate: Invalid time format:", timeStr);
          return null;
        }
        if (isNaN(hours) || isNaN(minutes)) {
          console.warn("parseTimeToDate: Invalid time values:", timeStr);
          return null;
        }
        const date = new Date(1970, 0, 1);
        date.setHours(hours);
        date.setMinutes(minutes);
        return date;
      } catch (error) {
        console.error("parseTimeToDate: Error parsing time:", timeStr, error);
        return null;
      }
    };

    // Helper function to parse date strings
    const parseDate = (dateStr) => {
      if (!dateStr) {
        console.warn("parseDate: No date string provided, returning null");
        return null;
      }
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          console.warn("parseDate: Invalid date format:", dateStr);
          return null;
        }
        return date;
      } catch (error) {
        console.error("parseDate: Error parsing date:", dateStr, error);
        return null;
      }
    };

    // Standardize lesson object properties with fallback values
    const newFormData = {
      _id: lesson._id || lesson.lessonId || "",
      lessonName: lesson.lessonName || lesson.name || "",
      lessonLiveClassLink: lesson.classLink || lesson.lessonLiveClassLink || "",
      lessonDescription: lesson.description || lesson.lessonDescription || "",
      date: parseDate(lesson.date),
      startTime: parseTimeToDate(lesson.startTime),
      endTime: parseTimeToDate(lesson.endTime),
      videoLink: lesson.recordedVideoLink || lesson.videoLink || "",
      introVideoUrl: lesson.introVideoUrl || null,
    };

    // Warn if expected fields are missing
    if (!lesson.classLink && !lesson.lessonLiveClassLink) {
      console.warn("Lesson object missing classLink/lessonLiveClassLink");
    }
    if (!lesson.date) {
      console.warn("Lesson object missing date");
    }
    if (!lesson.startTime) {
      console.warn("Lesson object missing startTime");
    }
    if (!lesson.endTime) {
      console.warn("Lesson object missing endTime");
    }
    if (!lesson.recordedVideoLink && !lesson.videoLink) {
      console.warn("Lesson object missing recordedVideoLink/videoLink");
    }
    if (!lesson.introVideoUrl) {
      console.warn("Lesson object missing introVideoUrl");
    }

    console.log("Form data set for edit:", JSON.stringify(newFormData, null, 2));
    setFormData(newFormData);
    setIsModalOpen(true);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  console.log("Rendering with formData:", JSON.stringify(formData, null, 2));

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Lessons</h1>
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">
            Mon, <span className="font-semibold">05:10 PM IST</span>
          </span>
          <div className="relative">
            <FaBell
              className="w-6 h-6 text-gray-500 cursor-pointer"
              onClick={() => navigate("/notifications")}
            />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></div>
          </div>
          <img
            src={profilePic}
            alt="profile"
            className="w-8 sm:w-10 h-8 sm:h-10 rounded-full object-cover"
          />
        </div>
      </div>

      <div>
        <div className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={() => navigate(`/subcourse/${subCourseId}`, { state: { courseId, subCourseId } })}
              className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition whitespace-nowrap bg-white text-xs sm:text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-md w-full bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs sm:text-sm"
              />
            </div>
            <button
              onClick={() => {
                console.log("Opening modal to add lesson");
                setFormData({
                  lessonName: "",
                  lessonLiveClassLink: "",
                  lessonDescription: "",
                  date: null,
                  startTime: null,
                  endTime: null,
                  videoLink: "",
                  introVideoUrl: null,
                  _id: null,
                });
                setIsModalOpen(true);
              }}
              className="bg-gradient-to-r from-[#003E54] to-[#0090b2] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-md flex items-center gap-2 hover:from-[#002a3a] hover:to-[#007a94] transition whitespace-nowrap font-medium text-xs sm:text-sm"
            >
              Add Lessons <FaPlus />
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-base sm:text-lg font-medium text-gray-800 mb-3">Lessons</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="bg-yellow-400 py-3 sm:py-4 px-4 text-center text-white font-semibold text-xs sm:text-sm">S.N.</th>
                  <th className="bg-yellow-400 py-3 sm:py-4 px-4 text-center text-white font-semibold text-xs sm:text-sm">Lesson Name</th>
                  <th className="bg-yellow-400 py-3 sm:py-4 px-4 text-center text-white font-semibold text-xs sm:text-sm">Lesson Duration</th>
                  <th className="bg-yellow-400 py-3 sm:py-4 px-4 text-center text-white font-semibold text-xs sm:text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {lessons.slice(0, limit).map((lesson, index) => (
                  <tr key={lesson._id || lesson.lessonId} className="hover:bg-gray-50 transition border-b border-gray-100">
                    <td className="py-3 sm:py-4 px-4 text-center text-xs sm:text-sm font-medium">
                      {(currentPage - 1) * limit + index + 1}
                    </td>
                    <td className="py-3 sm:py-4 px-4 text-center text-xs sm:text-sm">{lesson.lessonName || "N/A"}</td>
                    <td className="py-3 sm:py-4 px-4 text-center text-xs sm:text-sm text-gray-600">{lesson.duration || "N/A"}</td>
                    <td className="py-3 sm:py-4 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEditLesson(lesson)}
                          className="bg-[#FF8800] p-2 sm:p-2.5 rounded text-white hover:bg-[#e67a00] transition shadow-sm"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            console.log("Opening delete confirmation for lesson:", lesson._id || lesson.lessonId);
                            setLessonToDelete(lesson._id || lesson.lessonId);
                            setIsDeleteModalOpen(true);
                          }}
                          className="bg-[#FF8800] p-2 sm:p-2.5 rounded text-white hover:bg-[#e67a00] transition shadow-sm"
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
      </div>
      <div className="flex justify-center items-center gap-2 mt-4">
        <button
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
          className={`px-3 py-1 rounded ${currentPage <= 1 ? "bg-gray-300 cursor-not-allowed" : "bg-orange-500 text-white hover:bg-orange-600"}`}
        >
          Prev
        </button>
        <span className="px-2 text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <button
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
          className={`px-3 py-1 rounded ${currentPage >= totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-orange-500 text-white hover:bg-orange-600"}`}
        >
          Next
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 z-50 p-4 sm:p-0">
          <div
            className="bg-white w-full max-w-[95%] sm:max-w-[90%] md:max-w-[80%] lg:max-w-[600px] xl:max-w-[700px] 2xl:max-w-[800px] h-auto max-h-[90vh] p-4 sm:p-6 md:p-8 rounded-xl shadow-xl overflow-y-auto fixed right-0 top-0"
            style={{ transform: isModalOpen ? "translateX(0)" : "translateX(100%)", transition: "transform 300ms ease-in-out" }}
          >
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <img
                  src={classroomImage}
                  alt="Classroom"
                  className="w-12 sm:w-16 h-12 sm:h-16 rounded-md object-cover"
                />
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">
                  {formData._id ? "Edit Lesson" : "Add New Lesson"}
                </h3>
              </div>
              <button
                onClick={() => {
                  console.log("Closing modal, resetting formData");
                  setIsModalOpen(false);
                  setFormData({
                    lessonName: "",
                    lessonLiveClassLink: "",
                    lessonDescription: "",
                    date: null,
                    startTime: null,
                    endTime: null,
                    videoLink: "",
                    introVideoUrl: null,
                    _id: null,
                  });
                }}
                className="text-gray-500 hover:text-gray-700 text-lg sm:text-xl md:text-2xl transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">LESSON NAME</label>
                <div className="relative">
                  <input
                    type="text"
                    name="lessonName"
                    value={formData.lessonName || ""}
                    onChange={handleInputChange}
                    placeholder="Foundations of Modern Finance"
                    className="w-full pr-10 px-3 py-2 sm:py-2.5 border border-orange-500 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                  />
                  <FiEdit className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer" aria-label="edit lesson name" />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">LESSON LIVE CLASS LINK</label>
                <div className="relative">
                  <input
                    type="text"
                    name="lessonLiveClassLink"
                    value={formData.lessonLiveClassLink || ""}
                    onChange={handleInputChange}
                    placeholder="https://zoom.us/j/1234?pwd=abcdghi"
                    className="w-full pr-10 px-3 py-2 sm:py-2.5 border border-orange-500 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                  />
                  <FiEdit className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer" aria-label="edit class link" />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">LESSON DESCRIPTION</label>
                <div className="relative">
                  <textarea
                    name="lessonDescription"
                    value={formData.lessonDescription || ""}
                    onChange={handleInputChange}
                    placeholder="In this course you will learn how to build..."
                    rows="3"
                    className="w-full pr-10 px-3 py-2 sm:py-2.5 border border-orange-500 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                  />
                  <FiEdit className="absolute right-3 top-3 text-gray-500 cursor-pointer" aria-label="edit description" />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">DATE (Optional)</label>
                <div className="relative">
                  <DatePicker
                    selected={formData.date}
                    onChange={(date) => handleDateTimeChange("date", date)}
                    className="w-full px-3 py-2 sm:py-2.5 border border-orange-500 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                    placeholderText="Select date"
                    dateFormat="yyyy-MM-dd"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">STARTING TIME (Optional)</label>
                <div className="relative">
                  <DatePicker
                    selected={formData.startTime}
                    onChange={(time) => handleDateTimeChange("startTime", time)}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    className="w-full px-3 py-2 sm:py-2.5 border border-orange-500 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                    placeholderText="Select start time"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">ENDING TIME (Optional)</label>
                <div className="relative">
                  <DatePicker
                    selected={formData.endTime}
                    onChange={(time) => handleDateTimeChange("endTime", time)}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    className="w-full px-3 py-2 sm:py-2.5 border border-orange-500 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                    placeholderText="Select end time"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">UPLOAD RECORDED VIDEO LINK</label>
                <div className="relative">
                  <input
                    type="text"
                    name="videoLink"
                    value={formData.videoLink || ""}
                    onChange={handleInputChange}
                    placeholder="https://zoom.us/j/1234?pwd=abcdghi"
                    className="w-full pr-10 px-3 py-2 sm:py-2.5 border border-orange-500 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                  />
                  <FiEdit className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer" aria-label="edit video link" />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">INTRO VIDEO URL</label>
                {formData.introVideoUrl && typeof formData.introVideoUrl === "string" && (
                  <div className="mb-2">
                    <a
                      href={formData.introVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline text-sm"
                    >
                      View Current Video
                    </a>
                  </div>
                )}
                <div className="relative">
                  <input
                    type="file"
                    name="introVideoUrl"
                    accept="video/*"
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 sm:py-2.5 border border-orange-500 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    console.log("Closing modal, resetting formData");
                    setIsModalOpen(false);
                    setFormData({
                      lessonName: "",
                      lessonLiveClassLink: "",
                      lessonDescription: "",
                      date: null,
                      startTime: null,
                      endTime: null,
                      videoLink: "",
                      introVideoUrl: null,
                      _id: null,
                    });
                  }}
                  className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition text-xs sm:text-sm md:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={formData._id ? () => handleUpdateLesson(formData._id) : handleAddLesson}
                  className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition text-xs sm:text-sm md:text-base"
                >
                  {formData._id ? "Update Lesson" : "Save Details"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex justify-center items-center z-50 p-4 sm:p-0">
          <div className="bg-white w-full max-w-[95%] sm:max-w-[400px] md:max-w-[450px] p-4 sm:p-6 rounded-xl shadow-xl">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-6">Are you sure you want to delete this lesson?</p>
            <div className="flex justify-end gap-3 sm:gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition text-xs sm:text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteLesson(lessonToDelete)}
                className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition text-xs sm:text-sm md:text-base"
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
export default Lessons;