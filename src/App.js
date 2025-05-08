import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";

// Components
import AllCourses from "./Pages/Courses & Tests/AllCourses";
import AllCoursesDatails from "./Pages/Courses & Tests/AllCoursesDatails";
import Courses from "./Pages/Courses & Tests/Courses";
import CoursesEdit from "./Pages/Courses & Tests/CoursesEdit";
import Tests from "./Pages/Courses & Tests/Tests";
import Home from "./Pages/Home/Home";
import Login from "./Pages/Login/Login";
import Students from "./Pages/Students/Students";
import Teachers from "./Pages/Teachers/Teachers";
import Plans from "./Pages/Plans/Plans";
import Orders from "./Pages/Orders/Orders";
import Settings from "./Pages/Settings/Settings";
import Notification from "./Pages/Notification/Notification";
import SelfService from "./Pages/Self Service/SelfService";
import StudentProfile from "./Pages/Students/StudentProfile";
import TeacherProfile from "./Pages/Teachers/TeacherProfile";
import AddTeacher from "./Pages/Teachers/AddTeacher";
import AddCoupon from "./Pages/Self Service/AddCoupon";
import ManageBanners from "./Pages/Self Service/ManageBanners";
import Messages from "./Pages/Messages/Messages";
import CoursesFolder from "./Pages/Content/CoursesFolder";
import SubjectsFolder from "./Pages/Content/SubjectsFolder";
import ChaptersFolder from "./Pages/Content/ChaptersFolder";
import ChapterContent from "./Pages/Content/ChapterContent.jsx";
import FreeVideo from "./Pages/Courses & Tests/FreeVideo.jsx";
import ClientTestimonial from "./Pages/Self Service/clientTestimonial.jsx";
import EntranceExam from "./Pages/Self Service/entranceExam.jsx";
import BookStore from "./Pages/BookStore/BookStore.jsx";
import Enquries from "./Pages/Self Service/Enquries.jsx";
import Achiever from "./Pages/Self Service/Achiever.jsx";
import VideoMarketing from "./Pages/Self Service/VideoMarketing.jsx";
import ManageCoupons from "./Pages/Self Service/ManageCoupons.jsx";
import TestPanel from "./Pages/TestPanel/TestPanel.jsx";
import TestCreationPage from "./Pages/TestPanel/TestCreationPage.jsx";
import TestDetailsPage from "./Pages/TestPanel/TestDetailsPage.jsx";
import FolderComponent from "./Pages/Content/FolderStructure.jsx";
import FolderContents from "./Pages/Content/FolderContents.jsx";

// AdminRoute Component for Protected Routes
import AdminRoute from "./Component/utils/ProtectedRoute.js";
import ImportantLink from "./Pages/Self Service/ImportantLink.jsx";
import CourseAccess from "./Pages/Self Service/CourseAccess.jsx";
import EditCoupon from "./Pages/Self Service/EditCoupon.jsx";

function App() {
  const adminData = useSelector((state) => state.admin.adminData);

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
          <Route path="/orders" element={<Orders />} />
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
    </Router>
  );
}

export default App;
