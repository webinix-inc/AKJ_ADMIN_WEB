import React, { useState, useEffect } from "react";
import HOC from "../../Component/HOC/HOC";
import api from "../../api/axios";

// Modal Component
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out">
      <div className="bg-[#141414] rounded-lg p-6 shadow-lg w-4/5 md:w-2/3 lg:w-1/2 relative">
        <button
          onClick={onClose}
          className="absolute top-0 right-4 text-white hover:text-gray-300 rounded-full p-5 text-3xl"
          aria-label="Close Modal"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onConfirm, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-lg font-bold text-white">Confirm Deletion</h2>
      <p className="text-white">Are you sure you want to delete this book?</p>
      <div className="flex justify-end mt-4">
        <button
          onClick={onClose}
          className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition duration-300 ease-in-out mr-2"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition duration-300 ease-in-out"
        >
          Confirm
        </button>
      </div>
    </Modal>
  );
};

// Admin Panel UI Component
const BookStore = () => {
  const [view, setView] = useState("list");
  const [editingBookId, setEditingBookId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/admin/books");
      setBooks(response.data);
    } catch (error) {
      console.error("Error fetching books", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const switchToForm = (id = null) => {
    setEditingBookId(id);
    setView("form");
  };

  const switchToList = () => {
    setView("list");
  };

  const handleDeleteBook = (id) => {
    setBookToDelete(id);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (bookToDelete) {
      api
        .delete(`/admin/books/${bookToDelete}`)
        .then(() => {
          setBooks((prevBooks) =>
            prevBooks.filter((book) => book._id !== bookToDelete)
          );
          setIsConfirmDeleteOpen(false);
          setBookToDelete(null);
        })
        .catch((error) => {
          console.error("Error deleting book", error);
          fetchBooks();
        });
    }
  };

  console.log("All the books show here", books);

  return (
    <div className="flex flex-col bg-[#141414]">
      <main className="flex-grow p-8 bg-[#141414]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">Book Management</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out shadow-md"
          >
            Add Book
          </button>
        </div>

        {view === "list" ? (
          <BookList
            books={books}
            onEdit={switchToForm}
            onDelete={handleDeleteBook}
            isLoading={isLoading}
          />
        ) : (
          <BookForm
            id={editingBookId}
            switchToList={switchToList}
            fetchBooks={fetchBooks}
          />
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <BookForm
            switchToList={() => {
              setIsModalOpen(false);
              switchToList();
            }}
            fetchBooks={fetchBooks}
          />
        </Modal>

        <ConfirmationModal
          isOpen={isConfirmDeleteOpen}
          onClose={() => setIsConfirmDeleteOpen(false)}
          onConfirm={confirmDelete}
        />
      </main>
    </div>
  );
};

// Book List Component
const BookList = ({ books, onEdit, onDelete, isLoading }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {isLoading ? (
        <p className="text-white">Loading books...</p>
      ) : (
        books.map((book) => (
          <div
            key={book._id}
            className="bg-white rounded-lg overflow-hidden flex flex-col h-full"
          >
            <img
              src={book.imageUrl}
              alt={book.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4 flex flex-col flex-grow">
              <div className="flex-grow flex flex-col justify-between">
                <h3 className="text-lg font-semibold">{book.name}</h3>
                <p className="text-gray-600">{book.author}</p>
                <p className="text-gray-800  font-bold">
                  <span className="line-through text-gray-500 ">
                    {" "}
                    MRP: ₹{book.stock}
                  </span>
                  <span className=" ml-2">Price: ₹{book.price}</span>
                </p>
                <p className="text-green-600 font-semibold">
                  Discount:{" "}
                  {Math.round(((book.stock - book.price) / book.stock) * 100)}%
                  Off
                </p>

                <p className="text-gray-500">
                  Show Where:
                  {book.courseNames.map((course, index) => (
                    <span key={index}>
                      {course}
                      {index < book.courseNames.length - 1 && ", "}
                    </span>
                  ))}
                </p>
              </div>
              <div className="flex space-x-4 mt-4">
                <button
                  onClick={() => onEdit(book._id)}
                  className="bg-blue-600 text-white py-1 px-3 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(book._id)}
                  className="bg-red-600 text-white py-1 px-3 rounded-md hover:bg-red-700 transition duration-300 ease-in-out"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// Book Form Component (Add/Edit Book)
const BookForm = ({ id, switchToList, fetchBooks }) => {
  const [book, setBook] = useState({
    name: "",
    author: "",
    price: "",
    stock: "",
    description: "",
    images: [],
    showUnder: "Trending",
    courseNames: [],
    length: "",
    breadth: "",
    height: "",
    weight: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [newCourse, setNewCourse] = useState("");
  const [courses, setCourses] = useState({ data: [] });

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      api
        .get(`/admin/books/${id}`)
        .then((response) => {
          console.log(`got this response while fetching ${id} book`, response);
          // setBook(response.data);
          const bookData = response.data;

          const { dimensions = {}, ...rest } = bookData;

          setBook({
            ...rest,
            length: dimensions.length ?? "",
            breadth: dimensions.breadth ?? "",
            height: dimensions.height ?? "",
            weight: dimensions.weight ?? "",
          });
        })
        .catch((error) => {
          console.error("Error fetching book", error);
        })
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get("/admin/courses");
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses", error);
      }
    };

    fetchCourses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBook((prevBook) => ({
      ...prevBook,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files.length > 0) {
      setBook((prevBook) => ({
        ...prevBook,
        images: Array.from(e.target.files), // Convert FileList to an array of files
      }));
    }
  };

  const handlePrimaryImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBook((prevBook) => {
        const currentImages = Array.isArray(prevBook.images)
          ? prevBook.images
          : [];
        return {
          ...prevBook,
          images: [file, ...currentImages.slice(1)],
        };
      });
    }
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setBook((prevBook) => {
      const currentImages = Array.isArray(prevBook.images)
        ? prevBook.images
        : [];
      const primary = currentImages[0] || null;
      const additional = primary ? [primary, ...files] : files;
      return {
        ...prevBook,
        images: additional,
      };
    });
  };

  const handleCourseNameChange = (e) => {
    setNewCourse(e.target.value);
  };

  const addCourseField = () => {
    if (newCourse.trim()) {
      setBook((prevBook) => ({
        ...prevBook,
        courseNames: [...prevBook.courseNames, newCourse.trim()],
      }));
      setNewCourse(""); // Clear input after adding
    }
  };

  const removeCourse = (indexToRemove) => {
    setBook((prevBook) => ({
      ...prevBook,
      courseNames: prevBook.courseNames.filter(
        (_, index) => index !== indexToRemove
      ),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", book.name);
    if (book.author) {
      formData.append("author", book.author);
      console.log("!@#");
    }

    formData.append("price", book.price);
    formData.append("stock", book.stock);
    formData.append("description", book.description);
    formData.append("courseNames", JSON.stringify(book.courseNames));
    formData.append("showUnder", book.showUnder);
    formData.append("length", book.length);
    formData.append("breadth", book.breadth);
    formData.append("height", book.height);
    formData.append("weight", book.weight);

    // Handle single or multiple images

    console.log("here are the images :", book.images);
    if (book.images && book.images.length > 0) {
      Array.from(book.images).forEach((image) =>
        formData.append("images", image)
      );
    }

    console.log("here is the formData that is goona submitted :", formData);

    const apiCall = id
      ? api.put(`/admin/books/${id}`, formData)
      : api.post("/admin/books", formData, {
          headers: {
            "Content-Type": "multipart/form-data", // Ensure this is set for file uploads
          },
        });

    setIsLoading(true);
    apiCall
      .then(() => {
        fetchBooks();
        switchToList();
      })
      .catch((error) => {
        console.error("Error saving book", error);
        setError("Failed to save book");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="bg-[#141414] p-6 w-full h-[90vh] flex flex-col">
      <h2 className="text-xl font-bold text-white mb-4">
        {id ? "Edit Book" : "Add Book"}
      </h2>
      {isLoading ? (
        <p className="text-white">Loading...</p>
      ) : (
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 pr-2">
          <input
            type="text"
            name="name"
            value={book.name}
            onChange={handleChange}
            placeholder="Book Name"
            required
            className="w-full p-2 mb-4 rounded-md border border-white bg-[#141414] text-white"
          />
          <input
            type="text"
            name="author"
            value={book.author}
            onChange={handleChange}
            placeholder="Author Name"
            className="w-full p-2 mb-4 rounded-md border border-white bg-[#141414] text-white"
          />
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="number"
              name="price"
              value={book.price}
              onChange={handleChange}
              placeholder="Price"
              required
              className="p-2 rounded-md border border-white bg-[#141414] text-white"
            />
            <input
              type="number"
              name="stock"
              value={book.stock}
              onChange={handleChange}
              placeholder="MRP"
              required
              className="p-2 rounded-md border border-white bg-[#141414] text-white"
            />
          </div>
          <textarea
            name="description"
            value={book.description}
            onChange={handleChange}
            placeholder="Description"
            required
            className="w-full p-2 mb-4 rounded-md border border-white bg-[#141414] text-white"
          />
          <div className="mb-4">
            <label className="block text-white mb-2">Labels</label>
            <select
              name="showUnder"
              value={book.showUnder}
              onChange={handleChange}
              className="block w-full border border-white bg-[#141414] text-white p-2"
            >
              <option value="home">Trending</option>
              <option value="student">Bestselling</option>
              <option value="both">Teacher's Pick</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-white mb-1">Length (cm)</label>
              <input
                type="number"
                name="length"
                value={book.length}
                onChange={handleChange}
                className="w-full border border-white bg-[#141414] text-white p-2"
                placeholder="Enter length"
              />
            </div>
            <div>
              <label className="block text-white mb-1">Breadth (cm)</label>
              <input
                type="number"
                name="breadth"
                value={book.breadth}
                onChange={handleChange}
                className="w-full border border-white bg-[#141414] text-white p-2"
                placeholder="Enter breadth"
              />
            </div>
            <div>
              <label className="block text-white mb-1">Height (cm)</label>
              <input
                type="number"
                name="height"
                value={book.height}
                onChange={handleChange}
                className="w-full border border-white bg-[#141414] text-white p-2"
                placeholder="Enter height"
              />
            </div>
            <div>
              <label className="block text-white mb-1">Weight (kg)</label>
              <input
                type="number"
                name="weight"
                value={book.weight}
                onChange={handleChange}
                className="w-full border border-white bg-[#141414] text-white p-2"
                placeholder="Enter weight"
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="flex">
              <input
                list="courseOptions"
                name="newCourse"
                value={newCourse}
                onChange={handleCourseNameChange}
                className="w-full p-2 rounded-md border border-white bg-[#141414] text-white"
                placeholder="Select or type a course"
              />
              <button
                type="button"
                onClick={addCourseField}
                className="border border-white bg-[#141414] text-white py-2 px-4 ml-2 rounded-md"
              >
                ADD
              </button>
            </div>

            {book.courseNames.length > 0 && (
              <div className="mt-4 text-white">
                <ul className="mt-2">
                  {book.courseNames.map((courseName, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center mt-1"
                    >
                      {courseName}
                      <button
                        type="button"
                        onClick={() => removeCourse(index)}
                        className="ml-4 border border-white bg-[#141414] text-white px-2 py-1 rounded"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <datalist id="courseOptions">
            <option value="Book Store" />
            {Array.isArray(courses.data) &&
              courses.data.map((course) => (
                <option key={course._id} value={course.title} />
              ))}
          </datalist>

          {/* <input type="file" multiple onChange={handleImageChange} /> */}
          <div className="mb-4 text-white">
            <label className="block mb-2">Primary Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePrimaryImageChange}
              className="block w-full p-2 border border-white bg-[#141414] text-white rounded"
            />
          </div>

          <div className="mb-4 text-white">
            <label className="block mb-2">Additional Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleAdditionalImagesChange}
              className="block w-full p-2 border border-white bg-[#141414] text-white rounded"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="border border-white bg-[#141414] text-white py-2 px-4 rounded-md"
          >
            {isLoading ? "Saving..." : id ? "Update Book" : "Add Book"}
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>
      )}
    </div>
  );
};

export default HOC(BookStore);
