import React, { useEffect, useState } from "react";
import { FaPlus, FaBell } from "react-icons/fa";
import { MdDeleteOutline, MdEdit } from "react-icons/md";
import profileImg from "../../../assets/images/Profile Picture (1).svg";
import {
  getPromos,
  uploadPromo,
  deletePromo,
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
} from "../../apis/PromoApi";
import { useSelector } from "react-redux";
import { selectToken, selectProfile } from "../../redux/GlobalSlice";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [promos, setPromos] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  // Promo Modal
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [promoFile, setPromoFile] = useState(null);

  // Activity Modal (Add & Edit)
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  const [activityForm, setActivityForm] = useState({
    title: "",
    heading: "",
    description: "",
    link: "",
  });
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  // Delete Modal
  const [deleteType, setDeleteType] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const token = useSelector(selectToken);
  const profile = useSelector(selectProfile);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      fetchPromos();
      fetchActivities();
    }
  }, [token]);

  const fetchPromos = async () => {
    try {
      const data = await getPromos(token);
      setPromos(data || []);
    } catch (err) {
      console.error("Failed to fetch promos", err);
    }
  };

  const fetchActivities = async () => {
    try {
      const data = await getActivities(token);
      setActivities(data || []);
    } catch (err) {
      console.error("Failed to fetch activities", err);
    }
  };

  // Promo Upload
  const handlePromoUpload = async () => {
    if (!promoFile) return alert("Please select an image");
    setLoading(true);
    const formData = new FormData();
    formData.append("promo", promoFile);

    try {
      await uploadPromo(formData, token);
      await fetchPromos();
      setPromoFile(null);
      setIsPromoModalOpen(false);
      alert("Promo uploaded successfully!");
    } catch (err) {
      alert("Failed to upload promo");
    } finally {
      setLoading(false);
    }
  };

  // Open Activity Modal (Add or Edit)
  const openActivityModal = (activity = null) => {
    if (activity) {
      setEditingActivity(activity);
      setActivityForm({
        title: activity.activityTitle || "",
        heading: activity.activityHeading || "",
        description: activity.activityDescription || "",
        link: activity.activityLink || "",
      });
      setBannerPreview(activity.bannerUrl || null);
      setBannerFile(null);
    } else {
      setEditingActivity(null);
      setActivityForm({ title: "", heading: "", description: "", link: "" });
      setBannerFile(null);
      setBannerPreview(null);
    }
    setIsActivityModalOpen(true);
  };

  // Save or Update Activity
  const handleSaveActivity = async () => {
    const { title, heading, description, link } = activityForm;
    if (!title || !heading || !description || !link) {
      return alert("All fields are required");
    }
    if (!bannerFile && !editingActivity) {
      return alert("Banner image is required");
    }

    setLoading(true);
    const payload = {
      activityTitle: title,
      activityHeading: heading,
      activityDescription: description,
      activityLink: link,
      ...(bannerFile && { activityImage: bannerFile }),
    };

    try {
      if (editingActivity) {
        await updateActivity(editingActivity._id, payload, token);
        alert("Activity updated successfully!");
      } else {
        await createActivity(payload, token);
        alert("Activity created successfully!");
      }
      await fetchActivities();
      setIsActivityModalOpen(false);
    } catch (err) {
      alert(editingActivity ? "Update failed" : "Create failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (type, id) => {
    setDeleteType(type);
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      if (deleteType === "promo") {
        await deletePromo(deleteId, token);
        await fetchPromos();
      } else if (deleteType === "activity") {
        await deleteActivity(deleteId, token);
        await fetchActivities();
      }
      alert("Deleted successfully");
      setIsDeleteModalOpen(false);
    } catch (err) {
      alert("Delete failed");
    } finally {
      setLoading(false);
      setDeleteId(null);
      setDeleteType(null);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div></div>
        <div className="flex items-center gap-6">
          <span className="text-sm text-gray-600">
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              day: "2-digit",
              month: "short",
            })}{" "}
            {new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </span>
          <FaBell
            className="text-xl text-gray-600 cursor-pointer hover:text-gray-800"
            onClick={() => navigate("/notifications")}
          />
          <img
            src={profile?.profileImageUrl || profileImg}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
          />
        </div>
      </div>

      {/* Promo Section */}
      <div className="mb-12">
        <h2 className="text-lg font-semibold text-gray-700 mb-6">Promo</h2>
        <div className="flex flex-wrap gap-6">
          <button
            onClick={() => setIsPromoModalOpen(true)}
            className="w-80 h-40 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center hover:shadow-md transition"
          >
            <FaPlus className="text-3xl text-orange-500 mb-2" />
            <span className="text-gray-600 font-medium">Add Promotions</span>
          </button>

          {promos.map((promo) => (
            <div key={promo.promoId} className="relative group">
              <img
                src={promo.promoUrl || "https://via.placeholder.com/320x160/FFE0B2/FF6D00?text=No+Promo"}
                alt="Promo"
                className="w-80 h-40 rounded-2xl object-cover shadow-md"
                onError={(e) => (e.target.src = "https://via.placeholder.com/320x160/FDEDED/DC2626?text=Error")}
              />
              <div className="absolute inset-0  opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl flex items-center justify-center">
                <button
                  onClick={() => openDeleteModal("promo", promo.promoId)}
                  className="bg-white  p-4 rounded-full shadow-xl transform hover:scale-110 transition"
                >
                  <MdDeleteOutline className="text-red-600 text-2xl" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="my-10 border-gray-200" />

      {/* Activities Section - Icons Always Visible */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-6">Activities</h2>
        <div className="flex flex-wrap gap-6">
          {/* Add New Activity Card */}
          <button
            onClick={() => openActivityModal()}
            className="w-80 h-40 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center hover:shadow-md transition"
          >
            <FaPlus className="text-3xl text-orange-500 mb-2" />
            <span className="text-gray-600 font-medium">Add New Activities</span>
          </button>

          {/* Activity Cards */}
          {activities.map((act) => (
            <div key={act._id} className="relative">
              <img
                src={
                  act.bannerUrl ||
                  "https://via.placeholder.com/320x160/E0E7FF/6366F1?text=No+Banner"
                }
                alt={act.activityHeading}
                className="w-80 h-40 rounded-2xl object-cover shadow-md"
                onError={(e) =>
                  (e.target.src =
                    "https://via.placeholder.com/320x160/FDEDED/DC2626?text=Failed")
                }
              />

              {/* Always Visible Action Overlay */}
              <div className="absolute inset-0 rounded-2xl flex items-center justify-center gap-8">
                {/* Edit Button */}
                <button
                  onClick={() => openActivityModal(act)}
                  className="bg-white hover:bg-blue-50 p-4 rounded-full shadow-2xl transform hover:scale-125 transition-all duration-200"
                  title="Edit Activity"
                >
                  <MdEdit className="text-blue-600 text-2xl" />
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => openDeleteModal("activity", act._id)}
                  className="bg-white hover:bg-red-50 p-4 rounded-full shadow-2xl transform hover:scale-125 transition-all duration-200"
                  title="Delete Activity"
                >
                  <MdDeleteOutline className="text-red-600 text-2xl" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Promo Upload Modal */}
      {isPromoModalOpen && (
        <div className="fixed inset-0  flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-6">Upload Promo Banner</h3>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPromoFile(e.target.files[0])}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            {promoFile && (
              <img
                src={URL.createObjectURL(promoFile)}
                alt="Preview"
                className="mt-4 w-full h-48 object-cover rounded-lg shadow"
              />
            )}
            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => {
                  setIsPromoModalOpen(false);
                  setPromoFile(null);
                }}
                className="px-6 py-3 border border-gray-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handlePromoUpload}
                disabled={loading || !promoFile}
                className="px-8 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50"
              >
                {loading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Add/Edit Modal */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl my-8">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">
                  {editingActivity ? "Edit Activity" : "Add New Activity"}
                </h2>
                <button
                  onClick={() => setIsActivityModalOpen(false)}
                  className="text-4xl text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <input
                    placeholder="Activity Title"
                    value={activityForm.title}
                    onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none text-lg"
                  />
                  <input
                    placeholder="Activity Heading"
                    value={activityForm.heading}
                    onChange={(e) => setActivityForm({ ...activityForm, heading: e.target.value })}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none text-lg"
                  />
                  <textarea
                    placeholder="Activity Description"
                    rows="5"
                    value={activityForm.description}
                    onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none text-lg resize-none"
                  />
                  <input
                    placeholder="Activity Link (e.g. https://example.com)"
                    value={activityForm.link}
                    onChange={(e) => setActivityForm({ ...activityForm, link: e.target.value })}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none text-lg"
                  />
                </div>

                <div>
                  <p className="text-lg font-semibold text-gray-700 mb-4">Banner Image</p>
                  <label className="block border-4 border-dashed border-gray-300 rounded-2xl h-96 cursor-pointer relative overflow-hidden bg-gray-50 hover:border-orange-400 transition-all">
                    {bannerPreview ? (
                      <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <div className="bg-gray-300 border-4 border-dashed rounded-2xl w-24 h-24 mb-6" />
                        <p className="text-lg font-medium">Click to upload banner</p>
                        <p className="text-sm mt-2">Recommended: 1456 × 216 px</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setBannerFile(file);
                          setBannerPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                  {editingActivity && !bannerFile && (
                    <p className="text-sm text-gray-500 mt-3 text-center">
                      Leave empty to keep current banner
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-6 mt-10">
                <button
                  onClick={() => setIsActivityModalOpen(false)}
                  className="px-10 py-4 border-2 border-gray-300 rounded-xl text-lg font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveActivity}
                  disabled={loading}
                  className="px-12 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-xl shadow-xl hover:from-orange-600 hover:to-yellow-600 disabled:opacity-60 transition text-lg"
                >
                  {loading ? "Saving..." : editingActivity ? "Update Activity" : "Create Activity"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full text-center">
            <h3 className="text-2xl font-bold mb-4">Delete Item?</h3>
            <p className="text-gray-600 mb-10">This action cannot be undone.</p>
            <div className="flex justify-center gap-6">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-10 py-4 border-2 border-gray-300 rounded-xl text-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className="px-12 py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:opacity-60"
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

export default Dashboard;