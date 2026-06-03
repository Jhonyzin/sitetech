import { useEffect, useState } from "react";
import api from "../services/api.js";
import AppLayout from "../components/layout/AppLayout.jsx";

export default function RankingPage() {
  const [items, setItems] = useState([]);
  const [type, setType] = useState("global");
  const [me, setMe] = useState(null);

  useEffect(() => {
    Promise.all([api.get(`/users/ranking?type=${type}`), api.get("/users/me")]).then(([rk, user]) => {
      setItems(rk.data);
      setMe(user.data);
    });
  }, [type]);

  return (
    <AppLayout>
      <h2>Ranking</h2>
      <p>Compare sua evolução com outros jogadores da plataforma.</p>
      <div className="row">
        <button type="button" onClick={() => setType("weekly")}>
          Semanal
        </button>
        <button type="button" onClick={() => setType("monthly")}>
          Mensal
        </button>
        <button type="button" onClick={() => setType("global")}>
          Geral
        </button>
      </div>
      <ul className="card">
        {items.map((user, index) => (
          <li key={user._id} className={me && me._id === user._id ? "badge on" : ""}>
            #{user.position || index + 1} - {user.displayName} | {user.level?.title || "Nível"} |{" "}
            {type === "weekly" ? user.weeklyXp : type === "monthly" ? user.monthlyXp : user.xp} XP
          </li>
        ))}
      </ul>
    </AppLayout>
  );
}
