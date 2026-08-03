import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

type Props = {
  children: React.ReactNode;
};

export default function ProtectedRoute({
  children,
}: Props) {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">

        <div className="flex flex-col items-center">

          {/* Resolve Logo */}
          <img
            src="/resolve-logo.png"
            alt="Resolve"
            className="h-28 w-28 animate-pulse object-contain"
          />

          {/* Animated Spinner */}
          <div className="mt-8 h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-teal-400" />

          {/* Title */}
          <h1 className="mt-8 text-4xl font-bold text-white">
            Resolve
          </h1>

          {/* Subtitle */}
          <p className="mt-3 text-lg text-slate-400">
            Preparing your recovery workspace...
          </p>

          {/* Footer Message */}
          <p className="mt-8 text-sm text-slate-500">
            Recover • Focus • Transform
          </p>

        </div>

      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}