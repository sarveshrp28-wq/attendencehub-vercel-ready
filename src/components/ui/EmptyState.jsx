import React from "react";

const EmptyState = ({ title, description, action }) => (
  <div className="glass-panel p-8 text-center">
    <h3 className="text-lg font-semibold text-white">{title}</h3>
    <p className="text-sm text-slate-300 mt-2">{description}</p>
    {action ? <div className="mt-4">{action}</div> : null}
  </div>
);

export default EmptyState;
