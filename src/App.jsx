import { Link, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./services/api.js";

function normalizePtBrText(value) {
  if (typeof value !== "string") return value;
  return value
    .replace(/\bComputacao\b/g, "Computação")
    .replace(/\bInformatica\b/g, "Informática")
    .replace(/\bLogico\b/g, "Lógico")
    .replace(/\bTecnologico\b/g, "Tecnológico")
    .replace(/\bDificil\b/g, "Difícil")
    .replace(/\bcodigo\b/g, "código")
    .replace(/\bCodigo\b/g, "Código")
    .replace(/\bmodulo\b/g, "módulo")
    .replace(/\bModulo\b/g, "Módulo")
    .replace(/\bpratica\b/g, "prática")
    .replace(/\bdemonstracoes\b/g, "demonstrações")
    .replace(/\bfisicos\b/g, "físicos");
}

/** Módulos descontinuados: não listar e redirecionar URLs diretas (ex.: API/cache antigo). */
const REMOVED_MODULE_IDS = new Set(["m11"]);

function isRemovedModule(module) {
  if (!module) return false;
  const id = String(module.id || "").toLowerCase();
  const title = String(module.title || "").toLowerCase();
  const order = Number(module.order || 0);
  return (
    REMOVED_MODULE_IDS.has(id) ||
    order > 10 ||
    title.includes("jogos interativos") ||
    title.includes("módulo 11") ||
    title.includes("modulo 11")
  );
}

function withoutRemovedModules(list) {
  return (list || []).filter((m) => m && !isRemovedModule(m));
}

const MODULE_LESSON_LIBRARY = {
  m1: {
    title: "Conhecendo o computador",
    durationMin: 12,
    summary: "Você vai entender os principais componentes do computador e para que cada um serve no uso diário.",
    contentBlocks: [
      "CPU (processador): é o componente responsável por executar instruções e cálculos. Quanto mais eficiente o processador, mais rápido o computador responde às tarefas.",
      "Memória RAM: armazena temporariamente os dados que estão em uso. Quando você abre vários programas, a RAM ajuda a manter tudo funcionando ao mesmo tempo.",
      "Armazenamento (HD/SSD): guarda arquivos de forma permanente, como fotos, documentos e programas. O SSD é mais rápido que o HD tradicional.",
      "Placa-mãe e fonte: a placa-mãe conecta todos os componentes; a fonte distribui energia para que cada peça funcione corretamente.",
      "Periféricos de entrada e saída: teclado e mouse enviam comandos; monitor e caixas de som exibem resultados para o usuário."
    ],
    practiceTip: "Abra o gerenciador de tarefas do computador e identifique CPU, memória e disco em uso."
  },
  m2: {
    title: "Teclado e mouse na prática",
    durationMin: 10,
    summary: "Você vai ganhar agilidade com atalhos e ações básicas para navegar com mais produtividade.",
    contentBlocks: [
      "Atalhos essenciais: Ctrl+C (copiar), Ctrl+V (colar), Ctrl+X (recortar), Ctrl+Z (desfazer). Esses comandos economizam tempo em qualquer atividade.",
      "Seleção de texto: use duplo clique para selecionar palavra, triplo clique para parágrafo e Shift + setas para seleção precisa no teclado.",
      "Funções do mouse: clique esquerdo seleciona, clique direito abre menu de contexto, rolagem move a página e arrastar permite organizar arquivos.",
      "Organização de janelas: Alt+Tab alterna entre programas abertos; Windows+setas posiciona janelas lado a lado para estudar com duas fontes.",
      "Boas práticas: mantenha postura correta, apoie os punhos e faça pausas para evitar cansaço em uso prolongado."
    ],
    practiceTip: "Faça um treino rápido: copie um texto, cole em outro arquivo e desfaça a última ação."
  },
  m3: {
    title: "Internet com segurança",
    durationMin: 11,
    summary: "Você vai reconhecer riscos comuns na internet e aprender a proteger seus dados pessoais.",
    contentBlocks: [
      "Verifique o endereço do site: páginas seguras geralmente usam HTTPS e mostram cadeado ao lado da URL.",
      "Cuidado com phishing: mensagens urgentes pedindo senha, código ou dados bancários são sinais de golpe.",
      "Senhas fortes: combine letras maiúsculas, minúsculas, números e símbolos; nunca reutilize a mesma senha em vários serviços.",
      "Privacidade: evite publicar dados pessoais em redes sociais, como endereço, rotina detalhada ou documentos.",
      "Atualizações e antivírus: manter sistema e aplicativos atualizados reduz brechas de segurança."
    ],
    practiceTip: "Antes de clicar em qualquer link, leia o domínio completo e confirme se pertence ao serviço oficial."
  },
  m4: {
    title: "Organização de arquivos e pastas",
    durationMin: 9,
    summary: "Você vai estruturar arquivos de forma lógica para encontrar tudo com facilidade.",
    contentBlocks: [
      "Crie uma pasta principal por contexto: por exemplo, Estudos, Projetos e Pessoal.",
      "Dentro de Estudos, separe por disciplina e depois por tipo de material (Aulas, Exercícios, Revisão).",
      "Nomeação inteligente: use padrão como AAAA-MM-DD_tema para manter arquivos ordenados por data.",
      "Evite versões confusas: em vez de arquivo_final_final, use sufixos claros como v1, v2, v3.",
      "Backup básico: mantenha cópia em nuvem ou pendrive para não perder conteúdo importante."
    ],
    practiceTip: "Reorganize uma pasta antiga hoje usando um padrão único de nomes."
  },
  m5: {
    title: "Lógica e pensamento computacional",
    durationMin: 12,
    summary: "Você vai aprender a resolver problemas em passos organizados, como um programador.",
    contentBlocks: [
      "Sequência lógica: toda solução precisa de uma ordem de passos clara do início ao fim.",
      "Condições (se/então): ajudam a tomar decisões com base em regras, como 'se nota >= 7, aprovado'.",
      "Repetições: quando uma ação precisa acontecer várias vezes, usamos estruturas de loop.",
      "Decomposição: dividir problemas grandes em partes menores facilita o entendimento.",
      "Validação: testar com exemplos simples mostra rapidamente se sua lógica está correta."
    ],
    practiceTip: "Descreva em passos a rotina de preparar um lanche e identifique decisões no processo."
  },
  m6: {
    title: "Introdução a algoritmos",
    durationMin: 11,
    summary: "Você vai transformar ideias em instruções claras que podem ser executadas por uma máquina.",
    contentBlocks: [
      "Algoritmo é uma sequência de instruções para resolver um problema específico.",
      "Um bom algoritmo deve ser finito, claro e testável.",
      "Entradas são os dados recebidos; processamento é a lógica aplicada; saída é o resultado.",
      "Fluxogramas ajudam a visualizar caminhos e decisões do algoritmo.",
      "Antes de programar, simule o algoritmo com exemplos manuais para validar a ideia."
    ],
    practiceTip: "Crie um algoritmo para calcular média de duas notas e determinar aprovação."
  },
  m7: {
    title: "Primeiros passos em C",
    durationMin: 14,
    summary: "Você vai aprender a estrutura básica de um programa em C e comandos iniciais.",
    contentBlocks: [
      "Todo programa em C começa na função main(), que representa o ponto de entrada da execução.",
      "A função printf() exibe mensagens na tela; é essencial para interação inicial com o usuário.",
      "Variáveis guardam valores em memória. Exemplo: int idade = 12; para números inteiros.",
      "Tipos de dados comuns: int (inteiro), float (decimal), char (caractere).",
      "Compilar e executar: primeiro o código é traduzido para linguagem de máquina e depois executado."
    ],
    practiceTip: "Escreva um programa simples que mostre seu nome e uma mensagem de boas-vindas."
  },
  m8: {
    title: "Resolução de problemas",
    durationMin: 12,
    summary: "Você vai aplicar lógica para resolver desafios de forma estruturada e eficiente.",
    contentBlocks: [
      "Comece definindo o problema com clareza: o que precisa ser resolvido e qual resultado esperado.",
      "Liste entradas e saídas: isso evita confusão no momento de implementar a solução.",
      "Crie etapas pequenas: resolver bloco por bloco diminui erros.",
      "Teste com casos simples e extremos para validar se a solução é confiável.",
      "Refatore: após funcionar, melhore legibilidade e organização do raciocínio."
    ],
    practiceTip: "Escolha um problema do cotidiano e escreva sua solução em etapas numeradas."
  },
  m9: {
    title: "Primeiro projeto guiado",
    durationMin: 15,
    summary: "Você vai construir um mini projeto aplicando os conceitos estudados até aqui.",
    contentBlocks: [
      "Defina escopo: escolha um projeto pequeno, como calculadora, cadastro simples ou conversor.",
      "Planeje funcionalidades mínimas para entregar uma versão funcional rapidamente.",
      "Implemente por partes: entrada de dados, processamento e exibição do resultado.",
      "Teste cada parte antes de seguir para a próxima; isso reduz o acúmulo de erros.",
      "Documente o que foi feito para facilitar manutenção e evolução."
    ],
    practiceTip: "Faça um checklist de funcionalidades concluídas para acompanhar o progresso."
  },
  m10: {
    title: "Revisão com quizzes",
    durationMin: 8,
    summary: "Você vai revisar conceitos-chave em ciclos curtos para fortalecer a memória.",
    contentBlocks: [
      "Quizzes curtos ajudam a recuperar informação da memória e consolidar aprendizado.",
      "Feedback imediato mostra o erro no momento certo para correção rápida.",
      "Intercale temas em vez de estudar só um assunto por vez para ampliar retenção.",
      "Registre perguntas que você errou para montar sua revisão personalizada.",
      "Repetição espaçada: revisar em dias diferentes aumenta memorização de longo prazo."
    ],
    practiceTip: "Monte um mini quiz com 5 perguntas e repita após 24 horas."
  },
};

function getFallbackLesson(module) {
  const lesson = MODULE_LESSON_LIBRARY[module?.id];
  if (lesson) {
    return {
      id: `${module?.id}-lesson-library`,
      ...lesson
    };
  }
  return {
    id: `${module?.id || "module"}-fallback-lesson`,
    title: module?.title || "Aula introdutória",
    durationMin: 10,
    summary: `Nesta aula você vai revisar os pontos mais importantes de ${module?.title || "informática básica"}.`,
    contentBlocks: [
      `Conceito principal: ${module?.description || "entenda fundamentos e aplicações práticas."}`,
      "Passo a passo: leia com atenção, identifique termos-chave e relacione com situações do dia a dia.",
      "Aplicação prática: registre um exemplo real de uso desse conteúdo para fixar o aprendizado."
    ],
    practiceTip: "Anote os pontos principais e explique com suas palavras para validar seu entendimento."
  };
}

function getFallbackInteractions(module) {
  return [
    {
      id: `${module?.id || "module"}-interaction-1`,
      type: "desafio guiado",
      prompt: `Identifique dois conceitos-chave de ${module?.title || "este módulo"} e descreva para que servem.`
    },
    {
      id: `${module?.id || "module"}-interaction-2`,
      type: "aplicação prática",
      prompt: "Resolva um mini cenário usando o que você acabou de estudar."
    }
  ];
}

function getFallbackActivities(module) {
  return [
    {
      id: `${module?.id || "module"}-activity-1`,
      title: `Revisão: ${module?.title || "Módulo"}`,
      type: "multipla_escolha",
      difficulty: "🟢 Fácil",
      question: "Qual é o objetivo principal deste módulo?",
      options: ["Compreender fundamentos e aplicar na prática", "Apenas decorar termos", "Ignorar exercícios", "Não revisar conteúdo"],
      expectedAnswer: "Compreender fundamentos e aplicar na prática",
      explanation: "O foco é entender conceitos e aplicá-los em cenários reais."
    },
    {
      id: `${module?.id || "module"}-activity-2`,
      title: "Reflexão aplicada",
      type: "resolver_problema",
      difficulty: "🟡 Médio",
      question: "Escreva uma ação prática que você pode executar hoje com o que aprendeu.",
      expectedAnswer: "pratica",
      explanation: "A resposta deve indicar uma aplicação prática do conteúdo estudado."
    }
  ];
}

function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    fullName: "",
    birthDate: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [reset, setReset] = useState({ email: "", code: "", newPassword: "", confirmPassword: "" });
  const [resetCodeHint, setResetCodeHint] = useState("");
  const [msg, setMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeField, setActiveField] = useState("");
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [smoothLook, setSmoothLook] = useState({ x: 0, y: 0, mx: 0, my: 0 });
  const [rememberLogin, setRememberLogin] = useState(true);

  useEffect(() => {
    function handleMove(event) {
      setCursor({ x: event.clientX, y: event.clientY });
    }
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  const lookX = Math.max(-4, Math.min(4, ((cursor.x / Math.max(window.innerWidth, 1)) - 0.5) * 10));
  const lookY = Math.max(-3, Math.min(3, ((cursor.y / Math.max(window.innerHeight, 1)) - 0.5) * 8));
  const motionX = Math.max(-12, Math.min(12, ((cursor.x / Math.max(window.innerWidth, 1)) - 0.5) * 20));
  const motionY = Math.max(-8, Math.min(8, ((cursor.y / Math.max(window.innerHeight, 1)) - 0.5) * 16));
  const followsForm = Boolean(activeField);
  const privacyMode = showPassword && activeField.includes("password");
  const mascotExpression = privacyMode ? "guardando sua privacidade" : followsForm ? "acompanhando seu foco" : "seguindo o cursor";
  const pupilX = Math.max(-2, Math.min(2, smoothLook.x * 0.55));
  const pupilY = Math.max(-1.5, Math.min(1.5, smoothLook.y * 0.55));

  useEffect(() => {
    let rafId = null;
    function animate() {
      setSmoothLook((prev) => {
        const easing = 0.14;
        return {
          x: prev.x + (lookX - prev.x) * easing,
          y: prev.y + (lookY - prev.y) * easing,
          mx: prev.mx + (motionX - prev.mx) * easing,
          my: prev.my + (motionY - prev.my) * easing
        };
      });
      rafId = window.requestAnimationFrame(animate);
    }
    rafId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(rafId);
  }, [lookX, lookY, motionX, motionY]);

  async function submit(event) {
    event.preventDefault();
    try {
      if (mode === "register") {
        await api.post("/auth/register", form);
        setMsg("Cadastro realizado! Agora faça login.");
        setMode("login");
        return;
      }
      const { data } = await api.post("/auth/login", { email: form.email, password: form.password });
      localStorage.setItem("token", data.token);
      window.location.href = "/dashboard";
    } catch (error) {
      setMsg(error.response?.data?.message || "Erro ao processar requisição.");
    }
  }

  async function requestResetCode() {
    try {
      const { data } = await api.post("/auth/forgot-password", { email: reset.email });
      setMsg(data.message);
      setResetCodeHint(data.devCode ? `Código (modo dev): ${data.devCode}` : "");
      setMode("reset");
    } catch (error) {
      setMsg(error.response?.data?.message || "Falha ao solicitar recuperação.");
    }
  }

  async function resetPassword() {
    try {
      const { data } = await api.post("/auth/reset-password", reset);
      setMsg(data.message);
      setMode("login");
    } catch (error) {
      setMsg(error.response?.data?.message || "Falha ao redefinir senha.");
    }
  }

  return (
    <main className="container auth-shell">
      <div className="auth-layout card">
        <section className="auth-visual">
          <div
            className={`mascot-scene ${privacyMode ? "privacy-mode" : ""}`}
            aria-label={`Mascote ${mascotExpression}`}
            style={{
              "--mx": `${smoothLook.mx}px`,
              "--my": `${smoothLook.my}px`,
              "--look-x": `${smoothLook.x}px`,
              "--look-y": `${smoothLook.y}px`
            }}
          >
            <div className="mascot mascot-purple">
              <div className="mascot-face">
                <div className="mascot-eye">
                  <span style={{ transform: `translate(${followsForm ? 1.6 : pupilX}px, ${followsForm ? 0.8 : pupilY}px)` }} />
                </div>
                <div className="mascot-eye">
                  <span style={{ transform: `translate(${followsForm ? 1.6 : pupilX}px, ${followsForm ? 0.8 : pupilY}px)` }} />
                </div>
              </div>
            </div>
            <div className="mascot mascot-dark">
              <div className="mascot-face">
                <div className="mascot-eye">
                  <span style={{ transform: `translate(${followsForm ? 1.3 : pupilX * 0.85}px, ${followsForm ? 0.7 : pupilY * 0.85}px)` }} />
                </div>
                <div className="mascot-eye">
                  <span style={{ transform: `translate(${followsForm ? 1.3 : pupilX * 0.85}px, ${followsForm ? 0.7 : pupilY * 0.85}px)` }} />
                </div>
              </div>
            </div>
            <div className="mascot mascot-orange">
              <div className="mascot-face">
                <div className="mascot-eye">
                  <span style={{ transform: `translate(${followsForm ? 1.5 : pupilX * 0.9}px, ${followsForm ? 0.7 : pupilY * 0.9}px)` }} />
                </div>
                <div className="mascot-eye">
                  <span style={{ transform: `translate(${followsForm ? 1.5 : pupilX * 0.9}px, ${followsForm ? 0.7 : pupilY * 0.9}px)` }} />
                </div>
              </div>
            </div>
            <div className="mascot mascot-yellow">
              <div className="mascot-face">
                <div className="mascot-eye">
                  <span style={{ transform: `translate(${followsForm ? 1.7 : pupilX * 0.95}px, ${followsForm ? 0.6 : pupilY * 0.75}px)` }} />
                </div>
                <div className="mascot-eye">
                  <span style={{ transform: `translate(${followsForm ? 1.7 : pupilX * 0.95}px, ${followsForm ? 0.6 : pupilY * 0.75}px)` }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <form onSubmit={submit} className="auth-form" aria-label="Formulário de autenticação">
          {mode === "reset" && (
            <>
              <span className="auth-mark" aria-hidden="true">✦</span>
              <h3>Recuperar senha</h3>
              <input
                placeholder="E-mail"
                type="email"
                value={reset.email}
                onFocus={() => setActiveField("reset-email")}
                onBlur={() => setActiveField("")}
                onChange={(e) => setReset({ ...reset, email: e.target.value })}
                required
              />
              <input
                placeholder="Código de recuperação"
                value={reset.code}
                onFocus={() => setActiveField("reset-code")}
                onBlur={() => setActiveField("")}
                onChange={(e) => setReset({ ...reset, code: e.target.value })}
                required
              />
              <div className="password-field">
                <input
                  placeholder="Nova senha"
                  type={showPassword ? "text" : "password"}
                  value={reset.newPassword}
                  onFocus={() => setActiveField("reset-password")}
                  onBlur={() => setActiveField("")}
                  onChange={(e) => setReset({ ...reset, newPassword: e.target.value })}
                  required
                />
                <button type="button" className="ghost password-toggle" onClick={() => setShowPassword((value) => !value)}>
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              <input
                placeholder="Confirmar nova senha"
                type={showPassword ? "text" : "password"}
                value={reset.confirmPassword}
                onFocus={() => setActiveField("reset-password")}
                onBlur={() => setActiveField("")}
                onChange={(e) => setReset({ ...reset, confirmPassword: e.target.value })}
                required
              />
              <button type="button" onClick={resetPassword}>
                Redefinir senha
              </button>
              <button type="button" className="ghost" onClick={() => setMode("login")}>
                Voltar ao login
              </button>
              {resetCodeHint && <small>{resetCodeHint}</small>}
              {msg && <p aria-live="polite">{msg}</p>}
              <p>
                Esqueceu o código?{" "}
                <button type="button" className="ghost" onClick={requestResetCode}>
                  Gerar novo código
                </button>
              </p>
            </>
          )}
          {(mode === "login" || mode === "register") && (
            <>
              <span className="auth-mark" aria-hidden="true">✦</span>
              <h3>{mode === "login" ? "Bem-vindo(a) de volta!" : "Crie sua conta"}</h3>
              <p className="auth-helper">{mode === "login" ? "Digite seus dados para entrar" : "Preencha os campos para começar"}</p>
              {mode === "register" && (
                <>
                  <label htmlFor="fullName">Nome completo</label>
                  <input
                    id="fullName"
                    placeholder="Nome completo"
                    onFocus={() => setActiveField("fullName")}
                    onBlur={() => setActiveField("")}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    required
                  />
                  <label htmlFor="birthDate">Data de nascimento</label>
                  <input
                    id="birthDate"
                    type="date"
                    onFocus={() => setActiveField("birthDate")}
                    onBlur={() => setActiveField("")}
                    onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                    required
                  />
                </>
              )}
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                placeholder="E-mail"
                type="email"
                onFocus={() => setActiveField("email")}
                onBlur={() => setActiveField("")}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <label htmlFor="password">Senha</label>
              <div className="password-field">
                <input
                  id="password"
                  placeholder="Senha"
                  type={showPassword ? "text" : "password"}
                  onFocus={() => setActiveField("password")}
                  onBlur={() => setActiveField("")}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button type="button" className="ghost password-toggle" onClick={() => setShowPassword((value) => !value)}>
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              {mode === "login" && (
                <div className="auth-meta">
                  <label className="remember-me">
                    <input type="checkbox" checked={rememberLogin} onChange={(e) => setRememberLogin(e.target.checked)} />
                    Lembrar por 30 dias
                  </label>
                  <button type="button" className="text-action" onClick={() => setMode("recover")}>
                    Esqueci minha senha
                  </button>
                </div>
              )}
              {mode === "register" && (
                <input
                  placeholder="Confirmar senha"
                  type={showPassword ? "text" : "password"}
                  aria-label="Confirmar senha"
                  onFocus={() => setActiveField("confirm-password")}
                  onBlur={() => setActiveField("")}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                />
              )}
              <button type="submit">{mode === "login" ? "Entrar" : "Criar minha conta"}</button>
              {mode === "login" ? (
                <>
                  <button type="button" className="ghost social-google">Entrar com Google</button>
                  <p className="auth-signup">
                    Não tem uma conta?{" "}
                    <button type="button" className="text-action inline" onClick={() => setMode("register")}>
                      Criar conta
                    </button>
                  </p>
                </>
              ) : (
                <button type="button" className="ghost" onClick={() => setMode("login")}>
                  Já tenho conta
                </button>
              )}
            </>
          )}
          {mode === "recover" && (
            <>
              <span className="auth-mark" aria-hidden="true">✦</span>
              <h3>Recuperação de senha</h3>
              <input
                placeholder="Informe seu e-mail"
                type="email"
                value={reset.email}
                onFocus={() => setActiveField("recover-email")}
                onBlur={() => setActiveField("")}
                onChange={(e) => setReset({ ...reset, email: e.target.value })}
                required
              />
              <button type="button" onClick={requestResetCode}>
                Enviar código
              </button>
              <button type="button" className="ghost" onClick={() => setMode("login")}>
                Voltar
              </button>
            </>
          )}
          {msg && <p aria-live="polite">{msg}</p>}
        </form>
      </div>
    </main>
  );
}

function TopNav() {
  const navigate = useNavigate();
  function logout() {
    localStorage.removeItem("token");
    navigate("/");
  }
  return (
    <nav className="top-nav side-nav">
      <Link to="/dashboard" className="side-link">Dashboard</Link>
      <Link to="/perfil" className="side-link">Perfil</Link>
      <Link to="/ranking" className="side-link">Ranking</Link>
      <button type="button" onClick={logout} className="ghost side-link side-button">
        Sair
      </button>
    </nav>
  );
}

function AppLayout({ children }) {
  return (
    <main className="app-shell">
      <aside className="app-sidebar card">
        <h2 className="app-brand">CodeQuest</h2>
        <p className="app-brand-subtitle">Plataforma educacional</p>
        <TopNav />
      </aside>
      <section className="app-main">
        {children}
      </section>
    </main>
  );
}

function Dashboard() {
  const [user, setUser] = useState(null);
  const [modules, setModules] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [xpNotice, setXpNotice] = useState("");

  useEffect(() => {
    Promise.all([api.get("/users/me"), api.get("/content/modules"), api.get("/content/challenges")]).then(([me, md, ch]) => {
      setUser(me.data);
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
  const baseSpan = Math.max(1, (user.level.minXp + user.xpToNextLevel) - user.level.minXp);
  const progress = user.level?.level === 10 ? 100 : Math.max(0, Math.min(100, ((user.xp - user.level.minXp) / baseSpan) * 100));
  const moduleProgress = user.moduleProgress || {};
  const nextModule = modules.find((module) => (moduleProgress[module.id] || 0) < 100);

  return (
    <AppLayout>
      <section className="card hero-card">
        <h2>Bem-vindo, {user.displayName}!</h2>
        <p>Continue sua jornada e alcance o próximo nível com aulas, atividades e desafios.</p>
        {nextModule ? (
          <Link to={`/modulo/${nextModule.id}`}>
            <button>Continuar: {normalizePtBrText(nextModule.title)}</button>
          </Link>
        ) : (
          <p>Parabéns! Todos os módulos atuais foram concluídos.</p>
        )}
      </section>
      <h2>Olá, {user.displayName}</h2>
      <p>Nível atual: {normalizePtBrText(user.level.title)}</p>
      <p>Streak: {user.streak} dias 🔥</p>
      <div className="xp-bar">
        <div className="xp-fill" style={{ width: `${progress}%` }} />
      </div>
      <small>XP total: {user.xp} | Faltam {user.xpToNextLevel} XP para o próximo nível</small>
      {xpNotice && <p className="xp-notice" aria-live="polite">{xpNotice} ✨</p>}
      <section className="card">
        <h3>Desafios ativos</h3>
        <div className="grid">
          {challenges.map((challenge) => (
            <article key={challenge.id} className="badge on">
              <strong>{normalizePtBrText(challenge.title)}</strong>
              <p>{normalizePtBrText(challenge.description)}</p>
              <button onClick={() => gainXp(challenge.type === "weekly" ? "weekly_challenge" : "hard_challenge")}>
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
              <p>{normalizePtBrText(module.title)}</p>
              <small>{normalizePtBrText(module.description)}</small>
              <small>Progresso: {Math.round(moduleProgress[module.id] || 0)}%</small>
              <Link to={`/modulo/${module.id}`}>
                <button>{(moduleProgress[module.id] || 0) > 0 ? "Continuar" : "Iniciar módulo"}</button>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}

function ModulePage() {
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

  const lesson = module?.lessons?.[0]?.contentBlocks?.length ? module.lessons[0] : getFallbackLesson(module);
  const interactions = module?.interactions?.length ? module.interactions : getFallbackInteractions(module);
  const hasReadAll = lesson.contentBlocks.length > 0 && readBlocks.length === lesson.contentBlocks.length;
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
        {module.icon} {normalizePtBrText(module.title)}
      </h2>
      <p>{normalizePtBrText(module.description)}</p>
      {module.hasPhysicalDemo && <p className="xp-notice">Este módulo inclui demonstrações visuais com componentes físicos.</p>}
      <section className="card">
        <h3>Conteúdo do módulo</h3>
        <p><strong>Título:</strong> {normalizePtBrText(lesson.title)}</p>
        <p><strong>Duração estimada:</strong> {lesson.durationMin} minutos</p>
        <p><strong>Resumo:</strong> {normalizePtBrText(lesson.summary)}</p>
        <div className="lesson-blocks">
          {lesson.contentBlocks?.map((_, index) => (
            <div key={`${lesson.id}-block-${index}`} className="lesson-item">
              <p>
                {index + 1}. Espaço reservado para incluir o conteúdo do módulo.
              </p>
              <button
                type="button"
                className="ghost"
                onClick={() =>
                  setReadBlocks((prev) => (prev.includes(index) ? prev : [...prev, index]))
                }
                disabled={readBlocks.includes(index)}
              >
                {readBlocks.includes(index) ? "Bloco lido" : "Marcar como lido"}
              </button>
            </div>
          ))}
        </div>
        <small>Dica prática: espaço livre para inserir orientações da aula.</small>
        <small>Leitura concluída: {readBlocks.length}/{lesson.contentBlocks.length} blocos</small>
        <button onClick={completeLesson} disabled={!hasReadAll || lessonDone}>
          {lessonDone ? "Aula concluída (+10 XP)" : "Concluir aula agora (+10 XP)"}
        </button>
      </section>
      <section className="card">
        <h3>Conteúdo interativo</h3>
        <div className="grid">
          {interactions.map((item, index) => (
            <article key={item.id} className={`badge ${doneInteractions.includes(item.id) ? "on" : "off"}`}>
              <strong>Script {index + 1}</strong>
              <p>{normalizePtBrText(item.prompt)}</p>
              <button
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
        <small>Interações concluídas: {doneInteractions.length}/{interactions.length}</small>
      </section>
      <section className="card">
        <h3>Atividades avaliativas</h3>
        <p>Resolva as questões e receba feedback imediato com explicação de cada resposta.</p>
        <Link to={`/atividades/${module.id}`}>
          <button>Ir para atividades</button>
        </Link>
      </section>
      <button onClick={completeCourse} disabled={!lessonDone || !allInteractionsDone}>
        Concluir módulo (+50 XP)
      </button>
      {notice && <p className="xp-notice" aria-live="polite">{notice}</p>}
    </AppLayout>
  );
}

function ActivitiesPage() {
  const { moduleId } = useParams();
  const [module, setModule] = useState(null);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [wasCorrect, setWasCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    if (isRemovedModule({ id: moduleId })) return;
    api.get(`/content/modules/${moduleId}`).then(({ data }) => setModule(data));
  }, [moduleId]);

  if (isRemovedModule({ id: moduleId }) || (module && isRemovedModule(module))) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!module) return <p className="container">Carregando atividade...</p>;
  const activities = module.activities.length > 0 ? module.activities : getFallbackActivities(module);

  const activity = activities[index];
  const progress = ((index + 1) / activities.length) * 100;

  async function submitAnswer() {
    const normalized = answer.trim().toLowerCase();
    const expected = String(activity.expectedAnswer).trim().toLowerCase();
    const isCorrect =
      activity.type === "completar_codigo" ? normalized.includes(`${expected} idade`) || normalized.includes(expected) : normalized === expected;

    if (isCorrect) {
      setFeedback(`Correto! ${activity.explanation}`);
      setCorrectCount((v) => v + 1);
      setWasCorrect(true);
      await api.post("/users/me/xp", { action: "activity_completed" });
    } else {
      setFeedback(`Resposta esperada: ${activity.expectedAnswer}. ${activity.explanation}`);
      setWasCorrect(false);
    }
  }

  async function nextQuestion() {
    const last = index === activities.length - 1;
    if (last) {
      if (correctCount === activities.length) {
        await api.post("/users/me/xp", { action: "perfect_activity" });
      }
      await api.post("/users/me/xp", { action: "activity_review" });
      await api.post("/users/me/progress", { moduleId, percent: 75 });
      setFeedback("Atividade finalizada! Bônus aplicados.");
      return;
    }
    setIndex((v) => v + 1);
    setAnswer("");
    setFeedback("");
    setWasCorrect(false);
  }

  return (
    <AppLayout>
      <Link to={`/modulo/${moduleId}`}>Voltar ao módulo</Link>
      <h2>{activity.title}</h2>
      <p>
        Questão {index + 1} de {activities.length}
      </p>
      <div className="xp-bar">
        <div className="xp-fill" style={{ width: `${progress}%` }} />
      </div>
      <section className="card">
        <p>
          <strong>Tipo:</strong> {activity.type}
        </p>
        <p>
          <strong>Nível:</strong> {normalizePtBrText(activity.difficulty)}
        </p>
        <p>{normalizePtBrText(activity.question)}</p>

        {activity.options?.map((option) => (
          <button key={option} className="ghost" onClick={() => setAnswer(option)}>
            {option}
          </button>
        ))}

        {activity.type === "completar_codigo" && (
          <>
            <label>Editor C básico</label>
            <textarea value={answer || activity.starterCode} onChange={(e) => setAnswer(e.target.value)} rows={10} className="code" />
            <small>Dica: substitua ___ pelo tipo correto.</small>
          </>
        )}

        {!activity.options && activity.type !== "completar_codigo" && (
          <input value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Digite sua resposta" />
        )}

        <button onClick={submitAnswer}>Verificar resposta</button>
        <button onClick={nextQuestion} disabled={!feedback}>
          Próxima questão
        </button>
        {feedback && <small>{wasCorrect ? "✅ Boa! Continue assim." : "💡 Revise a explicação antes de avançar."}</small>}
        {feedback && <p className="xp-notice" aria-live="polite">{normalizePtBrText(feedback)}</p>}
      </section>
    </AppLayout>
  );
}

function Profile() {
  const [user, setUser] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [editing, setEditing] = useState({ displayName: "", email: "", profilePhotoUrl: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    Promise.all([api.get("/users/me"), api.get("/users/achievements")]).then(([me, ach]) => {
      setUser(me.data);
      setAchievements(ach.data);
      setEditing({
        displayName: me.data.displayName || "",
        email: me.data.email || "",
        profilePhotoUrl: me.data.profilePhotoUrl || ""
      });
    });
  }, []);

  async function save() {
    try {
      await api.patch("/users/me", editing);
      const me = await api.get("/users/me");
      setUser(me.data);
      setMsg("Dados atualizados com sucesso.");
    } catch (error) {
      setMsg(error.response?.data?.message || "Falha ao atualizar perfil.");
    }
  }

  async function changePassword() {
    try {
      const { data } = await api.patch("/users/me/password", passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setMsg(data.message);
    } catch (error) {
      setMsg(error.response?.data?.message || "Falha ao alterar senha.");
    }
  }

  if (!user) return <p className="container">Carregando...</p>;
  return (
    <AppLayout>
      <h2>Perfil de {user.displayName}</h2>
      <p>{user.email}</p>
      {user.profilePhotoUrl ? <img src={user.profilePhotoUrl} alt="Foto de perfil" width={88} height={88} className="avatar" /> : <p>Sem foto de perfil.</p>}
      <p>Cargo: {user.role}</p>
      <p>Membro desde: {new Date(user.memberSince || user.createdAt).toLocaleDateString("pt-BR")}</p>
      <p>Cursos concluídos: {user.completedCourses.length}</p>
      <section className="card">
        <h3>Resumo do jogador</h3>
        <p>XP total: {user.xp}</p>
        <p>Streak atual: {user.streak} dias</p>
      </section>
      <section className="card">
        <h3>Meus dados</h3>
        <label htmlFor="displayName">Nome de exibição</label>
        <input id="displayName" value={editing.displayName} onChange={(e) => setEditing({ ...editing, displayName: e.target.value })} placeholder="Nome de exibição" />
        <label htmlFor="profileEmail">E-mail</label>
        <input id="profileEmail" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} placeholder="E-mail" />
        <label htmlFor="profilePhotoUrl">URL da foto de perfil</label>
        <input id="profilePhotoUrl" value={editing.profilePhotoUrl} onChange={(e) => setEditing({ ...editing, profilePhotoUrl: e.target.value })} placeholder="URL da foto de perfil" />
        <button onClick={save}>Salvar alterações</button>
      </section>
      <section className="card">
        <h3>Alterar senha</h3>
        <input
          type="password"
          placeholder="Senha atual"
          value={passwordForm.currentPassword}
          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
        />
        <input
          type="password"
          placeholder="Nova senha"
          value={passwordForm.newPassword}
          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
        />
        <input
          type="password"
          placeholder="Confirmar nova senha"
          value={passwordForm.confirmPassword}
          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
        />
        <button onClick={changePassword}>Atualizar senha</button>
        {msg && <small aria-live="polite">{msg}</small>}
      </section>
      <h3>Conquistas</h3>
      <div className="grid">
        {achievements.map((a) => (
          <div key={a.key} className={`badge ${a.unlocked ? "on" : "off"}`}>
            <strong>{a.unlocked ? "🏆" : "🔒"} {a.title}</strong>
            <p>{a.description}</p>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}

function Ranking() {
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
        <button onClick={() => setType("weekly")}>Semanal</button>
        <button onClick={() => setType("monthly")}>Mensal</button>
        <button onClick={() => setType("global")}>Geral</button>
      </div>
      <ul className="card">
        {items.map((user, index) => (
          <li key={user._id} className={me && me._id === user._id ? "badge on" : ""}>
            #{user.position || index + 1} - {user.displayName} | {normalizePtBrText(user.level?.title || "Nível")} | {type === "weekly" ? user.weeklyXp : type === "monthly" ? user.monthlyXp : user.xp} XP
          </li>
        ))}
      </ul>
    </AppLayout>
  );
}

function Protected({ children }) {
  return localStorage.getItem("token") ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />
        <Route
          path="/modulo/:moduleId"
          element={
            <Protected>
              <ModulePage />
            </Protected>
          }
        />
        <Route
          path="/atividades/:moduleId"
          element={
            <Protected>
              <ActivitiesPage />
            </Protected>
          }
        />
        <Route
          path="/perfil"
          element={
            <Protected>
              <Profile />
            </Protected>
          }
        />
        <Route
          path="/ranking"
          element={
            <Protected>
              <Ranking />
            </Protected>
          }
        />
      </Routes>
    </>
  );
}
