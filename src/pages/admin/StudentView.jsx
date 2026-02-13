import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getStudentById } from "../../lib/api";
import { supabase } from "../../lib/supabaseClient";
import { formatDate, formatPercent } from "../../lib/formatters";
import SectionHeader from "../../components/ui/SectionHeader";
import Card from "../../components/ui/Card";
import StatusPill from "../../components/ui/StatusPill";
import LoadingScreen from "../../components/LoadingScreen";

const AdminStudentView = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const { data } = await getStudentById(id);
      const { data: attendanceData } = await supabase
        .from("attendance")
        .select("*")
        .eq("student_id", id)
        .order("date", { ascending: false })
        .limit(8);

      setStudent(data);
      setAttendance(attendanceData || []);
    };
    loadData();
  }, [id]);

  const stats = useMemo(() => {
    const totalDays = attendance.length;
    const present = attendance.filter((item) => item.status === "Present").length;
    const percentage = totalDays ? (present / totalDays) * 100 : 0;
    return { totalDays, present, percentage };
  }, [attendance]);
  const studentPhotoUrl = student?.student_photo_url?.trim() || "";
  const studentInitial = student?.name?.trim()?.charAt(0)?.toUpperCase() || "?";

  if (!student) {
    return <LoadingScreen label="Loading student profile..." />;
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        title={student.name}
        subtitle={`${student.class} - ${student.register_number}`}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <h3 className="text-lg font-semibold text-white">Profile Details</h3>
          <div className="mt-4 flex items-center gap-4">
            {studentPhotoUrl ? (
              <img
                src={studentPhotoUrl}
                alt={`${student.name} profile`}
                className="h-20 w-20 rounded-xl object-cover border border-white/10"
              />
            ) : (
              <div className="h-20 w-20 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-2xl font-semibold text-white">
                {studentInitial}
              </div>
            )}
            <div>
              <p className="text-white font-semibold">{student.name}</p>
              <p className="text-xs text-slate-400">{student.email}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm text-slate-300">
            <p>Phone: <span className="text-white">{student.phone_number}</span></p>
            <p>Date of Birth: <span className="text-white">{formatDate(student.date_of_birth)}</span></p>
            <p>Gender: <span className="text-white">{student.gender}</span></p>
            <p>Parent Name: <span className="text-white">{student.parent_name || "-"}</span></p>
            <p>
              Parent Phone:{" "}
              <span className="text-white">{student.parent_phone_number || "-"}</span>
            </p>
            <p>
              Parent Email: <span className="text-white">{student.parent_email || "-"}</span>
            </p>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-white">Attendance Snapshot</h3>
          <div className="mt-4 grid gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Total days tracked</span>
              <span className="text-white">{stats.totalDays}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Present days</span>
              <span className="text-white">{stats.present}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Attendance %</span>
              <span className="text-white">{formatPercent(stats.percentage)}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-white">Recent Attendance</h3>
        <div className="mt-4 space-y-3">
          {attendance.length ? (
            attendance.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">{formatDate(item.date)}</p>
                  <p className="text-xs text-slate-400">
                    Marked by {item.marked_by || "Admin"}
                  </p>
                </div>
                <StatusPill status={item.status} />
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">No attendance records yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AdminStudentView;
