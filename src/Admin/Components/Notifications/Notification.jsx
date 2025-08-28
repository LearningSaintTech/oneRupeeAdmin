import React, { useState, useEffect } from "react";
import { FaSearch, FaBell, FaTimes, FaUpload, FaCheck } from "react-icons/fa";
import { useSelector } from "react-redux"; // ✅ Redux
import { selectProfile } from "../../redux/GlobalSlice"
import profile from "../../../assets/images/Profile Picture (1).svg";
import DatePicker from "react-datepicker"; // ✅ Import react-datepicker
import "react-datepicker/dist/react-datepicker.css"; // ✅ Import datepicker CSS


const Notification = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null); // ✅ State for date picker
  const [currentDateTime, setCurrentDateTime] = useState(new Date()); // ✅ State for dynamic date and time
  const [filteredReminders, setFilteredReminders] = useState([]); // ✅ State for filtered reminders
const profile = useSelector(selectProfile);
  const liveClassReminders = [
    {
      id: 1,
      courseName: "Data Science",
      date: "03/15/2025",
      time: "2:00 PM",
    },
    {
      id: 2,
      courseName: "Applied Mathematics",
      date: "03/15/2025",
      time: "2:00 PM",
    },
    {
      id: 3,
      courseName: "Applied Statistics",
      date: "03/15/2025",
      time: "2:00 PM",
    },
  ];

  // Update current date and time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer); // Cleanup interval on component unmount
  }, []);

  // Filter reminders based on selected date
  useEffect(() => {
    if (selectedDate) {
      const formattedDate = selectedDate
        .toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        })
        .replace(/\//g, "/"); // Format as MM/DD/YYYY to match liveClassReminders
      const filtered = liveClassReminders.filter(
        (reminder) => reminder.date === formattedDate
      );
      setFilteredReminders(filtered);
    } else {
      setFilteredReminders(liveClassReminders); // Show all reminders if no date is selected
    }
  }, [selectedDate]);

  const handleUploadClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Notification</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">
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
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-64 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="relative">
            <FaBell className="text-gray-600 text-xl cursor-pointer" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></div>
          </div>
          <img
            src={profile?.profileImageUrl || profile}
            alt="profile"
            className="w-10 h-10 rounded-full object-cover"
          />
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-8">
        
        
      </div>

      {/* Live Class Reminders Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Live Class Reminders</h2>
        {filteredReminders.length === 0 ? (
          <p className="text-gray-500">No reminders available for the selected date.</p>
        ) : (
          <div className="space-y-4">
            {filteredReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="bg-gray-50 rounded-lg p-6 relative border-l-4 border-orange-500"
              >
                <button className="absolute top-4 left-4 bg-blue-400 hover:bg-blue-500 w-6 h-6 rounded flex items-center justify-center transition">
                  <FaTimes className="text-white text-xs" />
                </button>
                <div className="ml-12">
                  <p className="text-orange-500 font-bold text-lg mb-2">
                    Reminder: Live Class
                  </p>
                  <p className="text-gray-700 text-sm mb-2">
                    Course - {reminder.courseName}
                  </p>
                  <p className="text-gray-700 text-base">
                    Live Class Scheduled on - {reminder.date} ({reminder.time})
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Request</h2>
        <div className="bg-gray-50 rounded-lg p-6 relative border-l-4 border-orange-500">
          <button className="absolute top-4 left-4 bg-blue-400 hover:bg-blue-500 w-6 h-6 rounded flex items-center justify-center transition">
            <FaTimes className="text-white text-xs" />
          </button>
          <div className="ml-12">
            <p className="text-orange-500 font-bold text-lg mb-2">
              Internship Letter Request
            </p>
            <p className="text-gray-700 text-sm mb-2">
              Course - UI/UX Design
            </p>
            <p className="text-gray-700 text-sm mb-2">
              Name - John Deo
            </p>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-green-600 text-sm font-medium">Payment Successful</span>
              <FaCheck className="text-green-600 text-sm" />
            </div>
            <button
              onClick={handleUploadClick}
              className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition flex items-center gap-2"
            >
              Upload
            </button>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-96">
            <div className="text-center">
              {/* File Upload Area */}
              <div className="mb-6">
                <div className="w-full h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center">
                  <FaUpload className="text-gray-400 text-3xl mb-2" />
                  <p className="text-gray-600 font-medium">CHOOSE FILE</p>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  The Image dimension Should be 456 × 216 px
                </p>
              </div>
              {/* Upload Button */}
              <button
                onClick={handleCloseModal}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 px-6 rounded-lg font-medium hover:from-orange-600 hover:to-yellow-600 transition"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;