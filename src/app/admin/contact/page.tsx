// Create this file: src/app/admin/contact/page.tsx

"use client";

import AdminLayout from "@/components/admin/admin-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  Eye,
  Mail,
  MessageSquare,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "pending" | "viewed" | "in_progress" | "resolved";
  priority: "low" | "normal" | "high" | "urgent";
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  resolved_by?: string;
  notes?: string;
}

export default function AdminContactPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null
  );
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<ContactMessage | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setMessages(data || []);
    } catch (err: any) {
      console.error("Error fetching messages:", err);
      setError(err.message || "Failed to fetch messages. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const filteredMessages = messages.filter((message) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      message.name.toLowerCase().includes(searchLower) ||
      message.email.toLowerCase().includes(searchLower) ||
      message.subject.toLowerCase().includes(searchLower) ||
      message.message.toLowerCase().includes(searchLower);

    const matchesStatus =
      statusFilter === "all" || message.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setNotes(message.notes || "");
    setViewDialogOpen(true);

    // Mark as viewed if it's pending
    if (message.status === "pending") {
      updateMessageStatus(message.id, "viewed");
    }
  };

  const updateMessageStatus = async (
    messageId: number,
    status: string,
    newNotes?: string
  ) => {
    try {
      setIsUpdating(true);

      const { error } = await supabase.rpc("update_contact_message_status", {
        p_message_id: messageId,
        p_status: status,
        p_notes: newNotes || null,
      });

      if (error) {
        throw error;
      }

      // Refresh messages
      await fetchMessages();

      // Update selectedMessage if it's the current one
      if (selectedMessage && selectedMessage.id === messageId) {
        setSelectedMessage((prev) =>
          prev ? { ...prev, status: status as any, notes: newNotes } : null
        );
      }
    } catch (err: any) {
      console.error("Error updating message status:", err);
      alert("Failed to update message status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = (status: string) => {
    if (selectedMessage) {
      updateMessageStatus(selectedMessage.id, status, notes);
    }
  };

  const handleNotesUpdate = () => {
    if (selectedMessage) {
      updateMessageStatus(selectedMessage.id, selectedMessage.status, notes);
    }
  };

  const handleDeleteClick = (message: ContactMessage) => {
    setMessageToDelete(message);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!messageToDelete) return;

    try {
      setIsDeleting(true);

      const { error } = await supabase
        .from("contact_messages")
        .delete()
        .eq("id", messageToDelete.id);

      if (error) {
        throw error;
      }

      setMessages((prev) => prev.filter((m) => m.id !== messageToDelete.id));
      setDeleteDialogOpen(false);
    } catch (err: any) {
      console.error("Error deleting message:", err);
      alert("Failed to delete message. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "viewed":
        return "bg-blue-500";
      case "in_progress":
        return "bg-orange-500";
      case "resolved":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <AdminLayout>
      <div className="container px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Contact Messages</h1>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Viewed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Resolved</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive rounded-md p-4 mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        <div className="bg-card rounded-lg border shadow-sm overflow-hidden mb-6">
          <div className="p-4 flex flex-col md:flex-row gap-4">
            <form
              onSubmit={handleSearch}
              className="flex w-full max-w-md gap-2"
            >
              <Input
                type="search"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
              <Button type="submit" size="icon">
                <Search size={18} />
              </Button>
            </form>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="viewed">Viewed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredMessages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No messages found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMessages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <MessageSquare
                            size={16}
                            className="text-muted-foreground"
                          />
                          {message.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-muted-foreground" />
                          {message.email}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {message.subject}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(message.status)}>
                          {message.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(message.created_at), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewMessage(message)}
                            title="View"
                            type="button"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(message)}
                            title="Delete"
                            type="button"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* View Message Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Contact Message Details</DialogTitle>
              <DialogDescription>
                Manage this contact message and update its status.
              </DialogDescription>
            </DialogHeader>

            {selectedMessage && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Name</Label>
                    <p className="text-sm">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm">{selectedMessage.email}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Subject</Label>
                  <p className="text-sm">{selectedMessage.subject}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Message</Label>
                  <div className="text-sm bg-muted p-3 rounded-md max-h-40 overflow-y-auto">
                    {selectedMessage.message}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Select
                    value={selectedMessage.status}
                    onValueChange={handleStatusChange}
                    disabled={isUpdating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="viewed">Viewed</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Admin Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this message..."
                    rows={3}
                  />
                  <Button
                    onClick={handleNotesUpdate}
                    disabled={isUpdating}
                    size="sm"
                    className="mt-2"
                    type="button"
                  >
                    {isUpdating ? "Updating..." : "Update Notes"}
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>
                    Created:{" "}
                    {new Date(selectedMessage.created_at).toLocaleString()}
                  </p>
                  <p>
                    Updated:{" "}
                    {new Date(selectedMessage.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setViewDialogOpen(false)}
                type="button"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this message from{" "}
                <span className="font-semibold">{messageToDelete?.name}</span>?
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={isDeleting}
                type="button"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                type="button"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
