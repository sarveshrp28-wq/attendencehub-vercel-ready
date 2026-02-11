import { supabase } from "./supabaseClient";

const isFunctionNotFoundError = (error) =>
  error?.name === "FunctionsHttpError" && Number(error?.context?.status) === 404;

const resolveFunctionErrorMessage = async (error, fallbackMessage) => {
  if (!error) return fallbackMessage;

  if (
    error.message &&
    error.message !== "Edge Function returned a non-2xx status code"
  ) {
    return error.message;
  }

  try {
    const text = await error?.context?.text?.();
    if (!text) return fallbackMessage;

    try {
      const parsed = JSON.parse(text);
      return parsed?.message || fallbackMessage;
    } catch (_parseError) {
      return text;
    }
  } catch (_readError) {
    return fallbackMessage;
  }
};

const invokeFunction = async (functionName, body) => {
  const { data, error } = await supabase.functions.invoke(functionName, { body });
  if (!error) {
    return { data, error: null };
  }

  const status = Number(error?.context?.status || 0);
  const defaultMessage =
    status === 404
      ? `Edge function '${functionName}' is not deployed in this Supabase project.`
      : "Edge function request failed.";

  return {
    data: null,
    error: {
      name: error.name || "FunctionsHttpError",
      status,
      message: await resolveFunctionErrorMessage(error, defaultMessage)
    }
  };
};

const createStudentFallback = async (payload) => {
  const {
    email,
    name,
    class: className,
    register_number,
    phone_number,
    date_of_birth,
    gender
  } = payload;

  if (
    !email ||
    !name ||
    !className ||
    !register_number ||
    !phone_number ||
    !date_of_birth ||
    !gender
  ) {
    return {
      data: null,
      error: { message: "Missing required fields." }
    };
  }

  const { error: insertError } = await supabase.from("students").insert({
    user_id: null,
    email: email.toLowerCase().trim(),
    name,
    class: className,
    register_number,
    phone_number,
    date_of_birth,
    gender
  });

  if (insertError) {
    return { data: null, error: insertError };
  }

  return {
    data: {
      warning:
        "Edge function 'create-student' is missing. Student profile was created in fallback mode."
    },
    error: null
  };
};

const deleteStudentFallback = async ({ studentId }) => {
  if (!studentId) {
    return { data: null, error: { message: "studentId is required." } };
  }

  const { data, error } = await supabase.from("students").delete().eq("id", studentId);
  if (error) {
    return { data: null, error };
  }

  return {
    data: {
      rows: data || [],
      warning:
        "Edge function 'delete-student' is missing. Student profile was deleted, but auth user cleanup was skipped."
    },
    error: null
  };
};

export const listStudents = async () =>
  supabase.from("students").select("*").order("created_at", { ascending: false });

export const getStudentById = async (id) =>
  supabase.from("students").select("*").eq("id", id).single();

export const createStudent = async (payload) => {
  const response = await invokeFunction("create-student", payload);
  if (!isFunctionNotFoundError(response.error)) {
    return response;
  }
  return createStudentFallback(payload);
};

export const deleteStudent = async ({ studentId, userId }) => {
  const response = await invokeFunction("delete-student", { studentId, userId });
  if (!isFunctionNotFoundError(response.error)) {
    return response;
  }
  return deleteStudentFallback({ studentId });
};

export const updateStudent = async (id, payload) =>
  supabase.from("students").update(payload).eq("id", id);

export const listAttendanceForDate = async (date) =>
  supabase
    .from("attendance")
    .select("*, students(name, class)")
    .eq("date", date);

export const upsertAttendance = async (records) =>
  supabase
    .from("attendance")
    .upsert(records, { onConflict: "student_id,date" });

export const listAttendanceHistory = async ({
  fromDate,
  toDate,
  className,
  status
}) => {
  let query = supabase
    .from("attendance")
    .select("*, students(name, class)")
    .order("date", { ascending: false });

  if (fromDate) query = query.gte("date", fromDate);
  if (toDate) query = query.lte("date", toDate);
  if (status) query = query.eq("status", status);
  if (className) query = query.eq("students.class", className);

  return query;
};

export const listStats = async () =>
  supabase.from("student_attendance_stats").select("*");

export const getMyStats = async () => supabase.rpc("get_my_attendance");

export const getMonthlyStats = async ({ userId, month }) => {
  const payload = { p_month: month };
  if (userId) payload.p_user_id = userId;
  return supabase.rpc("get_monthly_attendance", payload);
};
