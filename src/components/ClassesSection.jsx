import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api.js";

export default function ClassesSection({ userRole }) {
  const [classes, setClasses] = useState([]);
  const [joinCode, setJoinCode] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const modules = [];

  async function loadClasses() {
    try {
      const { data } = await api.get("/users/classes");
      setClasses(data);
      if (!selectedClassId && data.length) setSelectedClassId(data[0].id);
    } catch {
      setClasses([]);
    }
  }

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (!selectedClassId) {
      setLeaderboard([]);
      return;
    }
    api
      .get(`/users/classes/${selectedClassId}/leaderboard`)
      .then(({ data }) => setLeaderboard(data))
      .catch(() => setLeaderboard([]));
  }, [selectedClassId]);

  async function joinClass() {
    try {
      const { data } = await api.post("/users/classes/join", { code: joinCode });
      setMessage(data.message);
      setJoinCode("");
      await loadClasses();
      setSelectedClassId(data.turma.id);
    } catch (error) {
      setMessage(error.response?.data?.message || "Não foi possível entrar na turma.");
    }
  }

  return (
    <section className="card">
      <h3>Turmas</h3>
      {userRole === "aluno" ? (
        <>
          <div className="inline-form">
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Digite o código da turma"
            />
            <button type="button" onClick={joinClass} disabled={!joinCode.trim()}>
              Entrar na turma
            </button>
          </div>
          <select value={selectedModuleId} onChange={(e) => setSelectedModuleId(e.target.value)}>
            <option value="">Selecione um conteúdo</option>
            {modules.map((module) => (
              <option key={module.id} value={module.id}>
                {module.title}
              </option>
            ))}
          </select>
          <div className="grid">
            {classes.map((item) => (
              <article key={item.id} className="badge on">
                <strong>{item.name}</strong>
                <small>Código: {item.code}</small>
                <small>Conteúdos liberados: {item.moduleCount}</small>
              </article>
            ))}
          </div>
        </>
      ) : (
        <>
          <p>Suas turmas e conteúdos administrados ficam centralizados na área de Gestão.</p>
          <div className="grid">
            {classes.map((item) => (
              <article key={item.id} className="badge on">
                <strong>{item.name}</strong>
                <small>Código: {item.code}</small>
                <small>Alunos: {item.memberCount}</small>
                <small>Conteúdos: {item.moduleCount}</small>
              </article>
            ))}
          </div>
          <Link to="/gestao">
            <button type="button">Abrir Gestão</button>
          </Link>
        </>
      )}
      <div className="management-grid">
        <article className="card">
          <h4>Selecionar turma</h4>
          <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)}>
            <option value="">Selecione uma turma</option>
            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </article>
        <article className="card">
          <h4>Ranking da turma</h4>
          {leaderboard.length === 0 ? (
            <p>Selecione uma turma para ver o ranking de XP.</p>
          ) : (
            <ul className="card">
              {leaderboard.map((item) => (
                <li key={item.userId}>
                  #{item.position} - {item.displayName} | {item.xp} XP
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
      {message && <p className="xp-notice">{message}</p>}
    </section>
  );
}
