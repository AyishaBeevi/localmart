import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {

  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" />;

  const payload = JSON.parse(atob(token.split(".")[1]));

  if (payload.role !== "admin") {
    return <Navigate to="/" />;
  }

  return children;

}

export default AdminRoute;