import React, { useEffect, useState } from "react";
import { FaSearch, FaBell, FaPlus } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import profile from "../../../assets/images/Profile Picture (1).svg";
import DatePicker from "react-datepicker"; // ✅ Import react-datepicker
import "react-datepicker/dist/react-datepicker.css"; // ✅ Import datepicker CSS
import { getPromos, uploadPromo, deletePromo } from "../../apis/PromoApi";
import { useSelector } from "react-redux";
import { selectToken } from "../../redux/Appstore";
import { selectProfile } from "../../redux/GlobalSlice";


const Promo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [promoToDelete, setPromoToDelete] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null); // ✅ State for date picker
  const [currentDateTime, setCurrentDateTime] = useState(new Date()); // ✅ State for dynamic date and time

  const token = useSelector(selectToken);
    const profile = useSelector(selectProfile);
  

  // Update current date and time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer); // Cleanup interval on component unmount
  }, []);

  // 🔹 Fetch promos on mount or when selectedDate changes
  const fetchPromos = async () => {
    try {
      console.log("🔄 Fetching promos with token:", token);
      let data;
      if (selectedDate) {
        // Format date for API (e.g., YYYY-MM-DD)
        const formattedDate = selectedDate.toIpv4String().split("T")[0];
        console.log("🔍 Fetching promos for date:", formattedDate);
        data = await searchPromosByDate(formattedDate, token); // Assume this API exists
      } else {
        data = await getPromos(token);
      }
      console.log("✅ Promo API response:", data);
      setPromos(data || []);
    } catch (error) {
      console.error("❌ Failed to fetch promos:", error);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, [token, selectedDate]);

  // 🔹 Handle save/upload promo
  const handleSave = async () => {
    if (!selectedFile) {
      alert("Please select a file before saving.");
      return;
    }

    try {
      setLoading(true);
      console.log("💾 Uploading promo file:", selectedFile);

      const formData = new FormData();
      formData.append("promo", selectedFile);

      const result = await uploadPromo(formData, token);
      console.log("✅ Promo uploaded successfully:", result);

      await fetchPromos();
      setSelectedFile(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error("❌ Error uploading promo:", error);
      alert("Failed to upload promo. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle delete promo
  const handleDeleteClick = (promoId) => {
    console.log("🗑️ Delete button clicked for promo:", promoId);
    setPromoToDelete(promoId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      console.log("🚀 Confirming delete for promo:", promoToDelete);
      const result = await deletePromo(promoToDelete, token);
      console.log("✅ Promo deleted successfully:", result);

      await fetchPromos();
      setIsDeleteModalOpen(false);
      setPromoToDelete(null);
    } catch (error) {
      console.error("❌ Error deleting promo:", error);
      alert("Failed to delete promo. Please try again.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-semibold text-gray-700">Promo</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {currentDateTime.toLocaleString("en-US", {
              weekday: "short",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
              timeZone: "Asia/Kolkata",
            })}
          </span>
         
          <FaBell className="text-gray-500 text-lg cursor-pointer" />
          <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
            <img               src={profile?.profileImageUrl || profile}
            
            alt="profile" />
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          
        </div>
        
      </div>

      {/* Promo cards */}
      <div className="flex gap-6 flex-wrap">
        {/* Add Promo Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-40 h-40 bg-white border rounded-lg flex flex-col items-center justify-center text-amber-500 hover:bg-gray-100 transition"
        >
          <FaPlus className="text-xl" />
          <span className="mt-2 block text-sm">Add Promo</span>
        </button>

        {/* Dynamic promos from API */}
        {promos.length > 0 ? (
          promos.map((promo) => (
            <div
              key={promo.promoId}
              className="w-80 h-40 bg-gray-200 rounded-lg flex items-center justify-between p-4 relative overflow-hidden"
            >
              <img
                src={promo.promoUrl}
                alt="Promo"
                className="absolute inset-0 w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={() => handleDeleteClick(promo.promoId)}
                className="absolute top-2 right-2 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition"
              >
                <MdDeleteOutline className="text-yellow-400 text-2xl" />
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No promos available.</p>
        )}
      </div>

      {/* Upload Promo Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-md bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-[420px] p-6 rounded-lg shadow-lg relative">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 text-xl"
            >
              ✕
            </button>

            {/* File Upload Box */}
            <div className="border border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center h-40">
              <input
                type="file"
                accept="image/*"
                id="promoFile"
                className="hidden"
                onChange={(e) => {
                  setSelectedFile(e.target.files[0]);
                  console.log("📂 Selected file:", e.target.files[0]);
                }}
              />
              <label
                htmlFor="promoFile"
                className="flex flex-col items-center cursor-pointer"
              >
                <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded">
                  {selectedFile ? (
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <svg
                      className="w-10 h-10 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.414-1.414A1 1 0 0011.586 3H4zm12 4a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1V6h9.586a1 1 0 01.707.293l1.414 1.414a1 1 0 01.293.707z"
                        clipRule="evenodd"
                      />
                      <path d="M11 7a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" />
                    </svg>
                  )}
                </div>
                <div className="text-gray-400 text-sm mt-2">CHOOSE FILE</div>
                <p className="text-xs text-gray-400 mt-1">
                  The image dimension should be 642 × 359 px
                </p>
              </label>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={loading}
              className={`mt-4 w-24 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
              } text-white py-2 rounded-md font-semibold`}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 backdrop-blur-md bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-[420px] p-6 rounded-lg shadow-lg relative">
            {/* Close Button */}
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 text-xl"
            >
              ✕
            </button>

            {/* Delete Confirmation Content */}
            <div className="flex flex-col items-center">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Are you sure you want to delete this promo?
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="w-24 bg-gray-300 text-gray-700 py-2 rounded-md font-semibold hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="w-24 bg-red-500 text-white py-2 rounded-md font-semibold hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Promo;