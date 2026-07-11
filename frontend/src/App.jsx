import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AppShell from "./components/AppShell.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import AlertDetails from "./pages/AlertDetails.jsx";
import Alerts from "./pages/Alerts.jsx";
import Approvals from "./pages/Approvals.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Entities from "./pages/Entities.jsx";
import Investigation from "./pages/Investigation.jsx";
import LoadInvestigation from "./pages/LoadInvestigation.jsx";
import NotFound from "./pages/NotFound.jsx";
import ReportDetails from "./pages/ReportDetails.jsx";
import Reports from "./pages/Reports.jsx";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected operational routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<Navigate replace to="/investigations/new" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/alerts/:alertId" element={<AlertDetails />} />
            <Route path="/investigations/new" element={<LoadInvestigation />} />
            <Route path="/investigations/:investigationId" element={<Investigation />} />
            <Route path="/entities" element={<Entities />} />
            <Route path="/approvals" element={<Approvals />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/:reportId" element={<ReportDetails />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
