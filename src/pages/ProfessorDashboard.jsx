import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api.js";
import AppLayout from "../components/layout/AppLayout.jsx";
import ClassesSection from "../components/ClassesSection.jsx";

export default function ProfessorDashboard() {
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);
  const [modules, setModules] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get("/users/me"),
      api.get("/users/classes"),
      api.get("/content/modules?scope=manageable")
    ]).then(([me, classRes, moduleRes]) => {
      setUser(me.data);
      setClasses(classRes.data);
      setModules(moduleRes.data);
    });
  }, []);

  if (!user) return <p className="container">Carregando...</p>;

  return (
    <AppLayout>
      <section className="card hero-card">
        <h2>Painel do professor</h2>
        <p>Crie turmas, compartilhe o código de convite gerado automaticamente e publique seus próprios conteúdos.</p>
        <Link to="/gestao">
          <button type="button">Abrir gestão</button>
        </Link>
      </section>

      <section className="management-grid">
        <article className="card">
          <h3>Visão geral</h3>
          <p>
            <strong>{user.displayName}</strong>
          </p>
          <small>Turmas ativas: {classes.length}</small>
          <small>Conteúdos criados: {modules.length}</small>
        </article>
        <article className="card">
          <h3>Convites recentes</h3>
          <div className="grid">
            {classes.slice(0, 3).map((item) => (
              <article key={item.id} className="badge on">
                <strong>{item.name}</strong>
                <small>Código: {item.code}</small>
                <small>Alunos: {item.memberCount}</small>
              </article>
            ))}
            {!classes.length && <p>Crie sua primeira turma na área de gestão.</p>}
          </div>
        </article>
      </section>

      <section className="card">
        <h3>Conteúdos do professor</h3>
        <div className="grid">
          {modules.map((module) => (
            <article key={module.id} className="badge on">
              <strong>
                {module.icon} {module.title}
              </strong>
              <small>ID: {module.id}</small>
              <small>Turmas vinculadas: {module.classes?.length || 0}</small>
            </article>
          ))}
          {!modules.length && <p>Você ainda não criou conteúdos.</p>}
        </div>
      </section>

      <ClassesSection userRole={user.role} />
    </AppLayout>
  );
}
