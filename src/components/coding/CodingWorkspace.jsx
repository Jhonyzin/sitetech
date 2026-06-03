import { useMemo } from "react";
import CodeEditor from "./CodeEditor.jsx";
import TestResultsPanel from "./TestResultsPanel.jsx";
import { deriveRunStatus, parseCompileErrorLines } from "../../utils/codeErrors.js";

export default function CodingWorkspace({
  code,
  onCodeChange,
  visibleTests = [],
  expectedAnswer = "",
  disabled = false,
  isRunning = false,
  runEvaluation = null,
  runMessage = "",
  onRun,
  onSubmit,
  canSubmit = true
}) {
  const status = useMemo(() => {
    if (isRunning) return "running";
    if (runEvaluation) return deriveRunStatus(runEvaluation);
    return "idle";
  }, [isRunning, runEvaluation]);

  const tests = runEvaluation?.tests || [];
  const failedTest = tests.find((t) => !t.passed);
  const stderr = failedTest?.stderr || tests[0]?.stderr || "";
  const errorLines = useMemo(() => parseCompileErrorLines(stderr), [stderr]);

  return (
    <div className="lc-workspace">
      <aside className="lc-workspace__problem">
        <div className="lc-workspace__tests">
          <h4>Casos de exemplo</h4>
          {visibleTests.length ? (
            <ul className="lc-workspace__test-list">
              {visibleTests.map((test) => (
                <li key={test}>
                  <code>{test}</code>
                </li>
              ))}
            </ul>
          ) : expectedAnswer ? (
            <p className="lc-workspace__hint">
              Saída esperada: <code>{expectedAnswer}</code>
            </p>
          ) : (
            <p className="lc-workspace__hint">Nenhum caso visível. A saída será comparada com o gabarito.</p>
          )}
        </div>
      </aside>

      <div className="lc-workspace__main">
        <div className="lc-workspace__editor-pane">
          <CodeEditor
            value={code}
            onChange={onCodeChange}
            disabled={disabled || isRunning}
            highlightLines={status === "compile" ? errorLines : []}
            placeholder="#include <stdio.h>\n\nint main(void) {\n    return 0;\n}"
            onExecute={onRun}
          />
          <div className="lc-workspace__actions">
            <button type="button" className="lc-btn lc-btn--run" onClick={onRun} disabled={disabled || isRunning || !code.trim()}>
              {isRunning ? "Executando..." : "▶ Executar"}
            </button>
            <button
              type="button"
              className="lc-btn lc-btn--submit"
              onClick={onSubmit}
              disabled={disabled || isRunning || !canSubmit || !code.trim()}
            >
              Enviar solução
            </button>
          </div>
        </div>

        <div className="lc-workspace__console">
          <TestResultsPanel
            status={status}
            tests={tests}
            stderr={stderr}
            message={runMessage}
            explanation={runEvaluation?.explanation}
          />
        </div>
      </div>
    </div>
  );
}
