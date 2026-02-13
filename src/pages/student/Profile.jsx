import React from "react";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../../lib/formatters";
import Card from "../../components/ui/Card";
import SectionHeader from "../../components/ui/SectionHeader";
import StudentAvatar from "../../components/ui/StudentAvatar";

const StudentProfile = () => {
  const { student } = useAuth();

  if (!student) return null;

  return (
    <div className="space-y-8">
      <SectionHeader
        title="My Profile"
        subtitle="Your details are managed by the admin."
      />
      <Card>
        <div className="flex items-center gap-4 mb-6">
          <StudentAvatar
            name={student.name}
            photoUrl={student.student_photo_url}
            size="lg"
          />
          <div>
            <p className="text-white font-semibold text-lg">{student.name}</p>
            <p className="text-slate-400 text-sm">{student.email}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 text-sm text-slate-300">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">Class</p>
            <p className="text-white font-semibold mt-1">{student.class}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">
              Register Number
            </p>
            <p className="text-white font-semibold mt-1">
              {student.register_number}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">
              Phone Number
            </p>
            <p className="text-white font-semibold mt-1">
              {student.phone_number}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">
              Date of Birth
            </p>
            <p className="text-white font-semibold mt-1">
              {formatDate(student.date_of_birth)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">Gender</p>
            <p className="text-white font-semibold mt-1">{student.gender}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">Parent Name</p>
            <p className="text-white font-semibold mt-1">{student.parent_name || "-"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">Parent Phone</p>
            <p className="text-white font-semibold mt-1">
              {student.parent_phone_number || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">Parent Email</p>
            <p className="text-white font-semibold mt-1">{student.parent_email || "-"}</p>
          </div>
        </div>
        <div className="mt-6 p-4 rounded-xl bg-white/5 text-sm text-slate-300">
          Contact admin to update your information.
        </div>
      </Card>
    </div>
  );
};

export default StudentProfile;
