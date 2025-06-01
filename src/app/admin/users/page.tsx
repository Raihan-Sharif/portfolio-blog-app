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
interface UserRoleData {
  user_id: string;
  roles: {
    id: number;
    name: string;
  };
}

interface Profile {
  id: string;
  full_name: string;
  created_at: string;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  role: string;
  role_id: number;
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
  const [updatingRoles, setUpdatingRoles] = useState<Set<string>>(new Set());

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

      // Get user roles
      const { data: userRoles, error: rolesError } = await supabase.from(
        "user_roles"
      ).select(`
          user_id,
          role_id,
          roles(id, name)
        `);

      if (rolesError) {
        throw rolesError;
      }

      // Get auth emails (normally would use admin API, but using regular auth for demo)
      const { data: authData } = await supabase.auth.getSession();

      // Combine the data
      const combinedUsers = profiles.map((profile: Profile) => {
        // Find user role
        const userRole = userRoles.find((ur) => ur.user_id === profile.id) as
          | UserRoleData
          | undefined;

        return {
          id: profile.id,
          email:
            authData?.session?.user?.id === profile.id
              ? authData.session.user.email || "No email found"
              : "Email hidden for privacy",
          full_name: profile.full_name,
          created_at: profile.created_at,
          role: userRole?.roles?.name || "No role",
          role_id: userRole?.roles?.id || 0,
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
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      user.full_name.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    );
  });

  const handleRoleChange = async (userId: string, newRoleId: string) => {
    if (updatingRoles.has(userId)) {
      return; // Prevent multiple simultaneous updates
    }

    try {
      setUpdatingRoles((prev) => new Set(prev).add(userId));

      const roleId = parseInt(newRoleId);

      // Use the database function for safer role updates
      const { data, error } = await supabase.rpc("upsert_user_role", {
        p_user_id: userId,
        p_role_id: roleId,
      });

      if (error) {
        throw error;
      }

      if (data === false) {
        throw new Error("Failed to update user role");
      }

      // Update local state immediately for better UX
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? {
                ...user,
                role_id: roleId,
                role: roles.find((r) => r.id === roleId)?.name || user.role,
              }
            : user
        )
      );

      // Optionally refresh from server to ensure consistency
      // await fetchUsers();
    } catch (err: any) {
      console.error("Error updating role:", err);

      // Show user-friendly error message
      const errorMessage =
        err.code === "23505"
          ? "Role update failed due to a conflict. The page will refresh to show the current state."
          : `Failed to update role: ${err.message}`;

      alert(errorMessage);

      // Refresh users to ensure UI is in sync with database
      await fetchUsers();
    } finally {
      setUpdatingRoles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
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

      // Note: In a real app, you would use admin functions to create users
      // For this demo, we're using the regular signup flow
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name },
        },
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
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
                          value={user.role_id.toString()}
                          onValueChange={(value) =>
                            handleRoleChange(user.id, value)
                          }
                          disabled={updatingRoles.has(user.id)}
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
                        {updatingRoles.has(user.id) && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Updating...
                          </div>
                        )}
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
