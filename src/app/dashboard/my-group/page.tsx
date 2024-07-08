"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { DashboardLayout } from "@/components/DashboardLayout";
import StudentGroupManagement from "@/components/StudentGroupManagement";

export default function MyGroupPage() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUserId();
  }, []);

  if (!userId) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout userRole="student">
      <StudentGroupManagement userId={userId} />
    </DashboardLayout>
  );
}
