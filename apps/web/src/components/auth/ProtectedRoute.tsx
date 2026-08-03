import { Navigate } from "react-router-dom";

import { useAuthStore } from "../../store/authStore";

type Props = {
  children: React.ReactNode;
};

export default function ProtectedRoute({
  children,
}: Props) {
  const session = useAuthStore(
    (state) => state.session
  );

  const loading = useAuthStore(
    (state) => state.loading
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        Loading Resolve...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}