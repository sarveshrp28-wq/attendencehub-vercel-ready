import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { getStudentById, updateStudent } from "../../lib/api";
import { GENDERS } from "../../lib/constants";
import SectionHeader from "../../components/ui/SectionHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import LoadingScreen from "../../components/LoadingScreen";

const schema = yup.object({
  name: yup.string().required("Name is required"),
  class: yup.string().required("Class is required"),
  register_number: yup.string().required("Register number is required"),
  phone_number: yup.string().required("Phone number is required"),
  date_of_birth: yup.string().required("Date of birth is required"),
  gender: yup.string().required("Gender is required")
});

const AdminStudentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [status, setStatus] = useState("");
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
      reset(data || {});
    };
    fetchStudent();
  }, [id, reset]);

  const onSubmit = async (values) => {
    setStatus("");
    const { error } = await updateStudent(id, values);
    if (error) {
      setStatus(error.message);
      return;
    }
    navigate(`/admin/students/${id}`);
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
