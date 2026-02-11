import { differenceInCalendarDays, parseISO } from "date-fns";

export const buildAttendanceMap = (records = []) => {
  const map = new Map();
  records.forEach((record) => {
    map.set(record.date, record.status);
  });
  return map;
};

export const calculateStreak = (records = []) => {
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  let lastDate = null;

  for (const record of sorted) {
    if (record.status !== "Present") break;
    if (!lastDate) {
      streak = 1;
      lastDate = record.date;
      continue;
    }
    const diff = differenceInCalendarDays(parseISO(lastDate), parseISO(record.date));
    if (diff === 1) {
      streak += 1;
      lastDate = record.date;
    } else {
      break;
    }
  }

  return streak;
};
