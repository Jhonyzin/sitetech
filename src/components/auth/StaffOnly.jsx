import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api.js";

export default function StaffOnly({ children }) {
  const [me, setMe] = useState(undefined);

  useEffect(() => {
    api.get("/users/me").then(({ data }) => setMe(data)).catch(() => setMe(null));
  }, []);

  if (me === undefined) return <p className="container">Carregando...</p>;
  if (!me || me.role !== "professor") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
