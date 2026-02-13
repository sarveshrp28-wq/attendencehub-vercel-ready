import React, { useMemo, useState } from "react";
import clsx from "clsx";

const SIZE_MAP = {
  sm: "h-10 w-10 text-sm rounded-lg",
  md: "h-14 w-14 text-lg rounded-xl",
  lg: "h-20 w-20 text-2xl rounded-xl"
};

const StudentAvatar = ({ name, photoUrl, size = "sm", className }) => {
  const [hasError, setHasError] = useState(false);
  const initial = useMemo(() => name?.trim()?.charAt(0)?.toUpperCase() || "?", [name]);
  const showImage = Boolean(photoUrl && !hasError);

  return (
    <div
      className={clsx(
        "overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center font-semibold text-white",
        SIZE_MAP[size] || SIZE_MAP.sm,
        className
      )}
    >
      {showImage ? (
        <img
          src={photoUrl}
          alt={name ? `${name} profile` : "Student profile"}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setHasError(true)}
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
};

export default StudentAvatar;
