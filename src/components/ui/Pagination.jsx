import React from "react";
import Button from "./Button";

const Pagination = ({ page, pageCount, onPageChange }) => {
  if (pageCount <= 1) return null;

  const prevDisabled = page <= 1;
  const nextDisabled = page >= pageCount;

  return (
    <div className="flex items-center justify-between">
      <Button
        variant="outline"
        disabled={prevDisabled}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>
      <p className="text-sm text-slate-300">
        Page {page} of {pageCount}
      </p>
      <Button
        variant="outline"
        disabled={nextDisabled}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;
