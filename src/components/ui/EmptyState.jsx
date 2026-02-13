import React from "react";

const EmptyState = ({ title, description, action }) => (
  <div className="glass-panel p-8 text-center bg-gradient-to-br from-aqua-500/10 via-transparent to-sunrise-500/10">
    <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-aqua-300 to-sunrise-300">
      {title}
    </h3>
    <p className="text-sm text-slate-300 mt-2">{description}</p>
    {action ? <div className="mt-4">{action}</div> : null}
  </div>
);

export default EmptyState;
