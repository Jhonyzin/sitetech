import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import api from "../services/api.js";
import AppLayout from "../components/layout/AppLayout.jsx";
import CodingWorkspace from "../components/coding/CodingWorkspace.jsx";
import { isRemovedModule } from "../utils/modules.js";
import { statusLabel, deriveRunStatus } from "../utils/codeErrors.js";

export default function ActivitiesPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [wasCorrect, setWasCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [scoredActivities, setScoredActivities] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [runEvaluation, setRunEvaluation] = useState(null);
  const [runMessage, setRunMessage] = useState("");

  useEffect(() => {
    if (isRemovedModule({ id: moduleId })) return;
    api.get(`/content/modules/${moduleId}`).then(({ data }) => {
      setModule(data);
      setIndex(0);
      setAnswer(data.activities?.[0]?.type === "coding_challenge" ? data.activities[0].starterCode || "" : "");
      resetRunState();
      setFeedback("");
      setWasCorrect(false);
      setCorrectCount(0);
      setScoredActivities([]);
      setIsTransitioning(false);
    });
  }, [moduleId]);

  function resetRunState() {
    setRunEvaluation(null);
    setRunMessage("");
  }

  const activities = module?.activities || [];
  const activity = activities[index];
  const isCodingChallenge = activity?.type === "coding_challenge";

  const evaluateCode = useCallback(async () => {
    if (!activity?.id || !answer.trim()) return null;

    const { data } = await api.post(`/content/activities/${activity.id}/submit`, {
      answer,
      code: answer
    });
    return data;
  }, [activity?.id, answer]);

  async function handleRun() {
    if (!answer.trim() || isTransitioning) return;

    setIsTransitioning(true);
    setRunMessage("");
    try {
      const evaluation = await evaluateCode();
      setRunEvaluation(evaluation);
      const status = deriveRunStatus(evaluation);
      if (evaluation.isCorrect) {
        setRunMessage("Todos os testes passaram. Use «Enviar solução» para registrar e avançar.");
      } else if (status === "compile") {
        setRunMessage("Corrija os erros destacados no editor e no terminal.");
      } else {
        setRunMessage("Ajuste o código e execute novamente.");
      }
    } catch (error) {
      setRunEvaluation(null);
      setRunMessage(error.response?.data?.message || "Não foi possível executar o código.");
    } finally {
      setIsTransitioning(false);
    }
  }

  async function handleSubmitSolution() {
    if (!answer.trim() || isTransitioning) return;

    setIsTransitioning(true);
    let evaluation = runEvaluation;

    try {
      if (!evaluation || deriveRunStatus(evaluation) !== "accepted") {
        evaluation = await evaluateCode();
        setRunEvaluation(evaluation);
      }

      const nextCorrectCount =
        evaluation.isCorrect && !scoredActivities.includes(activity.id) ? correctCount + 1 : correctCount;

      if (evaluation.isCorrect) {
        const passedTests = evaluation.tests?.length ? ` (${evaluation.tests.length} teste(s))` : "";
        setFeedback(`Correto!${passedTests} ${evaluation.explanation || activity.explanation}`);
        setWasCorrect(true);
        setRunMessage(statusLabel("accepted"));
        if (!scoredActivities.includes(activity.id)) {
          setCorrectCount(nextCorrectCount);
          setScoredActivities((prev) => [...prev, activity.id]);
          await api.post("/users/me/xp", { action: "activity_completed" });
        }
        window.setTimeout(() => nextQuestion(nextCorrectCount), 1800);
      } else {
        const status = deriveRunStatus(evaluation);
        setRunMessage(status === "compile" ? "Corrija os erros antes de enviar." : "Resposta ainda incorreta.");
        setFeedback(evaluation.explanation || activity.explanation);
        setWasCorrect(false);
        setIsTransitioning(false);
      }
    } catch (error) {
      setFeedback(error.response?.data?.message || "Não foi possível avaliar a resposta.");
      setRunMessage(error.response?.data?.message || "");
      setWasCorrect(false);
      setIsTransitioning(false);
    }
  }

  async function submitMultipleChoice() {
    if (!answer.trim() || isTransitioning) return;

    setIsTransitioning(true);
    try {
      const { data: evaluation } = await api.post(`/content/activities/${activity.id}/submit`, { answer });
      const nextCorrectCount =
        evaluation.isCorrect && !scoredActivities.includes(activity.id) ? correctCount + 1 : correctCount;

      if (evaluation.isCorrect) {
        setFeedback(`Correto! ${evaluation.explanation || activity.explanation}`);
        setWasCorrect(true);
        if (!scoredActivities.includes(activity.id)) {
          setCorrectCount(nextCorrectCount);
          setScoredActivities((prev) => [...prev, activity.id]);
          await api.post("/users/me/xp", { action: "activity_completed" });
        }
        window.setTimeout(() => nextQuestion(nextCorrectCount), 1800);
      } else {
        setFeedback(
          `Resposta esperada: ${evaluation.expectedAnswer || activity.expectedAnswer}. ${evaluation.explanation || activity.explanation}`
        );
        setWasCorrect(false);
        setIsTransitioning(false);
      }
    } catch (error) {
      setFeedback(error.response?.data?.message || "Não foi possível avaliar a resposta.");
      setWasCorrect(false);
      setIsTransitioning(false);
    }
  }

  async function nextQuestion(finalCorrectCount = correctCount) {
    const last = index === activities.length - 1;
    if (last) {
      if (finalCorrectCount === activities.length) {
        await api.post("/users/me/xp", { action: "perfect_activity" });
      }
      await api.post("/users/me/xp", { action: "activity_review" });
      await api.post("/users/me/progress", { moduleId, percent: 75 });
      setFeedback("Atividade finalizada! Bônus aplicados.");
      window.setTimeout(() => navigate(`/modulo/${moduleId}`), 1200);
      return;
    }
    setIndex((v) => v + 1);
    const next = activities[index + 1];
    setAnswer(next?.type === "coding_challenge" ? next.starterCode || "" : "");
    resetRunState();
    setFeedback("");
    setWasCorrect(false);
    setIsTransitioning(false);
  }

  function handleCodeChange(value) {
    setAnswer(value);
    if (runEvaluation) resetRunState();
  }

  if (isRemovedModule({ id: moduleId }) || (module && isRemovedModule(module))) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!module) return <p className="container">Carregando atividade...</p>;

  if (!activities.length) {
    return (
      <AppLayout>
        <Link to={`/modulo/${moduleId}`}>Voltar ao módulo</Link>
        <section className="card">
          <h3>Atividades avaliativas</h3>
          <p>Este módulo ainda não possui atividades cadastradas.</p>
        </section>
      </AppLayout>
    );
  }

  const progress = ((index + 1) / activities.length) * 100;
  const normalizedExpectedAnswer = String(activity.expectedAnswer || "").trim().toLowerCase();

  function getOptionState(option) {
    const isSelected = answer === option;
    const isCorrectOption = String(option).trim().toLowerCase() === normalizedExpectedAnswer;

    if (!feedback) return isSelected ? "is-selected" : "";
    if (isCorrectOption) return "is-correct";
    if (isSelected && !wasCorrect) return "is-incorrect";
    return "";
  }

  return (
    <AppLayout>
      <div className={isCodingChallenge ? "activity-page activity-page--coding" : "activity-page"}>
        <Link to={`/modulo/${moduleId}`}>Voltar ao módulo</Link>
        <header className="activity-page__header">
          <div>
            <h2>{activity.title}</h2>
            <p>
              Questão {index + 1} de {activities.length} · {activity.difficulty}
            </p>
          </div>
          <div className="xp-bar activity-page__progress">
            <div className="xp-fill" style={{ width: `${progress}%` }} />
          </div>
        </header>

        {isCodingChallenge ? (
          <section className="card activity-page__coding-card">
            <div className="activity-page__statement">
              <span className="activity-page__badge">Desafio de código · C</span>
              <p>{activity.question}</p>
            </div>
            <CodingWorkspace
              code={answer}
              onCodeChange={handleCodeChange}
              visibleTests={activity.visibleTests || []}
              expectedAnswer={activity.expectedAnswer}
              disabled={isTransitioning}
              isRunning={isTransitioning}
              runEvaluation={runEvaluation}
              runMessage={runMessage}
              onRun={handleRun}
              onSubmit={handleSubmitSolution}
            />
            {feedback && (
              <p className={`xp-notice activity-page__feedback ${wasCorrect ? "is-success" : ""}`} aria-live="polite">
                {wasCorrect ? "✅ " : "💡 "}
                {feedback}
              </p>
            )}
          </section>
        ) : (
          <section className="card">
            <p>
              <strong>Tipo:</strong> Múltipla escolha
            </p>
            <p>
              <strong>Nível:</strong> {activity.difficulty}
            </p>
            <p>{activity.question}</p>

            {!!activity.options?.length &&
              activity.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`ghost activity-option ${getOptionState(option)}`.trim()}
                  onClick={() => !isTransitioning && setAnswer(option)}
                  disabled={isTransitioning}
                >
                  {option}
                </button>
              ))}

            {!activity.options?.length && (
              <p className="xp-notice">Esta questão precisa de opções cadastradas pelo professor.</p>
            )}

            <button type="button" onClick={submitMultipleChoice} disabled={!answer.trim() || isTransitioning}>
              {isTransitioning ? "Aguardando..." : "Confirmar resposta"}
            </button>
            {feedback && (
              <p className="xp-notice" aria-live="polite">
                {wasCorrect ? "✅ " : "💡 "}
                {feedback}
              </p>
            )}
          </section>
        )}
      </div>
    </AppLayout>
  );
}
