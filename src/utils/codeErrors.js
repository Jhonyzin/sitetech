/** Extrai números de linha de mensagens típicas do gcc (ex.: main.c:4:12: error). */
export function parseCompileErrorLines(stderr = "") {
  const lines = new Set();
  const pattern = /\.c:(\d+):/g;
  let match = pattern.exec(stderr);
  while (match) {
    lines.add(Number(match[1]));
    match = pattern.exec(stderr);
  }
  return [...lines].sort((a, b) => a - b);
}

export function deriveRunStatus(evaluation) {
  if (!evaluation) return "idle";
  if (evaluation.isCorrect) return "accepted";

  const tests = evaluation.tests || [];
  const failed = tests.find((t) => !t.passed) || tests[0];

  if (!failed) return "wrong";

  if (failed.timedOut) return "timeout";
  if (failed.exitCode !== 0 && failed.stderr?.trim()) return "compile";
  return "wrong";
}

export function statusLabel(status) {
  const labels = {
    idle: "Aguardando execução",
    running: "Executando...",
    accepted: "Aceito",
    wrong: "Resposta incorreta",
    compile: "Erro de compilação",
    timeout: "Tempo esgotado",
    error: "Erro na execução"
  };
  return labels[status] || status;
}
