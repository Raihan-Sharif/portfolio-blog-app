// src/app/admin/about/components/workshops-manager.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";
import {
  AlertCircle,
  Award,
  Calendar,
  Clock,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  MapPin,
  Plus,
  Presentation,
  Save,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Workshop {
  id: number;
  title: string;
  organizer: string;
  description?: string;
  event_date?: string;
  location?: string;
  event_type?: string;
  certificate_url?: string;
  event_url?: string;
  skills_gained?: string[];
  duration?: string;
  attendees_count?: number;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export default function WorkshopsManager() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    organizer: "",
    description: "",
    event_date: "",
    location: "",
    event_type: "attended",
    certificate_url: "",
    event_url: "",
    skills_gained: "",
    duration: "",
    attendees_count: "",
    display_order: 0,
  });

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const fetchWorkshops = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("workshops")
        .select("*")
        .order("display_order, event_date", { ascending: false });

      if (error) throw error;
      setWorkshops(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      organizer: "",
      description: "",
      event_date: "",
      location: "",
      event_type: "attended",
      certificate_url: "",
      event_url: "",
      skills_gained: "",
      duration: "",
      attendees_count: "",
      display_order: 0,
    });
    setEditingWorkshop(null);
  };

  const handleEdit = (workshop: Workshop) => {
    setEditingWorkshop(workshop);
    setFormData({
      title: workshop.title,
      organizer: workshop.organizer,
      description: workshop.description || "",
      event_date: workshop.event_date || "",
      location: workshop.location || "",
      event_type: workshop.event_type || "attended",
      certificate_url: workshop.certificate_url || "",
      event_url: workshop.event_url || "",
      skills_gained: workshop.skills_gained?.join(", ") || "",
      duration: workshop.duration || "",
      attendees_count: workshop.attendees_count?.toString() || "",
      display_order: workshop.display_order,
    });
    setDialogOpen(true);
  };

  const handleAdd = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      const saveData = {
        ...formData,
        skills_gained: formData.skills_gained
          ? formData.skills_gained
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s)
          : [],
        attendees_count: formData.attendees_count
          ? parseInt(formData.attendees_count)
          : null,
        event_date: formData.event_date || null,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (editingWorkshop) {
        result = await supabase
          .from("workshops")
          .update(saveData)
          .eq("id", editingWorkshop.id);
      } else {
        result = await supabase
          .from("workshops")
          .insert({ ...saveData, is_active: true });
      }

      if (result.error) throw result.error;

      setDialogOpen(false);
      resetForm();
      fetchWorkshops();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: number, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("workshops")
        .update({ is_active: !isActive, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      fetchWorkshops();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this workshop?")) return;

    try {
      const { error } = await supabase.from("workshops").delete().eq("id", id);

      if (error) throw error;
      fetchWorkshops();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getEventTypeColor = (type?: string) => {
    switch (type) {
      case "conducted":
        return "bg-green-100 text-green-800";
      case "organized":
        return "bg-blue-100 text-blue-800";
      case "participated":
        return "bg-purple-100 text-purple-800";
      case "attended":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-destructive/10 text-destructive rounded-md p-4 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Workshops & Events ({workshops.length})
        </h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Workshop
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingWorkshop ? "Edit Workshop" : "Add New Workshop"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Workshop/Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    required
                    placeholder="React Workshop"
                  />
                </div>

                <div>
                  <Label htmlFor="organizer">Organizer *</Label>
                  <Input
                    id="organizer"
                    value={formData.organizer}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        organizer: e.target.value,
                      }))
                    }
                    required
                    placeholder="Organization or Company"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="event_type">Event Type</Label>
                  <Select
                    value={formData.event_type}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, event_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="attended">Attended</SelectItem>
                      <SelectItem value="participated">Participated</SelectItem>
                      <SelectItem value="conducted">Conducted</SelectItem>
                      <SelectItem value="organized">Organized</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="event_date">Event Date</Label>
                  <Input
                    id="event_date"
                    type="date"
                    value={formData.event_date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        event_date: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    placeholder="City, Country or Online"
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        duration: e.target.value,
                      }))
                    }
                    placeholder="2 hours, 1 day, etc."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="attendees_count">Number of Attendees</Label>
                <Input
                  id="attendees_count"
                  type="number"
                  value={formData.attendees_count}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      attendees_count: e.target.value,
                    }))
                  }
                  placeholder="50"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Applicable for organized/conducted events
                </p>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="Workshop description and key topics covered..."
                />
              </div>

              <div>
                <Label htmlFor="skills_gained">Skills Gained</Label>
                <Input
                  id="skills_gained"
                  value={formData.skills_gained}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      skills_gained: e.target.value,
                    }))
                  }
                  placeholder="React Hooks, State Management, Testing (comma separated)"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Separate skills with commas
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="event_url">Event URL</Label>
                  <Input
                    id="event_url"
                    type="url"
                    value={formData.event_url}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        event_url: e.target.value,
                      }))
                    }
                    placeholder="https://event-link.com"
                  />
                </div>

                <div>
                  <Label htmlFor="certificate_url">Certificate URL</Label>
                  <Input
                    id="certificate_url"
                    type="url"
                    value={formData.certificate_url}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        certificate_url: e.target.value,
                      }))
                    }
                    placeholder="https://certificate-link.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      display_order: parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="0"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Lower numbers appear first
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Workshop
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {workshops.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Presentation className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No workshops added yet.</p>
          <p className="text-sm">Click "Add Workshop" to get started.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workshop & Organizer</TableHead>
                <TableHead>Event Details</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workshops.map((workshop) => (
                <TableRow key={workshop.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-semibold">{workshop.title}</div>
                      <div className="text-sm text-primary">
                        {workshop.organizer}
                      </div>
                      {workshop.description && (
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {workshop.description}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1 text-sm">
                      {workshop.event_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(workshop.event_date)}
                        </div>
                      )}
                      {workshop.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {workshop.location}
                        </div>
                      )}
                      {workshop.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {workshop.duration}
                        </div>
                      )}
                      {workshop.attendees_count && (
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {workshop.attendees_count} attendees
                        </div>
                      )}
                      {workshop.skills_gained &&
                        workshop.skills_gained.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {workshop.skills_gained
                              .slice(0, 2)
                              .map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-1 py-0.5 bg-primary/10 text-primary rounded text-xs"
                                >
                                  {skill}
                                </span>
                              ))}
                            {workshop.skills_gained.length > 2 && (
                              <span className="text-xs text-muted-foreground">
                                +{workshop.skills_gained.length - 2} more
                              </span>
                            )}
                          </div>
                        )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getEventTypeColor(
                        workshop.event_type
                      )}`}
                    >
                      {workshop.event_type}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          toggleActive(workshop.id, workshop.is_active)
                        }
                        className="flex items-center gap-1 text-sm"
                      >
                        {workshop.is_active ? (
                          <>
                            <Eye className="w-4 h-4 text-green-600" />
                            <span className="text-green-600">Visible</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400">Hidden</span>
                          </>
                        )}
                      </button>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(workshop)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      {workshop.certificate_url && (
                        <a
                          href={workshop.certificate_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            title="View Certificate"
                          >
                            <Award className="w-4 h-4" />
                          </Button>
                        </a>
                      )}

                      {workshop.event_url && (
                        <a
                          href={workshop.event_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            title="View Event"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </a>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(workshop.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
