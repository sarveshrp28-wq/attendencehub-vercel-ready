import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Chrome } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    setError("");
    const { data, error: signInError } = await signInWithGoogle();
    if (signInError) {
      setError(signInError.message);
      setSubmitting(false);
      return;
    }
    if (data?.url) {
      window.location.assign(data.url);
      return;
    }
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="glass-panel max-w-md w-full p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Attendance Hub
        </p>
        <h1 className="text-3xl font-semibold text-white mt-3">Sign in</h1>
        <p className="text-sm text-slate-300 mt-2">
          Google sign-in is required. Access is allowed only for admin email or pre-approved student emails.
        </p>

        <div className="mt-6 space-y-4">
          <button className="btn-primary w-full" onClick={handleGoogleSignIn} disabled={submitting}>
            <Chrome className="h-4 w-4" />
            {submitting ? "Redirecting..." : "Continue with Google"}
          </button>
          {error ? <p className="text-sm text-rose-200">{error}</p> : null}
          <p className="text-xs text-slate-400">
            Use the same Gmail address the admin added for your student profile.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
