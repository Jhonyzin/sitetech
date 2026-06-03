import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";

export default function AuthPage() {
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
    if (localStorage.getItem("token")) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    function handleMove(event) {
      setCursor({ x: event.clientX, y: event.clientY });
    }
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  const lookX = Math.max(-4, Math.min(4, (cursor.x / Math.max(window.innerWidth, 1) - 0.5) * 10));
  const lookY = Math.max(-3, Math.min(3, (cursor.y / Math.max(window.innerHeight, 1) - 0.5) * 8));
  const motionX = Math.max(-12, Math.min(12, (cursor.x / Math.max(window.innerWidth, 1) - 0.5) * 20));
  const motionY = Math.max(-8, Math.min(8, (cursor.y / Math.max(window.innerHeight, 1) - 0.5) * 16));
  const followsForm = Boolean(activeField);
  const privacyMode = showPassword && activeField.includes("password");
  const mascotExpression = privacyMode
    ? "guardando sua privacidade"
    : followsForm
      ? "acompanhando seu foco"
      : "seguindo o cursor";
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
                  <span
                    style={{
                      transform: `translate(${followsForm ? 1.6 : pupilX}px, ${followsForm ? 0.8 : pupilY}px)`
                    }}
                  />
                </div>
                <div className="mascot-eye">
                  <span
                    style={{
                      transform: `translate(${followsForm ? 1.6 : pupilX}px, ${followsForm ? 0.8 : pupilY}px)`
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="mascot mascot-dark">
              <div className="mascot-face">
                <div className="mascot-eye">
                  <span
                    style={{
                      transform: `translate(${followsForm ? 1.3 : pupilX * 0.85}px, ${followsForm ? 0.7 : pupilY * 0.85}px)`
                    }}
                  />
                </div>
                <div className="mascot-eye">
                  <span
                    style={{
                      transform: `translate(${followsForm ? 1.3 : pupilX * 0.85}px, ${followsForm ? 0.7 : pupilY * 0.85}px)`
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="mascot mascot-orange">
              <div className="mascot-face">
                <div className="mascot-eye">
                  <span
                    style={{
                      transform: `translate(${followsForm ? 1.5 : pupilX * 0.9}px, ${followsForm ? 0.7 : pupilY * 0.9}px)`
                    }}
                  />
                </div>
                <div className="mascot-eye">
                  <span
                    style={{
                      transform: `translate(${followsForm ? 1.5 : pupilX * 0.9}px, ${followsForm ? 0.7 : pupilY * 0.9}px)`
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="mascot mascot-yellow">
              <div className="mascot-face">
                <div className="mascot-eye">
                  <span
                    style={{
                      transform: `translate(${followsForm ? 1.7 : pupilX * 0.95}px, ${followsForm ? 0.6 : pupilY * 0.75}px)`
                    }}
                  />
                </div>
                <div className="mascot-eye">
                  <span
                    style={{
                      transform: `translate(${followsForm ? 1.7 : pupilX * 0.95}px, ${followsForm ? 0.6 : pupilY * 0.75}px)`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <form onSubmit={submit} className="auth-form" aria-label="Formulário de autenticação">
          {mode === "reset" && (
            <>
              <span className="auth-mark" aria-hidden="true">
                ✦
              </span>
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
              <span className="auth-mark" aria-hidden="true" />
              <h3>{mode === "login" ? "Bem-vindo(a) de volta!" : "Crie sua conta"}</h3>
              <p className="auth-helper">
                {mode === "login" ? "Digite seus dados para entrar" : "Preencha os campos para começar"}
              </p>
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
                  <button type="button" className="ghost social-google">
                    Entrar com Google
                  </button>
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
              <span className="auth-mark" aria-hidden="true">
                ✦
              </span>
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
