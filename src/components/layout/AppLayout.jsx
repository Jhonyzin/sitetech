import TopNav from "./TopNav.jsx";

export default function AppLayout({ children }) {
  return (
    <main className="app-shell">
      <aside className="app-sidebar card">
        <h2 className="app-brand">NextTech</h2>
        <p className="app-brand-subtitle">Plataforma educacional</p>
        <TopNav />
      </aside>
      <section className="app-main">{children}</section>
    </main>
  );
}
