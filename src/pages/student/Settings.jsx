import React from "react";
import { useAuth } from "../../context/AuthContext";
import SectionHeader from "../../components/ui/SectionHeader";
import Card from "../../components/ui/Card";

const StudentSettings = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Account"
        subtitle="Google identity and profile access."
      />

      <Card>
        <h3 className="text-lg font-semibold text-white">Google Sign-In</h3>
        <div className="mt-4 space-y-2 text-sm text-slate-300">
          <p>
            Signed in as: <span className="text-white">{user?.email || "-"}</span>
          </p>
          <p>
            Password management is disabled in this app. Sign-in is handled only through Google.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default StudentSettings;
