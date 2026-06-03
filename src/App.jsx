import { Route, Routes } from "react-router-dom";
import Protected from "./components/auth/Protected.jsx";
import StaffOnly from "./components/auth/StaffOnly.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ModulePage from "./pages/ModulePage.jsx";
import ActivitiesPage from "./pages/ActivitiesPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import RankingPage from "./pages/RankingPage.jsx";
import ManagementPage from "./pages/ManagementPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route
        path="/dashboard"
        element={
          <Protected>
            <DashboardPage />
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
            <ProfilePage />
          </Protected>
        }
      />
      <Route
        path="/ranking"
        element={
          <Protected>
            <RankingPage />
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
  );
}
