import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthButton from "../../components/auth/AuthButton";
import AuthCard from "../../components/auth/AuthCard";
import AuthInput from "../../components/auth/AuthInput";
import PasswordInput from "../../components/auth/PasswordInput";

import { useAuthStore } from "../../store/authStore";

export default function Register() {
  const navigate = useNavigate();

  const register = useAuthStore(
    (state) => state.register
  );

  const loading = useAuthStore(
    (state) => state.loading
  );

  const [fullName, setFullName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] = useState("");

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError("");

    if (!fullName.trim()) {
      setError("Full name is required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await register(email, password);

      navigate("/login");
    } catch (err: any) {
      setError(
        err?.message ??
          "Failed to create account."
      );
    }
  }

  return (
    <AuthCard
      title="Create Account"
      subtitle="Start your recovery journey."
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
          label="Full Name"
          value={fullName}
          onChange={(e) =>
            setFullName(e.target.value)
          }
          placeholder="John Doe"
        />

        <AuthInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          placeholder="john@example.com"
        />

        <PasswordInput
          label="Password"
          value={password}
          onChange={setPassword}
          placeholder="Enter password"
        />

        <PasswordInput
          label="Confirm Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Confirm password"
        />

        <AuthButton
          type="submit"
          loading={loading}
        >
          Create Account
        </AuthButton>

        <p className="text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-teal-400 hover:text-teal-300"
          >
            Sign In
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}