import React from "react";

const sizeMap = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14"
};

const BrandLogo = ({
  size = "md",
  showText = true,
  className = "",
  textClassName = "",
  subtitle = ""
}) => {
  const logoSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src="/attendancehub-logo.svg"
        alt="Attendance Hub logo"
        className={`${logoSize} rounded-lg object-contain`}
      />
      {showText ? (
        <div className={textClassName}>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Attendance Hub
          </p>
          {subtitle ? (
            <p className="text-sm font-semibold text-white mt-1">{subtitle}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default BrandLogo;
