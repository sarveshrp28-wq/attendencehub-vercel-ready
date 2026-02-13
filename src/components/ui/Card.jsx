import React from "react";
import clsx from "clsx";

const Card = ({ children, className }) => (
  <div className={clsx("card-surface p-6 section-animate", className)}>
    <div className="pointer-events-none absolute -top-10 -right-8 h-24 w-24 rounded-full bg-aqua-500/10 blur-2xl" />
    {children}
  </div>
);

export default Card;
