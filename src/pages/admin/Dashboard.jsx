import React, { useEffect, useMemo, useState } from "react";
import { CalendarCheck, Users, TrendingUp, Clock } from "lucide-react";
import { format } from "date-fns";
import { listStats } from "../../lib/api";
import { supabase } from "../../lib/supabaseClient";
import { formatPercent, formatShortDate } from "../../lib/formatters";
import SectionHeader from "../../components/ui/SectionHeader";
import StatCard from "../../components/ui/StatCard";
import Card from "../../components/ui/Card";
import StatusPill from "../../components/ui/StatusPill";
import LoadingScreen from "../../components/LoadingScreen";

const AdminDashboard = () => {
  const [stats, setStats] = useState([]);
  const [recent, setRecent] = useState([]);
  const [todaySummary, setTodaySummary] = useState({ present: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const { data: statsData } = await listStats();
    const { data: recentData } = await supabase
      .from("attendance")
      .select("*, students(name, class)")
      .order("marked_at", { ascending: false })
      .limit(5);
    const today = format(new Date(), "yyyy-MM-dd");
    const { data: todayData } = await supabase
      .from("attendance")
      .select("status")
      .eq("date", today);

    setStats(statsData || []);
    setRecent(recentData || []);
    if (todayData) {
      const present = todayData.filter((item) => item.status === "Present").length;
      setTodaySummary({ present, total: todayData.length });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const totals = useMemo(() => {
    const totalStudents = stats.length;
    const totalDays = stats.reduce((sum, item) => sum + (item.total_days || 0), 0);
    const presentDays = stats.reduce((sum, item) => sum + (item.present_days || 0), 0);
    const overallPercentage =
      totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    const classMap = stats.reduce((acc, item) => {
      const key = item.class || "Unassigned";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return { totalStudents, overallPercentage, classMap };
  }, [stats]);

  if (loading) {
    return <LoadingScreen label="Loading admin insights..." />;
  }

  return (
    <div className="space-y-10">
      <SectionHeader
        title="Overview"
        subtitle="Track attendance performance across the entire campus."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Students"
          value={totals.totalStudents}
          icon={Users}
        />
        <StatCard
          label="Overall Attendance"
          value={formatPercent(totals.overallPercentage)}
          hint="Across all recorded sessions"
          icon={TrendingUp}
          accent="sunrise"
        />
        <StatCard
          label="Today"
          value={
            todaySummary.total
              ? `${todaySummary.present}/${todaySummary.total} present`
              : "No marks"
          }
          hint="Today's attendance summary"
          icon={CalendarCheck}
        />
        <StatCard
          label="Recent Activity"
          value={recent.length ? `${recent.length} updates` : "No updates"}
          hint="Last marked sessions"
          icon={Clock}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <SectionHeader
            title="Class Distribution"
            subtitle="See how many students are tracked in each class."
          />
          <div className="mt-6 space-y-3">
            {Object.entries(totals.classMap).length ? (
              Object.entries(totals.classMap).map(([key, value]) => (
                <div key={key} className="flex items-center gap-4">
                  <div className="w-28 text-sm text-slate-300">{key}</div>
                  <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-aqua-400"
                      style={{ width: `${(value / totals.totalStudents) * 100}%` }}
                    />
                  </div>
                  <div className="text-sm text-slate-200">{value}</div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No classes yet.</p>
            )}
          </div>
        </Card>

        <Card>
          <SectionHeader
            title="Recent Activity"
            subtitle="Latest attendance entries by admin."
          />
          <div className="mt-4 space-y-3">
            {recent.length ? (
              recent.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between border-b border-white/5 pb-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {entry.students?.name || "Unknown Student"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {entry.students?.class || "Class"} - {formatShortDate(entry.date)}
                    </p>
                  </div>
                  <StatusPill status={entry.status} />
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No attendance marked yet.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
