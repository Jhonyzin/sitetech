import { Navigate } from "react-router-dom";

export default function Protected({ children }) {
  return localStorage.getItem("token") ? children : <Navigate to="/" replace />;
}
