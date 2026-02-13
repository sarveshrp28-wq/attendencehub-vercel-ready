import { supabase, supabaseUrl } from "./supabaseClient";

export const STUDENT_PHOTO_BUCKET =
  import.meta.env.VITE_STUDENT_PHOTO_BUCKET?.trim() || "student-photos";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const sanitizeFileName = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const resolveExtension = (file) => {
  const safeName = sanitizeFileName(file.name || "");
  const fromName = safeName.split(".").pop();
  if (fromName && fromName !== safeName) {
    return fromName;
  }
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
};

const buildObjectPath = ({ studentId, file }) => {
  const extension = resolveExtension(file);
  const token = Math.random().toString(36).slice(2, 8);
  return `${studentId}/${Date.now()}-${token}.${extension}`;
};

const parseObjectPathFromUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  const base = `${supabaseUrl}/storage/v1/object/public/${STUDENT_PHOTO_BUCKET}/`;
  if (url.startsWith(base)) {
    return decodeURIComponent(url.slice(base.length).split("?")[0]);
  }

  const marker = `/storage/v1/object/public/${STUDENT_PHOTO_BUCKET}/`;
  const markerIndex = url.indexOf(marker);
  if (markerIndex === -1) return null;
  return decodeURIComponent(url.slice(markerIndex + marker.length).split("?")[0]);
};

export const validateStudentPhotoFile = (file) => {
  if (!file) {
    return "Please choose an image file.";
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return "Use JPG, PNG, or WEBP image format.";
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "Photo size must be 5 MB or less.";
  }
  return null;
};

export const uploadStudentPhoto = async ({ file, studentId }) => {
  const validationError = validateStudentPhotoFile(file);
  if (validationError) {
    return { data: null, error: { message: validationError } };
  }
  if (!studentId) {
    return { data: null, error: { message: "Student ID is required for photo upload." } };
  }

  const objectPath = buildObjectPath({ studentId, file });
  const { error: uploadError } = await supabase
    .storage
    .from(STUDENT_PHOTO_BUCKET)
    .upload(objectPath, file, {
      upsert: false,
      cacheControl: "3600",
      contentType: file.type
    });

  if (uploadError) {
    return { data: null, error: uploadError };
  }

  const { data: urlData } = supabase.storage
    .from(STUDENT_PHOTO_BUCKET)
    .getPublicUrl(objectPath);

  return {
    data: {
      objectPath,
      publicUrl: urlData?.publicUrl || null
    },
    error: null
  };
};

export const deleteStudentPhotoByUrl = async (url) => {
  const objectPath = parseObjectPathFromUrl(url);
  if (!objectPath) {
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .storage
    .from(STUDENT_PHOTO_BUCKET)
    .remove([objectPath]);

  return { data, error };
};
