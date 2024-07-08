"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import GroupManagement from "@/components/GroupManagement";

export default function GroupManagementPage() {
  return (
    <DashboardLayout userRole="demonstrator">
      <GroupManagement />
    </DashboardLayout>
  );
}
