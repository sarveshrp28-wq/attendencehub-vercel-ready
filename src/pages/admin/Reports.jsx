import React, { useEffect, useMemo, useState } from "react";
import { listStats } from "../../lib/api";
import { formatPercent } from "../../lib/formatters";
import SectionHeader from "../../components/ui/SectionHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { downloadCSV } from "../../utils/csv";
import StudentAvatar from "../../components/ui/StudentAvatar";

const AdminReports = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const { data } = await listStats();
      setStats(data || []);
      setLoading(false);
    };
    loadStats();
  }, []);

  const overview = useMemo(() => {
    const total = stats.length;
    const totalPresent = stats.reduce((sum, item) => sum + (item.present_days || 0), 0);
    const totalDays = stats.reduce((sum, item) => sum + (item.total_days || 0), 0);
    const percentage = totalDays ? (totalPresent / totalDays) * 100 : 0;
    return { total, percentage };
  }, [stats]);

  const handleExport = () => {
    downloadCSV(
      "attendance-report.csv",
      stats.map((item) => ({
        name: item.name,
        email: item.email,
        class: item.class,
        register_number: item.register_number,
        parent_name: item.parent_name || "",
        parent_phone_number: item.parent_phone_number || "",
        parent_email: item.parent_email || "",
        student_photo_url: item.student_photo_url || "",
        total_days: item.total_days,
        present_days: item.present_days,
        absent_days: item.absent_days,
        attendance_percentage: item.attendance_percentage
      }))
    );
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Reports & Analytics"
        subtitle="Export attendance statistics or review overall trends."
        actions={<Button onClick={handleExport}>Export CSV</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold text-white">Overall Attendance</h3>
          <p className="text-3xl font-semibold text-white mt-4">
            {formatPercent(overview.percentage)}
          </p>
          <p className="text-sm text-slate-300 mt-2">
            Across {overview.total} students.
          </p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-white">Export Options</h3>
          <p className="text-sm text-slate-300 mt-2">
            Export the latest attendance stats with totals and percentages.
          </p>
          <Button className="mt-4" onClick={handleExport}>
            Download CSV
          </Button>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-white">Student Summary</h3>
        <div className="mt-4 overflow-x-auto">
          {loading ? (
            <p className="text-sm text-slate-300">Loading report data...</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-widest text-slate-400">
                  <th className="pb-3">Student</th>
                  <th className="pb-3">Parent Contact</th>
                  <th className="pb-3">Class</th>
                  <th className="pb-3">Present</th>
                  <th className="pb-3">Absent</th>
                  <th className="pb-3">Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((item) => (
                  <tr key={item.student_id} className="border-t border-white/5">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <StudentAvatar
                          name={item.name}
                          photoUrl={item.student_photo_url}
                          size="sm"
                        />
                        <div>
                          <p className="text-white font-semibold">{item.name}</p>
                          <p className="text-xs text-slate-400">{item.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <p className="text-white">{item.parent_name || "-"}</p>
                      <p className="text-xs text-slate-400">
                        {item.parent_phone_number || "-"}
                      </p>
                    </td>
                    <td className="py-4">{item.class}</td>
                    <td className="py-4">{item.present_days}</td>
                    <td className="py-4">{item.absent_days}</td>
                    <td className="py-4">{formatPercent(item.attendance_percentage)}</td>
                  </tr>
                ))}
                {!stats.length ? (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-slate-400">
                      No report data yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AdminReports;
