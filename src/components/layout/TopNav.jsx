import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api.js";

export default function TopNav() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);

  useEffect(() => {
    api.get("/users/me").then(({ data }) => setMe(data)).catch(() => setMe(null));
  }, []);

  function logout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  return (
    <nav className="top-nav side-nav">
      <Link to="/dashboard" className="side-link">Dashboard</Link>
      <Link to="/perfil" className="side-link">Perfil</Link>
      <Link to="/ranking" className="side-link">Ranking</Link>
      {me?.role === "professor" && (
        <Link to="/gestao" className="side-link">Gestão</Link>
      )}
      <button type="button" onClick={logout} className="ghost side-link side-button">
        Sair
      </button>
    </nav>
  );
}
