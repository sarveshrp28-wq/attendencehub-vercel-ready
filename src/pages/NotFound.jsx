import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center px-6">
    <div className="glass-panel max-w-md w-full p-8 text-center">
      <h1 className="text-3xl font-semibold text-white">Page not found</h1>
      <p className="text-sm text-slate-300 mt-3">
        The page you are looking for does not exist.
      </p>
      <Link className="btn-outline mt-6 inline-flex" to="/">
        Go home
      </Link>
    </div>
  </div>
);

export default NotFound;
