import { Navigate, useLocation } from "react-router-dom";
import { isAdminLoggedIn } from "../../services/adminAuth.js";

function AdminRoute({ children }) {
  const location = useLocation();

  if (!isAdminLoggedIn()) {
    return <Navigate replace state={{ from: location.pathname }} to="/admin/login" />;
  }

  return children;
}

export default AdminRoute;
