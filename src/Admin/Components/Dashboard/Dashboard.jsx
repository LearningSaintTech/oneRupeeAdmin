import React, { useEffect, useState } from "react";
import StatCard from "../Dashboard/Statcard.jsx";
import LineGraph from "../Dashboard/Linegraph.jsx";
import { FaBell, FaInfoCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

// ✅ Redux imports
import { selectProfile } from "../../redux/GlobalSlice";
import { selectToken } from "../../redux/Appstore";

// ✅ Import APIs
import {
  getAdminStats,
  getRecentCourses,
  getCourseStatusCount,
} from "../../apis/DashboardApi.js";

// ✅ Assets
import bookIcon from "../../../assets/images/back.svg";
import schoolIcon from "../../../assets/images/student.svg";
import financialIcon from "../../../assets/images/financial.svg";
import defaultProfile from "../../../assets/images/Profile Picture (1).svg";

// ✅ Import calendar package
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Dashboard = () => {
  const token = useSelector(selectToken); // ✅ get token from Redux
  const profileData = useSelector(selectProfile); // ✅ profile from Redux
  const navigate = useNavigate();

  const [stats, setStats] = useState([]);
  const [courseStatus, setCourseStatus] = useState(null);
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Calendar state
  const [selectedDate, setSelectedDate] = useState(new Date());

  // ✅ Fetch stats when token is available
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const adminStats = await getAdminStats(token);
        console.log("📊 Admin Stats Response:", adminStats);

        const statusCount = await getCourseStatusCount(token);
        console.log("📈 Course Status Response:", statusCount);

        const recent = await getRecentCourses(token);
        console.log("📚 Recent Courses Response:", recent);

        // ✅ Prepare Stat Cards
        setStats([
          {
            title: "Total Courses",
            subtitle: `${adminStats.totalCourses} courses`,
            value: adminStats.totalCourses,
            iconSrc: bookIcon,
          },
          {
            title: "Total Learners",
            subtitle: `${adminStats.verifiedUsers} learners`,
            value: adminStats.verifiedUsers,
            iconSrc: schoolIcon,
          },
          {
            title: "Certified Learners",
            subtitle: `${adminStats.certifiedLearners} users`,
            value: adminStats.certifiedLearners,
            iconSrc: financialIcon,
          },
        ]);

        setCourseStatus(statusCount);
        setRecentCourses(recent);
      } catch (error) {
        console.error("❌ Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchStats();
    } else {
      console.warn("⚠️ No token found in Redux, skipping API calls.");
    }
  }, [token]);

  if (loading) {
    return <div className="p-6 text-center">⏳ Loading Dashboard...</div>;
  }

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-gray-100 mb-4">
        <h1 className="text-xl font-normal">Dashboard</h1>
        <div className="flex items-center space-x-4">
          {/* ✅ Date & Time Picker */}
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            showTimeSelect
            timeIntervals={30}
            dateFormat="MMM d, yyyy h:mm aa"
            className="text-lg rounded px-2 py-1"
          />

          {/* <FaBell className="w-6 h-6 text-gray-500" /> */}
          {/* <Route path="/notification" element={<Notification />} /> */}
       <FaBell 
  className="w-6 h-6 text-gray-500 cursor-pointer" 
  onClick={() => navigate("/notifications")} 
/>

          <img
            src={profileData?.profileImageUrl || defaultProfile}
            alt="User"
            className="w-10 h-10 rounded-full cursor-pointer object-cover"
            // onClick={() => navigate("/profile")}
          />
        </div>
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            subtitle={stat.subtitle}
            value={stat.value}
            iconSrc={stat.iconSrc}
            iconSize="w-24 h-24"
          />
        ))}
      </div>

      {/* Graph */}
      <div className="bg-white p-6 rounded-2xl mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Total Learners</h2>
        </div>
        <LineGraph data={{ label: "Learners", currentValue: stats[1]?.value }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ✅ User Stats (Donut + Legend) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-lg font-semibold text-gray-800">User Stats</h3>
            <FaInfoCircle className="w-4 h-4 text-gray-400" />
          </div>

          <div className="flex items-center gap-8">
            {/* Donut Chart */}
            <div className="relative w-32 h-32">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth="12"
                />

                {/* Certified Learners - Dark Teal */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#0f766e"
                  strokeWidth="12"
                  strokeDasharray="251.2"
                  strokeDashoffset={
                    courseStatus
                      ? 251.2 -
                        (courseStatus.certifiedLearner /
                          (courseStatus.certifiedLearner +
                            courseStatus.coursePending +
                            courseStatus.courseCompleted)) *
                          251.2
                      : 251.2
                  }
                  transform="rotate(-90 50 50)"
                />

                {/* Course Pending - Royal Blue */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="12"
                  strokeDasharray="251.2"
                  strokeDashoffset={
                    courseStatus
                      ? 251.2 -
                        ((courseStatus.certifiedLearner +
                          courseStatus.coursePending) /
                          (courseStatus.certifiedLearner +
                            courseStatus.coursePending +
                            courseStatus.courseCompleted)) *
                          251.2
                      : 251.2
                  }
                  transform="rotate(-90 50 50)"
                />

                {/* Course Completed - Orange */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#ea580c"
                  strokeWidth="12"
                  strokeDasharray="251.2"
                  strokeDashoffset="0"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              {/* Center percentage */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-800">
                  {courseStatus
                    ? Math.round(
                        ((courseStatus.certifiedLearner +
                          courseStatus.courseCompleted) /
                          (courseStatus.certifiedLearner +
                            courseStatus.coursePending +
                            courseStatus.courseCompleted)) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>
            {/* Legend */}
            <div className="flex-1 space-y-4">
              {/* Certified Learners */}
              <div className="flex items-center gap-3">
                <div className="w-4 h-0.5 bg-[#0f766e]"></div>
                <div>
                  <p className="text-sm text-gray-500">Certified Learners</p>
                  <p className="text-sm font-bold text-gray-800">
                    {courseStatus?.certifiedLearner?.toLocaleString() || 0} users
                  </p>
                </div>
              </div>
              {/* Course Pending */}
              <div className="flex items-center gap-3">
                <div className="w-4 h-0.5 bg-[#2563eb]"></div>
                <div>
                  <p className="text-sm text-gray-500">Course Pending</p>
                  <p className="text-sm font-bold text-gray-800">
                    {courseStatus?.coursePending?.toLocaleString() || 0} users
                  </p>
                </div>
              </div>
              {/* Course Completed */}
              <div className="flex items-center gap-3">
                <div className="w-4 h-0.5 bg-[#ea580c]"></div>
                <div>
                  <p className="text-sm text-gray-500">Course Completed</p>
                  <p className="text-sm font-bold text-gray-800">
                    {courseStatus?.courseCompleted?.toLocaleString() || 0} users
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recently Added Courses */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Recently Added Courses</h3>
          <div className="space-y-3">
            {recentCourses.map((course, i) => (
              <div key={course._id || i} className="space-y-1">
                <span className="text-sm font-medium text-gray-800">
                  {course.courseName}
                </span>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-blue-700 h-2 rounded-full"
                    style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;