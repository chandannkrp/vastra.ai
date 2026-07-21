import { AxiosError } from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell, Divider, Field } from "../components/AuthShell";
import { BrandLoader } from "../components/BrandLoader";
import { GoogleButton } from "../components/GoogleButton";
import { useAuth } from "../lib/auth";

export default function Register() {
  const { register, loginWithGoogle } = useAuth();
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
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
      });
      navigate("/dashboard");
    } catch (err) {
      const ax = err as AxiosError<{ detail?: string }>;
      setError(ax.response?.data?.detail ?? "Could not create account. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your store account"
      subtitle="Start turning fabric photos into published listings."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field
          label="Full name"
          required
          value={form.name}
          onChange={update("name")}
          placeholder="Aarav Textiles"
        />
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={update("email")}
          placeholder="you@studio.com"
        />
        <Field
          label="Phone (optional)"
          value={form.phone}
          onChange={update("phone")}
          placeholder="+91 …"
        />
        <Field
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={form.password}
          onChange={update("password")}
          placeholder="At least 8 characters"
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
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <Divider />
      <GoogleButton onCredential={handleGoogle} />

      <p className="mt-6 text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-indigo-700 hover:underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
