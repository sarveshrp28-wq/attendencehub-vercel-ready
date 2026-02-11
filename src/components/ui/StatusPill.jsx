import React from "react";

const StatusPill = ({ status = "Unknown" }) => {
  const normalized = status.toLowerCase();
  const className =
    normalized === "present"
      ? "tag-success"
      : normalized === "absent"
        ? "tag-danger"
        : normalized === "late"
          ? "tag-warning"
          : "tag-neutral";

  return <span className={className}>{status}</span>;
};

export default StatusPill;
