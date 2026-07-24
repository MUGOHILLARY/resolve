import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthButton from "../../components/auth/AuthButton";
import AuthCard from "../../components/auth/AuthCard";
import AuthInput from "../../components/auth/AuthInput";
import PasswordInput from "../../components/auth/PasswordInput";

import { useAuthStore } from "../../store/authStore";

export default function Login() {
  const navigate = useNavigate();

  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    try {
      await login(email, password);

      navigate("/recovery");
    } catch (err: any) {
      setError(err?.message ?? "Login failed.");
    }
  }

  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Sign in to continue your recovery journey."
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <AuthInput
          label="Email"
          type="email"
          placeholder="john@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={setPassword}
        />

        <AuthButton
          type="submit"
          loading={loading}
        >
          Sign In
        </AuthButton>

        <p className="text-center text-sm text-slate-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-teal-400 hover:text-teal-300"
          >
            Create one
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}