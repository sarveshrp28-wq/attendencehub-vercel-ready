import React from "react";

const SectionHeader = ({ title, subtitle, actions }) => (
  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
    <div>
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      {subtitle ? <p className="text-sm text-slate-300">{subtitle}</p> : null}
    </div>
    {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
  </div>
);

export default SectionHeader;
