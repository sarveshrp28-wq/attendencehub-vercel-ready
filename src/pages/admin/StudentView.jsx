import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getStudentById } from "../../lib/api";
import { getParentAlerts, sendParentAlert } from "../../lib/phpAlerts";
import { supabase } from "../../lib/supabaseClient";
import { formatDate, formatPercent } from "../../lib/formatters";
import SectionHeader from "../../components/ui/SectionHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import StatusPill from "../../components/ui/StatusPill";
import LoadingScreen from "../../components/LoadingScreen";
import StudentAvatar from "../../components/ui/StudentAvatar";

const buildDefaultAlertMessage = ({ studentName, parentName, attendancePercentage }) => {
  const name = parentName || "Parent";
  const attendanceText =
    typeof attendancePercentage === "number"
      ? formatPercent(attendancePercentage)
      : "the latest tracked";
  return `Hello ${name}, this is an attendance alert for ${studentName}. Current attendance is ${attendanceText}. Please ensure regular attendance.`;
};

const AdminStudentView = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [overallStats, setOverallStats] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertStatus, setAlertStatus] = useState("");
  const [alertHistory, setAlertHistory] = useState([]);
  const [historyError, setHistoryError] = useState("");
  const [sendingAlert, setSendingAlert] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [{ data: studentData }, { data: attendanceData }, { data: statsData }] =
        await Promise.all([
          getStudentById(id),
          supabase
            .from("attendance")
            .select("*")
            .eq("student_id", id)
            .order("date", { ascending: false })
            .limit(8),
          supabase
            .from("student_attendance_stats")
            .select("*")
            .eq("student_id", id)
            .maybeSingle()
        ]);

      setStudent(studentData || null);
      setAttendance(attendanceData || []);
      setOverallStats(statsData || null);

      if (studentData) {
        setAlertMessage(
          buildDefaultAlertMessage({
            studentName: studentData.name,
            parentName: studentData.parent_name,
            attendancePercentage: statsData?.attendance_percentage
          })
        );
      }

      setLoadingHistory(true);
      setHistoryError("");
      const { data: historyData, error: historyLoadError } = await getParentAlerts({
        studentId: id,
        parentEmail: studentData?.parent_email || "",
        limit: 8
      });
      setLoadingHistory(false);
      if (historyLoadError) {
        setHistoryError(historyLoadError.message);
        setAlertHistory([]);
      } else {
        setAlertHistory(historyData?.alerts || []);
      }
    };
    loadData();
  }, [id]);

  const recentStats = useMemo(() => {
    const totalDays = attendance.length;
    const present = attendance.filter((item) => item.status === "Present").length;
    const percentage = totalDays ? (present / totalDays) * 100 : 0;
    return { totalDays, present, percentage };
  }, [attendance]);

  const stats = useMemo(
    () => ({
      totalDays: overallStats?.total_days ?? recentStats.totalDays,
      present: overallStats?.present_days ?? recentStats.present,
      absent: overallStats?.absent_days ?? Math.max(recentStats.totalDays - recentStats.present, 0),
      percentage: overallStats?.attendance_percentage ?? recentStats.percentage
    }),
    [overallStats, recentStats]
  );

  const loadHistory = async () => {
    if (!student) return;
    setLoadingHistory(true);
    setHistoryError("");
    const { data, error } = await getParentAlerts({
      studentId: student.id,
      parentEmail: student.parent_email || "",
      limit: 8
    });
    setLoadingHistory(false);
    if (error) {
      setHistoryError(error.message);
      return;
    }
    setAlertHistory(data?.alerts || []);
  };

  const handleSendParentAlert = async () => {
    if (!student) return;
    setAlertStatus("");

    if (!student.parent_phone_number && !student.parent_email) {
      setAlertStatus("Add parent phone or parent email before sending alerts.");
      return;
    }

    const message = alertMessage.trim();
    if (!message) {
      setAlertStatus("Please enter an alert message.");
      return;
    }

    setSendingAlert(true);
    const { data, error } = await sendParentAlert({
      student_id: student.id,
      student_name: student.name,
      parent_name: student.parent_name,
      parent_phone_number: student.parent_phone_number,
      parent_email: student.parent_email,
      attendance_percentage: stats.percentage,
      message
    });
    setSendingAlert(false);

    if (error) {
      setAlertStatus(error.message);
      return;
    }

    setAlertStatus(data?.warning || data?.message || "Parent alert sent.");
    loadHistory();
  };

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
            <StudentAvatar
              name={student.name}
              photoUrl={student.student_photo_url}
              size="lg"
            />
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
          <div className="mt-4 flex flex-wrap gap-2">
            {student.parent_phone_number ? (
              <a className="btn-outline text-xs" href={`tel:${student.parent_phone_number}`}>
                Call Parent
              </a>
            ) : null}
            {student.parent_email ? (
              <a className="btn-outline text-xs" href={`mailto:${student.parent_email}`}>
                Email Parent
              </a>
            ) : null}
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
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Absent days</span>
              <span className="text-white">{stats.absent}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-white">Parent Alert Center (PHP)</h3>
        <p className="text-sm text-slate-300 mt-2">
          Send attendance alerts to parent contacts and keep alert history from the PHP API.
        </p>

        <div className="mt-4 space-y-3">
          <label className="text-xs uppercase tracking-widest text-slate-400">
            Alert message
          </label>
          <textarea
            className="input-field min-h-[110px] w-full"
            value={alertMessage}
            onChange={(event) => setAlertMessage(event.target.value)}
            placeholder="Write an attendance alert for parent..."
          />
          <div className="flex flex-wrap gap-3 items-center">
            <Button onClick={handleSendParentAlert} disabled={sendingAlert}>
              {sendingAlert ? "Sending..." : "Send Parent Alert"}
            </Button>
            {alertStatus ? <p className="text-sm text-slate-200">{alertStatus}</p> : null}
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white">Recent Alerts</h4>
            <button className="btn-outline text-xs" onClick={loadHistory} disabled={loadingHistory}>
              {loadingHistory ? "Loading..." : "Refresh"}
            </button>
          </div>
          {historyError ? <p className="text-xs text-rose-200 mt-2">{historyError}</p> : null}
          <div className="mt-3 space-y-3">
            {alertHistory.length ? (
              alertHistory.map((item) => (
                <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-slate-400">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                  <p className="text-sm text-white mt-1">{item.message}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No parent alerts sent yet.</p>
            )}
          </div>
        </div>
      </Card>

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
