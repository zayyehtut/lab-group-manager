// src/components/DashboardLayout.tsx
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

type DashboardLayoutProps = {
  children: React.ReactNode;
  userRole: "student" | "demonstrator";
};

export function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    // Implement sign out logic here
    router.push("/");
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-gray-100">
      <button
        className="lg:hidden fixed top-4 left-4 z-20 p-2 bg-white rounded-md shadow-md"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={`w-64 bg-white shadow-md fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0 transition duration-200 ease-in-out z-10`}
      >
        <nav className="mt-5">
          <Link
            href="/dashboard"
            className="block px-4 py-2 text-gray-600 hover:bg-gray-200"
          >
            Dashboard
          </Link>
          {userRole === "demonstrator" && (
            <>
              <Link
                href="/dashboard/students"
                className="block px-4 py-2 text-gray-600 hover:bg-gray-200"
              >
                Manage Students
              </Link>
              <Link
                href="/dashboard/groups"
                className="block px-4 py-2 text-gray-600 hover:bg-gray-200"
              >
                Manage Groups
              </Link>
            </>
          )}
          {userRole === "student" && (
            <Link
              href="/dashboard/my-group"
              className="block px-4 py-2 text-gray-600 hover:bg-gray-200"
            >
              My Group
            </Link>
          )}
        </nav>
        <div className="absolute bottom-0 w-full p-4">
          <Button onClick={handleSignOut} variant="outline" className="w-full">
            Sign Out
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto lg:ml-64">{children}</main>
    </div>
  );
}
