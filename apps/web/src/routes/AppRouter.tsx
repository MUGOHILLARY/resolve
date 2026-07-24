import { Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";

import ProtectedRoute from "./ProtectedRoute";

import Dashboard from "../pages/Dashboard";
import Recovery from "../pages/Recovery";
import Analytics from "../pages/Analytics";
import AICoach from "../pages/AICoach";
import RecoveryProfile from "../pages/RecoveryProfile";
import Blocker from "../pages/Blocker";
import Settings from "../pages/Settings";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

export default function AppRouter() {
  return (
    <Routes>
      {/* Public Routes */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* Protected Routes */}

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/recovery"
          element={<Recovery />}
        />

        <Route
          path="/analytics"
          element={<Analytics />}
        />

        <Route
          path="/ai-coach"
          element={<AICoach />}
        />

        <Route
          path="/recovery-profile"
          element={<RecoveryProfile />}
        />

        <Route
          path="/blocker"
          element={<Blocker />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />
      </Route>

      {/* Catch-all */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}