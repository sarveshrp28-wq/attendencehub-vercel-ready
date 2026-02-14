import React, { useState } from "react";
import { listAttendanceHistory } from "../../lib/api";
import { ATTENDANCE_STATUSES } from "../../lib/constants";
import { formatDate } from "../../lib/formatters";
import SectionHeader from "../../components/ui/SectionHeader";
import Card from "../../components/ui/Card";
import StatusPill from "../../components/ui/StatusPill";
import Button from "../../components/ui/Button";

const AdminAttendanceHistory = () => {
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    className: "",
    status: ""
  });
  const [records, setRecords] = useState([]);
  const [message, setMessage] = useState("");

  const handleChange = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const runSearch = async () => {
    setMessage("");
    const { data, error } = await listAttendanceHistory(filters);
    if (error) {
      setMessage(error.message);
      return;
    }
    setRecords(data || []);
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Attendance History"
        subtitle="Filter and review attendance records across all classes."
        actions={<Button onClick={runSearch}>Run search</Button>}
      />

      <Card>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="text-sm text-slate-300">From</label>
            <input
              className="input-field mt-2"
              type="date"
              value={filters.fromDate}
              onChange={(event) => handleChange("fromDate", event.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-slate-300">To</label>
            <input
              className="input-field mt-2"
              type="date"
              value={filters.toDate}
              onChange={(event) => handleChange("toDate", event.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-slate-300">Class</label>
            <input
              className="input-field mt-2"
              placeholder="Class name"
              value={filters.className}
              onChange={(event) => handleChange("className", event.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-slate-300">Status</label>
            <select
              className="select-field mt-2"
              data-empty={!filters.status}
              value={filters.status}
              onChange={(event) => handleChange("status", event.target.value)}
            >
              <option value="">All</option>
              {ATTENDANCE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
        {message ? <p className="text-sm text-rose-200 mt-4">{message}</p> : null}

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-widest text-slate-400">
                <th className="pb-3">Student</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Marked by</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-t border-white/5">
                  <td className="py-4">
                    <p className="text-white font-semibold">{record.students?.name}</p>
                    <p className="text-xs text-slate-400">
                      {record.students?.class}
                    </p>
                  </td>
                  <td className="py-4">{formatDate(record.date)}</td>
                  <td className="py-4">
                    <StatusPill status={record.status} />
                  </td>
                  <td className="py-4">{record.marked_by || "Admin"}</td>
                </tr>
              ))}
              {!records.length ? (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-slate-400">
                    No attendance records for this filter.
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

export default AdminAttendanceHistory;
