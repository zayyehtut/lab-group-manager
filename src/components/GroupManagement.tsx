"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

type Group = {
  id: string;
  name: string;
};

type GroupMember = {
  id: string;
  group_id: string;
  user_id: string;
  user: {
    name: string;
    email: string;
  };
};

export default function GroupManagement() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupMembers(selectedGroup);
    }
  }, [selectedGroup]);

  async function fetchGroups() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
      alert("Error fetching groups. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function addGroup(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from("groups")
        .insert([{ name: newGroupName }])
        .select();

      if (error) throw error;
      setGroups([...groups, data[0]]);
      setNewGroupName("");
      toast({
        title: "Group added",
        description: `Successfully added group: ${newGroupName}`,
      });
    } catch (error) {
      console.error("Error adding group:", error);
      toast({
        title: "Error",
        description: "Failed to add group. Please try again.",
        variant: "destructive",
      });
    }
  }

  async function fetchGroupMembers(groupId: string) {
    try {
      const { data, error } = await supabase
        .from("group_members")
        .select("*, user:users(name, email)")
        .eq("group_id", groupId);

      if (error) throw error;
      setGroupMembers(data || []);
    } catch (error) {
      console.error("Error fetching group members:", error);
      alert("Error fetching group members. Please try again.");
    }
  }

  async function removeGroupMember(memberId: string) {
    try {
      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
      setGroupMembers(groupMembers.filter((member) => member.id !== memberId));
      toast({
        title: "Member removed",
        description: "Successfully removed member from the group.",
      });
    } catch (error) {
      console.error("Error removing group member:", error);
      toast({
        title: "Error",
        description: "Failed to remove group member. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <h2 className="text-2xl font-bold">Group Management</h2>
      </CardHeader>
      <CardContent>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="mb-4">Add New Group</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Group</DialogTitle>
            </DialogHeader>
            <form onSubmit={addGroup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-group-name">Group Name</Label>
                <Input
                  id="new-group-name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  required
                />
              </div>
              <Button type="submit">Add Group</Button>
            </form>
          </DialogContent>
        </Dialog>

        {loading ? (
          <p>Loading groups...</p>
        ) : (
          <div className="flex space-x-4">
            <div className="w-1/2">
              <h3 className="font-bold mb-2">Groups</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell>{group.name}</TableCell>
                      <TableCell>
                        <Button
                          onClick={() => setSelectedGroup(group.id)}
                          variant="outline"
                          size="sm"
                        >
                          View Members
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="w-1/2">
              <h3 className="font-bold mb-2">Group Members</h3>
              {selectedGroup ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>{member.user.name}</TableCell>
                        <TableCell>{member.user.email}</TableCell>
                        <TableCell>
                          <Button
                            onClick={() => removeGroupMember(member.id)}
                            variant="destructive"
                            size="sm"
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p>Select a group to view members</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
