import { format, parseISO } from "date-fns";

export const formatDate = (value, fallback = "-") => {
  if (!value) return fallback;
  try {
    const date = typeof value === "string" ? parseISO(value) : value;
    return format(date, "MMM dd, yyyy");
  } catch (error) {
    return fallback;
  }
};

export const formatShortDate = (value, fallback = "-") => {
  if (!value) return fallback;
  try {
    const date = typeof value === "string" ? parseISO(value) : value;
    return format(date, "MMM dd");
  } catch (error) {
    return fallback;
  }
};

export const formatPercent = (value, fallback = "--") => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return fallback;
  }
  return `${Number(value).toFixed(1)}%`;
};

export const titleCase = (value = "") =>
  value
    .toString()
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
