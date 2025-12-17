import React, { useEffect, useRef, useState } from "react";
import { Oval } from "react-loader-spinner";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HOC from "../../Component/HOC/HOC";
import api from "../../api/axios";
import { getOptimizedQuizImage } from "../../utils/imageUtils";
// 🔧 NEW: Import MathRenderer for LaTeX support
import QuestionRenderer from "../../Components/MathRenderer";

import {
  FiArrowLeft,
  FiCopy,
  FiEdit,
  FiPlus,
  FiSave,
  FiTrash2,
  FiUpload,
} from "react-icons/fi";
import { MdClose } from "react-icons/md";

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
  const [addQuestionModal, setAddQuestionModal] = useState(false);
  const [addQuestionViewMode, setAddQuestionViewMode] = useState("table"); // "table" or "form"
  const [newQuestion, setNewQuestion] = useState({
    questionText: "",
    questionImage: [],
    questionType: "multiple_choice",
    options: [
      { optionText: "", isCorrect: false, optionImage: [] },
      { optionText: "", isCorrect: false, optionImage: [] },
      { optionText: "", isCorrect: false, optionImage: [] },
      { optionText: "", isCorrect: false, optionImage: [] },
    ],
    solution: "",
    questionCorrectMarks: 2,
    questionIncorrectMarks: 0,
  });

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

  // Helper function to extract data from tables array
  const extractDataFromTables = (question) => {
    if (!question.tables || !Array.isArray(question.tables) || question.tables.length === 0) {
      return null;
    }

    try {
      const parsedTables = question.tables.map(item => {
        if (typeof item === 'string' && item.startsWith('[')) {
          try {
            return JSON.parse(item);
          } catch (e) {
            return item;
          }
        }
        return item;
      });

      const extracted = {
        questionText: question.questionText || '',
        questionType: question.questionType || 'mcq',
        options: question.options && question.options.length > 0 ? question.options : [],
        solution: question.solution || '',
        questionCorrectMarks: question.questionCorrectMarks || 2,
        questionIncorrectMarks: question.questionIncorrectMarks || 0,
      };

      // Extract question text
      const questionRow = parsedTables.find(row => 
        Array.isArray(row) && row.length >= 2 && 
        (row[0] === 'Question' || (typeof row[0] === 'string' && row[0].toLowerCase().includes('question')))
      );
      if (questionRow && questionRow[1]) {
        extracted.questionText = questionRow[1];
      }

      // Extract question type
      const typeRow = parsedTables.find(row => 
        Array.isArray(row) && row.length >= 2 && 
        (row[0] === 'Type' || (typeof row[0] === 'string' && row[0].toLowerCase().includes('type')))
      );
      if (typeRow && typeRow[1]) {
        extracted.questionType = typeRow[1].toLowerCase().trim();
      }

      // Extract options
      const optionRows = parsedTables.filter(row => 
        Array.isArray(row) && row.length >= 2 && 
        (row[0] === 'Option' || (typeof row[0] === 'string' && row[0].toLowerCase().includes('option')))
      );
      
      if (optionRows.length > 0 && extracted.options.length === 0) {
        extracted.options = optionRows.map(row => ({
          optionText: row[1] || '',
          isCorrect: row.length >= 3 && (row[2] || '').toLowerCase().trim() === 'correct',
          optionImage: []
        }));
      }

      // Extract solution
      const solutionRow = parsedTables.find(row => 
        Array.isArray(row) && row.length >= 2 && 
        (row[0] === 'Solution' || (typeof row[0] === 'string' && row[0].toLowerCase().includes('solution')))
      );
      if (solutionRow && solutionRow[1]) {
        extracted.solution = solutionRow[1];
      }

      // Extract marks
      const marksRow = parsedTables.find(row => 
        Array.isArray(row) && row.length >= 2 && 
        (row[0] === 'Marks' || (typeof row[0] === 'string' && row[0].toLowerCase().includes('marks')))
      );
      if (marksRow) {
        if (marksRow.length >= 3) {
          extracted.questionCorrectMarks = parseFloat(marksRow[1]) || 2;
          extracted.questionIncorrectMarks = parseFloat(marksRow[2]) || 0;
        } else if (marksRow.length === 2) {
          const marksText = String(marksRow[1] || '').trim();
          const parts = marksText.split(/[,\s]+/);
          if (parts.length >= 2) {
            extracted.questionCorrectMarks = parseFloat(parts[0]) || 2;
            extracted.questionIncorrectMarks = parseFloat(parts[1]) || 0;
          } else if (parts.length === 1) {
            extracted.questionCorrectMarks = parseFloat(parts[0]) || 2;
          }
        }
      }

      return extracted;
    } catch (error) {
      console.error('Error extracting data from tables:', error);
      return null;
    }
  };

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
        const { totalQuestions, totalImages, questionsWithImages } = response.data;
        
        let successMessage = `✅ ${totalQuestions} questions uploaded successfully!`;
        if (totalImages > 0) {
          successMessage += ` 🖼️ ${totalImages} images uploaded (${questionsWithImages} questions with images)`;
        }
        
        toast.success(successMessage);
        console.log("📊 Upload Statistics:", { totalQuestions, totalImages, questionsWithImages });
        
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
      console.error("Upload error details:", error);
      
      // Check if it's a partial success (some questions uploaded)
      const errorMessage = error.response?.data?.message || "Failed to upload file. Please try again.";
      
      // If the error mentions processing but questions were likely uploaded, show a different message
      if (errorMessage.includes("Internal server error") || errorMessage.includes("Cannot read properties")) {
        toast.warning("Upload completed with some issues. Please check if questions were added and refresh the page.");
        // Still refresh questions to show what was uploaded
        await fetchQuestions();
        setShowModal(false);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (question) => {
    // 🔧 FIX: Enhanced question content selection for mathematical expressions
    let questionContent = "";
    
    // Smart content selection: prefer tables if available and substantial, otherwise use questionText
    if (question.tables && question.tables.length > 0 && question.tables[0]) {
      const tableContent = question.tables[0];
      // If table content is very short or seems like plain text, prefer questionText
      if (tableContent.length < 50 && !tableContent.includes('<') && question.questionText) {
        questionContent = question.questionText;
      } else {
        questionContent = tableContent;
      }
    } else {
      questionContent = question.questionText || "";
    }
    
    // Initialize question images array if not present
    const questionImages = question.questionImage && Array.isArray(question.questionImage) 
      ? question.questionImage.map(url => ({ src: url, name: '', file: null }))
      : [];
    
    // Initialize option images for each option
    const optionsWithImages = question.options && Array.isArray(question.options)
      ? question.options.map(opt => ({
          ...opt,
          optionImage: opt.optionImage && Array.isArray(opt.optionImage)
            ? opt.optionImage.map(url => ({ src: url, name: '', file: null }))
            : []
        }))
      : [
          { optionText: "", isCorrect: false, optionImage: [] },
          { optionText: "", isCorrect: false, optionImage: [] },
          { optionText: "", isCorrect: false, optionImage: [] },
          { optionText: "", isCorrect: false, optionImage: [] },
        ];
    
    const updatedQuestion = {
      ...question,
      questionText: questionContent,
      questionImage: questionImages,
      questionType: question.questionType || "multiple_choice",
      options: optionsWithImages,
      solution: question.solution || "",
      questionCorrectMarks: question.questionCorrectMarks || 2,
      questionIncorrectMarks: question.questionIncorrectMarks || 0,
    };
    setSelectedQuestion(updatedQuestion);

    console.log("🔧 Enhanced question selected for editing:", {
      hasTableContent: !!(question.tables && question.tables[0]),
      hasQuestionText: !!question.questionText,
      selectedContent: questionContent.substring(0, 100) + "...",
      contentSource: questionContent === question.questionText ? "questionText" : "tables"
    });
    setEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedQuestion) return;

    // Validation - strip HTML tags for text validation
    const cleanedQuestionText = selectedQuestion.questionText?.replace(/<[^>]*>?/gm, '').trim() || "";
    const hasQuestionText = cleanedQuestionText.length > 0;
    const hasQuestionImage = selectedQuestion.questionImage && Array.isArray(selectedQuestion.questionImage) && selectedQuestion.questionImage.length > 0;

    if (!hasQuestionText && !hasQuestionImage) {
      toast.error("Question must have text or an image.");
      return;
    }

    // Validate options
    let hasValidOptions = false;
    for (let i = 0; i < selectedQuestion.options.length; i++) {
      const opt = selectedQuestion.options[i];
      const hasOptionText = opt.optionText && opt.optionText.trim().length > 0;
      const hasOptionImage = opt.optionImage && Array.isArray(opt.optionImage) && opt.optionImage.length > 0;
      if (hasOptionText || hasOptionImage) {
        hasValidOptions = true;
        break;
      }
    }

    if (!hasValidOptions) {
      toast.error("At least one option must have text or an image.");
      return;
    }

    const correctOptions = selectedQuestion.options.filter((opt) => opt.isCorrect);
    if (correctOptions.length === 0) {
      toast.error("Please select at least one correct option.");
      return;
    }

    if (!selectedQuestion.questionCorrectMarks || selectedQuestion.questionCorrectMarks <= 0) {
      toast.error("Please enter valid marks (greater than 0).");
      return;
    }

    try {
      setLoading(true);
      
      // Prepare question images - send as-is, backend will handle upload
      const questionImages = [];
      if (selectedQuestion.questionImage && Array.isArray(selectedQuestion.questionImage)) {
        selectedQuestion.questionImage.forEach(img => {
          const imgSrc = typeof img === 'string' ? img : img.src;
          if (imgSrc) {
            questionImages.push(imgSrc);
          }
        });
      }

      // Prepare option images - send as-is, backend will handle upload
      const processedOptions = [];
      for (let i = 0; i < selectedQuestion.options.length; i++) {
        const option = selectedQuestion.options[i];
        const optionImages = [];

        if (option.optionImage && Array.isArray(option.optionImage)) {
          option.optionImage.forEach(img => {
            const imgSrc = typeof img === 'string' ? img : img.src;
            if (imgSrc) {
              optionImages.push(imgSrc);
            }
          });
        }

        processedOptions.push({
          optionText: option.optionText || "",
          isCorrect: option.isCorrect || false,
          optionImage: optionImages
        });
      }

      const updatedQuestion = {
        questionText: selectedQuestion.questionText,
        questionImage: questionImages,
        questionType: selectedQuestion.questionType || "mcq",
        options: processedOptions,
        solution: selectedQuestion.solution || "",
        questionCorrectMarks: selectedQuestion.questionCorrectMarks,
        questionIncorrectMarks: selectedQuestion.questionIncorrectMarks || 0,
      };

      const response = await api.put(
        `/admin/quizzes/${quizId}/questions/${selectedQuestion._id}`,
        updatedQuestion
      );

      if (response.status === 200) {
        toast.success("Question updated successfully!");
        setEditModal(false);
        await fetchQuestions();
        await fetchQuizDetails();
      } else {
        toast.error("Failed to update question.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating question.");
      console.error("Error in updating question:", error);
    } finally {
      setLoading(false);
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

  // Handle edit question image upload
  const handleEditQuestionImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = {
        src: e.target.result,
        name: file.name.replace(/\.[^/.]+$/, ""),
        file: file
      };

      setSelectedQuestion((prev) => ({
        ...prev,
        questionImage: [...(prev.questionImage || []), imageData]
      }));
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  // Remove edit question image
  const handleRemoveEditQuestionImage = (imageIndex) => {
    setSelectedQuestion((prev) => ({
      ...prev,
      questionImage: prev.questionImage.filter((_, idx) => idx !== imageIndex)
    }));
  };

  // Handle edit option image upload
  const handleEditOptionImageUpload = (event, optionIndex) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = {
        src: e.target.result,
        name: file.name.replace(/\.[^/.]+$/, ""),
        file: file
      };

      setSelectedQuestion((prev) => {
        const updatedOptions = [...prev.options];
        if (!updatedOptions[optionIndex].optionImage) {
          updatedOptions[optionIndex].optionImage = [];
        }
        updatedOptions[optionIndex].optionImage.push(imageData);
        return { ...prev, options: updatedOptions };
      });
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  // Remove edit option image
  const handleRemoveEditOptionImage = (optionIndex, imageIndex) => {
    setSelectedQuestion((prev) => {
      const updatedOptions = [...prev.options];
      updatedOptions[optionIndex].optionImage = updatedOptions[optionIndex].optionImage.filter(
        (_, idx) => idx !== imageIndex
      );
      return { ...prev, options: updatedOptions };
    });
  };

  const quillRef = useRef();
  const addQuestionQuillRef = useRef();

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

  // Handle add question
  const handleOpenAddQuestion = () => {
    setNewQuestion({
      questionText: "",
      questionImage: [],
      questionType: "multiple_choice",
      options: [
        { optionText: "", isCorrect: false, optionImage: [] },
        { optionText: "", isCorrect: false, optionImage: [] },
        { optionText: "", isCorrect: false, optionImage: [] },
        { optionText: "", isCorrect: false, optionImage: [] },
      ],
      solution: "",
      questionCorrectMarks: 2,
      questionIncorrectMarks: 0,
    });
    setAddQuestionModal(true);
  };

  // Handle question image upload
  const handleQuestionImageUpload = (event, index = null) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = {
        src: e.target.result,
        name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension for name
        file: file
      };

      if (index !== null) {
        // Option image
        setNewQuestion((prev) => {
          const updatedOptions = [...prev.options];
          if (!updatedOptions[index].optionImage) {
            updatedOptions[index].optionImage = [];
          }
          updatedOptions[index].optionImage.push(imageData);
          return { ...prev, options: updatedOptions };
        });
      } else {
        // Question image
        setNewQuestion((prev) => ({
          ...prev,
          questionImage: [...(prev.questionImage || []), imageData]
        }));
      }
    };
    reader.readAsDataURL(file);
    event.target.value = ''; // Reset input
  };

  // Remove question image
  const handleRemoveQuestionImage = (imageIndex) => {
    setNewQuestion((prev) => ({
      ...prev,
      questionImage: prev.questionImage.filter((_, idx) => idx !== imageIndex)
    }));
  };

  // Remove option image
  const handleRemoveOptionImage = (optionIndex, imageIndex) => {
    setNewQuestion((prev) => {
      const updatedOptions = [...prev.options];
      updatedOptions[optionIndex].optionImage = updatedOptions[optionIndex].optionImage.filter(
        (_, idx) => idx !== imageIndex
      );
      return { ...prev, options: updatedOptions };
    });
  };

  const handleAddQuestionOptionChange = (optionIndex, value) => {
    setNewQuestion((prev) => {
      const updatedOptions = [...prev.options];
      updatedOptions[optionIndex].optionText = value;
      return { ...prev, options: updatedOptions };
    });
  };

  const handleAddQuestionCorrectOptionSelect = (idx) => {
    setNewQuestion((prev) => {
      const updatedOptions = prev.options.map((option, optionIdx) => ({
        ...option,
        isCorrect: optionIdx === idx,
      }));
      return { ...prev, options: updatedOptions };
    });
  };

  const handleAddQuestion = async () => {
    // Validation
    if (!newQuestion.questionText || newQuestion.questionText.trim() === "") {
      toast.error("Please enter a question text.");
      return;
    }

    // Check if at least one option has text (or image for options)
    const hasValidOptions = newQuestion.options.some((opt) => 
      (opt.optionText && opt.optionText.trim() !== "") || 
      (opt.optionImage && opt.optionImage.length > 0)
    );
    
    if (!hasValidOptions) {
      toast.error("Please fill in at least one option with text or image.");
      return;
    }

    const correctOptions = newQuestion.options.filter((opt) => opt.isCorrect);
    if (correctOptions.length === 0) {
      toast.error("Please select at least one correct option.");
      return;
    }

    if (!newQuestion.questionCorrectMarks || newQuestion.questionCorrectMarks <= 0) {
      toast.error("Please enter valid marks (greater than 0).");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(
        `/admin/quizzes/${quizId}/questions`,
        {
          questionText: newQuestion.questionText,
          questionImage: newQuestion.questionImage || [],
          questionType: newQuestion.questionType || "mcq",
          options: newQuestion.options.map(opt => ({
            optionText: opt.optionText || "",
            isCorrect: opt.isCorrect || false,
            optionImage: opt.optionImage || []
          })),
          solution: newQuestion.solution || "",
          questionCorrectMarks: newQuestion.questionCorrectMarks,
          questionIncorrectMarks: newQuestion.questionIncorrectMarks || 0,
        }
      );

      if (response.status === 201) {
        toast.success("Question added successfully!");
        setAddQuestionModal(false);
        setNewQuestion({
          questionText: "",
          questionImage: [],
          questionType: "multiple_choice",
          options: [
            { optionText: "", isCorrect: false, optionImage: [] },
            { optionText: "", isCorrect: false, optionImage: [] },
            { optionText: "", isCorrect: false, optionImage: [] },
            { optionText: "", isCorrect: false, optionImage: [] },
          ],
          solution: "",
          questionCorrectMarks: 2,
          questionIncorrectMarks: 0,
        });
        // Reset quill editor
        if (addQuestionQuillRef.current) {
          const editor = addQuestionQuillRef.current.getEditor();
          editor.root.innerHTML = "";
        }
        await fetchQuestions();
        await fetchQuizDetails(); // Refresh quiz details to update total marks
      } else {
        toast.error("Failed to add question.");
      }
    } catch (error) {
      console.error("Error adding question:", error);
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.error || 
                      "Failed to add question. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

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
              onClick={handleOpenAddQuestion}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700"
            >
              <FiPlus className="mr-2" />
              Add Question
            </button>
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

        {questions.map((question, index) => {
          console.log('🔍 Question Debug:', {
            questionIndex: index + 1,
            questionId: question._id,
            hasQuestionImage: !!question.questionImage,
            questionImageLength: question.questionImage?.length || 0,
            questionImageData: question.questionImage,
            questionText: question.questionText?.substring(0, 50) + '...',
            hasTables: !!question.tables,
            tablesLength: question.tables?.length || 0
          });
          
          // Extract data from tables array if question data is incomplete
          const extractedData = extractDataFromTables(question);
          const displayQuestion = extractedData ? { ...question, ...extractedData } : question;
          
          return (
          <div className="overflow-x-auto mb-6">
            <table className="w-full border border-gray-700 bg-[#0d0d0d] rounded-lg shadow-lg">
              <thead>
                <tr>
                  <th
                    colSpan="2"
                    className="p-4 text-left text-white font-semibold border-b border-gray-700"
                  >
                    Question {index + 1}
                  </th>
                </tr>
              </thead>

              <tbody>
                {/* Question Row */}
                <tr>
                  <td className="p-4 font-medium text-white border-b border-gray-700 w-1/4">
                    Question
                  </td>
                  <td className="p-4 border-b border-gray-700 text-white">
                    {/* 🔧 NEW: Use QuestionRenderer for LaTeX support and image rendering */}
                    {/* QuestionRenderer now handles both math expressions (parts) and images (questionImage) */}
                    <QuestionRenderer 
                      question={displayQuestion} 
                      className="text-white"
                    />
                  </td>
                </tr>

                {/* Type Row */}
                {displayQuestion.questionType && (
                  <tr className="border-b border-gray-700">
                    <td className="p-4 font-medium text-white">
                      Type
                    </td>
                    <td className="p-4 text-white">
                      <span className="capitalize">{displayQuestion.questionType.replace('_', ' ')}</span>
                    </td>
                  </tr>
                )}

                {/* Options - Simple A, B, C, D format */}
                {displayQuestion.options && displayQuestion.options.length > 0 && (
                  <tr className="border-b border-gray-700">
                    <td className="p-4 font-medium text-white">
                      Options
                    </td>
                    <td className="p-4 text-white">
                      <div className="space-y-3">
                        {displayQuestion.options.map((option, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <span className="font-semibold text-white min-w-[30px]">
                              {String.fromCharCode(65 + idx)})
                            </span>
                            <div className="flex-1">
                              <span>{option.optionText || ""}</span>
                              {option.optionImage && option.optionImage.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {option.optionImage.map((imageUrl, imgIdx) => {
                                    // Backend already returns presigned URLs, use directly
                                    const isPresignedUrl = imageUrl && (
                                      imageUrl.includes('X-Amz-Signature') || 
                                      imageUrl.includes('X-Amz-Algorithm') ||
                                      imageUrl.includes('?X-Amz-')
                                    );
                                    const finalUrl = isPresignedUrl ? imageUrl : (getOptimizedQuizImage(imageUrl) || imageUrl);
                                    
                                    return (
                                      <div key={imgIdx} className="mb-2">
                                        <img
                                          src={finalUrl}
                                          alt={`Option ${String.fromCharCode(65 + idx)} image ${imgIdx + 1}`}
                                          className="max-w-full h-auto rounded-md shadow-md border border-gray-700"
                                          style={{ maxHeight: '200px' }}
                                          crossOrigin="anonymous"
                                          onError={(e) => { 
                                            console.error('❌ Option image failed to load:', imageUrl);
                                            e.target.style.display = 'none'; 
                                          }}
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}

                {/* Solution Row */}
                {displayQuestion.solution && displayQuestion.solution.trim() && (
                  <tr className="border-b border-gray-700">
                    <td className="p-4 font-medium text-white">
                      Solution
                    </td>
                    <td className="p-4 text-white">
                      <span>{displayQuestion.solution}</span>
                    </td>
                  </tr>
                )}

                {/* Marks Row */}
                <tr className="border-b border-gray-700">
                  <td className="p-4 font-medium text-white">
                    Marks
                  </td>
                  <td className="p-4 text-white">
                    <span className="text-green-400 font-semibold">+{displayQuestion.questionCorrectMarks || 0}</span>
                    {displayQuestion.questionIncorrectMarks > 0 && (
                      <span className="text-red-400 font-semibold ml-4">-{displayQuestion.questionIncorrectMarks}</span>
                    )}
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
          );
        })}

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

        {/* Edit Question Modal - Table Style */}
        {editModal && selectedQuestion && (
          <div className="fixed inset-0 flex items-center justify-center text-white bg-black bg-opacity-50 z-50">
            <div className="w-4/5 max-w-5xl max-h-[90vh] overflow-y-auto p-6 rounded-lg shadow-lg text-white bg-[#0d0d0d]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Edit Question</h2>
                <button
                  onClick={() => setEditModal(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <MdClose size={24} />
                </button>
              </div>
              
              <table className="w-full border border-gray-700 bg-[#0d0d0d] rounded-lg shadow-md">
                <tbody>
                  {/* Question Row */}
                  <tr>
                    <td className="p-4 font-medium text-white border-b border-gray-700 w-1/4">
                      Question
                    </td>
                    <td className="p-4 border-b border-gray-700">
                      <ReactQuill
                        ref={quillRef}
                        value={selectedQuestion.questionText || ""}
                        onChange={(value) =>
                          setSelectedQuestion((prev) => ({
                            ...prev,
                            questionText: value,
                          }))
                        }
                        style={{
                          minHeight: "120px",
                          backgroundColor: "black",
                          color: "white",
                        }}
                      />
                      {/* Question Image Upload */}
                      <div className="mt-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditQuestionImageUpload}
                          className="w-full px-3 py-2 bg-[#0d0d0d] text-white border border-gray-600 rounded-md text-sm"
                        />
                        {selectedQuestion.questionImage && selectedQuestion.questionImage.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedQuestion.questionImage.map((img, imgIdx) => {
                              const imgSrc = typeof img === 'string' ? img : img.src;
                              const isPresignedUrl = imgSrc && (
                                imgSrc.includes('X-Amz-Signature') || 
                                imgSrc.includes('X-Amz-Algorithm') ||
                                imgSrc.includes('?X-Amz-')
                              );
                              const finalUrl = isPresignedUrl ? imgSrc : (getOptimizedQuizImage(imgSrc) || imgSrc);
                              
                              return (
                                <div key={imgIdx} className="relative">
                                  <img
                                    src={finalUrl}
                                    alt={`Question image ${imgIdx + 1}`}
                                    className="w-20 h-20 object-cover rounded border border-gray-600"
                                  />
                                  <button
                                    onClick={() => handleRemoveEditQuestionImage(imgIdx)}
                                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
                                  >
                                    ×
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Type Row */}
                  <tr>
                    <td className="p-4 font-medium text-white border-b border-gray-700">
                      Type
                    </td>
                    <td className="p-4 border-b border-gray-700">
                      <select
                        value={selectedQuestion.questionType || "multiple_choice"}
                        onChange={(e) =>
                          setSelectedQuestion((prev) => ({
                            ...prev,
                            questionType: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 bg-[#0d0d0d] text-white border border-gray-600 rounded-md"
                      >
                        <option value="mcq">MCQ</option>
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="integer">Integer</option>
                      </select>
                    </td>
                  </tr>

                  {/* Options Rows */}
                  {selectedQuestion.options && selectedQuestion.options.map((option, idx) => (
                    <tr key={idx}>
                      <td className="p-4 font-medium text-white border-b border-gray-700">
                        Option
                      </td>
                      <td className="p-4 border-b border-gray-700">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={option.optionText || ""}
                              onChange={(e) =>
                                handleOptionChange(idx, e.target.value)
                              }
                              placeholder={`${String.fromCharCode(65 + idx)}) Enter option text`}
                              className="w-full px-3 py-2 bg-[#0d0d0d] text-white border border-gray-600 rounded-md"
                            />
                            {/* Option Image Upload */}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleEditOptionImageUpload(e, idx)}
                              className="w-full px-3 py-2 bg-[#0d0d0d] text-white border border-gray-600 rounded-md mt-2 text-sm"
                            />
                            {option.optionImage && option.optionImage.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {option.optionImage.map((img, imgIdx) => {
                                  const imgSrc = typeof img === 'string' ? img : img.src;
                                  const isPresignedUrl = imgSrc && (
                                    imgSrc.includes('X-Amz-Signature') || 
                                    imgSrc.includes('X-Amz-Algorithm') ||
                                    imgSrc.includes('?X-Amz-')
                                  );
                                  const finalUrl = isPresignedUrl ? imgSrc : (getOptimizedQuizImage(imgSrc) || imgSrc);
                                  
                                  return (
                                    <div key={imgIdx} className="relative">
                                      <img
                                        src={finalUrl}
                                        alt={`Option ${String.fromCharCode(65 + idx)} image ${imgIdx + 1}`}
                                        className="w-20 h-20 object-cover rounded border border-gray-600"
                                      />
                                      <button
                                        onClick={() => handleRemoveEditOptionImage(idx, imgIdx)}
                                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="inline-flex items-center text-gray-300 cursor-pointer">
                              <input
                                type="radio"
                                name="editCorrectOption"
                                checked={option.isCorrect || false}
                                onChange={() => handleCorrectOptionSelect(idx)}
                                className="form-radio h-4 w-4 text-green-600"
                              />
                              <span className="ml-2 text-sm">
                                {option.isCorrect ? (
                                  <span className="text-green-400 font-semibold">Correct</span>
                                ) : (
                                  <span className="text-red-400">Incorrect</span>
                                )}
                              </span>
                            </label>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* Solution Row */}
                  <tr>
                    <td className="p-4 font-medium text-white border-b border-gray-700">
                      Solution
                    </td>
                    <td className="p-4 border-b border-gray-700">
                      <input
                        type="text"
                        value={selectedQuestion.solution || ""}
                        onChange={(e) =>
                          setSelectedQuestion((prev) => ({
                            ...prev,
                            solution: e.target.value,
                          }))
                        }
                        placeholder="Enter solution explanation (optional)"
                        className="w-full px-4 py-2 bg-[#0d0d0d] text-white border border-gray-600 rounded-md"
                      />
                    </td>
                  </tr>

                  {/* Marks Row */}
                  <tr>
                    <td className="p-4 font-medium text-white border-b border-gray-700">
                      Marks
                    </td>
                    <td className="p-4 border-b border-gray-700">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-sm text-gray-300 mb-1">Correct Marks</label>
                          <input
                            type="number"
                            min="0"
                            value={selectedQuestion.questionCorrectMarks || 2}
                            onChange={(e) =>
                              setSelectedQuestion((prev) => ({
                                ...prev,
                                questionCorrectMarks: parseInt(e.target.value) || 0,
                              }))
                            }
                            className="w-full px-4 py-2 bg-[#0d0d0d] text-white border border-gray-600 rounded-md"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm text-gray-300 mb-1">Incorrect Marks</label>
                          <input
                            type="number"
                            min="0"
                            value={selectedQuestion.questionIncorrectMarks || 0}
                            onChange={(e) =>
                              setSelectedQuestion((prev) => ({
                                ...prev,
                                questionIncorrectMarks: parseInt(e.target.value) || 0,
                              }))
                            }
                            className="w-full px-4 py-2 bg-[#0d0d0d] text-white border border-gray-600 rounded-md"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Action Buttons */}
                  <tr>
                    <td colSpan="2" className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditModal(false)}
                          className="px-4 py-2 bg-gray-600 text-white rounded-md shadow-md hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          disabled={loading}
                          className="px-4 py-2 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 disabled:opacity-50"
                        >
                          {loading ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
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

        {/* Add Question Modal - Table Style */}
        {addQuestionModal && (
          <div className="fixed inset-0 flex items-center justify-center text-white bg-black bg-opacity-50 z-50">
            <div className="w-4/5 max-w-5xl max-h-[90vh] overflow-y-auto p-6 rounded-lg shadow-lg text-white bg-[#0d0d0d]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Add New Question</h2>
                <button
                  onClick={() => setAddQuestionModal(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <MdClose size={24} />
                </button>
              </div>
              
              <table className="w-full border border-gray-700 bg-[#0d0d0d] rounded-lg shadow-md">
                <tbody>
                  {/* Question Row */}
                  <tr>
                    <td className="p-4 font-medium text-white border-b border-gray-700 w-1/4">
                      Question
                    </td>
                    <td className="p-4 border-b border-gray-700">
                      <ReactQuill
                        ref={addQuestionQuillRef}
                        value={newQuestion.questionText}
                        onChange={(value) =>
                          setNewQuestion((prev) => ({
                            ...prev,
                            questionText: value,
                          }))
                        }
                        style={{
                          minHeight: "120px",
                          backgroundColor: "black",
                          color: "white",
                        }}
                      />
                      {/* Question Image Upload */}
                      <div className="mt-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleQuestionImageUpload(e)}
                          className="w-full px-3 py-2 bg-[#0d0d0d] text-white border border-gray-600 rounded-md text-sm"
                        />
                        {newQuestion.questionImage && newQuestion.questionImage.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {newQuestion.questionImage.map((img, imgIdx) => (
                              <div key={imgIdx} className="relative">
                                <img
                                  src={img.src}
                                  alt={`Question image ${imgIdx + 1}`}
                                  className="w-20 h-20 object-cover rounded border border-gray-600"
                                />
                                <button
                                  onClick={() => handleRemoveQuestionImage(imgIdx)}
                                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Type Row */}
                  <tr>
                    <td className="p-4 font-medium text-white border-b border-gray-700">
                      Type
                    </td>
                    <td className="p-4 border-b border-gray-700">
                      <select
                        value={newQuestion.questionType}
                        onChange={(e) =>
                          setNewQuestion((prev) => ({
                            ...prev,
                            questionType: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 bg-[#0d0d0d] text-white border border-gray-600 rounded-md"
                      >
                        <option value="mcq">MCQ</option>
                        {/* <option value="multiple_choice">Multiple Choice</option> */}
                        <option value="integer">Integer</option>
                      </select>
                    </td>
                  </tr>

                  {/* Options Rows */}
                  {newQuestion.options.map((option, idx) => (
                    <tr key={idx}>
                      <td className="p-4 font-medium text-white border-b border-gray-700">
                        Option
                      </td>
                      <td className="p-4 border-b border-gray-700">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={option.optionText || ""}
                              onChange={(e) =>
                                handleAddQuestionOptionChange(idx, e.target.value)
                              }
                              placeholder={`${String.fromCharCode(65 + idx)}) Enter option text`}
                              className="w-full px-3 py-2 bg-[#0d0d0d] text-white border border-gray-600 rounded-md"
                            />
                            {/* Option Image Upload */}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleQuestionImageUpload(e, idx)}
                              className="w-full px-3 py-2 bg-[#0d0d0d] text-white border border-gray-600 rounded-md mt-2 text-sm"
                            />
                            {option.optionImage && option.optionImage.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {option.optionImage.map((img, imgIdx) => (
                                  <div key={imgIdx} className="relative">
                                    <img
                                      src={img.src}
                                      alt={`Option ${String.fromCharCode(65 + idx)} image ${imgIdx + 1}`}
                                      className="w-20 h-20 object-cover rounded border border-gray-600"
                                    />
                                    <button
                                      onClick={() => handleRemoveOptionImage(idx, imgIdx)}
                                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="inline-flex items-center text-gray-300 cursor-pointer">
                              <input
                                type="radio"
                                name="correctOption"
                                checked={option.isCorrect || false}
                                onChange={() => handleAddQuestionCorrectOptionSelect(idx)}
                                className="form-radio h-4 w-4 text-green-600"
                              />
                              <span className="ml-2 text-sm">
                                {option.isCorrect ? (
                                  <span className="text-green-400 font-semibold">Correct</span>
                                ) : (
                                  <span className="text-red-400">Incorrect</span>
                                )}
                              </span>
                            </label>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* Solution Row */}
                  <tr>
                    <td className="p-4 font-medium text-white border-b border-gray-700">
                      Solution
                    </td>
                    <td className="p-4 border-b border-gray-700">
                      <input
                        type="text"
                        value={newQuestion.solution || ""}
                        onChange={(e) =>
                          setNewQuestion((prev) => ({
                            ...prev,
                            solution: e.target.value,
                          }))
                        }
                        placeholder="Enter solution explanation (optional)"
                        className="w-full px-4 py-2 bg-[#0d0d0d] text-white border border-gray-600 rounded-md"
                      />
                    </td>
                  </tr>

                  {/* Marks Row */}
                  <tr>
                    <td className="p-4 font-medium text-white border-b border-gray-700">
                      Marks
                    </td>
                    <td className="p-4 border-b border-gray-700">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-sm text-gray-300 mb-1">Correct Marks</label>
                          <input
                            type="number"
                            min="0"
                            value={newQuestion.questionCorrectMarks}
                            onChange={(e) =>
                              setNewQuestion((prev) => ({
                                ...prev,
                                questionCorrectMarks: parseInt(e.target.value) || 0,
                              }))
                            }
                            className="w-full px-4 py-2 bg-[#0d0d0d] text-white border border-gray-600 rounded-md"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm text-gray-300 mb-1">Incorrect Marks</label>
                          <input
                            type="number"
                            min="0"
                            value={newQuestion.questionIncorrectMarks}
                            onChange={(e) =>
                              setNewQuestion((prev) => ({
                                ...prev,
                                questionIncorrectMarks: parseInt(e.target.value) || 0,
                              }))
                            }
                            className="w-full px-4 py-2 bg-[#0d0d0d] text-white border border-gray-600 rounded-md"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td colSpan="2" className="p-4 text-right">
                      <button
                        onClick={() => setAddQuestionModal(false)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md shadow-md hover:bg-gray-700 mr-2"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddQuestion}
                        disabled={loading}
                        className="px-4 py-2 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 disabled:opacity-50"
                      >
                        {loading ? "Adding..." : "Add Question"}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HOC(TestDetailsPage);
