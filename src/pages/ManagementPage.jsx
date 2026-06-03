import { useEffect, useState } from "react";
import api from "../services/api.js";
import AppLayout from "../components/layout/AppLayout.jsx";
import { buildModuleIdFromTitle } from "../utils/modules.js";

export default function ManagementPage() {
  const [me, setMe] = useState(null);
  const [classes, setClasses] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [selectedModuleDetails, setSelectedModuleDetails] = useState(null);
  const [message, setMessage] = useState("");
  const [moduleForm, setModuleForm] = useState({ id: "", order: "", title: "", description: "", icon: "📘", classId: "" });
  const [lessonForm, setLessonForm] = useState({ moduleId: "", title: "", summary: "", durationMin: 10, videoUrl: "", position: 1 });
  const [questionForm, setQuestionForm] = useState({
    moduleId: "",
    title: "",
    activityType: "coding_challenge",
    difficulty: "🟢 Fácil",
    question: "",
    optionsText: "",
    expectedAnswer: "",
    starterCode: "",
    visibleTestsText: "",
    hiddenTestsText: "",
    explanation: ""
  });
  const [classForm, setClassForm] = useState({ name: "", description: "" });
  const [memberEmail, setMemberEmail] = useState("");
  const [assignModuleId, setAssignModuleId] = useState("");
  const [copyState, setCopyState] = useState("");

  async function loadBase() {
    const [meRes, classRes, moduleRes] = await Promise.all([
      api.get("/users/me"),
      api.get("/users/classes"),
      api.get("/content/modules?scope=manageable")
    ]);
    setMe(meRes.data);
    setClasses(classRes.data);
    setModules(moduleRes.data);
  }

  async function loadClassDetails(classId) {
    if (!classId) {
      setSelectedClass(null);
      return;
    }
    const { data } = await api.get(`/users/classes/${classId}`);
    setSelectedClass(data);
  }

  async function loadModuleDetails(moduleId) {
    if (!moduleId) {
      setSelectedModuleDetails(null);
      return;
    }
    const { data } = await api.get(`/content/modules/${moduleId}`);
    setSelectedModuleDetails(data);
  }

  useEffect(() => {
    loadBase().catch(() => setMessage("Não foi possível carregar a área de Gestão."));
  }, []);

  useEffect(() => {
    if (classes.length && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
    if (modules.length && !selectedModuleId) {
      setSelectedModuleId(modules[0].id);
    }
    loadClassDetails(selectedClassId).catch(() => setSelectedClass(null));
  }, [selectedClassId, classes, modules, selectedModuleId]);

  useEffect(() => {
    loadModuleDetails(selectedModuleId).catch(() => setSelectedModuleDetails(null));
  }, [selectedModuleId]);

  async function refreshAll(classId = selectedClassId, moduleId = selectedModuleId) {
    await loadBase();
    if (classId) {
      setSelectedClassId(classId);
      await loadClassDetails(classId);
    }
    if (moduleId) {
      setSelectedModuleId(moduleId);
      await loadModuleDetails(moduleId);
    }
  }

  async function createClass() {
    try {
      const { data } = await api.post("/users/classes", classForm);
      setMessage(`Turma ${data.name} criada com sucesso.`);
      setClassForm({ name: "", description: "" });
      await refreshAll(data.id);
    } catch (error) {
      setMessage(error.response?.data?.message || "Não foi possível criar a turma.");
    }
  }

  async function createModule() {
    try {
      const generatedId = moduleForm.id.trim() || buildModuleIdFromTitle(moduleForm.title);
      await api.post("/content/modules", {
        ...moduleForm,
        id: generatedId,
        order: Number(moduleForm.order),
        classIds: moduleForm.classId ? [moduleForm.classId] : []
      });
      setMessage("Conteúdo criado com sucesso.");
      setModuleForm({ id: "", order: "", title: "", description: "", icon: "📘", classId: "" });
      await refreshAll(moduleForm.classId || selectedClassId, generatedId);
    } catch (error) {
      setMessage(error.response?.data?.message || "Não foi possível criar o conteúdo.");
    }
  }

  async function createLesson() {
    try {
      await api.post(`/content/modules/${lessonForm.moduleId}/lessons`, {
        title: lessonForm.title,
        summary: lessonForm.summary,
        durationMin: Number(lessonForm.durationMin),
        videoUrl: lessonForm.videoUrl,
        position: Number(lessonForm.position)
      });
      setMessage("Aula adicionada com sucesso.");
      setLessonForm({ moduleId: "", title: "", summary: "", durationMin: 10, videoUrl: "", position: 1 });
      await refreshAll();
    } catch (error) {
      setMessage(error.response?.data?.message || "Não foi possível criar a aula.");
    }
  }

  async function createQuestion() {
    try {
      const options = questionForm.optionsText
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean);
      const visibleTests = questionForm.visibleTestsText
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean);
      const hiddenTests = questionForm.hiddenTestsText
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean);
      const targetModuleId = questionForm.moduleId;
      await api.post(`/content/modules/${targetModuleId}/activities`, {
        title: questionForm.title,
        activityType: questionForm.activityType,
        difficulty: questionForm.difficulty,
        question: questionForm.question,
        options: questionForm.activityType === "multipla_escolha" ? options : [],
        expectedAnswer: questionForm.expectedAnswer,
        starterCode: questionForm.activityType === "coding_challenge" ? questionForm.starterCode : "",
        visibleTests: questionForm.activityType === "coding_challenge" ? visibleTests : [],
        hiddenTests: questionForm.activityType === "coding_challenge" ? hiddenTests : [],
        explanation: questionForm.explanation
      });
      setMessage("Questão adicionada com sucesso.");
      setQuestionForm({
        moduleId: "",
        title: "",
        activityType: "coding_challenge",
        difficulty: "🟢 Fácil",
        question: "",
        optionsText: "",
        expectedAnswer: "",
        starterCode: "",
        visibleTestsText: "",
        hiddenTestsText: "",
        explanation: ""
      });
      await refreshAll(selectedClassId, targetModuleId);
    } catch (error) {
      setMessage(error.response?.data?.message || "Não foi possível criar a questão.");
    }
  }

  async function deleteModule(moduleId) {
    try {
      await api.delete(`/content/modules/${moduleId}`);
      setMessage("Conteúdo removido.");
      await refreshAll();
    } catch (error) {
      setMessage(error.response?.data?.message || "Não foi possível remover o conteúdo.");
    }
  }

  async function deleteQuestion(moduleId, activityId) {
    try {
      await api.delete(`/content/modules/${moduleId}/activities/${activityId}`);
      setMessage("Questão removida.");
      await refreshAll(selectedClassId, moduleId);
    } catch (error) {
      setMessage(error.response?.data?.message || "Não foi possível remover a questão.");
    }
  }

  async function deleteLesson(moduleId, lessonId) {
    try {
      await api.delete(`/content/modules/${moduleId}/lessons/${lessonId}`);
      setMessage("Aula removida.");
      await refreshAll(selectedClassId, moduleId);
    } catch (error) {
      setMessage(error.response?.data?.message || "Não foi possível remover a aula.");
    }
  }

  async function addMember() {
    try {
      await api.post(`/users/classes/${selectedClassId}/members`, { email: memberEmail });
      setMessage("Aluno adicionado à turma.");
      setMemberEmail("");
      await refreshAll(selectedClassId);
    } catch (error) {
      setMessage(error.response?.data?.message || "Não foi possível adicionar o aluno.");
    }
  }

  async function removeMember(userId) {
    try {
      await api.delete(`/users/classes/${selectedClassId}/members/${userId}`);
      setMessage("Aluno removido da turma.");
      await refreshAll(selectedClassId);
    } catch (error) {
      setMessage(error.response?.data?.message || "Não foi possível remover o aluno.");
    }
  }

  async function assignModule() {
    try {
      await api.post(`/users/classes/${selectedClassId}/modules/${assignModuleId}`);
      setMessage("Conteúdo vinculado à turma.");
      setAssignModuleId("");
      await refreshAll(selectedClassId);
    } catch (error) {
      setMessage(error.response?.data?.message || "Não foi possível vincular o conteúdo.");
    }
  }

  async function unassignModule(moduleId) {
    try {
      await api.delete(`/users/classes/${selectedClassId}/modules/${moduleId}`);
      setMessage("Conteúdo removido da turma.");
      await refreshAll(selectedClassId);
    } catch (error) {
      setMessage(error.response?.data?.message || "Não foi possível remover o conteúdo da turma.");
    }
  }

  async function copyInviteCode() {
    try {
      if (!selectedClass?.code) return;
      await navigator.clipboard.writeText(selectedClass.code);
      setCopyState("Código copiado!");
      window.setTimeout(() => setCopyState(""), 1800);
    } catch {
      setCopyState("Copie manualmente o código exibido.");
      window.setTimeout(() => setCopyState(""), 2200);
    }
  }

  if (!me) return <p className="container">Carregando Gestão...</p>;

  return (
    <AppLayout>
      <section className="card">
        <h2>Gestão acadêmica</h2>
        <p>
          Você está autenticado como professor. Aqui você cria turmas, gera convites automáticos, publica aulas e gerencia
          questões dos seus conteúdos.
        </p>
        {message && <p className="xp-notice">{message}</p>}
      </section>

      <section className="management-grid">
        <article className="card">
          <h3>Criar turma</h3>
          <input value={classForm.name} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} placeholder="Nome da turma" />
          <textarea
            value={classForm.description}
            onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
            placeholder="Descrição da turma"
            rows={4}
          />
          <button type="button" onClick={createClass} disabled={!classForm.name.trim()}>
            Criar turma
          </button>
        </article>

        <article className="card">
          <h3>Criar conteúdo</h3>
          <input
            value={moduleForm.id}
            onChange={(e) => setModuleForm({ ...moduleForm, id: e.target.value })}
            placeholder="ID do conteúdo (opcional, gerado a partir do título se vazio)"
          />
          <input
            value={moduleForm.order}
            onChange={(e) => setModuleForm({ ...moduleForm, order: e.target.value })}
            placeholder="Ordem"
            type="number"
          />
          <input value={moduleForm.title} onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })} placeholder="Título" />
          <textarea
            value={moduleForm.description}
            onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
            placeholder="Descrição"
            rows={4}
          />
          <div className="inline-form">
            <input value={moduleForm.icon} onChange={(e) => setModuleForm({ ...moduleForm, icon: e.target.value })} placeholder="Ícone" />
            <select value={moduleForm.classId} onChange={(e) => setModuleForm({ ...moduleForm, classId: e.target.value })}>
              <option value="">Sem turma inicial</option>
              {classes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={createModule}
            disabled={
              !(moduleForm.id.trim() || buildModuleIdFromTitle(moduleForm.title)) ||
              !moduleForm.order ||
              !moduleForm.title.trim() ||
              !moduleForm.description.trim()
            }
          >
            Criar conteúdo
          </button>
        </article>

        <article className="card">
          <h3>Adicionar aula</h3>
          <select value={lessonForm.moduleId} onChange={(e) => setLessonForm({ ...lessonForm, moduleId: e.target.value })}>
            <option value="">Selecione um módulo</option>
            {modules.map((module) => (
              <option key={module.id} value={module.id}>
                {module.title}
              </option>
            ))}
          </select>
          <input
            value={lessonForm.title}
            onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
            placeholder="Título da aula"
          />
          <textarea
            value={lessonForm.summary}
            onChange={(e) => setLessonForm({ ...lessonForm, summary: e.target.value })}
            placeholder="Resumo da aula"
            rows={4}
          />
          <div className="inline-form">
            <input
              value={lessonForm.durationMin}
              onChange={(e) => setLessonForm({ ...lessonForm, durationMin: e.target.value })}
              type="number"
              placeholder="Duração"
            />
            <input
              value={lessonForm.position}
              onChange={(e) => setLessonForm({ ...lessonForm, position: e.target.value })}
              type="number"
              placeholder="Posição"
            />
          </div>
          <input
            value={lessonForm.videoUrl}
            onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
            placeholder="URL do vídeo (opcional)"
          />
          <button
            type="button"
            onClick={createLesson}
            disabled={!lessonForm.moduleId || !lessonForm.title.trim() || !lessonForm.summary.trim()}
          >
            Adicionar aula
          </button>
        </article>

        <article className="card">
          <h3>Criar desafio</h3>
          <select value={questionForm.moduleId} onChange={(e) => setQuestionForm({ ...questionForm, moduleId: e.target.value })}>
            <option value="">Selecione um módulo</option>
            {modules.map((module) => (
              <option key={module.id} value={module.id}>
                {module.title}
              </option>
            ))}
          </select>
          <input
            value={questionForm.title}
            onChange={(e) => setQuestionForm({ ...questionForm, title: e.target.value })}
            placeholder="Título do desafio"
          />
          <select
            value={questionForm.activityType}
            onChange={(e) => setQuestionForm({ ...questionForm, activityType: e.target.value })}
          >
            <option value="coding_challenge">Desafio de código</option>
            <option value="multipla_escolha">Múltipla escolha</option>
          </select>
          <select
            value={questionForm.difficulty}
            onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
          >
            <option value="🟢 Fácil">Fácil</option>
            <option value="🟡 Médio">Médio</option>
            <option value="🔴 Difícil">Difícil</option>
          </select>
          <textarea
            value={questionForm.question}
            onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
            placeholder="Enunciado do desafio"
            rows={4}
          />
          {questionForm.activityType === "multipla_escolha" && (
            <textarea
              value={questionForm.optionsText}
              onChange={(e) => setQuestionForm({ ...questionForm, optionsText: e.target.value })}
              placeholder="Uma opção por linha"
              rows={4}
            />
          )}
          {questionForm.activityType === "coding_challenge" && (
            <>
              <textarea
                value={questionForm.starterCode}
                onChange={(e) => setQuestionForm({ ...questionForm, starterCode: e.target.value })}
                placeholder="Código inicial"
                rows={7}
                className="code"
              />
              <textarea
                value={questionForm.visibleTestsText}
                onChange={(e) => setQuestionForm({ ...questionForm, visibleTestsText: e.target.value })}
                placeholder={"Testes visíveis, um por linha\nEx: 2 3 => 5"}
                rows={3}
              />
              <textarea
                value={questionForm.hiddenTestsText}
                onChange={(e) => setQuestionForm({ ...questionForm, hiddenTestsText: e.target.value })}
                placeholder={'Testes ocultos, um por linha\nEx: {"stdin":"10 5","expectedStdout":"15"}'}
                rows={3}
              />
            </>
          )}
          <input
            value={questionForm.expectedAnswer}
            onChange={(e) => setQuestionForm({ ...questionForm, expectedAnswer: e.target.value })}
            placeholder={
              questionForm.activityType === "coding_challenge" ? "Saída esperada padrão" : "Resposta correta"
            }
          />
          <textarea
            value={questionForm.explanation}
            onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
            placeholder="Explicação do feedback"
            rows={3}
          />
          <button
            type="button"
            onClick={createQuestion}
            disabled={
              !questionForm.moduleId ||
              !questionForm.title.trim() ||
              !questionForm.question.trim() ||
              (questionForm.activityType === "multipla_escolha" && !questionForm.optionsText.trim()) ||
              (questionForm.activityType === "coding_challenge" && !questionForm.starterCode.trim()) ||
              !questionForm.expectedAnswer.trim() ||
              !questionForm.explanation.trim()
            }
          >
            Criar desafio
          </button>
        </article>
      </section>

      <section className="management-grid">
        <article className="card">
          <h3>Minhas turmas</h3>
          <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)}>
            <option value="">Selecione uma turma</option>
            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <div className="grid">
            {classes.map((item) => (
              <article key={item.id} className={`badge ${selectedClassId === item.id ? "on" : "off"}`}>
                <strong>{item.name}</strong>
                <small>Código: {item.code}</small>
                <small>Alunos: {item.memberCount}</small>
                <small>Conteúdos: {item.moduleCount}</small>
              </article>
            ))}
          </div>
        </article>

        <article className="card">
          <h3>Conteúdos administrados</h3>
          <div className="grid">
            {modules.map((module) => (
              <article key={module.id} className="badge on">
                <strong>
                  {module.icon} {module.title}
                </strong>
                <small>ID: {module.id}</small>
                <small>Ordem: {module.order}</small>
                <small>Turmas: {module.classes?.map((item) => item.name).join(", ") || "Nenhuma"}</small>
                <button type="button" onClick={() => deleteModule(module.id)}>
                  Remover conteúdo
                </button>
              </article>
            ))}
          </div>
        </article>
      </section>

      {selectedClass && (
        <section className="management-grid">
          <article className="card">
            <h3>Turma selecionada</h3>
            <p>
              <strong>{selectedClass.name}</strong>
            </p>
            <div className="invite-card">
              <small>Código de convite único</small>
              <strong className="invite-code">{selectedClass.code}</strong>
              <button type="button" onClick={copyInviteCode}>
                Copiar código
              </button>
              {copyState && <small>{copyState}</small>}
            </div>
            <p>{selectedClass.description || "Sem descrição."}</p>
            <div className="inline-form">
              <input value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} placeholder="E-mail do aluno" />
              <button type="button" onClick={addMember} disabled={!memberEmail.trim()}>
                Adicionar aluno
              </button>
            </div>
            <div className="inline-form">
              <select value={assignModuleId} onChange={(e) => setAssignModuleId(e.target.value)}>
                <option value="">Selecione um conteúdo</option>
                {modules.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.title}
                  </option>
                ))}
              </select>
              <button type="button" onClick={assignModule} disabled={!assignModuleId}>
                Vincular conteúdo
              </button>
            </div>
          </article>

          <article className="card">
            <h3>Membros da turma</h3>
            <div className="grid">
              {selectedClass.members?.map((member) => (
                <article key={member.id} className="badge on">
                  <strong>{member.displayName}</strong>
                  <small>{member.email}</small>
                  <small>{member.role}</small>
                  {selectedClass.canManage && (
                    <button type="button" onClick={() => removeMember(member.id)}>
                      Remover da turma
                    </button>
                  )}
                </article>
              ))}
            </div>
          </article>

          <article className="card">
            <h3>Conteúdos da turma</h3>
            <div className="grid">
              {selectedClass.modules?.map((module) => (
                <article key={module.id} className="badge on">
                  <strong>
                    {module.icon} {module.title}
                  </strong>
                  <small>{module.description}</small>
                  {selectedClass.canManage && (
                    <button type="button" onClick={() => unassignModule(module.id)}>
                      Remover da turma
                    </button>
                  )}
                </article>
              ))}
            </div>
          </article>
        </section>
      )}
      <section className="card">
  <h3>Selecionar conteúdo</h3>

  <select
    value={selectedModuleId}
    onChange={(e) => setSelectedModuleId(e.target.value)}
  >
    <option value="">Selecione um conteúdo</option>

    {modules.map((module) => (
      <option key={module.id} value={module.id}>
        {module.title}
      </option>
    ))}
  </select>
</section>
      {selectedModuleDetails && (
        <section className="management-grid">
          <article className="card">
            <h3>Detalhes do conteúdo selecionado</h3>
            <p>
              <strong>{selectedModuleDetails.title}</strong>
            </p>
            <p>{selectedModuleDetails.description}</p>
            <small>Aulas cadastradas: {selectedModuleDetails.lessons?.length || 0}</small>
            <small>Questões cadastradas: {selectedModuleDetails.activities?.length || 0}</small>
          </article>
          <article className="card">
            <h3>Aulas cadastradas</h3>
            <div className="grid">
              {selectedModuleDetails.lessons?.map((lesson) => (
                <article key={lesson.id} className="badge on">
                  <strong>{lesson.title}</strong>
                  <small>Duração: {lesson.durationMin} min</small>
                  <small>{lesson.videoUrl ? "Com vídeo do YouTube" : "Sem vídeo"}</small>
                  <button type="button" onClick={() => deleteLesson(selectedModuleDetails.id, lesson.id)}>
                    Remover aula
                  </button>
                </article>
              ))}
              {!selectedModuleDetails.lessons?.length && <p>Nenhuma aula cadastrada ainda.</p>}
            </div>
          </article>
          <article className="card">
            <h3>Questões cadastradas</h3>
            <div className="grid">
              {selectedModuleDetails.activities?.map((activity) => (
                <article key={activity.id} className="badge on">
                  <strong>{activity.title}</strong>
                  <small>Tipo: {activity.type === "coding_challenge" ? "Desafio de código" : "Múltipla escolha"}</small>
                  <small>{activity.question}</small>
                  <small>
                    {activity.type === "coding_challenge" ? "Saída esperada" : "Resposta correta"}: {activity.expectedAnswer}
                  </small>
                  <button type="button" onClick={() => deleteQuestion(selectedModuleDetails.id, activity.id)}>
                    Remover questão
                  </button>
                </article>
              ))}
            </div>
          </article>
        </section>
      )}
    </AppLayout>
  );
}
