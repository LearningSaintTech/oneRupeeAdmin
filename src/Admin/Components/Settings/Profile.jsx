import React, { useState, useEffect } from "react";
import { FaSearch, FaBell, FaCamera } from "react-icons/fa";
import profilePic from "../../../assets/images/Profile Picture (1).svg";
import learningSaint from "../../../assets/images/learning-saint.svg";
import ellipse from "../../../assets/images/ellipse.svg";
import threeDgirl from "../../../assets/images/3dgirl.svg";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fetchAdminProfile, updateAdminProfile } from "../../apis/ProfileApi";
import { useSelector, useDispatch } from "react-redux";
import {
  selectToken,
  selectProfile,
  setProfile,
} from "../../redux/GlobalSlice";

const Profile = () => {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const reduxProfile = useSelector(selectProfile);

  // ✅ Local state for editing (starts from Redux profile)
  const [profileData, setProfileData] = useState(reduxProfile || {});
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Keep local form in sync with redux
  useEffect(() => {
    if (reduxProfile) {
      setProfileData({
        ...reduxProfile,
        dob: reduxProfile.dob ? new Date(reduxProfile.dob) : null, // ✅ Ensure dob is Date
      });
    }
  }, [reduxProfile]);

  // Update current date and time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch profile on mount
  useEffect(() => {
    const getProfile = async () => {
      try {
        const data = await fetchAdminProfile(token);
        console.log("✅ Fetched Profile Data:", data);

        const profileObj = {
          firstName: data.profile.firstName || "",
          lastName: data.profile.lastName || "",
          dob: data.profile.dob ? new Date(data.profile.dob) : null,
          gender: data.profile.gender || "",
          address: data.profile.address || "",
          city: data.profile.city || "",
          pinCode: data.profile.pinCode || "",
          state: data.profile.state || "",
          email: data.profile.email || "",
          mobileNumber: data.mobileNumber || "",
          profileImageUrl: data.profile.profileImageUrl || "",
          profileImageFile: null,
        };

        dispatch(setProfile(profileObj)); // ✅ save in Redux
        localStorage.setItem("profile", JSON.stringify(profileObj)); // ✅ also save local
      } catch (err) {
        console.error("❌ Error fetching profile:", err);
      }
    };

    if (token) getProfile();
  }, [token, dispatch]);

  // Handle text input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle date change
  const handleDateChange = (date) => {
    setProfileData((prev) => ({ ...prev, dob: date }));
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData((prev) => ({
        ...prev,
        profileImageFile: file,
        profileImageUrl: URL.createObjectURL(file), // preview
      }));
    }
  };

  // Save updated profile
  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("firstName", profileData.firstName || "");
      formData.append("lastName", profileData.lastName || "");
      formData.append(
        "dob",
        profileData.dob instanceof Date
          ? profileData.dob.toISOString().split("T")[0]
          : ""
      );
      formData.append("gender", profileData.gender || "");
      formData.append("address", profileData.address || "");
      formData.append("city", profileData.city || "");
      formData.append("pinCode", profileData.pinCode || "");
      formData.append("state", profileData.state || "");
      formData.append("email", profileData.email || "");
      formData.append("mobileNumber", profileData.mobileNumber || "");

      if (profileData.profileImageFile) {
        formData.append("profileImageUrl", profileData.profileImageFile);
      }

      const updated = await updateAdminProfile(formData, token);
      console.log("✅ Profile Updated Successfully:", updated);

      const updatedProfile = {
        ...updated.profile,
        mobileNumber: updated.mobileNumber || profileData.mobileNumber,
        profileImageUrl:
          updated.profile.profileImageUrl || profileData.profileImageUrl,
        dob: updated.profile.dob ? new Date(updated.profile.dob) : null,
        profileImageFile: null,
      };

      dispatch(setProfile(updatedProfile)); // ✅ update redux
      setProfileData(updatedProfile);
      localStorage.setItem("profile", JSON.stringify(updatedProfile)); // ✅ update local

      alert("Profile updated successfully!");
    } catch (err) {
      console.error("❌ Error updating profile:", err);
      alert("Error updating profile! Check console.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
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
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-64 bg-white"
            />
          </div>
          <div className="relative">
            <FaBell className="text-gray-600 text-xl cursor-pointer" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></div>
          </div>
          <img
            src={reduxProfile?.profileImageUrl || profilePic}
            alt="profile"
            className="w-10 h-10 rounded-full object-cover"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
        {/* Banner */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-300 p-6 relative">
          <div className="flex justify-between items-center">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                  {profileData.profileImageUrl ? (
                    <img
                      src={profileData.profileImageUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <img
                        src={ellipse}
                        alt="sage icon"
                        className="w-full h-full object-cover opacity-30"
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-gray-600 text-4xl font-semibold z-10">
                        {profileData.firstName
                          ? profileData.firstName[0].toUpperCase()
                          : "A"}
                        {profileData.lastName
                          ? profileData.lastName[0].toUpperCase()
                          : "S"}
                      </span>
                    </>
                  )}
                </div>
                <label className="absolute bottom-2 right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-600 transition z-20">
                  <FaCamera className="text-white text-sm" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              <h2 className="text-2xl font-bold text-white">
                {profileData.firstName} {profileData.lastName}
              </h2>
            </div>
            <div className="flex flex-col items-end gap-2">
              <img src={learningSaint} alt="LEARNING SAINT" className="h-32" />
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Personal
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={profileData.firstName || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={profileData.lastName || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <DatePicker
                    selected={profileData.dob}
                    onChange={handleDateChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholderText="Select date of birth"
                    dateFormat="dd/MM/yyyy"
                    showYearDropdown
                    yearDropdownItemNumber={100}
                    scrollableYearDropdown
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={profileData.gender || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={profileData.address || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={profileData.city || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pin Code
                  </label>
                  <input
                    type="text"
                    name="pinCode"
                    value={profileData.pinCode || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={profileData.state || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Contact
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="mobileNumber"
                  value={profileData.mobileNumber || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8">
            <button
              onClick={handleSave}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 px-8 rounded-lg font-semibold hover:from-orange-600 hover:to-yellow-600 transition"
            >
              Save
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 right-8 w-[127px] h-[243px]">
          <img
            src={threeDgirl}
            alt="3D girl character"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
