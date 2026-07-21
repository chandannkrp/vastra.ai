import { AxiosError } from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell, Divider, Field } from "../components/AuthShell";
import { BrandLoader } from "../components/BrandLoader";
import { GoogleButton } from "../components/GoogleButton";
import { useAuth } from "../lib/auth";

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleGoogle(credential: string) {
    setError(null);
    try {
      const user = await loginWithGoogle(credential);
      navigate(user.is_admin ? "/admin" : "/dashboard");
    } catch (err) {
      const ax = err as AxiosError<{ detail?: string }>;
      setError(ax.response?.data?.detail ?? "Google sign-in failed. Try again.");
    }
  }
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.is_admin ? "/admin" : "/dashboard");
    } catch (err) {
      const ax = err as AxiosError<{ detail?: string }>;
      setError(ax.response?.data?.detail ?? "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Log in to your vastraas.ai workspace.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@studio.com"
        />
        <Field
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        {error && (
          <p className="rounded-lg bg-terracotta/10 px-4 py-2.5 text-sm text-terracotta">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-700 px-5 py-3.5 font-semibold text-cream shadow-lg shadow-indigo-700/20 transition hover:bg-indigo-800 disabled:opacity-60"
        >
          {loading && <BrandLoader size={18} />}
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <Divider />
      <GoogleButton onCredential={handleGoogle} />

      <p className="mt-6 text-center text-sm text-ink-soft">
        New to vastraas.ai?{" "}
        <Link to="/register" className="font-semibold text-indigo-700 hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
