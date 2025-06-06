// src/app/admin/about/components/courses-manager.tsx
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
  BookOpen,
  Calendar,
  Clock,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  Plus,
  Save,
  Star,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Course {
  id: number;
  title: string;
  provider: string;
  description?: string;
  completion_date?: string;
  certificate_url?: string;
  course_url?: string;
  duration?: string;
  skills_learned?: string[];
  instructor?: string;
  platform?: string;
  rating?: number;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export default function CoursesManager() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    provider: "",
    description: "",
    completion_date: "",
    certificate_url: "",
    course_url: "",
    duration: "",
    skills_learned: "",
    instructor: "",
    platform: "",
    rating: "",
    display_order: 0,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("display_order, completion_date", { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      provider: "",
      description: "",
      completion_date: "",
      certificate_url: "",
      course_url: "",
      duration: "",
      skills_learned: "",
      instructor: "",
      platform: "",
      rating: "",
      display_order: 0,
    });
    setEditingCourse(null);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      provider: course.provider,
      description: course.description || "",
      completion_date: course.completion_date || "",
      certificate_url: course.certificate_url || "",
      course_url: course.course_url || "",
      duration: course.duration || "",
      skills_learned: course.skills_learned?.join(", ") || "",
      instructor: course.instructor || "",
      platform: course.platform || "",
      rating: course.rating?.toString() || "",
      display_order: course.display_order,
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
        skills_learned: formData.skills_learned
          ? formData.skills_learned
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s)
          : [],
        rating: formData.rating ? parseInt(formData.rating) : null,
        completion_date: formData.completion_date || null,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (editingCourse) {
        result = await supabase
          .from("courses")
          .update(saveData)
          .eq("id", editingCourse.id);
      } else {
        result = await supabase
          .from("courses")
          .insert({ ...saveData, is_active: true });
      }

      if (result.error) throw result.error;

      setDialogOpen(false);
      resetForm();
      fetchCourses();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: number, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("courses")
        .update({ is_active: !isActive, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      fetchCourses();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const { error } = await supabase.from("courses").delete().eq("id", id);

      if (error) throw error;
      fetchCourses();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  const renderStars = (rating?: number) => {
    if (!rating)
      return <span className="text-sm text-muted-foreground">No rating</span>;

    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">({rating}/5)</span>
      </div>
    );
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
          Professional Courses ({courses.length})
        </h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCourse ? "Edit Course" : "Add New Course"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Course Title *</Label>
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
                    placeholder="React Fundamentals"
                  />
                </div>

                <div>
                  <Label htmlFor="provider">Provider *</Label>
                  <Input
                    id="provider"
                    value={formData.provider}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        provider: e.target.value,
                      }))
                    }
                    required
                    placeholder="Udemy, Coursera, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Input
                    id="platform"
                    value={formData.platform}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        platform: e.target.value,
                      }))
                    }
                    placeholder="Online Platform"
                  />
                </div>

                <div>
                  <Label htmlFor="instructor">Instructor</Label>
                  <Input
                    id="instructor"
                    value={formData.instructor}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        instructor: e.target.value,
                      }))
                    }
                    placeholder="Instructor Name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="completion_date">Completion Date</Label>
                  <Input
                    id="completion_date"
                    type="date"
                    value={formData.completion_date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        completion_date: e.target.value,
                      }))
                    }
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
                    placeholder="40 hours, 8 weeks, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="rating">Rating (1-5)</Label>
                  <Select
                    value={formData.rating}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, rating: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No rating</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                    </SelectContent>
                  </Select>
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
                  placeholder="Course description and what you learned..."
                />
              </div>

              <div>
                <Label htmlFor="skills_learned">Skills Learned</Label>
                <Input
                  id="skills_learned"
                  value={formData.skills_learned}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      skills_learned: e.target.value,
                    }))
                  }
                  placeholder="React, JavaScript, Node.js (comma separated)"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Separate skills with commas
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="course_url">Course URL</Label>
                  <Input
                    id="course_url"
                    type="url"
                    value={formData.course_url}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        course_url: e.target.value,
                      }))
                    }
                    placeholder="https://course-link.com"
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
                      Save Course
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No courses added yet.</p>
          <p className="text-sm">Click "Add Course" to get started.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course & Provider</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-semibold">{course.title}</div>
                      <div className="text-sm text-primary">
                        {course.provider}
                      </div>
                      {course.platform && (
                        <div className="text-xs text-muted-foreground">
                          {course.platform}
                        </div>
                      )}
                      {course.instructor && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {course.instructor}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1 text-sm">
                      {course.completion_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Completed: {formatDate(course.completion_date)}
                        </div>
                      )}
                      {course.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Duration: {course.duration}
                        </div>
                      )}
                      {course.skills_learned &&
                        course.skills_learned.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {course.skills_learned
                              .slice(0, 3)
                              .map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-1 py-0.5 bg-primary/10 text-primary rounded text-xs"
                                >
                                  {skill}
                                </span>
                              ))}
                            {course.skills_learned.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{course.skills_learned.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                    </div>
                  </TableCell>

                  <TableCell>{renderStars(course.rating)}</TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          toggleActive(course.id, course.is_active)
                        }
                        className="flex items-center gap-1 text-sm"
                      >
                        {course.is_active ? (
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
                        onClick={() => handleEdit(course)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      {course.certificate_url && (
                        <a
                          href={course.certificate_url}
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

                      {course.course_url && (
                        <a
                          href={course.course_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            title="View Course"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </a>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(course.id)}
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
