"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser) {
        const { data: userData, error } = await supabase
          .from("users")
          .select("*")
          .eq("auth_id", authUser.id)
          .single();

        if (error) {
          console.error("Error fetching user data:", error);
          return;
        }

        setUser(userData);
      } else {
        router.push("/auth/signin");
      }
    };
    getUser();
  }, [router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout userRole={user.role}>
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">Welcome to Your Dashboard</h1>
        </CardHeader>
        <CardContent>
          <p>Hello, {user.name}!</p>
          <p>Role: {user.role}</p>
          {user.role === "demonstrator" && (
            <p>Use the sidebar to manage students and groups.</p>
          )}
          {user.role === "student" && (
            <p>Use the sidebar to view and manage your group membership.</p>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
