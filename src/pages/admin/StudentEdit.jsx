import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { getStudentById, updateStudent } from "../../lib/api";
import {
  deleteStudentPhotoByUrl,
  uploadStudentPhoto,
  validateStudentPhotoFile
} from "../../lib/studentPhoto";
import { GENDERS } from "../../lib/constants";
import SectionHeader from "../../components/ui/SectionHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import LoadingScreen from "../../components/LoadingScreen";
import StudentPhotoDropzone from "../../components/ui/StudentPhotoDropzone";

const schema = yup.object({
  name: yup.string().required("Name is required"),
  class: yup.string().required("Class is required"),
  register_number: yup.string().required("Register number is required"),
  phone_number: yup.string().required("Phone number is required"),
  parent_name: yup.string().trim().required("Parent name is required"),
  parent_phone_number: yup.string().trim().required("Parent phone number is required"),
  parent_email: yup
    .string()
    .trim()
    .transform((value) => value || "")
    .test(
      "parent-email",
      "Valid parent email required",
      (value) => !value || yup.string().email().isValidSync(value)
    ),
  date_of_birth: yup.string().required("Date of birth is required"),
  gender: yup.string().required("Gender is required")
});

const emptyToNull = (value) => {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed || null;
};

const AdminStudentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [status, setStatus] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: yupResolver(schema) });

  useEffect(() => {
    const fetchStudent = async () => {
      const { data } = await getStudentById(id);
      setStudent(data);
      reset({
        ...(data || {}),
        parent_name: data?.parent_name || "",
        parent_phone_number: data?.parent_phone_number || "",
        parent_email: data?.parent_email || ""
      });
      setPhotoFile(null);
      setPhotoError("");
      setRemovePhoto(false);
    };
    fetchStudent();
  }, [id, reset]);

  const onSubmit = async (values) => {
    setStatus("");
    setPhotoError("");

    const previousPhotoUrl = student?.student_photo_url || "";
    const payload = {
      ...values,
      parent_name: emptyToNull(values.parent_name),
      parent_phone_number: emptyToNull(values.parent_phone_number),
      parent_email: emptyToNull(values.parent_email)?.toLowerCase() || null
    };

    if (photoFile) {
      const { data: photoData, error: photoUploadError } = await uploadStudentPhoto({
        file: photoFile,
        studentId: id
      });
      if (photoUploadError) {
        setStatus(`Photo upload failed: ${photoUploadError.message}`);
        return;
      }
      payload.student_photo_url = photoData?.publicUrl || null;
    } else if (removePhoto) {
      payload.student_photo_url = null;
    }

    const { error } = await updateStudent(id, payload);
    if (error) {
      setStatus(error.message);
      return;
    }

    const photoWasChanged = Boolean(
      previousPhotoUrl && (removePhoto || (photoFile && payload.student_photo_url !== previousPhotoUrl))
    );

    if (photoWasChanged) {
      await deleteStudentPhotoByUrl(previousPhotoUrl);
    }

    navigate(`/admin/students/${id}`);
  };

  const handleSelectPhoto = (file) => {
    const validationMessage = validateStudentPhotoFile(file);
    if (validationMessage) {
      setPhotoError(validationMessage);
      setPhotoFile(null);
      return;
    }
    setPhotoError("");
    setPhotoFile(file);
    setRemovePhoto(false);
  };

  const handleClearPhoto = () => {
    setPhotoError("");
    setPhotoFile(null);
    setRemovePhoto(true);
  };

  if (!student) {
    return <LoadingScreen label="Loading student details..." />;
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Edit Student"
        subtitle="Update core profile details."
      />

      <Card>
        <form className="grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="text-sm text-slate-300">Full name</label>
            <input className="input-field mt-2" {...register("name")} />
            {errors.name ? (
              <p className="text-xs text-rose-300 mt-1">{errors.name.message}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm text-slate-300">Gmail (read-only)</label>
            <input className="input-field mt-2" value={student.email} disabled />
          </div>

          <div>
            <label className="text-sm text-slate-300">Class</label>
            <input className="input-field mt-2" {...register("class")} />
            {errors.class ? (
              <p className="text-xs text-rose-300 mt-1">{errors.class.message}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm text-slate-300">Register number</label>
            <input className="input-field mt-2" {...register("register_number")} />
            {errors.register_number ? (
              <p className="text-xs text-rose-300 mt-1">
                {errors.register_number.message}
              </p>
            ) : null}
          </div>

          <div>
            <label className="text-sm text-slate-300">Phone number</label>
            <input className="input-field mt-2" {...register("phone_number")} />
            {errors.phone_number ? (
              <p className="text-xs text-rose-300 mt-1">
                {errors.phone_number.message}
              </p>
            ) : null}
          </div>

          <div>
            <label className="text-sm text-slate-300">Parent name</label>
            <input className="input-field mt-2" {...register("parent_name")} />
            {errors.parent_name ? (
              <p className="text-xs text-rose-300 mt-1">{errors.parent_name.message}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm text-slate-300">Parent phone number</label>
            <input
              className="input-field mt-2"
              placeholder="+91..."
              {...register("parent_phone_number")}
            />
            {errors.parent_phone_number ? (
              <p className="text-xs text-rose-300 mt-1">
                {errors.parent_phone_number.message}
              </p>
            ) : null}
          </div>

          <div>
            <label className="text-sm text-slate-300">Parent email</label>
            <input className="input-field mt-2" type="email" {...register("parent_email")} />
            {errors.parent_email ? (
              <p className="text-xs text-rose-300 mt-1">{errors.parent_email.message}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm text-slate-300">Date of birth</label>
            <input
              className="input-field mt-2"
              type="date"
              {...register("date_of_birth")}
            />
            {errors.date_of_birth ? (
              <p className="text-xs text-rose-300 mt-1">
                {errors.date_of_birth.message}
              </p>
            ) : null}
          </div>

          <div>
            <label className="text-sm text-slate-300">Gender</label>
            <select className="select-field mt-2" {...register("gender")}>
              <option value="">Select</option>
              {GENDERS.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
            {errors.gender ? (
              <p className="text-xs text-rose-300 mt-1">{errors.gender.message}</p>
            ) : null}
          </div>

          <div className="lg:col-span-2">
            <StudentPhotoDropzone
              currentPhotoUrl={removePhoto ? "" : student?.student_photo_url || ""}
              selectedFile={photoFile}
              error={photoError}
              disabled={isSubmitting}
              onSelectFile={handleSelectPhoto}
              onClear={handleClearPhoto}
            />
          </div>

          <div className="lg:col-span-2 flex flex-wrap gap-3 items-center">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
            {status ? <p className="text-sm text-rose-200">{status}</p> : null}
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AdminStudentEdit;
