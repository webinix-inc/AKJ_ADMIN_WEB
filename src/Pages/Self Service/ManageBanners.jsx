import React, { useState, useEffect } from "react";
import HOC from "../../Component/HOC/HOC";
import api from "../../api/axios";
import { fetchCourses } from "../../redux/slices/courseSlice";
import { useDispatch, useSelector } from "react-redux";

const ManageBanners = () => {
  const [banners, setBanners] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    linktoredirect: "",
    image: null,
    externallink: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState(null);

  const dispatch = useDispatch();
  const { courses } = useSelector((state) => state.courses);

  useEffect(() => {
    dispatch(fetchCourses());
    fetchBanners();
  }, [dispatch]);

  const fetchBanners = async () => {
    try {
      const response = await api.get("/admin/banner");
      setBanners(response.data.data || []);
    } catch (error) {
      console.error("Error fetching banners:", error);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "image" && formData[key]) {
        form.append("image", formData[key]); // Ensure file is added correctly
      } else {
        form.append(key, formData[key] || "");
      }
    });

    try {
      if (isEditing) {
        await api.put(`/admin/banner/${editingBannerId}`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Banner updated successfully!");
      } else {
        await api.post("/admin/banner", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Banner created successfully!");
      }
      resetForm();
      fetchBanners();
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit form");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      try {
        await api.delete(`/admin/banner/${id}`);
        alert("Banner deleted successfully!");
        fetchBanners();
      } catch (error) {
        console.error("Error deleting banner:", error);
        alert("Failed to delete banner");
      }
    }
  };

  const handleEdit = (banner) => {
    setFormData({
      title: banner.title,
      linktoredirect: banner.linktoredirect,
      image: null,
      externallink: banner.externallink,
    });
    setEditingBannerId(banner._id);
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      linktoredirect: "",
      image: null,
      externallink: "",
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
      <h1 className="text-3xl font-bold mb-6 text-white">Manage Banners</h1>

      <form
        onSubmit={handleFormSubmit}
        className="mb-6 bg-[#0d0d0d] p-6 rounded-lg shadow-lg space-y-4 text-white">
        <h2 className="text-2xl font-semibold">
          {isEditing ? "Edit Banner" : "Add Banner"}
        </h2>
        <p class="text-md font-semibold text-gray-700">
          Recommended Size: 1220 × 205 px
        </p>
        <p class="text-sm text-red-500">
          Warning: Adding an image larger than the recommended size may
          negatively impact the UI and could result in improper display.
        </p>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Title"
          className="w-full px-4 py-2 border border-gray-700 rounded bg-gray-700 text-white"
          required
        />
        <select
          name="linktoredirect"
          value={formData.linktoredirect}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-700 rounded bg-gray-700 text-white">
          <option value="">Select a course</option>
          {courses.map((course) => (
            <option key={course._id} value={`/explorecourses/${course._id}`}>
              {course.title}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="externallink"
          value={formData.externallink}
          onChange={handleInputChange}
          placeholder="External Link"
          className="w-full px-4 py-2 border border-gray-700 rounded bg-gray-700 text-white"
        />
        <input
          type="file"
          name="image"
          onChange={handleFileChange}
          className="w-full px-4 py-2 border border-gray-700 rounded bg-gray-700 text-white"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          {isEditing ? "Update Banner" : "Create Banner"}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={resetForm}
            className="bg-gray-500 text-white px-4 py-2 rounded ml-2 hover:bg-gray-600">
            Cancel
          </button>
        )}
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners.map((banner) => (
          <div
            key={banner._id}
            className="bg-[#0d0d0d] rounded-lg shadow-lg overflow-hidden text-white">
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-bold">{banner.title}</h3>
              <p className="text-gray-400">{banner.linktoredirect}</p>
              <div className="mt-4 space-x-2">
                <a
                  href={banner.linktoredirect}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                  View Details
                </a>
                <button
                  onClick={() => handleEdit(banner)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(banner._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HOC(ManageBanners);
