import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import ProtectedRoute from "../components/auth/ProtectedRoute";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import Dashboard from "../pages/Dashboard";

import RecoveryOverview from "../pages/RecoveryOverview";
import RecoveryJournal from "../pages/RecoveryJournal";
import RecoveryCalendar from "../pages/RecoveryCalendar";
import RecoveryTimeline from "../pages/RecoveryTimeline";
import RecoveryInsights from "../pages/RecoveryInsights";
import RecoveryAchievements from "../pages/RecoveryAchievements";
import RecoveryProfile from "../pages/RecoveryProfile";
import RecoveryPolicy from "../pages/RecoveryPolicy";

import Analytics from "../pages/Analytics";
import AICoach from "../pages/AICoach";
import Blocker from "../pages/Blocker";
import Settings from "../pages/Settings";

export default function AppRouter() {
  return (
    <Routes>

      {/* ---------- Public Routes ---------- */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* ---------- Protected App ---------- */}

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
          element={<RecoveryOverview />}
        />

        <Route
          path="/recovery/journal"
          element={<RecoveryJournal />}
        />

        <Route
          path="/recovery/calendar"
          element={<RecoveryCalendar />}
        />

        <Route
          path="/recovery/timeline"
          element={<RecoveryTimeline />}
        />

        <Route
          path="/recovery/insights"
          element={<RecoveryInsights />}
        />

        <Route
          path="/recovery/achievements"
          element={<RecoveryAchievements />}
        />

        <Route
          path="/recovery/profile"
          element={<RecoveryProfile />}
        />

        <Route
          path="/recovery/policy"
          element={<RecoveryPolicy />}
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
          path="/blocker"
          element={<Blocker />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />
      </Route>

      {/* ---------- Catch All ---------- */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}