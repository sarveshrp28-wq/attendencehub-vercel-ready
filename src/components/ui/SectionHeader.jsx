import React from "react";

const SectionHeader = ({ title, subtitle, actions }) => (
  <div className="section-animate flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
    <div>
      <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-aqua-400 via-cyan-300 to-sunrise-400">
        {title}
      </h2>
      {subtitle ? (
        <p className="text-sm text-slate-300 mt-1 max-w-2xl">{subtitle}</p>
      ) : null}
    </div>
    {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
  </div>
);

export default SectionHeader;
