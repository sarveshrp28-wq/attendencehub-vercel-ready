import React from "react";
import clsx from "clsx";

const Card = ({ children, className }) => (
  <div className={clsx("card-surface p-6", className)}>{children}</div>
);

export default Card;
