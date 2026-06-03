import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api.js";
import AppLayout from "../components/layout/AppLayout.jsx";
import ClassesSection from "../components/ClassesSection.jsx";
import ProfessorDashboard from "./ProfessorDashboard.jsx";
import { withoutRemovedModules } from "../utils/modules.js";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [modules, setModules] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [xpNotice, setXpNotice] = useState("");

  useEffect(() => {
    api.get("/users/me").then(async ({ data }) => {
      setUser(data);
      if (data.role === "professor") return;

      const [md, ch] = await Promise.all([api.get("/content/modules"), api.get("/content/challenges")]);
      setModules(withoutRemovedModules(md.data));
      setChallenges(ch.data);
    });
  }, []);

  async function gainXp(action) {
    const { data } = await api.post("/users/me/xp", { action });
    setXpNotice(data.message);
    const me = await api.get("/users/me");
    setUser(me.data);
  }

  if (!user) return <p className="container">Carregando...</p>;
  if (user.role === "professor") return <ProfessorDashboard />;

  const baseSpan = Math.max(1, user.level.minXp + user.xpToNextLevel - user.level.minXp);
  const progress =
    user.level?.level === 10 ? 100 : Math.max(0, Math.min(100, ((user.xp - user.level.minXp) / baseSpan) * 100));
  const moduleProgress = user.moduleProgress || {};
  const nextModule = modules.find((module) => (moduleProgress[module.id] || 0) < 100);

  return (
    <AppLayout>
      <section className="card hero-card">
        <h2>Bem-vindo, {user.displayName}!</h2>
        <p>Continue sua jornada e alcance o próximo nível com aulas, atividades e desafios.</p>
        {nextModule ? (
          <Link to={`/modulo/${nextModule.id}`}>
            <button type="button">Continuar: {nextModule.title}</button>
          </Link>
        ) : (
          <p>Parabéns! Todos os módulos atuais foram concluídos.</p>
        )}
      </section>
      <h2>Olá, {user.displayName}</h2>
      <p>Nível atual: {user.level.title}</p>
      <p>Streak: {user.streak} dias</p>
      <div className="xp-bar">
        <div className="xp-fill" style={{ width: `${progress}%` }} />
      </div>
      <small>
        XP total: {user.xp} | Faltam {user.xpToNextLevel} XP para o próximo nível
      </small>
      {xpNotice && (
        <p className="xp-notice" aria-live="polite">
          {xpNotice}
        </p>
      )}
      <section className="card">
        <h3>Desafios ativos</h3>
        <div className="grid">
          {challenges.map((challenge) => (
            <article key={challenge.id} className="badge on">
              <strong>{challenge.title}</strong>
              <p>{challenge.description}</p>
              <button
                type="button"
                onClick={() => gainXp(challenge.type === "weekly" ? "weekly_challenge" : "hard_challenge")}
              >
                Completar missão (+{challenge.xpReward} XP)
              </button>
            </article>
          ))}
        </div>
      </section>
      <section className="card">
        <h3>Cursos e módulos</h3>
        <div className="grid">
          {modules.map((module) => (
            <article key={module.id} className="badge on">
              <strong>
                {module.icon} Módulo {module.order}
              </strong>
              <p>{module.title}</p>
              <small>{module.description}</small>
              <small>Progresso: {Math.round(moduleProgress[module.id] || 0)}%</small>
              <Link to={`/modulo/${module.id}`}>
                <button type="button">{(moduleProgress[module.id] || 0) > 0 ? "Continuar" : "Iniciar módulo"}</button>
              </Link>
            </article>
          ))}
        </div>
      </section>
      <ClassesSection userRole={user.role} />
    </AppLayout>
  );
}
