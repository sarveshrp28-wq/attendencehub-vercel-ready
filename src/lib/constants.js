export const ADMIN_EMAIL =
  import.meta.env.VITE_ADMIN_EMAIL || "attendencehub@gmail.com";

export const ATTENDANCE_STATUSES = [
  "Present",
  "Absent",
  "Late",
  "Excused"
];

export const GENDERS = ["Male", "Female", "Other"];

export const ROLE_HOME = {
  admin: "/admin/dashboard",
  student: "/student/dashboard"
};
