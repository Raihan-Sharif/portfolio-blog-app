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
  BadgeCheck,
  Calendar,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Medal,
  Plus,
  Save,
  Star,
  Trash2,
  Trophy,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Achievement {
  id: number;
  title: string;
  description?: string;
  achievement_date?: string;
  organization?: string;
  BadgeCheck_url?: string;
  achievement_url?: string;
  achievement_type?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export default function AchievementsManager() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] =
    useState<Achievement | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    achievement_date: "",
    organization: "",
    BadgeCheck_url: "",
    achievement_url: "",
    achievement_type: "award",
    display_order: 0,
  });

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("display_order, achievement_date", { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      achievement_date: "",
      organization: "",
      BadgeCheck_url: "",
      achievement_url: "",
      achievement_type: "award",
      display_order: 0,
    });
    setEditingAchievement(null);
  };

  const handleEdit = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setFormData({
      title: achievement.title,
      description: achievement.description || "",
      achievement_date: achievement.achievement_date || "",
      organization: achievement.organization || "",
      BadgeCheck_url: achievement.BadgeCheck_url || "",
      achievement_url: achievement.achievement_url || "",
      achievement_type: achievement.achievement_type || "award",
      display_order: achievement.display_order,
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
        achievement_date: formData.achievement_date || null,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (editingAchievement) {
        result = await supabase
          .from("achievements")
          .update(saveData)
          .eq("id", editingAchievement.id);
      } else {
        result = await supabase
          .from("achievements")
          .insert({ ...saveData, is_active: true });
      }

      if (result.error) throw result.error;

      setDialogOpen(false);
      resetForm();
      fetchAchievements();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: number, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("achievements")
        .update({ is_active: !isActive, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      fetchAchievements();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this achievement?")) return;

    try {
      const { error } = await supabase
        .from("achievements")
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchAchievements();
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

  const getAchievementTypeIcon = (type?: string) => {
    switch (type) {
      case "award":
        return <Trophy className="w-4 h-4 text-yellow-600" />;
      case "certification":
        return <BadgeCheck className="w-4 h-4 text-blue-600" />;
      case "recognition":
        return <Star className="w-4 h-4 text-purple-600" />;
      case "publication":
        return <FileText className="w-4 h-4 text-green-600" />;
      default:
        return <Medal className="w-4 h-4 text-gray-600" />;
    }
  };

  const getAchievementTypeColor = (type?: string) => {
    switch (type) {
      case "award":
        return "bg-yellow-100 text-yellow-800";
      case "certification":
        return "bg-blue-100 text-blue-800";
      case "recognition":
        return "bg-purple-100 text-purple-800";
      case "publication":
        return "bg-green-100 text-green-800";
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
          Achievements & Awards ({achievements.length})
        </h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Achievement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAchievement
                  ? "Edit Achievement"
                  : "Add New Achievement"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Achievement Title *</Label>
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
                    placeholder="Best Developer Award"
                  />
                </div>

                <div>
                  <Label htmlFor="achievement_type">Achievement Type</Label>
                  <Select
                    value={formData.achievement_type}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        achievement_type: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="award">Award</SelectItem>
                      <SelectItem value="certification">
                        Certification
                      </SelectItem>
                      <SelectItem value="recognition">Recognition</SelectItem>
                      <SelectItem value="publication">Publication</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="organization">Organization/Institution</Label>
                  <Input
                    id="organization"
                    value={formData.organization}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        organization: e.target.value,
                      }))
                    }
                    placeholder="Company or Institution Name"
                  />
                </div>

                <div>
                  <Label htmlFor="achievement_date">Achievement Date</Label>
                  <Input
                    id="achievement_date"
                    type="date"
                    value={formData.achievement_date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        achievement_date: e.target.value,
                      }))
                    }
                  />
                </div>
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
                  placeholder="Brief description of the achievement and its significance..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="achievement_url">Achievement URL</Label>
                  <Input
                    id="achievement_url"
                    type="url"
                    value={formData.achievement_url}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        achievement_url: e.target.value,
                      }))
                    }
                    placeholder="https://achievement-link.com"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Link to the achievement page or announcement
                  </p>
                </div>

                <div>
                  <Label htmlFor="BadgeCheck_url">BadgeCheck URL</Label>
                  <Input
                    id="BadgeCheck_url"
                    type="url"
                    value={formData.BadgeCheck_url}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        BadgeCheck_url: e.target.value,
                      }))
                    }
                    placeholder="https://BadgeCheck-link.com"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Link to the BadgeCheck or proof document
                  </p>
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
                      Save Achievement
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {achievements.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No achievements added yet.</p>
          <p className="text-sm">Click "Add Achievement" to get started.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Achievement & Organization</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {achievements.map((achievement) => (
                <TableRow key={achievement.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-semibold flex items-center gap-2">
                        {getAchievementTypeIcon(achievement.achievement_type)}
                        {achievement.title}
                      </div>
                      {achievement.organization && (
                        <div className="text-sm text-primary">
                          {achievement.organization}
                        </div>
                      )}
                      {achievement.description && (
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {achievement.description}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getAchievementTypeColor(
                        achievement.achievement_type
                      )}`}
                    >
                      {achievement.achievement_type}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="w-3 h-3" />
                      {formatDate(achievement.achievement_date)}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          toggleActive(achievement.id, achievement.is_active)
                        }
                        className="flex items-center gap-1 text-sm"
                      >
                        {achievement.is_active ? (
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
                        onClick={() => handleEdit(achievement)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      {achievement.BadgeCheck_url && (
                        <a
                          href={achievement.BadgeCheck_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            title="View BadgeCheck"
                          >
                            <Award className="w-4 h-4" />
                          </Button>
                        </a>
                      )}

                      {achievement.achievement_url && (
                        <a
                          href={achievement.achievement_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            title="View Achievement"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </a>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(achievement.id)}
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
