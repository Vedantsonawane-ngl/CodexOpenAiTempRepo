import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Icon from "../components/Icon.jsx";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await signup(username, email, password);
      navigate("/login", {
        state: { message: "Operator registered successfully. Please authenticate." }
      });
    } catch (err) {
      setError(err.message || "Failed to create account. Username or email might be taken.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0b] px-md">
      <div className="w-full max-w-md rounded-xl card-glass shadow-soft-purple p-xl page-enter">
        <div className="mb-lg text-center">
          <div className="mx-auto mb-md grid h-12 w-12 place-items-center rounded-full bg-primary text-[#0a0a0b]">
            <Icon name="person_add" className="text-[24px]" filled />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-primary">intelliSOC</h1>
          <p className="font-geist text-[10px] uppercase tracking-[0.15em] text-on-surface-variant">
            Create Operator Account
          </p>
        </div>

        {error && (
          <div className="mb-md flex items-start gap-sm rounded-lg border border-error-container/40 bg-error-container/10 p-md text-sm text-error">
            <Icon name="error" className="shrink-0 text-[18px]" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-md">
          <div className="space-y-xs">
            <label className="font-geist text-[10px] uppercase tracking-[0.05em] text-on-surface-variant font-bold">
              Username
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-md text-on-surface-variant">
                <Icon name="person" className="text-[18px]" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-outline-variant bg-surface px-xl py-sm pl-11 text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="johndoe"
                disabled={submitting}
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-xs">
            <label className="font-geist text-[10px] uppercase tracking-[0.05em] text-on-surface-variant font-bold">
              Email Address
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-md text-on-surface-variant">
                <Icon name="mail" className="text-[18px]" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-outline-variant bg-surface px-xl py-sm pl-11 text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="operator@acme.com"
                disabled={submitting}
              />
            </div>
          </div>

          <div className="space-y-xs">
            <label className="font-geist text-[10px] uppercase tracking-[0.05em] text-on-surface-variant font-bold">
              Password
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-md text-on-surface-variant">
                <Icon name="lock" className="text-[18px]" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-outline-variant bg-surface px-xl py-sm pl-11 text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="••••••••"
                disabled={submitting}
              />
            </div>
          </div>

          <div className="space-y-xs">
            <label className="font-geist text-[10px] uppercase tracking-[0.05em] text-on-surface-variant font-bold">
              Confirm Password
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-md text-on-surface-variant">
                <Icon name="lock" className="text-[18px]" />
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-outline-variant bg-surface px-xl py-sm pl-11 text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="••••••••"
                disabled={submitting}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-sm rounded-lg bg-primary py-sm font-geist text-[12px] font-bold uppercase tracking-[0.05em] text-on-primary transition-all hover:bg-primary-container active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent" />
                <span>Registering Account...</span>
              </>
            ) : (
              <>
                <Icon name="person_add" className="text-[18px]" />
                <span>Register Operator</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-lg border-t border-outline-variant/30 pt-md text-center">
          <p className="text-xs text-on-surface-variant">
            Already registered?{" "}
            <Link to="/login" className="text-primary hover:underline font-bold">
              Authenticate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
