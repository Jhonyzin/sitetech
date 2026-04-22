import { Link, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./services/api.js";

function getYoutubeEmbedUrl(url) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }
  } catch {
    return "";
  }
  return "";
}

function normalizePtBrText(value) {
  if (typeof value !== "string") return value;
  return value
    .replace(/Ã¡/g, "\u00e1")
    .replace(/Ã¢/g, "\u00e2")
    .replace(/Ã£/g, "\u00e3")
    .replace(/Ã§/g, "\u00e7")
    .replace(/Ã©/g, "\u00e9")
    .replace(/Ãª/g, "\u00ea")
    .replace(/Ã­/g, "\u00ed")
    .replace(/Ã³/g, "\u00f3")
    .replace(/Ã´/g, "\u00f4")
    .replace(/Ãµ/g, "\u00f5")
    .replace(/Ãº/g, "\u00fa")
    .replace(/Ã‰/g, "\u00c9")
    .replace(/Ã/g, "\u00cd")
    .replace(/Ã“/g, "\u00d3")
    .replace(/Ãš/g, "\u00da")
    .replace(/Ã€/g, "\u00c0")
    .replace(/Ã/g, "\u00c3")
    .replace(/ÃƒÂ¡/g, "\u00e1")
    .replace(/ÃƒÂ¢/g, "\u00e2")
    .replace(/ÃƒÂ£/g, "\u00e3")
    .replace(/ÃƒÂ§/g, "\u00e7")
    .replace(/ÃƒÂ©/g, "\u00e9")
    .replace(/ÃƒÂª/g, "\u00ea")
    .replace(/ÃƒÂ­/g, "\u00ed")
    .replace(/ÃƒÂ³/g, "\u00f3")
    .replace(/ÃƒÂ´/g, "\u00f4")
    .replace(/ÃƒÂµ/g, "\u00f5")
    .replace(/ÃƒÂº/g, "\u00fa")
    .replace(/Ã°Å¸Å¸Â¢/g, "Fácil")
    .replace(/Ã°Å¸Å¸Â¡/g, "Médio")
    .replace(/ðŸŸ¢/g, "Fácil")
    .replace(/ðŸŸ¡/g, "Médio")
    .replace(/ðŸ”´/g, "Difícil")
    .replace(/âœ…/g, "OK")
    .replace(/ðŸ’¡/g, "Dica:")
    .replace(/Ã‚/g, "")
    .replace(/Â/g, "")
    .replace(/\bComputacao\b/g, "ComputaÃ§Ã£o")
    .replace(/\bInformatica\b/g, "InformÃ¡tica")
    .replace(/\bLogico\b/g, "LÃ³gico")
    .replace(/\bTecnologico\b/g, "TecnolÃ³gico")
    .replace(/\bDificil\b/g, "DifÃ­cil")
    .replace(/\bcodigo\b/g, "cÃ³digo")
    .replace(/\bCodigo\b/g, "CÃ³digo")
    .replace(/\bmodulo\b/g, "mÃ³dulo")
    .replace(/\bModulo\b/g, "MÃ³dulo")
    .replace(/\bpratica\b/g, "prÃ¡tica")
    .replace(/\bdemonstracoes\b/g, "demonstraÃ§Ãµes")
    .replace(/\bfisicos\b/g, "fÃ­sicos");
}

function normalizeNodeTree(node) {
  if (!node) return;

  if (node.nodeType === Node.TEXT_NODE) {
    const normalized = normalizePtBrText(node.textContent);
    if (normalized !== node.textContent) node.textContent = normalized;
    return;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return;

  ["placeholder", "title", "aria-label"].forEach((attr) => {
    const current = node.getAttribute(attr);
    if (!current) return;
    const normalized = normalizePtBrText(current);
    if (normalized !== current) node.setAttribute(attr, normalized);
  });

  node.childNodes.forEach(normalizeNodeTree);
}

/** MÃ³dulos descontinuados: nÃ£o listar e redirecionar URLs diretas (ex.: API/cache antigo). */
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
    title.includes("mÃ³dulo 11") ||
    title.includes("modulo 11")
  );
}

function withoutRemovedModules(list) {
  return (list || []).filter((m) => m && !isRemovedModule(m));
}

function buildModuleIdFromTitle(title) {
  const base = normalizePtBrText(title || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return base ? `mod-${base}` : "";
}

const MODULE_LESSON_LIBRARY = {
  m1: {
    title: "Conhecendo o computador",
    durationMin: 12,
    summary: "VocÃª vai entender os principais componentes do computador e para que cada um serve no uso diÃ¡rio.",
    contentBlocks: [
      "CPU (processador): Ã© o componente responsÃ¡vel por executar instruÃ§Ãµes e cÃ¡lculos. Quanto mais eficiente o processador, mais rÃ¡pido o computador responde Ã s tarefas.",
      "MemÃ³ria RAM: armazena temporariamente os dados que estÃ£o em uso. Quando vocÃª abre vÃ¡rios programas, a RAM ajuda a manter tudo funcionando ao mesmo tempo.",
      "Armazenamento (HD/SSD): guarda arquivos de forma permanente, como fotos, documentos e programas. O SSD Ã© mais rÃ¡pido que o HD tradicional.",
      "Placa-mÃ£e e fonte: a placa-mÃ£e conecta todos os componentes; a fonte distribui energia para que cada peÃ§a funcione corretamente.",
      "PerifÃ©ricos de entrada e saÃ­da: teclado e mouse enviam comandos; monitor e caixas de som exibem resultados para o usuÃ¡rio."
    ],
    practiceTip: "Abra o gerenciador de tarefas do computador e identifique CPU, memÃ³ria e disco em uso."
  },
  m2: {
    title: "Teclado e mouse na prÃ¡tica",
    durationMin: 10,
    summary: "VocÃª vai ganhar agilidade com atalhos e aÃ§Ãµes bÃ¡sicas para navegar com mais produtividade.",
    contentBlocks: [
      "Atalhos essenciais: Ctrl+C (copiar), Ctrl+V (colar), Ctrl+X (recortar), Ctrl+Z (desfazer). Esses comandos economizam tempo em qualquer atividade.",
      "SeleÃ§Ã£o de texto: use duplo clique para selecionar palavra, triplo clique para parÃ¡grafo e Shift + setas para seleÃ§Ã£o precisa no teclado.",
      "FunÃ§Ãµes do mouse: clique esquerdo seleciona, clique direito abre menu de contexto, rolagem move a pÃ¡gina e arrastar permite organizar arquivos.",
      "OrganizaÃ§Ã£o de janelas: Alt+Tab alterna entre programas abertos; Windows+setas posiciona janelas lado a lado para estudar com duas fontes.",
      "Boas prÃ¡ticas: mantenha postura correta, apoie os punhos e faÃ§a pausas para evitar cansaÃ§o em uso prolongado."
    ],
    practiceTip: "FaÃ§a um treino rÃ¡pido: copie um texto, cole em outro arquivo e desfaÃ§a a Ãºltima aÃ§Ã£o."
  },
  m3: {
    title: "Internet com seguranÃ§a",
    durationMin: 11,
    summary: "VocÃª vai reconhecer riscos comuns na internet e aprender a proteger seus dados pessoais.",
    contentBlocks: [
      "Verifique o endereÃ§o do site: pÃ¡ginas seguras geralmente usam HTTPS e mostram cadeado ao lado da URL.",
      "Cuidado com phishing: mensagens urgentes pedindo senha, cÃ³digo ou dados bancÃ¡rios sÃ£o sinais de golpe.",
      "Senhas fortes: combine letras maiÃºsculas, minÃºsculas, nÃºmeros e sÃ­mbolos; nunca reutilize a mesma senha em vÃ¡rios serviÃ§os.",
      "Privacidade: evite publicar dados pessoais em redes sociais, como endereÃ§o, rotina detalhada ou documentos.",
      "AtualizaÃ§Ãµes e antivÃ­rus: manter sistema e aplicativos atualizados reduz brechas de seguranÃ§a."
    ],
    practiceTip: "Antes de clicar em qualquer link, leia o domÃ­nio completo e confirme se pertence ao serviÃ§o oficial."
  },
  m4: {
    title: "OrganizaÃ§Ã£o de arquivos e pastas",
    durationMin: 9,
    summary: "VocÃª vai estruturar arquivos de forma lÃ³gica para encontrar tudo com facilidade.",
    contentBlocks: [
      "Crie uma pasta principal por contexto: por exemplo, Estudos, Projetos e Pessoal.",
      "Dentro de Estudos, separe por disciplina e depois por tipo de material (Aulas, ExercÃ­cios, RevisÃ£o).",
      "NomeaÃ§Ã£o inteligente: use padrÃ£o como AAAA-MM-DD_tema para manter arquivos ordenados por data.",
      "Evite versÃµes confusas: em vez de arquivo_final_final, use sufixos claros como v1, v2, v3.",
      "Backup bÃ¡sico: mantenha cÃ³pia em nuvem ou pendrive para nÃ£o perder conteÃºdo importante."
    ],
    practiceTip: "Reorganize uma pasta antiga hoje usando um padrÃ£o Ãºnico de nomes."
  },
  m5: {
    title: "LÃ³gica e pensamento computacional",
    durationMin: 12,
    summary: "VocÃª vai aprender a resolver problemas em passos organizados, como um programador.",
    contentBlocks: [
      "SequÃªncia lÃ³gica: toda soluÃ§Ã£o precisa de uma ordem de passos clara do inÃ­cio ao fim.",
      "CondiÃ§Ãµes (se/entÃ£o): ajudam a tomar decisÃµes com base em regras, como 'se nota >= 7, aprovado'.",
      "RepetiÃ§Ãµes: quando uma aÃ§Ã£o precisa acontecer vÃ¡rias vezes, usamos estruturas de loop.",
      "DecomposiÃ§Ã£o: dividir problemas grandes em partes menores facilita o entendimento.",
      "ValidaÃ§Ã£o: testar com exemplos simples mostra rapidamente se sua lÃ³gica estÃ¡ correta."
    ],
    practiceTip: "Descreva em passos a rotina de preparar um lanche e identifique decisÃµes no processo."
  },
  m6: {
    title: "IntroduÃ§Ã£o a algoritmos",
    durationMin: 11,
    summary: "VocÃª vai transformar ideias em instruÃ§Ãµes claras que podem ser executadas por uma mÃ¡quina.",
    contentBlocks: [
      "Algoritmo Ã© uma sequÃªncia de instruÃ§Ãµes para resolver um problema especÃ­fico.",
      "Um bom algoritmo deve ser finito, claro e testÃ¡vel.",
      "Entradas sÃ£o os dados recebidos; processamento Ã© a lÃ³gica aplicada; saÃ­da Ã© o resultado.",
      "Fluxogramas ajudam a visualizar caminhos e decisÃµes do algoritmo.",
      "Antes de programar, simule o algoritmo com exemplos manuais para validar a ideia."
    ],
    practiceTip: "Crie um algoritmo para calcular mÃ©dia de duas notas e determinar aprovaÃ§Ã£o."
  },
  m7: {
    title: "Primeiros passos em C",
    durationMin: 14,
    summary: "VocÃª vai aprender a estrutura bÃ¡sica de um programa em C e comandos iniciais.",
    contentBlocks: [
      "Todo programa em C comeÃ§a na funÃ§Ã£o main(), que representa o ponto de entrada da execuÃ§Ã£o.",
      "A funÃ§Ã£o printf() exibe mensagens na tela; Ã© essencial para interaÃ§Ã£o inicial com o usuÃ¡rio.",
      "VariÃ¡veis guardam valores em memÃ³ria. Exemplo: int idade = 12; para nÃºmeros inteiros.",
      "Tipos de dados comuns: int (inteiro), float (decimal), char (caractere).",
      "Compilar e executar: primeiro o cÃ³digo Ã© traduzido para linguagem de mÃ¡quina e depois executado."
    ],
    practiceTip: "Escreva um programa simples que mostre seu nome e uma mensagem de boas-vindas."
  },
  m8: {
    title: "ResoluÃ§Ã£o de problemas",
    durationMin: 12,
    summary: "VocÃª vai aplicar lÃ³gica para resolver desafios de forma estruturada e eficiente.",
    contentBlocks: [
      "Comece definindo o problema com clareza: o que precisa ser resolvido e qual resultado esperado.",
      "Liste entradas e saÃ­das: isso evita confusÃ£o no momento de implementar a soluÃ§Ã£o.",
      "Crie etapas pequenas: resolver bloco por bloco diminui erros.",
      "Teste com casos simples e extremos para validar se a soluÃ§Ã£o Ã© confiÃ¡vel.",
      "Refatore: apÃ³s funcionar, melhore legibilidade e organizaÃ§Ã£o do raciocÃ­nio."
    ],
    practiceTip: "Escolha um problema do cotidiano e escreva sua soluÃ§Ã£o em etapas numeradas."
  },
  m9: {
    title: "Primeiro projeto guiado",
    durationMin: 15,
    summary: "VocÃª vai construir um mini projeto aplicando os conceitos estudados atÃ© aqui.",
    contentBlocks: [
      "Defina escopo: escolha um projeto pequeno, como calculadora, cadastro simples ou conversor.",
      "Planeje funcionalidades mÃ­nimas para entregar uma versÃ£o funcional rapidamente.",
      "Implemente por partes: entrada de dados, processamento e exibiÃ§Ã£o do resultado.",
      "Teste cada parte antes de seguir para a prÃ³xima; isso reduz o acÃºmulo de erros.",
      "Documente o que foi feito para facilitar manutenÃ§Ã£o e evoluÃ§Ã£o."
    ],
    practiceTip: "FaÃ§a um checklist de funcionalidades concluÃ­das para acompanhar o progresso."
  },
  m10: {
    title: "RevisÃ£o com quizzes",
    durationMin: 8,
    summary: "VocÃª vai revisar conceitos-chave em ciclos curtos para fortalecer a memÃ³ria.",
    contentBlocks: [
      "Quizzes curtos ajudam a recuperar informaÃ§Ã£o da memÃ³ria e consolidar aprendizado.",
      "Feedback imediato mostra o erro no momento certo para correÃ§Ã£o rÃ¡pida.",
      "Intercale temas em vez de estudar sÃ³ um assunto por vez para ampliar retenÃ§Ã£o.",
      "Registre perguntas que vocÃª errou para montar sua revisÃ£o personalizada.",
      "RepetiÃ§Ã£o espaÃ§ada: revisar em dias diferentes aumenta memorizaÃ§Ã£o de longo prazo."
    ],
    practiceTip: "Monte um mini quiz com 5 perguntas e repita apÃ³s 24 horas."
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
    title: module?.title || "Aula introdutÃ³ria",
    durationMin: 10,
    summary: `Nesta aula vocÃª vai revisar os pontos mais importantes de ${module?.title || "informÃ¡tica bÃ¡sica"}.`,
    contentBlocks: [
      `Conceito principal: ${module?.description || "entenda fundamentos e aplicaÃ§Ãµes prÃ¡ticas."}`,
      "Passo a passo: leia com atenÃ§Ã£o, identifique termos-chave e relacione com situaÃ§Ãµes do dia a dia.",
      "AplicaÃ§Ã£o prÃ¡tica: registre um exemplo real de uso desse conteÃºdo para fixar o aprendizado."
    ],
    practiceTip: "Anote os pontos principais e explique com suas palavras para validar seu entendimento."
  };
}

function getFallbackInteractions(module) {
  return [
    {
      id: `${module?.id || "module"}-interaction-1`,
      type: "desafio guiado",
      prompt: `Identifique dois conceitos-chave de ${module?.title || "este mÃ³dulo"} e descreva para que servem.`
    },
    {
      id: `${module?.id || "module"}-interaction-2`,
      type: "aplicaÃ§Ã£o prÃ¡tica",
      prompt: "Resolva um mini cenÃ¡rio usando o que vocÃª acabou de estudar."
    }
  ];
}

function getFallbackActivities(module) {
  if (module?.id === "m7") {
    return [
      {
        id: "m7-activity-1",
        title: "Fundamentos de C",
        type: "multipla_escolha",
        difficulty: "Ã°Å¸Å¸Â¢ FÃƒÂ¡cil",
        question: "Qual funÃƒÂ§ÃƒÂ£o marca o ponto de entrada de um programa em C?",
        options: ["main()", "start()", "printf()", "return()"],
        expectedAnswer: "main()",
        explanation: "A execuÃƒÂ§ÃƒÂ£o de um programa em C comeÃƒÂ§a na funÃƒÂ§ÃƒÂ£o main()."
      },
      {
        id: "m7-activity-2",
        title: "SaÃƒÂ­da de dados",
        type: "multipla_escolha",
        difficulty: "Ã°Å¸Å¸Â¢ FÃƒÂ¡cil",
        question: "Qual comando ÃƒÂ© usado para exibir texto na tela em C?",
        options: ["scanf()", "printf()", "main()", "int()"],
        expectedAnswer: "printf()",
        explanation: "printf() envia mensagens e valores para a saÃƒÂ­da padrÃƒÂ£o, normalmente o terminal."
      },
      {
        id: "m7-activity-3",
        title: "Tipos bÃƒÂ¡sicos",
        type: "multipla_escolha",
        difficulty: "Ã°Å¸Å¸Â¡ MÃƒÂ©dio",
        question: "Qual tipo ÃƒÂ© mais indicado para armazenar um nÃƒÂºmero inteiro em C?",
        options: ["float", "char", "int", "string"],
        expectedAnswer: "int",
        explanation: "O tipo int ÃƒÂ© usado para armazenar valores inteiros, positivos ou negativos."
      },
      {
        id: "m7-activity-4",
        title: "Leitura de cÃƒÂ³digo",
        type: "multipla_escolha",
        difficulty: "Ã°Å¸Å¸Â¡ MÃƒÂ©dio",
        question: "O que este trecho faz? int idade = 16;",
        options: [
          "Cria uma variÃƒÂ¡vel inteira chamada idade com valor 16",
          "Exibe 16 na tela",
          "LÃƒÂª a idade digitada pelo usuÃƒÂ¡rio",
          "Encerra o programa"
        ],
        expectedAnswer: "Cria uma variÃƒÂ¡vel inteira chamada idade com valor 16",
        explanation: "Esse trecho declara uma variÃƒÂ¡vel do tipo int e jÃƒÂ¡ inicializa com o valor 16."
      },
      {
        id: "m7-activity-5",
        title: "Biblioteca padrÃƒÂ£o",
        type: "multipla_escolha",
        difficulty: "Ã°Å¸Å¸Â¡ MÃƒÂ©dio",
        question: "Qual biblioteca costuma ser incluÃƒÂ­da para usar printf() em C?",
        options: ["math.h", "stdio.h", "string.h", "stdlib.js"],
        expectedAnswer: "stdio.h",
        explanation: "A biblioteca stdio.h declara funÃƒÂ§ÃƒÂµes de entrada e saÃƒÂ­da, como printf() e scanf()."
      }
    ];
  }

  return [
    {
      id: `${module?.id || "module"}-activity-1`,
      title: `RevisÃ£o: ${module?.title || "MÃ³dulo"}`,
      type: "multipla_escolha",
      difficulty: "ðŸŸ¢ FÃ¡cil",
      question: "Qual Ã© o objetivo principal deste mÃ³dulo?",
      options: ["Compreender fundamentos e aplicar na prÃ¡tica", "Apenas decorar termos", "Ignorar exercÃ­cios", "NÃ£o revisar conteÃºdo"],
      expectedAnswer: "Compreender fundamentos e aplicar na prÃ¡tica",
      explanation: "O foco Ã© entender conceitos e aplicÃ¡-los em cenÃ¡rios reais."
    },
    {
      id: `${module?.id || "module"}-activity-2`,
      title: "ReflexÃ£o aplicada",
      type: "resolver_problema",
      difficulty: "ðŸŸ¡ MÃ©dio",
      question: "Escreva uma aÃ§Ã£o prÃ¡tica que vocÃª pode executar hoje com o que aprendeu.",
      expectedAnswer: "pratica",
      explanation: "A resposta deve indicar uma aplicaÃ§Ã£o prÃ¡tica do conteÃºdo estudado."
    }
  ];
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    fullName: "",
    birthDate: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "aluno"
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
        setMsg("Cadastro realizado! Agora faÃ§a login.");
        setMode("login");
        setForm({
          fullName: "",
          birthDate: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "aluno"
        });
        return;
      }
      const { data } = await api.post("/auth/login", { email: form.email, password: form.password });
      localStorage.setItem("token", data.token);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setMsg(error.response?.data?.message || "Erro ao processar requisiÃ§Ã£o.");
    }
  }

  async function requestResetCode() {
    try {
      const { data } = await api.post("/auth/forgot-password", { email: reset.email });
      setMsg(data.message);
      setResetCodeHint(data.devCode ? `CÃ³digo (modo dev): ${data.devCode}` : "");
      setMode("reset");
    } catch (error) {
      setMsg(error.response?.data?.message || "Falha ao solicitar recuperaÃ§Ã£o.");
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

        <form onSubmit={submit} className="auth-form" aria-label="FormulÃ¡rio de autenticaÃ§Ã£o">
          {mode === "reset" && (
            <>
              <span className="auth-mark" aria-hidden="true">âœ¦</span>
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
                placeholder="CÃ³digo de recuperaÃ§Ã£o"
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
                Esqueceu o cÃ³digo?{" "}
                <button type="button" className="ghost" onClick={requestResetCode}>
                  Gerar novo cÃ³digo
                </button>
              </p>
            </>
          )}
          {(mode === "login" || mode === "register") && (
            <>
              <span className="auth-mark" aria-hidden="true"></span>
              <h3>{mode === "login" ? "Bem-vindo(a) de volta!" : "Crie sua conta"}</h3>
              <p className="auth-helper">{mode === "login" ? "Digite seus dados para entrar" : "Preencha os campos para comeÃ§ar"}</p>
              {mode === "register" && (
                <>
                  <label htmlFor="fullName">Nome completo</label>
                  <input
                    id="fullName"
                    placeholder="Nome completo"
                    value={form.fullName}
                    onFocus={() => setActiveField("fullName")}
                    onBlur={() => setActiveField("")}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    required
                  />
                  <label htmlFor="birthDate">Data de nascimento</label>
                  <input
                    id="birthDate"
                    type="date"
                    value={form.birthDate}
                    onFocus={() => setActiveField("birthDate")}
                    onBlur={() => setActiveField("")}
                    onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                    required
                  />
                  <label htmlFor="role">Tipo de conta</label>
                  <select
                    id="role"
                    value={form.role}
                    onFocus={() => setActiveField("role")}
                    onBlur={() => setActiveField("")}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="aluno">Aluno</option>
                    <option value="professor">Professor</option>
                  </select>

                </>
              )}
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                placeholder="E-mail"
                type="email"
                value={form.email}
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
                  value={form.password}
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
                  value={form.confirmPassword}
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
                    NÃ£o tem uma conta?{" "}
                    <button type="button" className="text-action inline" onClick={() => setMode("register")}>
                      Criar conta
                    </button>
                  </p>
                </>
              ) : (
                <button type="button" className="ghost" onClick={() => setMode("login")}>
                  JÃ¡ tenho conta
                </button>
              )}
            </>
          )}
          {mode === "recover" && (
            <>
              <span className="auth-mark" aria-hidden="true">âœ¦</span>
              <h3>RecuperaÃ§Ã£o de senha</h3>
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
                Enviar cÃ³digo
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
  const [me, setMe] = useState(null);

  useEffect(() => {
    api.get("/users/me").then(({ data }) => setMe(data)).catch(() => setMe(null));
  }, []);

  function logout() {
    localStorage.removeItem("token");
    navigate("/");
  }
  return (
    <nav className="top-nav side-nav">
      <Link to="/dashboard" className="side-link">Dashboard</Link>
      <Link to="/perfil" className="side-link">Perfil</Link>
      <Link to="/ranking" className="side-link">Ranking</Link>
      {me?.role === "professor" && (
        <Link to="/gestao" className="side-link">Gestão</Link>
      )}
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
        <h2 className="app-brand">NextTech</h2>
        <p className="app-brand-subtitle">Plataforma educacional</p>
        <TopNav />
      </aside>
      <section className="app-main">
        {children}
      </section>
    </main>
  );
}

function ClassesSection({ userRole }) {
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
    api.get(`/users/classes/${selectedClassId}/leaderboard`).then(({ data }) => setLeaderboard(data)).catch(() => setLeaderboard([]));
  }, [selectedClassId]);

  async function joinClass() {
    try {
      const { data } = await api.post("/users/classes/join", { code: joinCode });
      setMessage(data.message);
      setJoinCode("");
      await loadClasses();
      setSelectedClassId(data.turma.id);
    } catch (error) {
      setMessage(error.response?.data?.message || "NÃƒÂ£o foi possÃƒÂ­vel entrar na turma.");
    }
  }

  return (
    <section className="card">
      <h3>Turmas</h3>
      {userRole === "aluno" ? (
        <>
          <div className="inline-form">
            <input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="Digite o cÃƒÂ³digo da turma" />
            <button type="button" onClick={joinClass} disabled={!joinCode.trim()}>
              Entrar na turma
            </button>
          </div>
          <select value={selectedModuleId} onChange={(e) => setSelectedModuleId(e.target.value)}>
            <option value="">Selecione um conteÃƒÂºdo</option>
            {modules.map((module) => (
              <option key={module.id} value={module.id}>{module.title}</option>
            ))}
          </select>
          <div className="grid">
            {classes.map((item) => (
              <article key={item.id} className="badge on">
                <strong>{item.name}</strong>
                <small>CÃƒÂ³digo: {item.code}</small>
                <small>ConteÃƒÂºdos liberados: {item.moduleCount}</small>
              </article>
            ))}
          </div>
        </>
      ) : (
        <>
          <p>Suas turmas e conteÃƒÂºdos administrados ficam centralizados na ÃƒÂ¡rea de Gestão.</p>
          <div className="grid">
            {classes.map((item) => (
              <article key={item.id} className="badge on">
                <strong>{item.name}</strong>
                <small>CÃƒÂ³digo: {item.code}</small>
                <small>Alunos: {item.memberCount}</small>
                <small>ConteÃƒÂºdos: {item.moduleCount}</small>
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
              <option key={item.id} value={item.id}>{item.name}</option>
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

function StaffOnly({ children }) {
  const [me, setMe] = useState(undefined);

  useEffect(() => {
    api.get("/users/me").then(({ data }) => setMe(data)).catch(() => setMe(null));
  }, []);

  if (me === undefined) return <p className="container">Carregando...</p>;
  if (!me || me.role !== "professor") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function ManagementPage() {
  const [me, setMe] = useState(null);
  const [classes, setClasses] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [selectedModuleDetails, setSelectedModuleDetails] = useState(null);
  const [message, setMessage] = useState("");
  const [moduleForm, setModuleForm] = useState({ id: "", order: "", title: "", description: "", icon: "ðŸ“˜", classId: "" });
  const [lessonForm, setLessonForm] = useState({ moduleId: "", title: "", summary: "", durationMin: 10, videoUrl: "", position: 1 });
  const [questionForm, setQuestionForm] = useState({
    moduleId: "",
    title: "",
    difficulty: "ðŸŸ¢ FÃ¡cil",
    question: "",
    optionsText: "",
    expectedAnswer: "",
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
    loadBase().catch(() => setMessage("NÃƒÂ£o foi possÃƒÂ­vel carregar a ÃƒÂ¡rea de Gestão."));
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
      setMessage(error.response?.data?.message || "NÃƒÂ£o foi possÃƒÂ­vel criar a turma.");
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
      setMessage("ConteÃƒÂºdo criado com sucesso.");
      setModuleForm({ id: "", order: "", title: "", description: "", icon: "ðŸ“˜", classId: "" });
      await refreshAll(moduleForm.classId || selectedClassId, generatedId);
    } catch (error) {
      setMessage(error.response?.data?.message || "NÃƒÂ£o foi possÃƒÂ­vel criar o conteÃƒÂºdo.");
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
      setMessage(error.response?.data?.message || "NÃƒÂ£o foi possÃƒÂ­vel criar a aula.");
    }
  }

  async function createQuestion() {
    try {
      const options = questionForm.optionsText
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean);
      await api.post(`/content/modules/${questionForm.moduleId}/activities`, {
        title: questionForm.title,
        difficulty: questionForm.difficulty,
        question: questionForm.question,
        options,
        expectedAnswer: questionForm.expectedAnswer,
        explanation: questionForm.explanation
      });
      setMessage("QuestÃ£o adicionada com sucesso.");
      setQuestionForm({
        moduleId: "",
        title: "",
        difficulty: "ðŸŸ¢ FÃ¡cil",
        question: "",
        optionsText: "",
        expectedAnswer: "",
        explanation: ""
      });
      await refreshAll(selectedClassId, questionForm.moduleId);
    } catch (error) {
      setMessage(error.response?.data?.message || "NÃ£o foi possÃ­vel criar a questÃ£o.");
    }
  }

  async function deleteModule(moduleId) {
    try {
      await api.delete(`/content/modules/${moduleId}`);
      setMessage("ConteÃƒÂºdo removido.");
      await refreshAll();
    } catch (error) {
      setMessage(error.response?.data?.message || "NÃƒÂ£o foi possÃƒÂ­vel remover o conteÃƒÂºdo.");
    }
  }

  async function deleteQuestion(moduleId, activityId) {
    try {
      await api.delete(`/content/modules/${moduleId}/activities/${activityId}`);
      setMessage("QuestÃƒÂ£o removida.");
      await refreshAll(selectedClassId, moduleId);
    } catch (error) {
      setMessage(error.response?.data?.message || "NÃƒÂ£o foi possÃƒÂ­vel remover a questÃƒÂ£o.");
    }
  }

  async function addMember() {
    try {
      await api.post(`/users/classes/${selectedClassId}/members`, { email: memberEmail });
      setMessage("Aluno adicionado ÃƒÂ  turma.");
      setMemberEmail("");
      await refreshAll(selectedClassId);
    } catch (error) {
      setMessage(error.response?.data?.message || "NÃƒÂ£o foi possÃƒÂ­vel adicionar o aluno.");
    }
  }

  async function removeMember(userId) {
    try {
      await api.delete(`/users/classes/${selectedClassId}/members/${userId}`);
      setMessage("Aluno removido da turma.");
      await refreshAll(selectedClassId);
    } catch (error) {
      setMessage(error.response?.data?.message || "NÃƒÂ£o foi possÃƒÂ­vel remover o aluno.");
    }
  }

  async function assignModule() {
    try {
      await api.post(`/users/classes/${selectedClassId}/modules/${assignModuleId}`);
      setMessage("ConteÃƒÂºdo vinculado ÃƒÂ  turma.");
      setAssignModuleId("");
      await refreshAll(selectedClassId);
    } catch (error) {
      setMessage(error.response?.data?.message || "NÃƒÂ£o foi possÃƒÂ­vel vincular o conteÃƒÂºdo.");
    }
  }

  async function unassignModule(moduleId) {
    try {
      await api.delete(`/users/classes/${selectedClassId}/modules/${moduleId}`);
      setMessage("ConteÃƒÂºdo removido da turma.");
      await refreshAll(selectedClassId);
    } catch (error) {
      setMessage(error.response?.data?.message || "NÃƒÂ£o foi possÃƒÂ­vel remover o conteÃƒÂºdo da turma.");
    }
  }

  async function copyInviteCode() {
    try {
      if (!selectedClass?.code) return;
      await navigator.clipboard.writeText(selectedClass.code);
      setCopyState("CÃ³digo copiado!");
      window.setTimeout(() => setCopyState(""), 1800);
    } catch {
      setCopyState("Copie manualmente o cÃ³digo exibido.");
      window.setTimeout(() => setCopyState(""), 2200);
    }
  }

  if (!me) return <p className="container">Carregando Gestão...</p>;

  return (
    <AppLayout>
      <section className="card">
        <h2>Gestão acadÃƒÂªmica</h2>
        <p>VocÃƒÂª estÃƒÂ¡ autenticado como professor. Aqui vocÃƒÂª cria turmas, gera convites automÃ¡ticos, publica aulas e gerencia questÃµes dos seus conteÃºdos.</p>
        {message && <p className="xp-notice">{message}</p>}
      </section>

      <section className="management-grid">
        <article className="card">
          <h3>Criar turma</h3>
          <input value={classForm.name} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} placeholder="Nome da turma" />
          <textarea value={classForm.description} onChange={(e) => setClassForm({ ...classForm, description: e.target.value })} placeholder="DescriÃƒÂ§ÃƒÂ£o da turma" rows={4} />
          <button type="button" onClick={createClass} disabled={!classForm.name.trim()}>
            Criar turma
          </button>
        </article>

        <article className="card">
          <h3>Criar conteÃƒÂºdo</h3>
          <input value={moduleForm.id} onChange={(e) => setModuleForm({ ...moduleForm, id: e.target.value })} placeholder="ID do conteÃºdo (opcional, gerado a partir do tÃ­tulo se vazio)" />
          <input value={moduleForm.order} onChange={(e) => setModuleForm({ ...moduleForm, order: e.target.value })} placeholder="Ordem" type="number" />
          <input value={moduleForm.title} onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })} placeholder="TÃƒÂ­tulo" />
          <textarea value={moduleForm.description} onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })} placeholder="DescriÃƒÂ§ÃƒÂ£o" rows={4} />
          <div className="inline-form">
            <input value={moduleForm.icon} onChange={(e) => setModuleForm({ ...moduleForm, icon: e.target.value })} placeholder="ÃƒÂcone" />
            <select value={moduleForm.classId} onChange={(e) => setModuleForm({ ...moduleForm, classId: e.target.value })}>
              <option value="">Sem turma inicial</option>
              {classes.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={createModule}
            disabled={!(moduleForm.id.trim() || buildModuleIdFromTitle(moduleForm.title)) || !moduleForm.order || !moduleForm.title.trim() || !moduleForm.description.trim()}
          >
            Criar conteÃƒÂºdo
          </button>
        </article>

        <article className="card">
          <h3>Adicionar aula</h3>
          <select value={lessonForm.moduleId} onChange={(e) => setLessonForm({ ...lessonForm, moduleId: e.target.value })}>
            <option value="">Selecione um mÃƒÂ³dulo</option>
            {modules.map((module) => (
              <option key={module.id} value={module.id}>{module.title}</option>
            ))}
          </select>
          <input value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} placeholder="TÃƒÂ­tulo da aula" />
          <textarea value={lessonForm.summary} onChange={(e) => setLessonForm({ ...lessonForm, summary: e.target.value })} placeholder="Resumo da aula" rows={4} />
          <div className="inline-form">
            <input value={lessonForm.durationMin} onChange={(e) => setLessonForm({ ...lessonForm, durationMin: e.target.value })} type="number" placeholder="DuraÃƒÂ§ÃƒÂ£o" />
            <input value={lessonForm.position} onChange={(e) => setLessonForm({ ...lessonForm, position: e.target.value })} type="number" placeholder="PosiÃƒÂ§ÃƒÂ£o" />
          </div>
          <input value={lessonForm.videoUrl} onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })} placeholder="URL do vÃƒÂ­deo (opcional)" />
          <button
            type="button"
            onClick={createLesson}
            disabled={!lessonForm.moduleId || !lessonForm.title.trim() || !lessonForm.summary.trim()}
          >
            Adicionar aula
          </button>
        </article>

        <article className="card">
          <h3>Criar questÃƒÂ£o</h3>
          <select value={questionForm.moduleId} onChange={(e) => setQuestionForm({ ...questionForm, moduleId: e.target.value })}>
            <option value="">Selecione um mÃƒÂ³dulo</option>
            {modules.map((module) => (
              <option key={module.id} value={module.id}>{module.title}</option>
            ))}
          </select>
          <input value={questionForm.title} onChange={(e) => setQuestionForm({ ...questionForm, title: e.target.value })} placeholder="TÃƒÂ­tulo da questÃƒÂ£o" />
          <select value={questionForm.difficulty} onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}>
            <option value="ðŸŸ¢ FÃ¡cil">FÃƒÂ¡cil</option>
            <option value="ðŸŸ¡ MÃ©dio">MÃƒÂ©dio</option>
            <option value="ðŸ”´ DifÃ­cil">DifÃƒÂ­cil</option>
          </select>
          <textarea value={questionForm.question} onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })} placeholder="Enunciado da questÃƒÂ£o" rows={4} />
          <textarea value={questionForm.optionsText} onChange={(e) => setQuestionForm({ ...questionForm, optionsText: e.target.value })} placeholder={"Uma opÃƒÂ§ÃƒÂ£o por linha"} rows={4} />
          <input value={questionForm.expectedAnswer} onChange={(e) => setQuestionForm({ ...questionForm, expectedAnswer: e.target.value })} placeholder="Resposta correta" />
          <textarea value={questionForm.explanation} onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })} placeholder="ExplicaÃƒÂ§ÃƒÂ£o do feedback" rows={3} />
          <button
            type="button"
            onClick={createQuestion}
            disabled={!questionForm.moduleId || !questionForm.title.trim() || !questionForm.question.trim() || !questionForm.optionsText.trim() || !questionForm.expectedAnswer.trim() || !questionForm.explanation.trim()}
          >
            Criar questÃƒÂ£o
          </button>
        </article>
      </section>

      <section className="management-grid">
        <article className="card">
          <h3>Minhas turmas</h3>
          <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)}>
            <option value="">Selecione uma turma</option>
            {classes.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          <div className="grid">
            {classes.map((item) => (
              <article key={item.id} className={`badge ${selectedClassId === item.id ? "on" : "off"}`}>
                <strong>{item.name}</strong>
                <small>CÃƒÂ³digo: {item.code}</small>
                <small>Alunos: {item.memberCount}</small>
                <small>ConteÃƒÂºdos: {item.moduleCount}</small>
              </article>
            ))}
          </div>
        </article>

        <article className="card">
          <h3>ConteÃƒÂºdos administrados</h3>
          <div className="grid">
            {modules.map((module) => (
              <article key={module.id} className="badge on">
                <strong>{module.icon} {module.title}</strong>
                <small>ID: {module.id}</small>
                <small>Ordem: {module.order}</small>
                <small>Turmas: {module.classes?.map((item) => item.name).join(", ") || "Nenhuma"}</small>
                <button type="button" onClick={() => deleteModule(module.id)}>
                  Remover conteÃƒÂºdo
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
            <p><strong>{selectedClass.name}</strong></p>
            <div className="invite-card">
              <small>CÃƒÂ³digo de convite Ãºnico</small>
              <strong className="invite-code">{selectedClass.code}</strong>
              <button type="button" onClick={copyInviteCode}>
                Copiar cÃ³digo
              </button>
              {copyState && <small>{copyState}</small>}
            </div>
            <p>{selectedClass.description || "Sem descriÃƒÂ§ÃƒÂ£o."}</p>
            <div className="inline-form">
              <input value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} placeholder="E-mail do aluno" />
              <button type="button" onClick={addMember} disabled={!memberEmail.trim()}>
                Adicionar aluno
              </button>
            </div>
            <div className="inline-form">
              <select value={assignModuleId} onChange={(e) => setAssignModuleId(e.target.value)}>
                <option value="">Selecione um conteÃƒÂºdo</option>
                {modules.map((module) => (
                  <option key={module.id} value={module.id}>{module.title}</option>
                ))}
              </select>
              <button type="button" onClick={assignModule} disabled={!assignModuleId}>
                Vincular conteÃƒÂºdo
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
            <h3>ConteÃƒÂºdos da turma</h3>
            <div className="grid">
              {selectedClass.modules?.map((module) => (
                <article key={module.id} className="badge on">
                  <strong>{module.icon} {module.title}</strong>
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
      {selectedModuleDetails && (
        <section className="management-grid">
          <article className="card">
            <h3>Detalhes do conteÃƒÂºdo selecionado</h3>
            <p><strong>{selectedModuleDetails.title}</strong></p>
            <p>{selectedModuleDetails.description}</p>
            <small>Aulas cadastradas: {selectedModuleDetails.lessons?.length || 0}</small>
            <small>QuestÃƒÂµes cadastradas: {selectedModuleDetails.activities?.length || 0}</small>
          </article>
          <article className="card">
            <h3>Aulas cadastradas</h3>
            <div className="grid">
              {selectedModuleDetails.lessons?.map((lesson) => (
                <article key={lesson.id} className="badge on">
                  <strong>{lesson.title}</strong>
                  <small>DuraÃ§Ã£o: {lesson.durationMin} min</small>
                  <small>{lesson.videoUrl ? "Com vÃ­deo do YouTube" : "Sem vÃ­deo"}</small>
                </article>
              ))}
              {!selectedModuleDetails.lessons?.length && <p>Nenhuma aula cadastrada ainda.</p>}
            </div>
          </article>
          <article className="card">
            <h3>QuestÃƒÂµes cadastradas</h3>
            <div className="grid">
              {selectedModuleDetails.activities?.map((activity) => (
                <article key={activity.id} className="badge on">
                  <strong>{activity.title}</strong>
                  <small>{activity.question}</small>
                  <small>Resposta correta: {activity.expectedAnswer}</small>
                  <button type="button" onClick={() => deleteQuestion(selectedModuleDetails.id, activity.id)}>
                    Remover questÃƒÂ£o
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

function ProfessorDashboard() {
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);
  const [modules, setModules] = useState([]);

  useEffect(() => {
    Promise.all([api.get("/users/me"), api.get("/users/classes"), api.get("/content/modules?scope=manageable")]).then(([me, classRes, moduleRes]) => {
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
        <p>Crie turmas, compartilhe o cÃ³digo de convite gerado automaticamente e publique seus prÃ³prios conteÃºdos.</p>
        <Link to="/gestao">
          <button>Abrir gestão</button>
        </Link>
      </section>

      <section className="management-grid">
        <article className="card">
          <h3>VisÃ£o geral</h3>
          <p><strong>{user.displayName}</strong></p>
          <small>Turmas ativas: {classes.length}</small>
          <small>ConteÃºdos criados: {modules.length}</small>
        </article>
        <article className="card">
          <h3>Convites recentes</h3>
          <div className="grid">
            {classes.slice(0, 3).map((item) => (
              <article key={item.id} className="badge on">
                <strong>{item.name}</strong>
                <small>CÃ³digo: {item.code}</small>
                <small>Alunos: {item.memberCount}</small>
              </article>
            ))}
            {!classes.length && <p>Crie sua primeira turma na Ã¡rea de gestÃ£o.</p>}
          </div>
        </article>
      </section>

      <section className="card">
        <h3>ConteÃºdos do professor</h3>
        <div className="grid">
          {modules.map((module) => (
            <article key={module.id} className="badge on">
              <strong>{module.icon} {module.title}</strong>
              <small>ID: {module.id}</small>
              <small>Turmas vinculadas: {module.classes?.length || 0}</small>
            </article>
          ))}
          {!modules.length && <p>VocÃª ainda nÃ£o criou conteÃºdos.</p>}
        </div>
      </section>

      <ClassesSection userRole={user.role} />
    </AppLayout>
  );
}

function Dashboard() {
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
  const baseSpan = Math.max(1, (user.level.minXp + user.xpToNextLevel) - user.level.minXp);
  const progress = user.level?.level === 10 ? 100 : Math.max(0, Math.min(100, ((user.xp - user.level.minXp) / baseSpan) * 100));
  const moduleProgress = user.moduleProgress || {};
  const nextModule = modules.find((module) => (moduleProgress[module.id] || 0) < 100);

  return (
    <AppLayout>
      <section className="card hero-card">
        <h2>Bem-vindo, {user.displayName}!</h2>
        <p>Continue sua jornada e alcance o prÃ³ximo nÃ­vel com aulas, atividades e desafios.</p>
        {nextModule ? (
          <Link to={`/modulo/${nextModule.id}`}>
            <button>Continuar: {normalizePtBrText(nextModule.title)}</button>
          </Link>
        ) : (
          <p>ParabÃ©ns! Todos os mÃ³dulos atuais foram concluÃ­dos.</p>
        )}
      </section>
      <h2>OlÃ¡, {user.displayName}</h2>
      <p>NÃ­vel atual: {normalizePtBrText(user.level.title)}</p>
      <p>Streak: {user.streak} dias </p>
      <div className="xp-bar">
        <div className="xp-fill" style={{ width: `${progress}%` }} />
      </div>
      <small>XP total: {user.xp} | Faltam {user.xpToNextLevel} XP para o proximo nivel  </small>
      {xpNotice && <p className="xp-notice" aria-live="polite">{xpNotice} </p>}
      <section className="card">
        <h3>Desafios ativos</h3>
        <div className="grid">
          {challenges.map((challenge) => (
            <article key={challenge.id} className="badge on">
              <strong>{normalizePtBrText(challenge.title)}</strong>
              <p>{normalizePtBrText(challenge.description)}</p>
              <button onClick={() => gainXp(challenge.type === "weekly" ? "weekly_challenge" : "hard_challenge")}>
                Completar missÃ£o (+{challenge.xpReward} XP)
              </button>
            </article>
          ))}
        </div>
      </section>
      <section className="card">
        <h3>Cursos e módulos </h3>
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
      <ClassesSection userRole={user.role} />
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
      setNotice("Para concluir a aula, leia todo o conteÃºdo e marque cada bloco como lido.");
      return;
    }
    await api.post("/users/me/xp", { action: "lesson_completed" });
    await api.post("/users/me/progress", { moduleId, percent: 35 });
    setNotice("+10 XP por aula concluÃ­da");
    setLessonDone(true);
  }

  async function completeCourse() {
    if (!lessonDone || !allInteractionsDone) {
      setNotice("Conclua a leitura da aula e finalize todas as interaÃ§Ãµes antes de concluir o mÃ³dulo.");
      return;
    }
    await api.post("/users/me/xp", { action: "course_completed", courseName: module.title });
    await api.post("/users/me/progress", { moduleId, percent: 100 });
    setNotice("+50 XP por mÃ³dulo concluÃ­do");
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
          {lesson.contentBlocks?.map((block, index) => (
            <div key={`${lesson.id}-block-${index}`} className="lesson-item">
              <p>{index + 1}. {normalizePtBrText(block)}</p>
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
        <small>Dica prática: assista ao vídeo, leia os blocos e depois conclua a aula.</small>
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
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [wasCorrect, setWasCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [scoredActivities, setScoredActivities] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (isRemovedModule({ id: moduleId })) return;
    api.get(`/content/modules/${moduleId}`).then(({ data }) => {
      setModule(data);
      setIndex(0);
      setAnswer("");
      setFeedback("");
      setWasCorrect(false);
      setCorrectCount(0);
      setScoredActivities([]);
      setIsTransitioning(false);
    });
  }, [moduleId]);

  if (isRemovedModule({ id: moduleId }) || (module && isRemovedModule(module))) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!module) return <p className="container">Carregando atividade...</p>;
  const activities = module.activities.length > 0 ? module.activities : getFallbackActivities(module);

  const activity = activities[index];
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

  async function submitAnswer() {
    if (!answer.trim() || isTransitioning) return;

    setIsTransitioning(true);
    const normalized = answer.trim().toLowerCase();
    const isCorrect =
      activity.type === "completar_codigo"
        ? normalized.includes(`${normalizedExpectedAnswer} idade`) || normalized.includes(normalizedExpectedAnswer)
        : normalized === normalizedExpectedAnswer;

    if (isCorrect) {
      setFeedback(`Correto! ${activity.explanation}`);
      setWasCorrect(true);
      if (!scoredActivities.includes(activity.id)) {
        setCorrectCount((v) => v + 1);
        setScoredActivities((prev) => [...prev, activity.id]);
        await api.post("/users/me/xp", { action: "activity_completed" });
      }
    } else {
      setFeedback(`Resposta esperada: ${activity.expectedAnswer}. ${activity.explanation}`);
      setWasCorrect(false);
    }

    window.setTimeout(() => {
      nextQuestion();
    }, 1800);
  }

  async function nextQuestion() {
    const last = index === activities.length - 1;
    if (last) {
      if (correctCount === activities.length) {
        await api.post("/users/me/xp", { action: "perfect_activity" });
      }
      await api.post("/users/me/xp", { action: "activity_review" });
      await api.post("/users/me/progress", { moduleId, percent: 75 });
      setFeedback("Atividade finalizada! BÃ´nus aplicados.");
      window.setTimeout(() => navigate(`/modulo/${moduleId}`), 1200);
      return;
    }
    setIndex((v) => v + 1);
    setAnswer("");
    setFeedback("");
    setWasCorrect(false);
    setIsTransitioning(false);
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

        {activity.type === "completar_codigo" && (
          <>
            <label>Editor C básico</label>
            <textarea value={answer || activity.starterCode} onChange={(e) => setAnswer(e.target.value)} rows={10} className="code" disabled={isTransitioning} />
            <small>Dica: substitua ___ pelo tipo correto.</small>
          </>
        )}

        {!activity.options && activity.type !== "completar_codigo" && (
          <input value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Digite sua resposta" disabled={isTransitioning} />
        )}

        <button onClick={submitAnswer} disabled={!answer.trim() || isTransitioning}>
          {isTransitioning ? "Aguardando próxima questão..." : "Confirmar resposta"}
        </button>
        {feedback && <small>{wasCorrect ? "âœ… Boa! Continue assim." : "ðŸ’¡ Revise a explicaÃ§Ã£o antes de avanÃ§ar."}</small>}
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
      <p>Cursos concluÃ­dos: {user.completedCourses.length}</p>
      <section className="card">
        <h3>Resumo do jogador</h3>
        <p>XP total: {user.xp}</p>
        <p>Streak atual: {user.streak} dias</p>
      </section>
      <section className="card">
        <h3>Meus dados</h3>
        <label htmlFor="displayName">Nome de exibiÃ§Ã£o</label>
        <input id="displayName" value={editing.displayName} onChange={(e) => setEditing({ ...editing, displayName: e.target.value })} placeholder="Nome de exibiÃ§Ã£o" />
        <label htmlFor="profileEmail">E-mail</label>
        <input id="profileEmail" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} placeholder="E-mail" />
        <label htmlFor="profilePhotoUrl">URL da foto de perfil</label>
        <input id="profilePhotoUrl" value={editing.profilePhotoUrl} onChange={(e) => setEditing({ ...editing, profilePhotoUrl: e.target.value })} placeholder="URL da foto de perfil" />
        <button onClick={save}>Salvar alteraÃ§Ãµes</button>
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
            <strong>{a.unlocked ? "ðŸ†" : "ðŸ”’"} {a.title}</strong>
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
            #{user.position || index + 1} - {user.displayName} | {normalizePtBrText(user.level?.title || "NÃ­vel")} | {type === "weekly" ? user.weeklyXp : type === "monthly" ? user.monthlyXp : user.xp} XP
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
  useEffect(() => {
    normalizeNodeTree(document.body);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach(normalizeNodeTree);
        if (mutation.type === "characterData") normalizeNodeTree(mutation.target);
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    return () => observer.disconnect();
  }, []);

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
        <Route
          path="/gestao"
          element={
            <Protected>
              <StaffOnly>
                <ManagementPage />
              </StaffOnly>
            </Protected>
          }
        />
      </Routes>
    </>
  );
}

