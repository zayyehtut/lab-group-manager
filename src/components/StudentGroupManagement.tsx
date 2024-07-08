"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

type Group = {
  id: string;
  name: string;
};

type GroupMemberWithGroup = {
  group: Group;
};

export default function StudentGroupManagement({ userId }: { userId: string }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [userGroup, setUserGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  useEffect(() => {
    fetchData();
  }, [userId]);

  async function fetchData() {
    setLoading(true);
    await Promise.all([fetchGroups(), fetchUserGroup()]);
    setLoading(false);
  }

  async function fetchGroups() {
    try {
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast({
        title: "Error",
        description: "Failed to fetch groups. Please try again.",
        variant: "destructive",
      });
    }
  }

  async function fetchUserGroup() {
    try {
      const { data, error } = await supabase
        .from("group_members")
        .select("group:groups(*)")
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          setUserGroup(null);
        } else {
          throw error;
        }
      } else {
        // Type guard to ensure data has the correct shape
        if (isGroupMemberWithGroup(data)) {
          setUserGroup(data.group);
        } else {
          console.error("Unexpected data structure:", data);
          setUserGroup(null);
        }
      }
    } catch (error) {
      console.error("Error fetching user group:", error);
      toast({
        title: "Error",
        description: "Failed to fetch your group. Please try again.",
        variant: "destructive",
      });
    }
  }

  // Type guard function
  function isGroupMemberWithGroup(data: any): data is GroupMemberWithGroup {
    return (
      data &&
      typeof data === "object" &&
      "group" in data &&
      typeof data.group === "object" &&
      data.group !== null &&
      "id" in data.group &&
      "name" in data.group
    );
  }
  async function joinGroup(groupId: string) {
    try {
      const { error } = await supabase
        .from("group_members")
        .insert({ user_id: userId, group_id: groupId });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Error",
            description: "You are already a member of this group.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        await fetchUserGroup();
        toast({
          title: "Success",
          description: "Successfully joined the group.",
        });
      }
    } catch (error) {
      console.error("Error joining group:", error);
      toast({
        title: "Error",
        description: "Failed to join group. Please try again.",
        variant: "destructive",
      });
    }
  }

  async function leaveGroup() {
    try {
      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;
      setUserGroup(null);
      toast({
        title: "Success",
        description: "Successfully left the group.",
      });
    } catch (error) {
      console.error("Error leaving group:", error);
      toast({
        title: "Error",
        description: "Failed to leave group. Please try again.",
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">Your Group</h2>
      </CardHeader>
      <CardContent>
        <Button onClick={fetchData} className="mb-4">
          Refresh
        </Button>
        {userGroup ? (
          <div>
            <p>You are in group: {userGroup.name}</p>
          </div>
        ) : (
          <div>
            <p>You are not in any group. Join a group:</p>
            <ul className="mt-4 space-y-2">
              {groups.map((group) => (
                <li
                  key={group.id}
                  className="flex items-center justify-between"
                >
                  <span>{group.name}</span>
                  <Button
                    onClick={() => joinGroup(group.id)}
                    variant="outline"
                    size="sm"
                  >
                    Join
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      {userGroup && (
        <CardFooter>
          <Button onClick={leaveGroup} variant="destructive">
            Leave Group
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
