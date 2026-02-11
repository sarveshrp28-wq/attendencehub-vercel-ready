import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  listStudents,
  listAttendanceForDate,
  upsertAttendance
} from "../../lib/api";
import { ATTENDANCE_STATUSES } from "../../lib/constants";
import SectionHeader from "../../components/ui/SectionHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";

const AdminAttendance = () => {
  const { user } = useAuth();
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [students, setStudents] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [message, setMessage] = useState("");

  const loadData = async () => {
    const { data: studentData } = await listStudents();
    const { data: attendanceData } = await listAttendanceForDate(date);

    const mapped = {};
    (attendanceData || []).forEach((record) => {
      mapped[record.student_id] = record.status;
    });

    setStudents(studentData || []);
    setStatusMap(mapped);
  };

  useEffect(() => {
    loadData();
  }, [date]);

  const updateStatus = (studentId, status) => {
    setStatusMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAllPresent = () => {
    const next = {};
    students.forEach((student) => {
      next[student.id] = "Present";
    });
    setStatusMap(next);
  };

  const handleSave = async () => {
    setMessage("");
    const records = students.map((student) => ({
      student_id: student.id,
      date,
      status: statusMap[student.id] || "Absent",
      marked_by: user?.email || "admin",
      marked_at: new Date().toISOString()
    }));

    const { error } = await upsertAttendance(records);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("Attendance saved.");
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Mark Attendance"
        subtitle="Update daily status for every student."
        actions={
          <>
            <button className="btn-outline" onClick={markAllPresent}>
              Mark all present
            </button>
            <Button onClick={handleSave}>Save attendance</Button>
          </>
        }
      />

      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-slate-300">Select date</label>
          <input
            className="input-field max-w-[200px]"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
          {message ? <p className="text-sm text-emerald-200">{message}</p> : null}
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-widest text-slate-400">
                <th className="pb-3">Student</th>
                <th className="pb-3">Class</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-t border-white/5">
                  <td className="py-4">
                    <p className="font-semibold text-white">{student.name}</p>
                    <p className="text-xs text-slate-400">{student.email}</p>
                  </td>
                  <td className="py-4">{student.class}</td>
                  <td className="py-4">
                    <select
                      className="select-field max-w-[160px]"
                      value={statusMap[student.id] || ""}
                      onChange={(event) =>
                        updateStatus(student.id, event.target.value)
                      }
                    >
                      <option value="">Select</option>
                      {ATTENDANCE_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {!students.length ? (
                <tr>
                  <td colSpan="3" className="py-6 text-center text-slate-400">
                    No students found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminAttendance;
