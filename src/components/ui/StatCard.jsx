import React from "react";
import clsx from "clsx";

const StatCard = ({ label, value, hint, icon: Icon, accent = "aqua" }) => (
  <div
    className={clsx(
      "glass-panel p-5 flex items-start gap-4",
      accent === "sunrise" ? "border-sunrise-500/30" : "border-aqua-500/30"
    )}
  >
    <div
      className={clsx(
        "h-12 w-12 rounded-2xl flex items-center justify-center",
        accent === "sunrise" ? "bg-sunrise-500/20" : "bg-aqua-500/20"
      )}
    >
      {Icon ? <Icon className="h-6 w-6 text-white" /> : null}
    </div>
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="text-2xl font-semibold text-white">{value}</p>
      {hint ? <p className="text-xs text-slate-400">{hint}</p> : null}
    </div>
  </div>
);

export default StatCard;
