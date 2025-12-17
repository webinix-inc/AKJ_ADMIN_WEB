import React, { useState, useEffect } from "react";
import HOC from "../../Component/HOC/HOC";
import api from "../../api/axios";
import { fetchCourses } from "../../redux/slices/courseSlice";
import { useDispatch, useSelector } from "react-redux";
import { getBannerImageUrl } from "../../utils/imageUtils";

const ManageBanners = () => {
  const [banners, setBanners] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    course: "",
    timePeriod: "",
    externalLink: "",
    image: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState(null);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const { courses } = useSelector((state) => state.courses);

  useEffect(() => {
    dispatch(fetchCourses());
    fetchBanners();
  }, [dispatch]);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      console.log("📋 Fetching banners...");
      const response = await api.get("/admin/banner");
      const bannersData = response.data.data || [];
      console.log(`✅ Fetched ${bannersData.length} banners`);
      setBanners(bannersData);
    } catch (error) {
      console.error("❌ Error fetching banners:", error);
      alert("Failed to fetch banners. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      alert("Banner name is required");
      return;
    }
    
    if (!formData.image && !isEditing) {
      alert("Image is required for new banners");
      return;
    }

    setLoading(true);
    const form = new FormData();
    
    // Add simplified form fields to FormData
    form.append('name', formData.name.trim());
    form.append('course', formData.course || '');
    form.append('timePeriod', formData.timePeriod || '');
    form.append('externalLink', formData.externalLink || '');
    
    // Add image file if present
    if (formData.image) {
      form.append('image', formData.image);
    }

    try {
      console.log("🚀 Submitting banner form data:", {
        name: formData.name,
        course: formData.course,
        timePeriod: formData.timePeriod,
        externalLink: formData.externalLink,
        hasImage: !!formData.image
      });
      
      if (isEditing) {
        const response = await api.put(`/admin/banner/${editingBannerId}`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log("✅ Update response:", response.data);
        alert("Banner updated successfully!");
      } else {
        const response = await api.post("/admin/banner", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log("✅ Create response:", response.data);
        
        if (response.data.status === 201 || response.status === 201) {
          alert("Banner created successfully!");
        } else if (response.data.status === 400) {
          alert("Validation error: " + (response.data.error || "Invalid data"));
          return;
        }
      }
      resetForm();
      fetchBanners();
    } catch (error) {
      console.error("❌ Error submitting form:", error);
      
      if (error.response?.status === 400) {
        alert("Validation error: " + (error.response.data?.error || error.response.data?.message || "Invalid data"));
      } else if (error.response?.status === 500) {
        alert("Server error occurred while saving the banner.");
      } else {
        alert(`Failed to submit form: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, bannerName) => {
    if (!id) {
      alert("Invalid banner ID");
      return;
    }

    if (window.confirm(`Are you sure you want to delete the banner "${bannerName}"? This action cannot be undone.`)) {
      try {
        setLoading(true);
        console.log(`🗑️ Attempting to delete banner: ${bannerName} (ID: ${id})`);
        const response = await api.delete(`/admin/banner/${id}`);
        console.log("✅ Delete response:", response);
        alert("Banner deleted successfully!");
        fetchBanners();
      } catch (error) {
        console.error("❌ Error deleting banner:", error);
        
        if (error.response?.status === 404) {
          alert("Banner not found. It may have already been deleted.");
        } else if (error.response?.status === 403) {
          alert("You don't have permission to delete this banner.");
        } else if (error.response?.status === 500) {
          alert("Server error occurred while deleting the banner.");
        } else {
          alert(`Failed to delete banner: ${error.response?.data?.message || error.message}`);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (banner) => {
    console.log("✏️ Editing banner:", banner.name);
    setFormData({
      name: banner.name || "",
      course: banner.course?._id || banner.course || "",
      timePeriod: banner.timePeriod || "",
      externalLink: banner.externalLink || "",
      image: null, // Don't pre-fill image for editing
    });
    setEditingBannerId(banner._id);
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      course: "",
      timePeriod: "",
      externalLink: "",
      image: null,
    });
    setIsEditing(false);
    setEditingBannerId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  return (
    <div className="container mx-auto p-4 bg-[#141414] min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-white">🖼️ Manage Banners</h1>
      <p className="text-gray-400 mb-6">Create and manage promotional banners with simple fields: Name, Course, Time Period, External Link, and Image.</p>

      <form
        onSubmit={handleFormSubmit}
        className="mb-8 bg-[#0d0d0d] p-6 rounded-lg shadow-lg space-y-6 text-white border border-gray-700">
        <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">
            {isEditing ? "✏️ Edit Banner" : "➕ Add New Banner"}
        </h2>
          {loading && <div className="text-blue-400">Processing...</div>}
        </div>
        
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <p className="text-blue-300 font-medium">📏 Recommended Image Size: 1220 × 205 px</p>
          <p className="text-yellow-300 text-sm mt-1">⚠️ Images larger than recommended size may affect UI display</p>
        </div>

        {/* Banner Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            📝 Banner Name *
          </label>
        <input
          type="text"
            name="name"
            value={formData.name}
          onChange={handleInputChange}
            placeholder="Enter banner name (e.g., 'JEE 2025 Admission Open')"
            className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>
        
        {/* Course Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            📚 Associated Course (Optional)
          </label>
        <select
          name="course"
          value={formData.course}
          onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
            <option value="">-- No specific course --</option>
          {courses.map((course) => (
            <option key={course._id} value={course._id}>
              {course.title}
            </option>
          ))}
        </select>
        </div>
        
        {/* Time Period */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            ⏰ Time Period (Optional)
          </label>
        <input
          type="text"
            name="timePeriod"
            value={formData.timePeriod}
          onChange={handleInputChange}
            placeholder="e.g., 'Valid till 31st March 2025' or 'Jan 2025 - Mar 2025'"
            className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        </div>
        
        {/* External Link */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            🔗 External Link (Optional)
          </label>
        <input
          type="url"
            name="externalLink"
            value={formData.externalLink}
          onChange={handleInputChange}
            placeholder="https://example.com/landing-page"
            className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        </div>
        
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            🖼️ Banner Image * {!isEditing && "(Required)"}
          </label>
          <input
            type="file"
            name="image"
            onChange={handleFileChange}
            accept="image/*"
            className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-800 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            required={!isEditing}
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
        <button
          type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium">
            {loading ? "Processing..." : (isEditing ? "✅ Update Banner" : "🚀 Create Banner")}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={resetForm}
              disabled={loading}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 disabled:opacity-50 font-medium">
              ❌ Cancel
          </button>
        )}
        </div>
      </form>

      {/* Banner List */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">📋 Current Banners ({banners.length})</h2>
        {loading && <div className="text-center text-blue-400 py-8">Loading banners...</div>}
        {!loading && banners.length === 0 && (
          <div className="text-center py-12 bg-[#0d0d0d] rounded-lg border border-gray-700">
            <p className="text-gray-400 text-lg">📭 No banners found</p>
            <p className="text-gray-500 text-sm mt-2">Create your first banner using the form above</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => {
          return (
            <div
              key={banner._id}
              className="bg-[#0d0d0d] rounded-lg shadow-lg overflow-hidden text-white border border-gray-700 hover:border-gray-500 transition-colors">
              
              {/* Banner Image */}
              <div className="relative">
                              <img
                  src={getBannerImageUrl(banner._id)}
                  alt={banner.name}
                  className="w-full h-40 object-cover"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="400" height="200" fill="%23374151"/><text x="200" y="100" text-anchor="middle" fill="%23fff" font-size="16">Image not found</text></svg>';
                  }}
                />
                <div className="absolute top-2 right-2 bg-black/50 rounded px-2 py-1 text-xs">
                  🖼️ Banner
                </div>
              </div>
              
              {/* Banner Info */}
              <div className="p-4 space-y-3">
                <h3 className="text-lg font-bold text-white">{banner.name}</h3>
                
                {banner.course && (
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400">📚</span>
                    <span className="text-sm text-gray-300">
                      {banner.course.title || banner.course}
                    </span>
                  </div>
                )}
                
                {banner.timePeriod && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">⏰</span>
                    <span className="text-sm text-gray-300">{banner.timePeriod}</span>
                  </div>
                )}
                
                {banner.externalLink && (
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400">🔗</span>
                    <span className="text-sm text-blue-400 truncate" title={banner.externalLink}>
                      {banner.externalLink}
                    </span>
                  </div>
                )}
                
                <div className="text-xs text-gray-500 border-t border-gray-700 pt-2">
                  Created: {new Date(banner.createdAt).toLocaleDateString()}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  {banner.externalLink && (
                    <a
                      href={banner.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 text-center">
                      🔗 Visit
                    </a>
                  )}
                  <button
                    onClick={() => handleEdit(banner)}
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50">
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(banner._id, banner.name)}
                    disabled={loading}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50">
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HOC(ManageBanners);
