import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";

const UsersTable = () => {
  const { toast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<{ id: number; first_name: string; last_name: string; email: string; role: string } | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8081/api/users");
        setUsers(response.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch users.",
          variant: "destructive",
        });
      }
    };
    fetchUsers();
  }, []);

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    try {
      await axios.put(`http://localhost:8081/api/users/${editingUser.id}`, editingUser);
      setUsers((prevUsers) => prevUsers.map((user) => (user.id === editingUser.id ? editingUser : user)));
      toast({
        title: "Success",
        description: `Changes for ${editingUser.first_name} have been saved.`,
      });

      setIsEditOpen(false);
      setEditingUser(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (userId: number) => {
    try {
      await axios.delete(`http://localhost:8081/api/users/${userId}`);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      toast({
        title: "Success",
        description: "User deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="h-12 px-4 text-left align-middle font-medium">First Name</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Last Name</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Email</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Role</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                <td className="p-4">{user.first_name}</td>
                <td className="p-4">{user.last_name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">{user.role}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(user.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit User</SheetTitle>
          </SheetHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="first_name">First Name</label>
              <Input
                id="first_name"
                value={editingUser?.first_name || ""}
                onChange={(e) =>
                  setEditingUser((prev) => (prev ? { ...prev, first_name: e.target.value } : null))
                }
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="last_name">Last Name</label>
              <Input
                id="last_name"
                value={editingUser?.last_name || ""}
                onChange={(e) =>
                  setEditingUser((prev) => (prev ? { ...prev, last_name: e.target.value } : null))
                }
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email">Email</label>
              <Input
                id="email"
                type="email"
                value={editingUser?.email || ""}
                onChange={(e) =>
                  setEditingUser((prev) => (prev ? { ...prev, email: e.target.value } : null))
                }
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                value={editingUser?.role || ""}
                onChange={(e) =>
                  setEditingUser((prev) => (prev ? { ...prev, role: e.target.value } : null))
                }
                className="border rounded px-3 py-2 w-full"
              >
                <option value="admin">Admin</option>
                <option value="farmer">Farmer</option>
                <option value="engineer">Engineer</option>
              </select>
            </div>
          </div>

          <SheetFooter>
            <Button onClick={handleSaveEdit}>Save</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default UsersTable;
