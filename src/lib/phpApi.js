import { uploadStudentPhoto as uploadViaStorage } from "./studentPhoto";

const fallbackStudentId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

// Backward-compatible bridge for old code paths that still import phpApi.js.
// It now uploads via Supabase Storage instead of requiring VITE_PHP_UPLOAD_URL.
export const uploadStudentPhoto = async (fileOrPayload) => {
  const file =
    fileOrPayload instanceof File ? fileOrPayload : fileOrPayload?.file || null;
  const studentId =
    typeof fileOrPayload?.studentId === "string" && fileOrPayload.studentId.trim()
      ? fileOrPayload.studentId.trim()
      : fallbackStudentId();

  const { data, error } = await uploadViaStorage({ file, studentId });
  if (error) {
    return { data: null, error };
  }

  return {
    data: {
      url: data?.publicUrl || "",
      objectPath: data?.objectPath || ""
    },
    error: null
  };
};
