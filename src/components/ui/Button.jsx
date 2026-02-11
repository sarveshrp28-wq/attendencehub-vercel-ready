import React from "react";
import clsx from "clsx";

const Button = ({
  children,
  variant = "primary",
  className,
  ...props
}) => {
  const variantClass =
    variant === "secondary"
      ? "btn-secondary"
      : variant === "outline"
        ? "btn-outline"
        : "btn-primary";

  return (
    <button className={clsx(variantClass, className)} {...props}>
      {children}
    </button>
  );
};

export default Button;
