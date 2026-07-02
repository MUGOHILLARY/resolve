import { Routes, Route } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";

import Dashboard from "../pages/Dashboard";
import Recovery from "../pages/Recovery";
import Analytics from "../pages/Analytics";
import AICoach from "../pages/AICoach";
import Blocker from "../pages/Blocker";
import Settings from "../pages/Settings";

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/recovery" element={<Recovery />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/ai-coach" element={<AICoach />} />
        <Route path="/blocker" element={<Blocker />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}