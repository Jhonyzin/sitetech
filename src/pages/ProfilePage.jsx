import { useEffect, useState } from "react";
import api from "../services/api.js";
import AppLayout from "../components/layout/AppLayout.jsx";

export default function ProfilePage() {
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
      {user.profilePhotoUrl ? (
        <img src={user.profilePhotoUrl} alt="Foto de perfil" width={88} height={88} className="avatar" />
      ) : (
        <p>Sem foto de perfil.</p>
      )}
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
        <input
          id="displayName"
          value={editing.displayName}
          onChange={(e) => setEditing({ ...editing, displayName: e.target.value })}
          placeholder="Nome de exibição"
        />
        <label htmlFor="profileEmail">E-mail</label>
        <input
          id="profileEmail"
          value={editing.email}
          onChange={(e) => setEditing({ ...editing, email: e.target.value })}
          placeholder="E-mail"
        />
        <label htmlFor="profilePhotoUrl">URL da foto de perfil</label>
        <input
          id="profilePhotoUrl"
          value={editing.profilePhotoUrl}
          onChange={(e) => setEditing({ ...editing, profilePhotoUrl: e.target.value })}
          placeholder="URL da foto de perfil"
        />
        <button type="button" onClick={save}>
          Salvar alterações
        </button>
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
        <button type="button" onClick={changePassword}>
          Atualizar senha
        </button>
        {msg && <small aria-live="polite">{msg}</small>}
      </section>
      <h3>Conquistas</h3>
      <div className="grid">
        {achievements.map((a) => (
          <div key={a.key} className={`badge ${a.unlocked ? "on" : "off"}`}>
            <strong>
              {a.unlocked ? "🏆" : "🔒"} {a.title}
            </strong>
            <p>{a.description}</p>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
