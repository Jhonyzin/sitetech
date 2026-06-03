import { useState } from "react";
import LineOutput from "./LineOutput.jsx";
import { statusLabel } from "../../utils/codeErrors.js";

export default function TestResultsPanel({ status, tests = [], stderr = "", message = "", explanation = "" }) {
  const [activeTab, setActiveTab] = useState("result");
  const [selectedCase, setSelectedCase] = useState(0);

  const visibleTests = tests.filter((t) => !t.hidden);
  const displayTests = visibleTests.length ? visibleTests : tests;
  const current = displayTests[selectedCase] || displayTests[0];
  const hasCompileError = status === "compile" && stderr;

  if (status === "idle" || status === "running") {
    return (
      <div className="lc-panel lc-panel--idle">
        <p>{status === "running" ? "Compilando e executando seu código..." : "Execute o código para ver a saída e os testes."}</p>
      </div>
    );
  }

  return (
    <div className="lc-panel">
      <div className={`lc-panel__status lc-panel__status--${status}`}>
        <span className="lc-panel__status-icon" aria-hidden="true">
          {status === "accepted" ? "✓" : status === "compile" || status === "timeout" ? "!" : "✗"}
        </span>
        <div>
          <strong>{statusLabel(status)}</strong>
          {message && <small>{message}</small>}
        </div>
      </div>

      <div className="lc-panel__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          className={activeTab === "result" ? "is-active" : ""}
          onClick={() => setActiveTab("result")}
        >
          Resultado
        </button>
        <button
          type="button"
          role="tab"
          className={activeTab === "cases" ? "is-active" : ""}
          onClick={() => setActiveTab("cases")}
          disabled={!displayTests.length}
        >
          Casos de teste ({displayTests.length})
        </button>
        <button
          type="button"
          role="tab"
          className={activeTab === "terminal" ? "is-active" : ""}
          onClick={() => setActiveTab("terminal")}
        >
          Terminal
        </button>
      </div>

      <div className="lc-panel__body">
        {activeTab === "result" && (
          <div className="lc-panel__result">
            {status === "accepted" && (
              <p className="lc-panel__success">Todos os testes passaram. Você pode enviar a solução.</p>
            )}
            {current && status !== "accepted" && (
              <div className="lc-compare">
                {current.stdin?.trim() && (
                  <div className="lc-compare__block">
                    <span className="lc-compare__label">Entrada</span>
                    <LineOutput value={current.stdin} variant="stdin" />
                  </div>
                )}
                <div className="lc-compare__block">
                  <span className="lc-compare__label">Saída esperada</span>
                  <LineOutput value={current.expectedStdout} variant="expected" />
                </div>
                <div className="lc-compare__block">
                  <span className="lc-compare__label">Sua saída</span>
                  <LineOutput value={current.actualStdout} variant="actual" />
                </div>
              </div>
            )}
            {hasCompileError && (
              <div className="lc-compare__block">
                <span className="lc-compare__label lc-compare__label--error">Erro de compilação</span>
                <LineOutput value={stderr} variant="stderr" emptyLabel="Sem mensagem de erro" />
              </div>
            )}
            {explanation && <p className="lc-panel__explanation">{explanation}</p>}
          </div>
        )}

        {activeTab === "cases" && displayTests.length > 0 && (
          <div className="lc-cases">
            <div className="lc-cases__picker">
              {displayTests.map((test, index) => (
                <button
                  key={test.index ?? index}
                  type="button"
                  className={`lc-cases__tab ${selectedCase === index ? "is-active" : ""} ${test.passed ? "is-pass" : "is-fail"}`}
                  onClick={() => setSelectedCase(index)}
                >
                  Caso {test.index ?? index + 1}
                </button>
              ))}
            </div>
            {current && (
              <div className="lc-compare">
                {current.stdin?.trim() && (
                  <div className="lc-compare__block">
                    <span className="lc-compare__label">stdin</span>
                    <LineOutput value={current.stdin} variant="stdin" />
                  </div>
                )}
                <div className="lc-compare__block">
                  <span className="lc-compare__label">Esperado</span>
                  <LineOutput value={current.expectedStdout} variant="expected" />
                </div>
                <div className="lc-compare__block">
                  <span className="lc-compare__label">Obtido</span>
                  <LineOutput value={current.actualStdout} variant="actual" />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "terminal" && (
          <div className="lc-terminal">
            <div className="lc-terminal__section">
              <span className="lc-compare__label">stdout</span>
              <LineOutput value={current?.actualStdout || ""} variant="stdout" />
            </div>
            <div className="lc-terminal__section">
              <span className="lc-compare__label lc-compare__label--error">stderr</span>
              <LineOutput value={stderr || current?.stderr || ""} variant="stderr" />
            </div>
            {current?.timedOut && <p className="lc-panel__warn">Execução interrompida por tempo limite.</p>}
            {current?.exitCode != null && current.exitCode !== 0 && (
              <p className="lc-panel__warn">Código de saída: {current.exitCode}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
