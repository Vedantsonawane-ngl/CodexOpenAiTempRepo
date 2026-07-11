import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Icon from "../components/Icon.jsx";

export default function Login() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [successMessage, setSuccessMessage] = useState(location.state?.message || "");
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    
    if (!usernameOrEmail.trim() || !password) {
      setError("Please enter both credentials.");
      return;
    }

    setSubmitting(true);
    try {
      await login(usernameOrEmail, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Failed to authenticate. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0b] px-md">
      <div className="w-full max-w-md rounded-xl card-glass shadow-soft-purple p-xl page-enter">
        <div className="mb-lg text-center">
          <div className="mx-auto mb-md grid h-12 w-12 place-items-center rounded-full bg-primary text-[#0a0a0b]">
            <Icon name="security" className="text-[24px]" filled />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-primary">intelliSOC</h1>
          <p className="font-geist text-[10px] uppercase tracking-[0.15em] text-on-surface-variant">
            Secured Access Gateway
          </p>
        </div>

        {successMessage && !error && (
          <div className="mb-md flex items-start gap-sm rounded-lg border border-success/30 bg-success/5 p-md text-sm text-success">
            <Icon name="check_circle" className="shrink-0 text-[18px]" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="mb-md flex items-start gap-sm rounded-lg border border-error-container/40 bg-error-container/10 p-md text-sm text-error">
            <Icon name="error" className="shrink-0 text-[18px]" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-md">
          <div className="space-y-xs">
            <label className="font-geist text-[10px] uppercase tracking-[0.05em] text-on-surface-variant font-bold">
              Username or Email
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-md text-on-surface-variant">
                <Icon name="person" className="text-[18px]" />
              </span>
              <input
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                className="w-full rounded-lg border border-outline-variant bg-surface px-xl py-sm pl-11 text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="analyst"
                disabled={submitting}
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-xs">
            <label className="font-geist text-[10px] uppercase tracking-[0.05em] text-on-surface-variant font-bold flex justify-between">
              <span>Password</span>
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

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-sm rounded-lg bg-primary py-sm font-geist text-[12px] font-bold uppercase tracking-[0.05em] text-on-primary transition-all hover:bg-primary-container active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent" />
                <span>Authorizing...</span>
              </>
            ) : (
              <>
                <Icon name="login" className="text-[18px]" />
                <span>Authenticate</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-lg border-t border-outline-variant/30 pt-md text-center">
          <p className="text-xs text-on-surface-variant">
            Don't have an operator credential?{" "}
            <Link to="/signup" className="text-primary hover:underline font-bold">
              Register Operator
            </Link>
          </p>
          <div className="mt-md text-[10px] text-on-surface-variant/40 font-geist uppercase tracking-widest">
            Mock Mode: analyst / password
          </div>
        </div>
      </div>
    </div>
  );
}
