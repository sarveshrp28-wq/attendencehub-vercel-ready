import React from "react";
import { Link } from "react-router-dom";

const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center px-6">
    <div className="glass-panel max-w-md w-full p-8 text-center">
      <h1 className="text-3xl font-semibold text-white">Access restricted</h1>
      <p className="text-sm text-slate-300 mt-3">
        This email is not approved for this workspace. Ask the admin to add this
        exact Gmail as a student profile, then sign in again.
      </p>
      <Link className="btn-outline mt-6 inline-flex" to="/login">
        Back to login
      </Link>
    </div>
  </div>
);

export default Unauthorized;
