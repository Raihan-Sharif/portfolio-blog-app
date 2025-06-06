// src/app/admin/about/components/education-manager.tsx
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
import { Switch } from "@/components/ui/switch";
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
  Book,
  Calendar,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  GraduationCap,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Education {
  id: number;
  institution: string;
  degree: string;
  field_of_study?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  grade_gpa?: string;
  institution_logo_url?: string;
  institution_url?: string;
  degree_type?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export default function EducationManager() {
  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    institution: "",
    degree: "",
    field_of_study: "",
    start_date: "",
    end_date: "",
    is_current: false,
    description: "",
    grade_gpa: "",
    institution_logo_url: "",
    institution_url: "",
    degree_type: "bachelor",
    display_order: 0,
  });

  useEffect(() => {
    fetchEducation();
  }, []);

  const fetchEducation = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("education")
        .select("*")
        .order("display_order, start_date", { ascending: false });

      if (error) throw error;
      setEducation(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      institution: "",
      degree: "",
      field_of_study: "",
      start_date: "",
      end_date: "",
      is_current: false,
      description: "",
      grade_gpa: "",
      institution_logo_url: "",
      institution_url: "",
      degree_type: "bachelor",
      display_order: 0,
    });
    setEditingEducation(null);
  };

  const handleEdit = (edu: Education) => {
    setEditingEducation(edu);
    setFormData({
      institution: edu.institution,
      degree: edu.degree,
      field_of_study: edu.field_of_study || "",
      start_date: edu.start_date,
      end_date: edu.end_date || "",
      is_current: edu.is_current,
      description: edu.description || "",
      grade_gpa: edu.grade_gpa || "",
      institution_logo_url: edu.institution_logo_url || "",
      institution_url: edu.institution_url || "",
      degree_type: edu.degree_type || "bachelor",
      display_order: edu.display_order,
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
        end_date: formData.is_current ? null : formData.end_date || null,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (editingEducation) {
        result = await supabase
          .from("education")
          .update(saveData)
          .eq("id", editingEducation.id);
      } else {
        result = await supabase
          .from("education")
          .insert({ ...saveData, is_active: true });
      }

      if (result.error) throw result.error;

      setDialogOpen(false);
      resetForm();
      fetchEducation();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: number, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("education")
        .update({ is_active: !isActive, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      fetchEducation();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this education record?"))
      return;

    try {
      const { error } = await supabase.from("education").delete().eq("id", id);

      if (error) throw error;
      fetchEducation();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  const getDegreeTypeIcon = (type: string) => {
    switch (type) {
      case "bachelor":
        return <GraduationCap className="w-4 h-4" />;
      case "master":
        return <Book className="w-4 h-4" />;
      case "phd":
        return <GraduationCap className="w-4 h-4" />;
      case "diploma":
        return <Book className="w-4 h-4" />;
      case "certificate":
        return <Book className="w-4 h-4" />;
      default:
        return <Book className="w-4 h-4" />;
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
          Education ({education.length})
        </h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Education
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEducation ? "Edit Education" : "Add New Education"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="institution">Institution Name *</Label>
                  <Input
                    id="institution"
                    value={formData.institution}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        institution: e.target.value,
                      }))
                    }
                    required
                    placeholder="University Name"
                  />
                </div>

                <div>
                  <Label htmlFor="degree">Degree *</Label>
                  <Input
                    id="degree"
                    value={formData.degree}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        degree: e.target.value,
                      }))
                    }
                    required
                    placeholder="Bachelor of Science"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="degree_type">Degree Type</Label>
                  <Select
                    value={formData.degree_type}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, degree_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bachelor">Bachelor's</SelectItem>
                      <SelectItem value="master">Master's</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                      <SelectItem value="diploma">Diploma</SelectItem>
                      <SelectItem value="certificate">Certificate</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="field_of_study">Field of Study</Label>
                  <Input
                    id="field_of_study"
                    value={formData.field_of_study}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        field_of_study: e.target.value,
                      }))
                    }
                    placeholder="Computer Science"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        start_date: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        end_date: e.target.value,
                      }))
                    }
                    disabled={formData.is_current}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_current"
                  checked={formData.is_current}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      is_current: checked,
                      end_date: checked ? "" : prev.end_date,
                    }))
                  }
                />
                <Label htmlFor="is_current">Currently studying here</Label>
              </div>

              <div>
                <Label htmlFor="grade_gpa">Grade/GPA</Label>
                <Input
                  id="grade_gpa"
                  value={formData.grade_gpa}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      grade_gpa: e.target.value,
                    }))
                  }
                  placeholder="3.8/4.0 or First Class"
                />
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
                  placeholder="Relevant coursework, thesis, activities..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="institution_logo_url">
                    Institution Logo URL
                  </Label>
                  <Input
                    id="institution_logo_url"
                    type="url"
                    value={formData.institution_logo_url}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        institution_logo_url: e.target.value,
                      }))
                    }
                    placeholder="https://university.edu/logo.png"
                  />
                </div>

                <div>
                  <Label htmlFor="institution_url">Institution Website</Label>
                  <Input
                    id="institution_url"
                    type="url"
                    value={formData.institution_url}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        institution_url: e.target.value,
                      }))
                    }
                    placeholder="https://university.edu"
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
                      Save Education
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {education.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No education records added yet.</p>
          <p className="text-sm">Click "Add Education" to get started.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Institution & Degree</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {education.map((edu) => (
                <TableRow key={edu.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {edu.institution_logo_url ? (
                        <div className="w-10 h-10 rounded border overflow-hidden">
                          <Image
                            src={edu.institution_logo_url}
                            alt={`${edu.institution} logo`}
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded border bg-muted flex items-center justify-center">
                          {getDegreeTypeIcon(edu.degree_type || "bachelor")}
                        </div>
                      )}

                      <div>
                        <div className="font-semibold">{edu.degree}</div>
                        {edu.field_of_study && (
                          <div className="text-sm text-primary">
                            {edu.field_of_study}
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          {edu.institution_url ? (
                            <a
                              href={edu.institution_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              {edu.institution}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            edu.institution
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="w-3 h-3" />
                      {formatDate(edu.start_date)} -{" "}
                      {edu.is_current
                        ? "Present"
                        : edu.end_date
                        ? formatDate(edu.end_date)
                        : "N/A"}
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="text-sm">{edu.grade_gpa || "N/A"}</span>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActive(edu.id, edu.is_active)}
                        className="flex items-center gap-1 text-sm"
                      >
                        {edu.is_active ? (
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
                        onClick={() => handleEdit(edu)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(edu.id)}
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
