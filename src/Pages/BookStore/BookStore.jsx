import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  Button,
  Input,
  Form,
  Select,
  Upload,
  Modal,
  message,
  Spin,
  Empty,
  Tooltip,
  Badge,
  Row,
  Col,
  Tag
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  BookOutlined,
  ArrowLeftOutlined,
  SaveOutlined
} from "@ant-design/icons";
import HOC from "../../Component/HOC/HOC";
import api from "../../api/axios";
import { getOptimizedBookImage, handleImageError } from "../../utils/imageUtils";
import "./BookStore.css";

const { TextArea } = Input;
const { Option } = Select;
const { Meta } = Card;

// --- Components ---

const BookCard = React.memo(({ book, onEdit, onDelete }) => {
  const discount = useMemo(() => {
    if (!book.stock || !book.price) return 0;
    return Math.round(((book.stock - book.price) / book.stock) * 100);
  }, [book.stock, book.price]);

  return (
    <Card
      hoverable
      className="book-card"
      cover={
        <div className="book-image-container">
          <img
            alt={book.name}
            src={getOptimizedBookImage(book)}
            onError={handleImageError}
            className="book-image"
            loading="lazy"
          />
          {discount > 0 && (
            <Badge.Ribbon text={`${discount}% OFF`} color="red" className="book-ribbon" />
          )}
        </div>
      }
      actions={[
        <Tooltip title="Edit">
          <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(book._id)} className="text-blue-500 hover:text-blue-400" />
        </Tooltip>,
        <Tooltip title="Delete">
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => onDelete(book._id)} />
        </Tooltip>
      ]}
    >
      <Meta
        title={<Tooltip title={book.name}><span className="book-title text-white">{book.name}</span></Tooltip>}
        description={
          <div className="flex flex-col gap-1">
            <span className="book-author text-gray-400"><BookOutlined className="mr-1" /> {book.author || 'Unknown Author'}</span>
            <div className="book-price-row mt-2">
              <span className="book-price">₹{book.price}</span>
              <span className="original-price">₹{book.stock}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {book.courseNames?.slice(0, 2).map((c, i) => (
                <Tag color="blue" key={i} className="m-0 text-xs">{c}</Tag>
              ))}
              {book.courseNames?.length > 2 && <Tag className="m-0 text-xs">+{book.courseNames.length - 2}</Tag>}
            </div>
          </div>
        }
      />
    </Card>
  );
});

const BookForm = ({ id, switchToList, fetchBooks }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState({ data: [] });
  const [fileList, setFileList] = useState([]);
  const [primaryFile, setPrimaryFile] = useState([]);

  // Fetch initial data
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

  useEffect(() => {
    if (id) {
      setLoading(true);
      api.get(`/admin/books/${id}`)
        .then((response) => {
          const bookData = response.data;
          const { dimensions = {}, ...rest } = bookData;
          form.setFieldsValue({
            ...rest,
            length: dimensions.length,
            breadth: dimensions.breadth,
            height: dimensions.height,
            weight: dimensions.weight,
          });

          // Set Primary Image
          if (bookData.imageUrl) {
            setPrimaryFile([{
              uid: '-1',
              name: 'Primary Image',
              status: 'done',
              url: bookData.imageUrl,
            }]);
          } else {
            setPrimaryFile([]);
          }

          // Set Additional Images
          if (bookData.additionalImages && bookData.additionalImages.length > 0) {
            setFileList(bookData.additionalImages.map((url, index) => ({
              uid: `-${index + 2}`,
              name: `Image ${index + 1}`,
              status: 'done',
              url: url,
            })));
          } else {
            setFileList([]);
          }
        })
        .catch(() => message.error("Failed to load book details"))
        .finally(() => setLoading(false));
    } else {
      form.resetFields();
      setPrimaryFile([]);
      setFileList([]);
    }
  }, [id, form]);

  const onFinish = async (values) => {
    setLoading(true);
    const formData = new FormData();

    // Append standard fields
    Object.keys(values).forEach(key => {
      if (key !== 'images' && key !== 'primaryImage' && key !== 'courseNames' && values[key] !== undefined) {
        formData.append(key, values[key]);
      }
    });

    // Special handling for courseNames
    if (values.courseNames) {
      formData.append("courseNames", JSON.stringify(values.courseNames));
    }

    // Handle Images
    if (primaryFile.length > 0) {
      if (primaryFile[0].originFileObj) {
        formData.append("images", primaryFile[0].originFileObj);
      }
    } else {
      // If no primary file is present, it means it was deleted
      formData.append("deletePrimaryImage", "true");
    }

    if (fileList.length > 0) {
      fileList.forEach(file => {
        if (file.originFileObj) {
          formData.append("images", file.originFileObj);
        }
      });
    } else {
      formData.append("deleteAdditionalImages", "true");
    }

    try {
      if (id) {
        await api.put(`/admin/books/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        message.success("Book updated successfully");
      } else {
        await api.post("/admin/books", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        message.success("Book added successfully");
      }
      fetchBooks();
      switchToList();
    } catch (error) {
      console.error(error);
      message.error("Failed to save book");
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (file) => {
    let src = file.url || file.preview;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }

    Modal.info({
      title: 'Image Preview',
      content: (
        <img src={src} alt="Preview" style={{ width: '100%' }} />
      ),
      width: 600,
      maskClosable: true,
      icon: null,
      footer: null,
      className: 'dark-modal'
    });
  };

  return (
    <div className="book-form-container fade-in">
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-[#262626]">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={switchToList}
          className="text-gray-400 hover:text-white"
        />
        <h2 className="text-2xl font-bold text-white m-0">{id ? "Edit Book" : "Add New Book"}</h2>
      </div>

      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="max-w-4xl mx-auto"
          initialValues={{ showUnder: "home", courseNames: [] }}
        >
          <Row gutter={24}>
            <Col xs={24} md={16}>
              <Card className="bg-[#171717] border-[#262626] mb-6">
                <Form.Item name="name" label={<span className="text-gray-400">Book Name</span>} rules={[{ required: true }]}>
                  <Input className="dark-input" placeholder="Enter book title" size="large" />
                </Form.Item>
                <Form.Item name="author" label={<span className="text-gray-400">Author</span>}>
                  <Input className="dark-input" prefix={<BookOutlined />} placeholder="Author name" />
                </Form.Item>
                <Form.Item name="description" label={<span className="text-gray-400">Description</span>} rules={[{ required: true }]}>
                  <TextArea rows={6} className="dark-input" placeholder="Book description..." />
                </Form.Item>
              </Card>

              <Card className="bg-[#171717] border-[#262626] mb-6" title={<span className="text-white">Product Dimensions</span>}>
                <Row gutter={16}>
                  <Col span={6}><Form.Item name="length" label={<span className="text-gray-400">Length (cm)</span>}><Input type="number" className="dark-input" /></Form.Item></Col>
                  <Col span={6}><Form.Item name="breadth" label={<span className="text-gray-400">Breadth (cm)</span>}><Input type="number" className="dark-input" /></Form.Item></Col>
                  <Col span={6}><Form.Item name="height" label={<span className="text-gray-400">Height (cm)</span>}><Input type="number" className="dark-input" /></Form.Item></Col>
                  <Col span={6}><Form.Item name="weight" label={<span className="text-gray-400">Weight (kg)</span>}><Input type="number" className="dark-input" /></Form.Item></Col>
                </Row>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card className="bg-[#171717] border-[#262626] mb-6">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="price" label={<span className="text-gray-400">Selling Price</span>} rules={[{ required: true }]}>
                      <Input prefix="₹" type="number" className="dark-input" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="stock" label={<span className="text-gray-400">MRP</span>} rules={[{ required: true }]}>
                      <Input prefix="₹" type="number" className="dark-input" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="showUnder" label={<span className="text-gray-400">Category Tag</span>}>
                  <Select className="dark-select" popupClassName="dark-select-dropdown">
                    <Option value="home">Trending</Option>
                    <Option value="student">Bestselling</Option>
                    <Option value="both">Teacher's Pick</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="courseNames" label={<span className="text-gray-400">Courses</span>}>
                  <Select mode="tags" className="dark-select" popupClassName="dark-select-dropdown" placeholder="Select/Add courses">
                    <Option value="Book Store">Book Store</Option>
                    {courses.data?.map(c => <Option key={c._id} value={c.title}>{c.title}</Option>)}
                  </Select>
                </Form.Item>
              </Card>

              <Card className="bg-[#171717] border-[#262626] mb-6" title={<span className="text-white">Images</span>}>
                <Form.Item label={<span className="text-gray-400">Primary Image</span>}>
                  <div className="flex flex-col gap-3">
                    <Upload
                      beforeUpload={() => false}
                      fileList={primaryFile}
                      onChange={({ fileList }) => setPrimaryFile(fileList)}
                      onPreview={handlePreview}
                      maxCount={1}
                      listType="picture-card"
                      className="dark-upload"
                    >
                      {primaryFile.length < 1 && <div><PlusOutlined className="text-white" /> <div className="mt-2 text-white">Upload</div></div>}
                    </Upload>
                    {primaryFile.length > 0 && (
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => setPrimaryFile([])}
                        className="dark-btn-secondary"
                        style={{ maxWidth: '120px' }}
                      >
                        Change
                      </Button>
                    )}
                  </div>
                </Form.Item>
                <Form.Item label={<span className="text-gray-400">Additional Images</span>}>
                  <Upload
                    beforeUpload={() => false}
                    fileList={fileList}
                    multiple
                    onChange={({ fileList }) => setFileList(fileList)}
                    onPreview={handlePreview}
                    listType="picture-card"
                    className="dark-upload"
                  >
                    <div><PlusOutlined className="text-white" /> <div className="mt-2 text-white">Add More</div></div>
                  </Upload>
                </Form.Item>
              </Card>

              <Button type="primary" htmlType="submit" block size="large" icon={<SaveOutlined />} className="bg-blue-600 hover:bg-blue-700 h-12">
                {id ? "Update Book" : "Publish Book"}
              </Button>
            </Col>
          </Row>
        </Form>
      </Spin>
    </div>
  );
};


const BookStore = () => {
  const [view, setView] = useState("list");
  const [editingBookId, setEditingBookId] = useState(null);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Search state
  const [searchText, setSearchText] = useState("");

  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/admin/books");
      setBooks(response.data);
    } catch (error) {
      console.error("Error fetching books", error);
      message.error("Failed to load books");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleDeleteBook = useCallback(async (id) => {
    Modal.confirm({
      title: 'Delete Book',
      content: 'Are you sure you want to delete this book? This action cannot be undone.',
      okText: 'Yes Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      centered: true,
      maskClosable: true,
      onOk: async () => {
        try {
          await api.delete(`/admin/books/${id}`);
          message.success("Book deleted successfully");
          setBooks(prev => prev.filter(b => b._id !== id));
        } catch (e) {
          message.error("Failed to delete book");
        }
      }
    });
  }, []);

  const filteredBooks = useMemo(() => {
    if (!searchText) return books;
    return books.filter(b => b.name.toLowerCase().includes(searchText.toLowerCase()) || b.author?.toLowerCase().includes(searchText.toLowerCase()));
  }, [books, searchText]);

  return (
    <div className="bookstore-container">
      {view === "list" && (
        <>
          <div className="bookstore-header flex flex-col md:flex-row gap-4 md:gap-0">
            <div className="w-full md:w-auto mb-4 md:mb-0">
              <h1 className="bookstore-title">Book Store</h1>
              <p className="text-gray-400 m-0">Manage your inventory and products</p>
            </div>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <Input
                prefix={<SearchOutlined className="text-gray-500" />}
                placeholder="Search books..."
                className="dark-input w-full md:w-64"
                onChange={e => setSearchText(e.target.value)}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => { setEditingBookId(null); setView("form"); }}
                className="bg-blue-600 hover:bg-blue-700 border-none w-full md:w-auto"
              >
                Add Book
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <Card key={i} loading className="bg-[#171717] border-[#262626]" />)}
            </div>
          ) : filteredBooks.length > 0 ? (
            <div className="books-grid">
              {filteredBooks.map(book => (
                <BookCard
                  key={book._id}
                  book={book}
                  onEdit={(id) => { setEditingBookId(id); setView("form"); }}
                  onDelete={handleDeleteBook}
                />
              ))}
            </div>
          ) : (
            <Empty description={<span className="text-gray-500">No books found</span>} className="mt-20" />
          )}
        </>
      )}

      {view === "form" && (
        <BookForm
          id={editingBookId}
          switchToList={() => setView("list")}
          fetchBooks={fetchBooks}
        />
      )}
    </div>
  );
};

export default HOC(BookStore);
