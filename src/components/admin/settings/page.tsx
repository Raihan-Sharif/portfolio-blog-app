"use client";

import AdminLayout from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/lib/supabase/client";
import { AlertCircle, Palette, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ThemeSettings {
  id: number;
  name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  text_color: string;
  background_color: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export default function SettingsPage() {
  const [themes, setThemes] = useState<ThemeSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeSettings | null>(
    null
  );
  const [formState, setFormState] = useState({
    name: "",
    primary_color: "#000000",
    secondary_color: "#666666",
    accent_color: "#3b82f6",
    text_color: "#0f172a",
    background_color: "#ffffff",
    is_default: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [themeToDelete, setThemeToDelete] = useState<ThemeSettings | null>(
    null
  );

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("theme_settings")
        .select("*")
        .order("created_at");

      if (error) {
        throw error;
      }

      setThemes(data || []);
    } catch (err: any) {
      console.error("Error fetching themes:", err);
      setError(err.message || "Failed to fetch themes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditTheme = (theme: ThemeSettings) => {
    setSelectedTheme(theme);
    setFormState({
      name: theme.name,
      primary_color: theme.primary_color,
      secondary_color: theme.secondary_color,
      accent_color: theme.accent_color,
      text_color: theme.text_color,
      background_color: theme.background_color,
      is_default: theme.is_default,
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleNewTheme = () => {
    setSelectedTheme(null);
    setFormState({
      name: "",
      primary_color: "#000000",
      secondary_color: "#666666",
      accent_color: "#3b82f6",
      text_color: "#0f172a",
      background_color: "#ffffff",
      is_default: false,
    });
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (theme: ThemeSettings) => {
    setThemeToDelete(theme);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!themeToDelete) return;

    try {
      const { error } = await supabase
        .from("theme_settings")
        .delete()
        .eq("id", themeToDelete.id);

      if (error) {
        throw error;
      }

      // Remove theme from state
      setThemes((prev) => prev.filter((t) => t.id !== themeToDelete.id));
      setIsDeleteDialogOpen(false);
    } catch (err: any) {
      console.error("Error deleting theme:", err);
      alert("Failed to delete theme. Please try again.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggleChange = (checked: boolean) => {
    setFormState((prev) => ({
      ...prev,
      is_default: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSaving(true);

      const {
        name,
        primary_color,
        secondary_color,
        accent_color,
        text_color,
        background_color,
        is_default,
      } = formState;

      if (!name) {
        throw new Error("Theme name is required");
      }

      // If setting as default, unset all other themes
      if (is_default) {
        await supabase
          .from("theme_settings")
          .update({ is_default: false })
          .neq("id", selectedTheme?.id || 0);
      }

      if (isEditMode && selectedTheme) {
        // Update existing theme
        const { error } = await supabase
          .from("theme_settings")
          .update({
            name,
            primary_color,
            secondary_color,
            accent_color,
            text_color,
            background_color,
            is_default,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedTheme.id);

        if (error) {
          throw error;
        }
      } else {
        // Create new theme
        const { error } = await supabase.from("theme_settings").insert({
          name,
          primary_color,
          secondary_color,
          accent_color,
          text_color,
          background_color,
          is_default,
        });

        if (error) {
          throw error;
        }
      }

      // Fetch updated themes
      await fetchThemes();
      setIsDialogOpen(false);
    } catch (err: any) {
      console.error("Error saving theme:", err);
      alert(err.message || "Failed to save theme. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderColorPreview = (theme: ThemeSettings) => {
    return (
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded-full border"
          style={{ backgroundColor: theme.primary_color }}
          title="Primary"
        ></div>
        <div
          className="w-4 h-4 rounded-full border"
          style={{ backgroundColor: theme.secondary_color }}
          title="Secondary"
        ></div>
        <div
          className="w-4 h-4 rounded-full border"
          style={{ backgroundColor: theme.accent_color }}
          title="Accent"
        ></div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="container px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Theme Settings</h1>

          <Button className="gap-2" onClick={handleNewTheme}>
            <Plus size={18} />
            New Theme
          </Button>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive rounded-md p-4 mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Theme Name</TableHead>
                  <TableHead>Colors</TableHead>
                  <TableHead>Default</TableHead>
                  <TableHead>Created</TableHead>
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
                ) : themes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No themes found. Create your first theme.
                    </TableCell>
                  </TableRow>
                ) : (
                  themes.map((theme) => (
                    <TableRow key={theme.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Palette
                            size={16}
                            className="text-muted-foreground"
                          />
                          {theme.name}
                        </div>
                      </TableCell>
                      <TableCell>{renderColorPreview(theme)}</TableCell>
                      <TableCell>
                        {theme.is_default ? (
                          <span className="text-green-600 font-medium">
                            Default
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(theme.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditTheme(theme)}
                          >
                            <Palette size={16} />
                          </Button>
                          {!theme.is_default && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(theme)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Theme Form Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {isEditMode ? "Edit Theme" : "Create New Theme"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Theme Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formState.name}
                  onChange={handleChange}
                  placeholder="e.g., Dark Blue"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <div className="flex gap-2">
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: formState.primary_color }}
                    ></div>
                    <Input
                      id="primary_color"
                      name="primary_color"
                      value={formState.primary_color}
                      onChange={handleChange}
                      type="color"
                      className="h-8 w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary_color">Secondary Color</Label>
                  <div className="flex gap-2">
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: formState.secondary_color }}
                    ></div>
                    <Input
                      id="secondary_color"
                      name="secondary_color"
                      value={formState.secondary_color}
                      onChange={handleChange}
                      type="color"
                      className="h-8 w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accent_color">Accent Color</Label>
                  <div className="flex gap-2">
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: formState.accent_color }}
                    ></div>
                    <Input
                      id="accent_color"
                      name="accent_color"
                      value={formState.accent_color}
                      onChange={handleChange}
                      type="color"
                      className="h-8 w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="text_color">Text Color</Label>
                  <div className="flex gap-2">
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: formState.text_color }}
                    ></div>
                    <Input
                      id="text_color"
                      name="text_color"
                      value={formState.text_color}
                      onChange={handleChange}
                      type="color"
                      className="h-8 w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="background_color">Background Color</Label>
                  <div className="flex gap-2">
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: formState.background_color }}
                    ></div>
                    <Input
                      id="background_color"
                      name="background_color"
                      value={formState.background_color}
                      onChange={handleChange}
                      type="color"
                      className="h-8 w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_default"
                  checked={formState.is_default}
                  onCheckedChange={handleToggleChange}
                />
                <Label htmlFor="is_default">Set as default theme</Label>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="gap-2">
                  <Save size={16} />
                  {isSaving ? "Saving..." : "Save Theme"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <p>
              Are you sure you want to delete the theme{" "}
              <span className="font-semibold">{themeToDelete?.name}</span>? This
              action cannot be undone.
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
