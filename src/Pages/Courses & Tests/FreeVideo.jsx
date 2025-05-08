import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import HOC from "../../Component/HOC/HOC";
import { FaEdit, FaTimes, FaTrashAlt, FaArrowLeft } from "react-icons/fa";

function AdminPanel() {
  const [batches, setBatches] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoSrc: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch all batches
  const fetchBatches = async () => {
    try {
      const response = await api.get("admin/freeCourse");
      setBatches(response.data);
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  // Handle form inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Submit a new batch or update an existing one
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`admin/freeCourse/${editingId}`, formData);
        setIsEditing(false);
        setEditingId(null);
      } else {
        await api.post("admin/freeCourse", formData);
      }
      fetchBatches();
      setFormData({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        videoSrc: "",
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error submitting batch:", error);
    }
  };

  // Edit a batch
  const handleEdit = (batch) => {
    setFormData({
      title: batch.title,
      description: batch.description,
      startDate: batch.startDate,
      endDate: batch.endDate,
      videoSrc: batch.videoSrc,
    });
    setIsEditing(true);
    setEditingId(batch._id);
    setIsModalOpen(true);
  };

  // Delete a batch
  const handleDelete = async (id) => {
    try {
      await api.delete(`admin/freeCourse/${id}`);
      fetchBatches();
    } catch (error) {
      console.error("Error deleting batch:", error);
    }
  };

  // Get the YouTube video URL
  const getVideoUrl = (url) => {
    const regex =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? `https://www.youtube.com/watch?v=${match[1]}` : "";
  };

  // Get the YouTube thumbnail URL
  const getThumbnailUrl = (url) => {
    const regex =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : "";
  };

  return (
    <div className="container mx-auto p-4 bg-[#141414] min-h-screen text-white">
      {/* Back Button */}
      <div className="flex justify-between items-center mb-4">
        <div className=" flex gap-3">
          <button
            onClick={() => window.history.back()}
            className="text-white flex items-center gap-2 text-xl font-bold hover:text-gray-400 transition duration-200">
            <FaArrowLeft />
          </button>
          <h1 className="text-xl mt-2 font-bold">Free Videos</h1>
        </div>

        <button
          onClick={() => {
            setIsEditing(false);
            setEditingId(null);
            setFormData({
              title: "",
              description: "",
              startDate: "",
              endDate: "",
              videoSrc: "",
            });
            setIsModalOpen(true);
          }}
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200">
          Add Video
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-opacity-70 flex justify-center items-center">
          <div className="relative bg-[#141414] text-white w-full max-w-md rounded-lg shadow-lg p-6">
            {/* Close Icon */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-white text-xl hover:text-gray-400 transition duration-200"
              aria-label="Close Modal">
              <FaTimes />
            </button>

            <h2 className="text-xl font-semibold mb-4">
              {isEditing ? "Edit Batch" : "Add Batch"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Batch Title"
                  required
                  className="border border-gray-600 rounded-lg p-2 w-full bg-[#0a0a0a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Description"
                  required
                  className="border border-gray-600 rounded-lg p-2 w-full bg-[#0a0a0a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <input
                  type="url"
                  name="videoSrc"
                  value={formData.videoSrc}
                  onChange={handleInputChange}
                  placeholder="YouTube Video URL"
                  required
                  className="border border-gray-600 rounded-lg p-2 w-full bg-[#0a0a0a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition duration-200">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200">
                  {isEditing ? "Update Batch" : "Add Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-2">Existing Videos</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {batches.map((batch) => (
          <div
            key={batch._id}
            className="bg-gray-800 rounded-lg p-4 shadow-lg flex flex-col justify-between h-full">
            <div>
              <a
                href={getVideoUrl(batch.videoSrc)}
                target="_blank"
                rel="noopener noreferrer">
                <img
                  src={getThumbnailUrl(batch.videoSrc)}
                  alt={`${batch.title} Thumbnail`}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
              </a>
              <h3 className="font-semibold text-lg">{batch.title}</h3>
              <p className="text-gray-400">
                {batch.description.split(" ").slice(0, 10).join(" ")}...
              </p>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={() => handleEdit(batch)}
                className="bg-[#2563eb] text-white px-3 py-1 rounded-lg flex items-center gap-2 hover:bg-yellow-600 transition duration-200">
                <FaEdit />
                Edit
              </button>
              <button
                onClick={() => handleDelete(batch._id)}
                className="bg-red-500 text-white px-3 py-1 rounded-lg flex items-center gap-2 hover:bg-red-600 transition duration-200">
                <FaTrashAlt />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HOC(AdminPanel);
