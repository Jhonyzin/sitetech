import { Link, Navigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api.js";
import AppLayout from "../components/layout/AppLayout.jsx";
import { getYoutubeEmbedUrl } from "../utils/youtube.js";
import { isRemovedModule } from "../utils/modules.js";

export default function ModulePage() {
  const { moduleId } = useParams();
  const [module, setModule] = useState(null);
  const [notice, setNotice] = useState("");
  const [readBlocks, setReadBlocks] = useState([]);
  const [doneInteractions, setDoneInteractions] = useState([]);
  const [lessonDone, setLessonDone] = useState(false);

  useEffect(() => {
    if (isRemovedModule({ id: moduleId })) return;
    api.get(`/content/modules/${moduleId}`).then(({ data }) => {
      setModule(data);
      setReadBlocks([]);
      setDoneInteractions([]);
      setLessonDone(false);
      setNotice("");
    });
  }, [moduleId]);

  if (isRemovedModule({ id: moduleId }) || (module && isRemovedModule(module))) {
    return <Navigate to="/dashboard" replace />;
  }

  const lesson = module?.lessons?.[0] || null;
  const interactions = module?.interactions?.length ? module.interactions : [];
  const contentBlocks = lesson?.contentBlocks || [];
  const hasReadAll = contentBlocks.length > 0 && readBlocks.length === contentBlocks.length;
  const allInteractionsDone = interactions.length === 0 || doneInteractions.length === interactions.length;

  async function completeLesson() {
    if (!hasReadAll) {
      setNotice("Para concluir a aula, leia todo o conteúdo e marque cada bloco como lido.");
      return;
    }
    await api.post("/users/me/xp", { action: "lesson_completed" });
    await api.post("/users/me/progress", { moduleId, percent: 35 });
    setNotice("+10 XP por aula concluída");
    setLessonDone(true);
  }

  async function completeCourse() {
    if (!lessonDone || !allInteractionsDone) {
      setNotice("Conclua a leitura da aula e finalize todas as interações antes de concluir o módulo.");
      return;
    }
    await api.post("/users/me/xp", { action: "course_completed", courseName: module.title });
    await api.post("/users/me/progress", { moduleId, percent: 100 });
    setNotice("+50 XP por módulo concluído");
  }

  if (!module) return <p className="container">Carregando módulo...</p>;

  return (
    <AppLayout>
      <Link to="/dashboard">Voltar ao dashboard</Link>
      <h2>
        {module.icon} {module.title}
      </h2>
      <p>{module.description}</p>
      {module.hasPhysicalDemo && (
        <p className="xp-notice">Este módulo inclui demonstrações visuais com componentes físicos.</p>
      )}
      <section className="card">
        <h3>Conteúdo do módulo</h3>
        {lesson ? (
          <>
            <p>
              <strong>Título:</strong> {lesson.title}
            </p>
            <p>
              <strong>Duração estimada:</strong> {lesson.durationMin} minutos
            </p>
            <p>
              <strong>Resumo:</strong> {lesson.summary}
            </p>
            {getYoutubeEmbedUrl(lesson.videoUrl) && (
              <div className="video-frame">
                <iframe
                  src={getYoutubeEmbedUrl(lesson.videoUrl)}
                  title={lesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            <div className="lesson-blocks">
              {contentBlocks.map((block, index) => (
                <div key={`${lesson.id}-block-${index}`} className="lesson-item">
                  <p>
                    {index + 1}. {block}
                  </p>
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => setReadBlocks((prev) => (prev.includes(index) ? prev : [...prev, index]))}
                    disabled={readBlocks.includes(index)}
                  >
                    {readBlocks.includes(index) ? "Bloco lido" : "Marcar como lido"}
                  </button>
                </div>
              ))}
            </div>
            <small>Dica prática: assista ao vídeo, leia os blocos e depois conclua a aula.</small>
            <small>
              Leitura concluída: {readBlocks.length}/{contentBlocks.length} blocos
            </small>
            <button type="button" onClick={completeLesson} disabled={!hasReadAll || lessonDone}>
              {lessonDone ? "Aula concluída (+10 XP)" : "Concluir aula agora (+10 XP)"}
            </button>
          </>
        ) : (
          <p>Nenhuma aula cadastrada para este módulo ainda.</p>
        )}
      </section>
      <section className="card">
        <h3>Conteúdo interativo</h3>
        <div className="grid">
          {interactions.map((item, index) => (
            <article key={item.id} className={`badge ${doneInteractions.includes(item.id) ? "on" : "off"}`}>
              <strong>Script {index + 1}</strong>
              <p>{item.prompt}</p>
              <button
                type="button"
                onClick={() => {
                  setDoneInteractions((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));
                  setNotice("Interação registrada! Continue explorando.");
                }}
                disabled={doneInteractions.includes(item.id)}
              >
                {doneInteractions.includes(item.id) ? "Interação concluída" : "Interagir"}
              </button>
            </article>
          ))}
        </div>
        <small>
          Interações concluídas: {doneInteractions.length}/{interactions.length}
        </small>
      </section>
      <section className="card">
        <h3>Atividades avaliativas</h3>
        <p>Resolva as questões e receba feedback imediato com explicação de cada resposta.</p>
        <Link to={`/atividades/${module.id}`}>
          <button type="button">Ir para atividades</button>
        </Link>
      </section>
      <button type="button" onClick={completeCourse} disabled={!lessonDone || !allInteractionsDone}>
        Concluir módulo (+50 XP)
      </button>
      {notice && (
        <p className="xp-notice" aria-live="polite">
          {notice}
        </p>
      )}
    </AppLayout>
  );
}
