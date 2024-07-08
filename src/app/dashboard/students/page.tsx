"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { CSVImport } from "@/components/CSVImport";

type Student = {
  id: string;
  email: string;
  name: string;
};

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [newStudent, setNewStudent] = useState({ email: "", name: "" });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("role", "student")
        .order("name", { ascending: true });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "Failed to fetch students. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function addStudent(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from("users")
        .insert([{ ...newStudent, role: "student" }])
        .select();

      if (error) throw error;
      setStudents([...students, data[0]]);
      setNewStudent({ email: "", name: "" });
      toast({
        title: "Success",
        description: "Student added successfully.",
      });
    } catch (error) {
      console.error("Error adding student:", error);
      toast({
        title: "Error",
        description: "Failed to add student. Please try again.",
        variant: "destructive",
      });
    }
  }

  async function handleCSVImport(data: any[]) {
    try {
      const { data: insertedData, error } = await supabase
        .from("users")
        .insert(data.map((row) => ({ ...row, role: "student" })))
        .select();

      if (error) throw error;

      setStudents([...students, ...insertedData]);
      toast({
        title: "Success",
        description: `${insertedData.length} students imported successfully.`,
      });
    } catch (error) {
      console.error("Error importing students:", error);
      toast({
        title: "Error",
        description: "Failed to import students. Please try again.",
        variant: "destructive",
      });
    }
  }

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout userRole="demonstrator">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold">Add Student</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={addStudent} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={newStudent.email}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, email: e.target.value })
                }
                required
              />
              <Input
                type="text"
                placeholder="Name"
                value={newStudent.name}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, name: e.target.value })
                }
                required
              />
              <Button type="submit">Add Student</Button>
            </form>
          </CardContent>
        </Card>

        <CSVImport onImport={handleCSVImport} />

        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold">Student List</h2>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
            />
            {loading ? (
              <p>Loading students...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
