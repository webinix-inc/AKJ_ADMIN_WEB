import React, { Suspense, lazy } from "react";
import "./App.css";
import "antd/dist/reset.css"; // ✅ Correct for AntD v5
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";

// Components (Eager Loading)
import AdminRoute from "./Component/utils/ProtectedRoute";
import Login from "./Pages/Login/Login";

// Lazy Loaded Components
const Home = lazy(() => import("./Pages/Home/Home"));
const AllCourses = lazy(() => import("./Pages/Courses & Tests/AllCourses"));
const AllCoursesDatails = lazy(() => import("./Pages/Courses & Tests/AllCoursesDatails"));
const Courses = lazy(() => import("./Pages/Courses & Tests/Courses"));
const CoursesEdit = lazy(() => import("./Pages/Courses & Tests/CoursesEdit"));
const FreeVideo = lazy(() => import("./Pages/Courses & Tests/FreeVideo"));

const Plans = lazy(() => import("./Pages/Plans/Plans"));
const Settings = lazy(() => import("./Pages/Settings/Settings"));
const Notification = lazy(() => import("./Pages/Notification/Notification"));
const BookStore = lazy(() => import("./Pages/BookStore/BookStore"));
const Messages = lazy(() => import("./Pages/Messages/Messages"));

const CoursesFolder = lazy(() => import("./Pages/Content/CoursesFolder"));
const FolderComponent = lazy(() => import("./Pages/Content/FolderStructure"));
const FolderContents = lazy(() => import("./Pages/Content/FolderContents"));
const SubjectsFolder = lazy(() => import("./Pages/Content/SubjectsFolder"));
const ChaptersFolder = lazy(() => import("./Pages/Content/ChaptersFolder"));
const ChapterContent = lazy(() => import("./Pages/Content/ChapterContent"));

const TestPanel = lazy(() => import("./Pages/TestPanel/TestPanel"));
const TestCreationPage = lazy(() => import("./Pages/TestPanel/TestCreationPage"));
const TestDetailsPage = lazy(() => import("./Pages/TestPanel/TestDetailsPage"));

// Existing Lazy Loads
const Orders = lazy(() => import("./Pages/Orders/Orders"));
const BookOrders = lazy(() => import("./Pages/Orders/BookOrders"));
const Teachers = lazy(() => import("./Pages/Teachers/Teachers"));
const TeacherProfile = lazy(() => import("./Pages/Teachers/TeacherProfile"));
const AddTeacher = lazy(() => import("./Pages/Teachers/AddTeacher"));
const Students = lazy(() => import("./Pages/Students/Students"));
const StudentProfile = lazy(() => import("./Pages/Students/StudentProfile"));
const SelfService = lazy(() => import("./Pages/Self Service/SelfService"));
const AddCoupon = lazy(() => import("./Pages/Self Service/AddCoupon"));
const ManageBanners = lazy(() => import("./Pages/Self Service/ManageBanners"));
const ClientTestimonial = lazy(() => import("./Pages/Self Service/clientTestimonial.jsx"));
const EntranceExam = lazy(() => import("./Pages/Self Service/entranceExam.jsx"));
const Enquries = lazy(() => import("./Pages/Self Service/Enquries.jsx"));
const Achiever = lazy(() => import("./Pages/Self Service/Achiever.jsx"));
const VideoMarketing = lazy(() => import("./Pages/Self Service/VideoMarketing.jsx"));
const ManageCoupons = lazy(() => import("./Pages/Self Service/ManageCoupons.jsx"));
const ImportantLink = lazy(() => import("./Pages/Self Service/ImportantLink.jsx"));
const CourseAccess = lazy(() => import("./Pages/Self Service/CourseAccess.jsx"));
const EditCoupon = lazy(() => import("./Pages/Self Service/EditCoupon.jsx"));

// Loading Fallback Component
const Loading = () => (
  <div className="flex flex-col justify-center items-center h-screen bg-black">
    {/* Animated Spinner with Gradient Border */}
    <div className="relative w-16 h-16">
      <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500/30 rounded-full"></div>
      <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    {/* Loading Text with Pulse Effect */}
    <div className="mt-4 flex items-center space-x-1">
      <span className="text-gray-400 text-sm font-medium tracking-widest uppercase animate-pulse">Loading System</span>
      <span className="flex space-x-1">
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
      </span>
    </div>
  </div>
);

function App() {
  const adminData = useSelector((state) => state.admin.adminData);

  // console.log("Admidata is this :", adminData); // Removed excessive logs for performance

  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Public Routes (Eager) */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes (Lazy) */}
          <Route element={<AdminRoute />}>
            <Route path="/home" element={<Home />} />
          </Route>

          <Route
            element={
              <AdminRoute requiredPermissions={["marketingServicesPermission"]} />
            }
          >
            <Route path="/settings" element={<Settings />} />
            <Route path="/notification" element={<Notification />} />
          </Route>

          <Route
            element={
              <AdminRoute requiredPermissions={["reportAndAnalyticPermission"]} />
            }
          >
            <Route path="/orders" element={<Orders />} />
            <Route path="/books/orders" element={<BookOrders />} />
          </Route>

          <Route
            element={<AdminRoute requiredPermissions={["planPermission"]} />}
          >
            <Route path="/plans" element={<Plans />} />
          </Route>

          <Route
            element={<AdminRoute requiredPermissions={["coursesPermission"]} />}
          >
            <Route path="/courses_tests/courses" element={<Courses />} />
            <Route
              path="/courses_tests/courses/allcourses"
              element={<AllCourses />}
            />
            <Route
              path="/courses_tests/courses/edit/:id"
              element={<CoursesEdit />}
            />
            <Route
              path="/courses_tests/courses/allcourses/details"
              element={<AllCoursesDatails />}
            />
            <Route path="/courses_tests/freeVideo" element={<FreeVideo />} />
          </Route>

          <Route
            element={
              <AdminRoute requiredPermissions={["testPortalPermission"]} />
            }
          >
            <Route path="/content/testpanel" element={<TestPanel />} />
            <Route path="/content/testpanel/:id" element={<TestCreationPage />} />
            <Route path="/test-details/:id" element={<TestDetailsPage />} />
          </Route>

          <Route
            element={<AdminRoute requiredPermissions={["coursesPermission"]} />}
          >
            <Route path="/content/courses" element={<CoursesFolder />} />
            <Route path="/folder" element={<FolderComponent />} />
            <Route path="/folder/:folderId" element={<FolderContents />} />
            <Route path="/content/subjects/:id" element={<SubjectsFolder />} />
            <Route
              path="/content/subjects/:id/chapters"
              element={<ChaptersFolder />}
            />
            <Route
              path="/content/subjects/:id/chapters/:chapterId"
              element={<ChapterContent />}
            />
          </Route>

          <Route
            element={<AdminRoute requiredPermissions={["bookStorePermission"]} />}
          >
            <Route path="/bookStore" element={<BookStore />} />
          </Route>

          <Route
            element={<AdminRoute requiredPermissions={["peoplePermission"]} />}
          >
            <Route path="/students" element={<Students />} />
            <Route
              path="/students/studentprofile/:id"
              element={<StudentProfile />}
            />
            <Route path="/teachers" element={<Teachers />} />
            <Route
              path="/teachers/teacherprofile/:id"
              element={<TeacherProfile />}
            />
            <Route path="/teachers/addteacher" element={<AddTeacher />} />
          </Route>

          <Route
            element={
              <AdminRoute requiredPermissions={["marketingServicesPermission"]} />
            }
          >
            <Route path="/selfservice" element={<SelfService />} />

            <Route path="/selfservice/addcoupon" element={<AddCoupon />} />

            <Route path="/selfservice/editcoupon/:id" element={<EditCoupon />} />

            <Route
              path="/selfservice/managebanners"
              element={<ManageBanners />}
            />
            <Route
              path="/selfservice/clientTestimonial"
              element={<ClientTestimonial />}
            />
            <Route path="/selfservice/entranceExam" element={<EntranceExam />} />
            <Route
              path="/selfservice/manage-coupons"
              element={<ManageCoupons />}
            />
            <Route path="/enquries" element={<Enquries />} />
            <Route path="/achiever" element={<Achiever />} />

            <Route path="/marketing-video" element={<VideoMarketing />} />
            <Route path="/important-link" element={<ImportantLink />} />
            <Route path="/selfservice/course-access" element={<CourseAccess />} />
          </Route>

          <Route
            element={<AdminRoute requiredPermissions={["chatPermission"]} />}
          >
            <Route path="/messages" element={<Messages />} />
          </Route>

          {/* Unauthorized Route */}
          <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
