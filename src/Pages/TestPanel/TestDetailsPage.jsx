import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import HOC from "../../Component/HOC/HOC";
import api from "../../api/axios";
import { Oval } from "react-loader-spinner";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import {
  FiEdit,
  FiCopy,
  FiUpload,
  FiSave,
  FiArrowLeft,
  FiTrash2,
} from "react-icons/fi";
import { MdClose } from "react-icons/md";
import { AiFillCheckCircle } from "react-icons/ai";
// import QuestionEditor from "../../Component/editor/QuestionEditor";

const useQuizId = () => {
  const { id } = useParams();

  useEffect(() => {
    if (!id) {
      console.error("Quiz ID is missing in the URL parameters");
      return;
    }
    console.log(`Quiz ID retrieved: ${id}`);
  }, [id]);

  return id;
};

const TestDetailsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quizDetails, setQuizDetails] = useState({
    quizName: "",
    duration: "",
    marks: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteAllModal, setDeleteAllModal] = useState(false);

  const quizId = useQuizId();

  if (!quizId) {
    console.log("Quize id is not findout right now!");
  }

  const navigate = useNavigate();

  const location = useLocation();
  const test = location.state;

  console.log("Test Details:", test);

  const calculateTotalMarks = () =>
    questions.reduce(
      (total, question) => total + (question.questionCorrectMarks || 0),
      0
    );

  const fetchQuizDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/quizzes/${quizId}`);

      console.log("API response from quize details page:", response);

      setQuizDetails(response.data.quiz || {});
    } catch (error) {
      console.error("Error fetching quiz details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await api.get(`/admin/quizzes/${quizId}/questions`);
      console.log("API response from Questions details page:", response);

      setQuestions(response.data.questions || []);
      toast.success("Questions loaded successfully!");
      console.log("hre the the fetched qquestions : ", response.data.questions);
    } catch (error) {
      toast.error("Failed to load questions.");
      console.error("Error fetching questions:", error);
    }
  };
  useEffect(() => {
    fetchQuizDetails();
    fetchQuestions();
  }, [quizId]);

  // Fetch tests from backend
  const fetchTests = async () => {
    try {
      const response = await api.get(`/admin/quizzes`);
      if (response.data.quizzes) {
        setTests(
          response.data.quizzes.map((quiz) => ({
            id: quizId,
            name: quiz.quizName,
            date: quiz.createdAt,
            time: quiz.createdAt,
            marks: quiz.marks,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching tests:", error);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  // console.log("test details print here:", tests);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      toast.error("No file selected. Please choose a file to upload.");
      return;
    }

    if (
      ![
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
      ].includes(file.type)
    ) {
      toast.error("Invalid file type. Only .doc and .docx files are allowed.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const response = await api.post(
        `/admin/quizzes/${quizId}/upload-questions`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        toast.success(response.data.message || "File uploaded successfully!");
        // setQuestions((prev) => [...prev, ...response.data.savedQuestions]);
        await fetchQuestions();
        // const newQuestions = response.data.savedQuestions || [];
        // console.log(response);
        // console.log("NewQuestions are these : ", newQuestions);
        // setQuestions((prev) => [...prev, ...newQuestions]);

        setShowModal(false);
      } else {
        throw new Error(response.data.message || "Unknown error occurred.");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to upload file. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (question) => {
    // setSelectedQuestion({
    //   ...question,
    //   questionText: question.tables[0] || question.questionText || "",
    // });
    const updatedQuestion = {
      ...question,
      questionText: question.tables[0] || question.questionText || "",
    };
    setSelectedQuestion(updatedQuestion);

    console.log("this is the selected question for editing :", updatedQuestion);
    setEditModal(true);
  };

  const handleSaveEdit = async () => {
    console.log(
      "this is the selected question to be updated :",
      selectedQuestion
    );
    if (!selectedQuestion) return;

    const updatedQuestion = {
      ...selectedQuestion,
      // Assume ReactQuill uses `questionText` field for updates
      questionText: selectedQuestion.questionText,
    };

    console.log("this could be the new question if updated :", updatedQuestion);

    try {
      const response = await api.put(
        `/admin/quizzes/${quizId}/questions/${selectedQuestion._id}`,
        updatedQuestion
      );
      console.log("response for the update :", response);

      if (response.status === 200) {
        setQuestions((prev) =>
          prev.map((q) =>
            q._id === selectedQuestion._id
              ? { ...q, ...response.data.updatedQuestion }
              : q
          )
        );
        toast.success("Question updated successfully!");
        setEditModal(false);
      } else {
        toast.error("Failed to update question.");
      }
    } catch (error) {
      toast.error("Error updating question.");
      console.error("Error in updating question:", error);
    }
  };

  const handleCopy = (id) => {
    console.log("handle copy called");

    const questionToCopy = questions.find((q) => q._id === id);
    console.log("this is the question to be copied :", questionToCopy);
    if (questionToCopy) {
      setQuestions([...questions, { ...questionToCopy, id: `${id}-copy` }]);
      toast.success("Question copied successfully!");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const response = await api.delete(
        `/admin/quizzes/${quizId}/questions/${deleteTarget}`
      );
      if (response.status === 200) {
        setQuestions(
          questions.filter((question) => question._id !== deleteTarget)
        );
        toast.success("Question deleted successfully!");
        setDeleteModal(false);
        setDeleteTarget(null);
      }
    } catch (error) {
      toast.error("Failed to delete question. Please try again.");
      console.error("Error deleting question:", error);
    }
  };

  const handleDeleteAll = () => {
    setDeleteAllModal(true);
  };

  const handleConfirmDeleteAll = async () => {
    try {
      const response = await api.delete(`/admin/quizzes/${quizId}/questions`);
      if (response.status === 200) {
        setQuestions([]);
        toast.success("All questions deleted successfully!");
        setDeleteAllModal(false);
      } else {
        toast.error("Failed to delete all questions.");
      }
    } catch (error) {
      toast.error("Error deleting all questions.");
      console.error("Error in deleting all questions:", error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await api.put(`/admin/quizzes/${quizId}`, quizDetails);
      if (response.status === 200) {
        toast.success("Quiz details updated successfully!");
      } else {
        toast.error("Failed to update quiz details.");
      }
    } catch (error) {
      toast.error("Error updating quiz details.");
      console.error(error);
    }
  };

  console.log("Quize details print:", quizDetails);

  const handleOptionChange = (optionIndex, value) => {
    setSelectedQuestion((prev) => {
      const updatedOptions = [...prev.options];
      updatedOptions[optionIndex].optionText = value;
      return { ...prev, options: updatedOptions };
    });
  };

  const handleCorrectOptionSelect = (idx) => {
    setSelectedQuestion((prev) => {
      const updatedOptions = prev.options.map((option, optionIdx) => ({
        ...option,
        isCorrect: optionIdx === idx,
      }));
      return { ...prev, options: updatedOptions };
    });
  };

  const quillRef = useRef();

  // When selectedQuestion changes from outside, update editor content only if different
  useEffect(() => {
    if (quillRef.current && selectedQuestion?.questionText) {
      const editor = quillRef.current.getEditor();
      const currentContent = editor.root.innerHTML;
      if (currentContent !== selectedQuestion.questionText) {
        editor.clipboard.dangerouslyPasteHTML(selectedQuestion.questionText);
      }
    }
  }, [selectedQuestion]);

  return (
    <div className="flex h-[95vh] overflow-hidden">
      <main
        style={{
          msOverflowStyle: "none",
          scrollbarWidth: "none",
          overflowY: "scroll",
        }}
        className="flex-1 overflow-y-auto bg-[#141414] p-6 text-gray-200 hide-scrollbar"
      >
        <ToastContainer />
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700"
          >
            <FiArrowLeft className="mr-2" />
            Back
          </button>
          <div className="space-x-4 flex">
            <button
              onClick={handleDeleteAll}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md shadow-md hover:bg-red-700"
            >
              <FiTrash2 className="mr-2" />
              Delete All
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md shadow-md hover:bg-gray-700"
            >
              <FiUpload className="mr-2" />
              Upload
            </button>
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700"
            >
              <FiSave className="mr-2" />
              Save
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-6">
          <div>
            <label className="block text-gray-400 font-medium">Test Name</label>
            <input
              type="text"
              value={quizDetails?.quizName}
              onChange={(e) =>
                setQuizDetails((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-4 py-2 bg-[#0d0d0d] border border-gray-600 rounded-lg focus:ring focus:ring-blue-300 text-white"
            />
          </div>
          <div>
            <label className="block text-gray-400 font-medium">
              Test Duration
            </label>
            <input
              type="text"
              value={`${quizDetails?.duration?.hours / 10} hr ${
                quizDetails?.duration?.minutes
              } mins`}
              readOnly
              className="w-full px-4 py-2 bg-[#0d0d0d] border border-gray-600 rounded-lg focus:ring focus:ring-blue-300 text-white"
            />
          </div>
          <div>
            <label className="block text-gray-400 font-medium">
              Total Marks
            </label>
            <input
              type="text"
              value={calculateTotalMarks()}
              onChange={(e) =>
                setQuizDetails((prev) => ({ ...prev, marks: e.target.value }))
              }
              className="w-full px-4 py-2 bg-[#0d0d0d] border border-gray-600 rounded-lg focus:ring focus:ring-blue-300 text-white"
            />
          </div>
          <div>
            <label className="block text-gray-400 font-medium">
              Total Question
            </label>
            <input
              type="text"
              value={questions?.length} // Displaying the total number of questions
              readOnly // Making the input read-only since it's a calculated field
              className="w-full px-4 py-2 bg-[#0d0d0d] border border-gray-600 rounded-lg focus:ring focus:ring-blue-300 text-white"
            />
          </div>
        </div>

        {questions.map((question, index) => (
          <div class="overflow-x-auto">
            <table class="w-full border border-gray-700 bg-[#0d0d0d] rounded-lg shadow-lg mb-6">
              <thead>
                <tr>
                  <th
                    colspan="2"
                    class="p-4 text-left text-white font-semibold  border-b border-gray-700"
                  >
                    Question {index + 1}
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td class="p-4 text-white">
                    {question.questionText ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: question.tables[0]
                            ?.replace(
                              /<table/g,
                              '<table class="table-auto border-collapse border w-1/2 text-left text-white"'
                            )
                            .replace(
                              /<th/g,
                              '<th class="border border-gray-700 px-4 py-2"'
                            )
                            .replace(
                              /<td/g,
                              '<td class="border border-gray-700 px-4 py-2"'
                            )
                            .replace(/<tr/g, '<tr class=""'),
                        }}
                        class="text-white"
                      ></div>
                    ) : question.questionImage &&
                      question.questionImage.length > 0 ? (
                      question.questionImage.map((imageUrl, imgIndex) => (
                        <div key={imgIndex} class="mb-4">
                          <img
                            src={imageUrl}
                            alt={`Question ${index + 1} image ${imgIndex + 1}`}
                            class="w-3/4 rounded-md shadow-md border border-gray-700"
                          />
                        </div>
                      ))
                    ) : (
                      <span class="text-white italic">
                        No Question Text or Images Available
                      </span>
                    )}
                  </td>
                </tr>

                {question.options && question.options.length > 0 && (
                  <tr class="border-t border-gray-700">
                    <td class="p-4">
                      <ul class="space-y-3">
                        {question.options.map((option, idx) => (
                          <li
                            key={idx}
                            class="flex items-start space-x-3 text-white"
                          >
                            <span class="font-semibold text-white">
                              {String.fromCharCode(65 + idx)}){" "}
                            </span>
                            <span>{option.optionText}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                )}

                <tr class="border-t border-gray-700">
                  <td class="p-4 flex items-center gap-4">
                    <span class="text-white font-medium">
                      Correct Answer Marks: {question.questionCorrectMarks}
                    </span>
                    <AiFillCheckCircle
                      style={{ color: "green", fontSize: "24px" }}
                    />
                  </td>
                </tr>

                <tr class="border-t border-gray-700">
                  <td class="p-4">
                    <div class="flex space-x-4">
                      <button
                        onClick={() => handleEdit(question)}
                        class="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md shadow hover:bg-yellow-600"
                      >
                        <FiEdit class="mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleCopy(question._id)}
                        class="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md shadow hover:bg-gray-700"
                      >
                        <FiCopy class="mr-2" />
                        Copy
                      </button>
                      <button
                        onClick={() => {
                          setDeleteModal(true);
                          setDeleteTarget(question._id);
                        }}
                        class="flex items-center px-4 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700"
                      >
                        <FiTrash2 class="mr-2" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}

        {deleteModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-[#0d0d0d] w-1/3 p-6 rounded-lg shadow-lg text-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Are you sure you want to delete this question?
                </h3>
                <button
                  onClick={() => setDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <MdClose size={24} />
                </button>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setDeleteModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md shadow-md hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md shadow-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {editModal && (
          <div className="fixed inset-0 flex items-center justify-center text-white bg-black bg-opacity-50">
            <div className="  w-2/3 max-h-[90vh] overflow-y-auto p-6 rounded-lg shadow-lg text-white">
              <table className="w-full border border-white bg-[#0d0d0d] rounded-lg shadow-md">
                <thead>
                  <tr>
                    <th
                      colSpan="2"
                      className="p-4 text-left text-lg font-semibold text-white border-b border-gray-700"
                    >
                      Edit Question
                      <button
                        onClick={() => setEditModal(false)}
                        className="float-right text-gray-400 hover:text-gray-200"
                      >
                        <MdClose size={24} />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-4 font-medium text-white border-b border-gray-700">
                      Question
                    </td>
                    <td className="p-4 border-b border-gray-700">
                      {/* <ReactQuill
                        value={selectedQuestion?.questionText || ""}
                        onChange={(value) =>
                          setSelectedQuestion((prev) => ({
                            ...prev,
                            questionText: value,
                          }))
                        }
                        
                      /> */}

                      <ReactQuill
                        ref={quillRef}
                        defaultValue={selectedQuestion.questionText}
                        // onChange={handleQuillChange}
                        onChange={(value) =>
                          setSelectedQuestion((prev) => ({
                            ...prev,
                            questionText: value,
                          }))
                        }
                        style={{
                          minHeight: "150px",
                          backgroundColor: "black",
                          color: "white",
                        }}
                      />
                    </td>
                  </tr>

                  {selectedQuestion?.options?.map((option, idx) => (
                    <tr key={idx}>
                      <td className="p-4 font-medium text-white border-b border-gray-700">
                        Option {String.fromCharCode(65 + idx)}
                      </td>
                      <td className="p-4 border-b border-gray-700">
                        <input
                          type="text"
                          value={option.optionText || ""}
                          onChange={(e) =>
                            handleOptionChange(idx, e.target.value)
                          }
                          className="w-full px-4 py-2 bg-[#0d0d0d] text-white  border border-gray-600 mb-2"
                        />
                        <div>
                          <label className="inline-flex items-center text-gray-400">
                            <input
                              type="checkbox"
                              checked={option.isCorrect || false}
                              onChange={() => handleCorrectOptionSelect(idx)}
                              className="form-checkbox h-5 w-5 text-green-600"
                            />
                            <span className="ml-2">Mark as Correct</span>
                          </label>
                        </div>
                      </td>
                    </tr>
                  ))}

                  <tr>
                    <td className="p-4 font-medium text-gray-300 border-b border-gray-700">
                      Correct Option:
                    </td>
                    <td className="p-4 border-b border-gray-700 text-green-400">
                      {selectedQuestion?.options?.find(
                        (option) => option.isCorrect
                      ) ? (
                        <>
                          Option{" "}
                          {String.fromCharCode(
                            65 +
                              selectedQuestion.options.findIndex(
                                (option) => option.isCorrect
                              )
                          )}
                          :{" "}
                          {
                            selectedQuestion.options.find(
                              (option) => option.isCorrect
                            ).optionText
                          }
                        </>
                      ) : (
                        "No correct option selected."
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td colSpan="2" className="p-4 text-right">
                      <button
                        onClick={handleSaveEdit}
                        className="px-4 py-2 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700"
                      >
                        Save Changes
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-[#0d0d0d] w-1/2 p-6 rounded-lg shadow-lg text-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Upload Questions</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <MdClose size={24} />
                </button>
              </div>
              <input
                type="file"
                accept=".doc, .docx"
                onChange={handleUpload}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-md border border-gray-600"
              />
            </div>
          </div>
        )}

        {isUploading && (
          <div className="fixed top-10 right-10 flex items-center space-x-4 bg-black bg-opacity-75 p-4 rounded-lg">
            <Oval height={30} width={30} color="white" />
            <span className="text-white">Uploading...</span>
          </div>
        )}
        {deleteAllModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-[#0d0d0d] w-1/3 p-6 rounded-lg shadow-lg text-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Are you sure you want to delete <strong>ALL</strong>{" "}
                  questions?
                </h3>
                <button
                  onClick={() => setDeleteAllModal(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <MdClose size={24} />
                </button>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setDeleteAllModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md shadow-md hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDeleteAll}
                  className="px-4 py-2 bg-red-600 text-white rounded-md shadow-md hover:bg-red-700"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HOC(TestDetailsPage);
