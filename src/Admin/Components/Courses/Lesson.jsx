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
  searchLesson
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
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };

  const convertTo24Hour = (time12) => {
    if (!time12) {
      console.warn("convertTo24Hour: No time provided, returning default '10:00'");
      return "10:00";
    }
    const [time, period] = time12.split(" ");
    let [hours, minutes] = time.split(":");
    hours = parseInt(hours, 10);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  };

  useEffect(() => {
    const fetchLessons = async () => {
      console.log("Fetching lessons for subCourseId:", subCourseId, "with token:", token);
      if (!token) {
        console.log("No token found, redirecting to login");
        setError("Please log in to view lessons");
        setLoading(false);
        navigate("/login");
        return;
      }
      if (!subCourseId) {
        console.log("No subCourseId found, redirecting to subcourses");
        setError("Subcourse ID is missing");
        setLoading(false);
        navigate("/subcourses", { state: { courseId } });
        return;
      }
      try {
        const data = await fetchAllLessonsById(subCourseId, token);
        console.log("Lessons fetched successfully:", data);
        setLessons(data.data || []);
      } catch (err) {
        console.error("Error fetching lessons:", err);
        if (err.message.includes("Invalid token") || err.status === 401) {
          console.log("Invalid or expired token, redirecting to login");
          setError("Session expired. Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setError("Failed to fetch lessons");
          console.error("Fetch lessons error:", err.response?.data || err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, [token, navigate, subCourseId, courseId]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    console.log(`Input changed: ${name} =`, files ? files[0] : value);
    setFormData((prev) => {
      if (name === "introVideoUrl" && files) {
        return { ...prev, introVideoUrl: files[0] };
      }
      return { ...prev, [name]: value };
    });
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

    if (!token) {
      console.log("No token found, redirecting to login");
      setError("Please log in to search lessons");
      navigate("/login");
      return;
    }

    if (query.trim() === "") {
      try {
        const data = await fetchAllLessonsById(subCourseId, token);
        console.log("Fetched lessons by subCourseId due to empty search query:", data);
        setLessons(data.data || []);
      } catch (err) {
        console.error("Error fetching lessons:", err);
        if (err.message.includes("Invalid token") || err.status === 401) {
          console.log("Invalid or expired token, redirecting to login");
          setError("Session expired. Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setError("Failed to fetch lessons");
          console.error("Fetch lessons error:", err.response?.data || err);
        }
      }
      return;
    }

    try {
      console.log("Calling searchLesson API with query:", query);
      const response = await searchLesson(query, token);
      console.log("Search results:", response);
      setLessons(response.data || []);
    } catch (err) {
      console.error("Error searching lessons:", err);
      if (err.message.includes("Invalid token") || err.status === 401) {
        console.log("Invalid or expired token, redirecting to login");
        setError("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Failed to search lessons");
        console.error("Search lesson error:", err.response?.data || err);
      }
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    console.log("Starting handleAddLesson with token:", token);
    console.log("Form data before validation:", formData);

    if (!token) {
      console.log("No token found, redirecting to login");
      setError("Please log in to add a lesson");
      navigate("/login");
      return;
    }
    if (!courseId || !subCourseId) {
      console.error("Missing courseId or subCourseId:", { courseId, subCourseId });
      setError("Course or subcourse ID is missing");
      return;
    }
    if (!formData.lessonName || !formData.date) {
      console.error("Required fields missing:", {
        lessonName: formData.lessonName,
        date: formData.date,
      });
      setError("Lesson name and date are required");
      return;
    }

    try {
      console.log("Preparing FormData for submission");
      const formDataToSend = new FormData();
      formDataToSend.append("lessonName", formData.lessonName);
      formDataToSend.append("classLink", formData.lessonLiveClassLink);
      formDataToSend.append("description", formData.lessonDescription);
      formDataToSend.append("date", formData.date ? formData.date.toISOString().split("T")[0] : "");
      formDataToSend.append("startTime", formData.startTime ? convertTo24Hour(formData.startTime.toLocaleTimeString()) : "10:00");
      formDataToSend.append("endTime", formData.endTime ? convertTo24Hour(formData.endTime.toLocaleTimeString()) : "11:00");
      formDataToSend.append("recordedVideoLink", formData.videoLink);
      if (formData.introVideoUrl) {
        console.log("Appending introVideoUrl:", formData.introVideoUrl);
        formDataToSend.append("introVideoUrl", formData.introVideoUrl);
      }
      formDataToSend.append("courseId", courseId);
      formDataToSend.append("subcourseId", subCourseId);

      console.log(
        "Form data being sent:",
        Object.fromEntries(formDataToSend.entries())
      );

      console.log("Calling addLesson API");
      const response = await addLesson(formDataToSend, token);
      console.log("Lesson added successfully, response:", response);

      setLessons((prev) => [...prev, response.data]);
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
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      console.error("API error response:", error.response?.data || error);
      if (error.message.includes("Invalid token") || error.status === 401) {
        console.log("Invalid or expired token, redirecting to login");
        setError("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Failed to add lesson: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleUpdateLesson = async (lessonId) => {
    console.log("Starting handleUpdateLesson with ID:", lessonId, "and token:", token);
    if (!token) {
      console.log("No token found, redirecting to login");
      setError("Please log in to update a lesson");
      navigate("/login");
      return;
    }
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("lessonName", formData.lessonName);
      formDataToSend.append("classLink", formData.lessonLiveClassLink);
      formDataToSend.append("description", formData.lessonDescription);
      formDataToSend.append("date", formData.date ? formData.date.toISOString().split("T")[0] : "");
      formDataToSend.append("startTime", formData.startTime ? convertTo24Hour(formData.startTime.toLocaleTimeString()) : "10:00");
      formDataToSend.append("endTime", formData.endTime ? convertTo24Hour(formData.endTime.toLocaleTimeString()) : "11:00");
      formDataToSend.append("recordedVideoLink", formData.videoLink);
      if (formData.introVideoUrl) {
        formDataToSend.append("introVideoUrl", formData.introVideoUrl);
      }
      console.log("Form data for update:", Object.fromEntries(formDataToSend.entries()));
      const response = await updateLesson(lessonId, formDataToSend, token);
      console.log("Lesson updated successfully:", response);
      setLessons((prev) =>
        prev.map((lesson) => (lesson._id === lessonId ? response.data : lesson))
      );
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
    } catch (err) {
      console.error("Error updating lesson:", err);
      if (err.message.includes("Invalid token") || err.status === 401) {
        console.log("Invalid or expired token, redirecting to login");
        setError("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Failed to update lesson");
        console.error("Update lesson error:", err.response?.data || err);
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
      await deleteLesson(lessonId, token);
      console.log("Lesson deleted successfully:", lessonId);
      setLessons((prev) => prev.filter((lesson) => lesson._id !== lessonId));
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error("Error deleting lesson:", err);
      if (err.message.includes("Invalid token") || err.status === 401) {
        console.log("Invalid or expired token, redirecting to login");
        setError("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Failed to delete lesson");
        console.error("Delete lesson error:", err.response?.data || err);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Lessons</h1>
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">
            Thu, <span className="font-semibold">12:38 AM IST</span>
          </span>
          
          <div className="relative">
            {/* <FaBell className="text-gray-600 text-lg sm:text-xl cursor-pointer" /> */}
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

      {/* Main Content */}
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
                setIsModalOpen(true);
              }}
              className="bg-gradient-to-r from-[#003E54] to-[#0090b2] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-md flex items-center gap-2 hover:from-[#002a3a] hover:to-[#007a94] transition whitespace-nowrap font-medium text-xs sm:text-sm"
            >
              Add Lessons <FaPlus />
            </button>
          </div>
        </div>

        {/* Lessons Table Section */}
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
                {lessons.map((lesson, index) => (
                  <tr key={lesson._id || lesson.lessonId} className="hover:bg-gray-50 transition border-b border-gray-100">
                    <td className="py-3 sm:py-4 px-4 text-center text-xs sm:text-sm font-medium">{lesson.SNo || index + 1}</td>
                    <td className="py-3 sm:py-4 px-4 text-center text-xs sm:text-sm">{lesson.lessonName}</td>
                    <td className="py-3 sm:py-4 px-4 text-center text-xs sm:text-sm text-gray-600">{lesson.duration || "N/A"}</td>
                    <td className="py-3 sm:py-4 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
  console.log("Editing lesson:", lesson._id || lesson.lessonId);

  const [startHour, startMinute] = lesson.startTime ? lesson.startTime.split(":") : [];
  const [endHour, endMinute] = lesson.endTime ? lesson.endTime.split(":") : [];

  setFormData({
    _id: lesson._id || lesson.lessonId,
    lessonName: lesson.lessonName,
    lessonLiveClassLink: lesson.classLink || "",
    lessonDescription: lesson.description || "",
    date: lesson.date ? new Date(lesson.date) : null,
    startTime: lesson.startTime ? new Date(1970, 0, 1, startHour, startMinute) : null,
    endTime: lesson.endTime ? new Date(1970, 0, 1, endHour, endMinute) : null,
    videoLink: lesson.recordedVideoLink || "",
    introVideoUrl: null,
  });

  setIsModalOpen(true);
}}

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

      {/* Add/Edit Lesson Modal */}
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
                  console.log("Closing modal");
                  setIsModalOpen(false);
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
                    value={formData.lessonName}
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
                    value={formData.lessonLiveClassLink}
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
                    value={formData.lessonDescription}
                    onChange={handleInputChange}
                    placeholder="In this course you will learn how to build..."
                    rows="3"
                    className="w-full pr-10 px-3 py-2 sm:py-2.5 border border-orange-500 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                  />
                  <FiEdit className="absolute right-3 top-3 text-gray-500 cursor-pointer" aria-label="edit description" />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">DATE</label>
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
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">STARTING TIME</label>
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
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">ENDING TIME</label>
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
                    value={formData.videoLink}
                    onChange={handleInputChange}
                    placeholder="https://zoom.us/j/1234?pwd=abcdghi"
                    className="w-full pr-10 px-3 py-2 sm:py-2.5 border border-orange-500 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                  />
                  <FiEdit className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer" aria-label="edit video link" />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">INTRO VIDEO URL</label>
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
                  onClick={() => setIsModalOpen(false)}
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

      {/* Delete Confirmation Modal */}
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