"use client";

import AdminLayout from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/lib/supabase/client";
import { AlertCircle, CheckCircle, Search, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";

// Define interfaces for type safety
interface Role {
  id: number;
  name: string;
}

interface UserRole {
  user_id: string;
  roles: Role;
}

interface Profile {
  id: string;
  full_name: string;
  created_at: string;
}

interface AuthUser {
  id: string;
  email: string;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  role: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: "",
    full_name: "",
    password: "",
    role_id: "",
  });
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [addUserSuccess, setAddUserSuccess] = useState(false);
  const [addUserError, setAddUserError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Get all users with their roles
      const { data: profiles, error: profilesError } = await supabase.from(
        "profiles"
      ).select(`
          id,
          full_name,
          created_at
        `);

      if (profilesError) {
        throw profilesError;
      }

      // Get emails from auth.users (requires service role)
      const { data: authUsers, error: authError } =
        await supabase.auth.admin.listUsers();

      if (authError) {
        throw authError;
      }

      // Get user roles
      const { data: userRoles, error: rolesError } = await supabase.from(
        "user_roles"
      ).select(`
          user_id,
          roles(id, name)
        `);

      if (rolesError) {
        throw rolesError;
      }

      // Combine the data
      const combinedUsers = profiles.map((profile: Profile) => {
        const authUser = authUsers.users.find(
          (u: AuthUser) => u.id === profile.id
        );
        const userRole = userRoles.find(
          (ur: UserRole) => ur.user_id === profile.id
        );

        return {
          id: profile.id,
          email: authUser?.email || "No email found",
          full_name: profile.full_name,
          created_at: profile.created_at,
          // Fix the type issue here - properly handle the nested roles object
          role: userRole?.roles?.name || "No role",
        };
      });

      setUsers(combinedUsers);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err.message || "Failed to fetch users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .order("id");

      if (error) {
        throw error;
      }

      setRoles(data || []);
    } catch (err: any) {
      console.error("Error fetching roles:", err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter users client-side for simplicity
    // In a production app, you might want to implement server-side filtering
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      user.full_name.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    );
  });

  const handleRoleChange = async (userId: string, roleId: string) => {
    try {
      // First, delete existing role
      await supabase.from("user_roles").delete().eq("user_id", userId);

      // Then, add new role
      const { error } = await supabase.from("user_roles").insert({
        user_id: userId,
        role_id: parseInt(roleId),
      });

      if (error) {
        throw error;
      }

      // Update local state
      fetchUsers();
    } catch (err: any) {
      console.error("Error updating role:", err);
      alert("Failed to update role. Please try again.");
    }
  };

  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleSelect = (value: string) => {
    setNewUserData((prev) => ({
      ...prev,
      role_id: value,
    }));
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsAddingUser(true);
      setAddUserError(null);
      setAddUserSuccess(false);

      const { email, full_name, password, role_id } = newUserData;

      if (!email || !password || !role_id) {
        throw new Error("Email, password, and role are required");
      }

      // Create user in Auth
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          full_name,
        });

        if (profileError) {
          console.error("Error creating profile:", profileError);
        }

        // Add role
        const { error: roleError } = await supabase.from("user_roles").insert({
          user_id: data.user.id,
          role_id: parseInt(role_id),
        });

        if (roleError) {
          console.error("Error assigning role:", roleError);
        }

        setAddUserSuccess(true);
        setNewUserData({
          email: "",
          full_name: "",
          password: "",
          role_id: "",
        });

        // Refresh user list
        fetchUsers();

        // Close dialog after 2 seconds
        setTimeout(() => {
          setIsAddUserOpen(false);
          setAddUserSuccess(false);
        }, 2000);
      }
    } catch (err: any) {
      console.error("Error adding user:", err);
      setAddUserError(err.message || "Failed to add user. Please try again.");
    } finally {
      setIsAddingUser(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">User Management</h1>

          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus size={18} />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>

              {addUserError && (
                <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm flex items-start">
                  <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                  <div>{addUserError}</div>
                </div>
              )}

              {addUserSuccess && (
                <div className="bg-green-50 text-green-600 rounded-md p-3 text-sm flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                  <div>User created successfully!</div>
                </div>
              )}

              <form onSubmit={handleAddUser} className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newUserData.email}
                    onChange={handleNewUserChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={newUserData.full_name}
                    onChange={handleNewUserChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={newUserData.password}
                    onChange={handleNewUserChange}
                    required
                    minLength={8}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newUserData.role_id}
                    onValueChange={handleRoleSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={isAddingUser || addUserSuccess}
                  >
                    {isAddingUser ? "Adding..." : "Add User"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive rounded-md p-4 mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        <div className="bg-card rounded-lg border shadow-sm overflow-hidden mb-6">
          <div className="p-4">
            <form onSubmit={handleSearch} className="flex w-full gap-2">
              <Input
                type="search"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full max-w-md"
              />
              <Button type="submit" size="icon">
                <Search size={18} />
              </Button>
            </form>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Select
                          defaultValue={roles
                            .find((r) => r.name === user.role)
                            ?.id.toString()}
                          onValueChange={(value) =>
                            handleRoleChange(user.id, value)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder={user.role} />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem
                                key={role.id}
                                value={role.id.toString()}
                              >
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {/* Additional actions can be added here */}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
