import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { siteUrl, supabase } from "../lib/supabaseClient";
import { ADMIN_EMAIL, ROLE_HOME } from "../lib/constants";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const getStudentByUserId = async (userId) =>
    supabase.from("students").select("*").eq("user_id", userId).maybeSingle();

  const loadProfile = async (authUser) => {
    if (!authUser) {
      setRole(null);
      setStudent(null);
      return;
    }

    if (authUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      setRole("admin");
      setStudent(null);
      return;
    }

    const { data, error } = await getStudentByUserId(authUser.id);

    if (data && !error) {
      setRole("student");
      setStudent(data);
      return;
    }

    const { data: claimedProfile, error: claimError } = await supabase.rpc(
      "claim_student_profile"
    );
    if (!claimError && claimedProfile) {
      const claimed =
        Array.isArray(claimedProfile) ? claimedProfile[0] : claimedProfile;
      if (claimed) {
        setRole("student");
        setStudent(claimed);
        return;
      }
    }

    setRole("unknown");
    setStudent(null);
  };

  const loadProfileSafe = async (authUser) => {
    try {
      await loadProfile(authUser);
    } catch (error) {
      console.error("Profile load failed", error);
      setRole("unknown");
      setStudent(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }
        if (!mounted) return;
        setSession(data.session || null);
        setUser(data.session?.user || null);
        await loadProfileSafe(data.session?.user || null);
      } catch (error) {
        if (!mounted) return;
        console.error("Auth init failed", error);
        setSession(null);
        setUser(null);
        setRole(null);
        setStudent(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        setUser(newSession?.user || null);
        setLoading(true);
        try {
          await loadProfileSafe(newSession?.user || null);
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () =>
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${siteUrl}/`,
        skipBrowserRedirect: true
      }
    });

  const signOut = async () => supabase.auth.signOut();

  const refreshProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await loadProfileSafe(user);
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      session,
      user,
      role,
      student,
      loading,
      signInWithGoogle,
      signOut,
      refreshProfile,
      roleHome: ROLE_HOME[role] || "/login"
    }),
    [session, user, role, student, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
