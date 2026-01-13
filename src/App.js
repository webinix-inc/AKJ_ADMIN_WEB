import React, { Suspense, lazy } from "react";
import "./App.css";
import "antd/dist/reset.css"; // ✅ Correct for AntD v5
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";

// Components
import AdminRoute from "./Component/utils/ProtectedRoute";
import AllCourses from "./Pages/Courses & Tests/AllCourses";
import AllCoursesDatails from "./Pages/Courses & Tests/AllCoursesDatails";
import Courses from "./Pages/Courses & Tests/Courses";
import CoursesEdit from "./Pages/Courses & Tests/CoursesEdit";
import Tests from "./Pages/Courses & Tests/Tests";
import FreeVideo from "./Pages/Courses & Tests/FreeVideo";
import Home from "./Pages/Home/Home";
import Login from "./Pages/Login/Login";



import Plans from "./Pages/Plans/Plans";

import Settings from "./Pages/Settings/Settings";
import Notification from "./Pages/Notification/Notification";
import BookStore from "./Pages/BookStore/BookStore";
import Messages from "./Pages/Messages/Messages";

// Content Management Components
import CoursesFolder from "./Pages/Content/CoursesFolder";
import FolderComponent from "./Pages/Content/FolderStructure";
import FolderContents from "./Pages/Content/FolderContents";
import SubjectsFolder from "./Pages/Content/SubjectsFolder";
import ChaptersFolder from "./Pages/Content/ChaptersFolder";
import ChapterContent from "./Pages/Content/ChapterContent";

// Test Panel Components
import TestPanel from "./Pages/TestPanel/TestPanel";
import TestCreationPage from "./Pages/TestPanel/TestCreationPage";
import TestDetailsPage from "./Pages/TestPanel/TestDetailsPage";

// Orders Components (Lazy Loaded)
const Orders = lazy(() => import("./Pages/Orders/Orders"));
const BookOrders = lazy(() => import("./Pages/Orders/BookOrders"));

// Teachers Components (Lazy Loaded)
const Teachers = lazy(() => import("./Pages/Teachers/Teachers"));
const TeacherProfile = lazy(() => import("./Pages/Teachers/TeacherProfile"));
const AddTeacher = lazy(() => import("./Pages/Teachers/AddTeacher"));

// Self Service Components (Lazy Loaded)
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
  <div className="flex justify-center items-center h-screen bg-black text-white">
    Loading...
  </div>
);

function App() {
  const adminData = useSelector((state) => state.admin.adminData);

  const adminData2 = useSelector((state) => state);

  console.log("Admidata is this :", adminData);
  console.log("Admidata New is this :", adminData2);

  const { permissions, userType } = adminData?.data || {};

  console.log(permissions); // Debug permissions object

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route element={<AdminRoute />}>
          <Route path="/home" element={<Home />} />
        </Route>
        {/* Protected Routes */}
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
          <Route path="/orders" element={<Suspense fallback={<Loading />}><Orders /></Suspense>} />
          <Route path="/books/orders" element={<Suspense fallback={<Loading />}><BookOrders /></Suspense>} />
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
          <Route path="/students" element={<Suspense fallback={<Loading />}><Students /></Suspense>} />
          <Route
            path="/students/studentprofile/:id"
            element={<Suspense fallback={<Loading />}><StudentProfile /></Suspense>}
          />
          <Route path="/teachers" element={<Suspense fallback={<Loading />}><Teachers /></Suspense>} />
          <Route
            path="/teachers/teacherprofile/:id"
            element={<Suspense fallback={<Loading />}><TeacherProfile /></Suspense>}
          />
          <Route path="/teachers/addteacher" element={<Suspense fallback={<Loading />}><AddTeacher /></Suspense>} />
        </Route>

        <Route
          element={
            <AdminRoute requiredPermissions={["marketingServicesPermission"]} />
          }
        >
          <Route path="/selfservice" element={<Suspense fallback={<Loading />}><SelfService /></Suspense>} />

          <Route path="/selfservice/addcoupon" element={<Suspense fallback={<Loading />}><AddCoupon /></Suspense>} />

          <Route path="/selfservice/editcoupon/:id" element={<Suspense fallback={<Loading />}><EditCoupon /></Suspense>} />

          <Route
            path="/selfservice/managebanners"
            element={<Suspense fallback={<Loading />}><ManageBanners /></Suspense>}
          />
          <Route
            path="/selfservice/clientTestimonial"
            element={<Suspense fallback={<Loading />}><ClientTestimonial /></Suspense>}
          />
          <Route path="/selfservice/entranceExam" element={<Suspense fallback={<Loading />}><EntranceExam /></Suspense>} />
          <Route
            path="/selfservice/manage-coupons"
            element={<Suspense fallback={<Loading />}><ManageCoupons /></Suspense>}
          />
          <Route path="/enquries" element={<Suspense fallback={<Loading />}><Enquries /></Suspense>} />
          <Route path="/achiever" element={<Suspense fallback={<Loading />}><Achiever /></Suspense>} />

          <Route path="/marketing-video" element={<Suspense fallback={<Loading />}><VideoMarketing /></Suspense>} />
          <Route path="/important-link" element={<Suspense fallback={<Loading />}><ImportantLink /></Suspense>} />
          <Route path="/selfservice/course-access" element={<Suspense fallback={<Loading />}><CourseAccess /></Suspense>} />
        </Route>

        <Route
          element={<AdminRoute requiredPermissions={["chatPermission"]} />}
        >
          <Route path="/messages" element={<Messages />} />
        </Route>

        {/* Unauthorized Route */}
        <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
      </Routes>
    </Router>
  );
}

export default App;
