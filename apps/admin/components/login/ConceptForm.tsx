"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function ConceptForm({ heading, introduction }: { heading: string; introduction: string }) {
  const id = useId();
  const router = useRouter();
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const client = createClient();
      if (mode === "password") {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) {
          setError(error.message);
          return;
        }
        router.push("/dashboard");
        router.refresh();
      } else {
        const { error } = await client.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${location.origin}/auth/callback` },
        });
        if (error) {
          setError(error.message);
          return;
        }
        setSent(true);
      }
    } catch {
      setError("We couldn’t connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="concept-form">
      {sent ? (
        <div className="concept-sent" role="status">
          <Mail size={32} />
          <h1>Check your inbox.</h1>
          <p>
            Open the sign-in link we sent to <strong>{email}</strong> to access your workspace.
          </p>
          <button className="concept-submit" onClick={() => setSent(false)}>
            Use another email
            <ArrowRight size={17} />
          </button>
        </div>
      ) : (
        <>
          <p className="concept-form__eyebrow">YOUR TEAM WORKSPACE</p>
          <h1>{heading}</h1>
          <p className="concept-form__intro">{introduction}</p>
          <div className="concept-method" role="group" aria-label="Sign-in method">
            <button
              type="button"
              aria-pressed={mode === "password"}
              disabled={loading}
              onClick={() => {
                setMode("password");
                setError("");
              }}
            >
              Password
            </button>
            <button
              type="button"
              aria-pressed={mode === "magic"}
              disabled={loading}
              onClick={() => {
                setMode("magic");
                setError("");
              }}
            >
              Email link
            </button>
          </div>
          <form onSubmit={submit}>
            <div className="concept-field">
              <label htmlFor={`${id}-email`}>Work email</label>
              <input
                id={`${id}-email`}
                type="email"
                name="email"
                autoComplete="username"
                placeholder="you@organisation.org"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={loading}
              />
            </div>
            {mode === "password" ? (
              <div className="concept-field">
                <label htmlFor={`${id}-password`}>Password</label>
                <div className="concept-password">
                  <input
                    id={`${id}-password`}
                    type={visible ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    aria-label={visible ? "Hide password" : "Show password"}
                    aria-pressed={visible}
                    onClick={() => setVisible((value) => !value)}
                  >
                    {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            ) : (
              <p className="concept-magic-note">
                A secure link, delivered to your inbox. No password needed.
              </p>
            )}
            {error && (
              <p className="concept-error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="concept-submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="motion-safe:animate-spin" size={17} />
                  {mode === "password" ? "Signing in…" : "Sending link…"}
                </>
              ) : (
                <>
                  {mode === "password" ? "Sign in to workspace" : "Send sign-in link"}
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
          <p className="concept-access">Need access? Contact your workspace administrator.</p>
        </>
      )}
    </div>
  );
}
