import React from "react";

const LoadingScreen = ({ label = "Loading..." }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="glass-panel px-8 py-6 text-center">
      <div className="h-10 w-10 mx-auto mb-3 rounded-full border-4 border-white/20 border-t-aqua-400 animate-spin" />
      <p className="text-sm text-slate-200">{label}</p>
    </div>
  </div>
);

export default LoadingScreen;
