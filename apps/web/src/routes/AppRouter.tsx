import { Routes, Route } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import Dashboard from "../pages/Dashboard";

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}