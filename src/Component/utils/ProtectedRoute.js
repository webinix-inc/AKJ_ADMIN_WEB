import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const AdminRoute = ({ requiredPermissions = [] }) => {
  const { adminData } = useSelector((state) => state.admin);

  // Check if user is authenticated
  if (!adminData || !adminData?.accessToken) {
    return <Navigate to="/login" replace />;
  }

  const { userType, permissions } = adminData.data || {};

  // Admin can access all routes
  if (userType === "ADMIN") {
    return <Outlet />;
  }

  // Teacher needs specific permissions
  if (userType === "TEACHER") {
    // Ensure permissions is valid and check required permissions
    const hasPermission = requiredPermissions.every((perm) => permissions?.[perm]);

    if (hasPermission) {
      return <Outlet />;
    } else {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Default fallback for unhandled user types
  return <Navigate to="/unauthorized" replace />;
};

export default AdminRoute;
