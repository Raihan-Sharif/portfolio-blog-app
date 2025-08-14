// src/app/admin/about/page.tsx
"use client";

import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase/client";
import { AlertCircle, Plus, Settings, User } from "lucide-react";
import { useEffect, useState } from "react";
import AboutSettingsForm from "./components/about-settings-form";
import AchievementsManager from "./components/achievements-manager";
import CertificationsManager from "./components/certifications-manager";
import CoursesManager from "./components/courses-manager";
import EducationManager from "./components/education-manager";
import ExperienceManager from "./components/experience-manager";
import WorkshopsManager from "./components/workshops-manager";

export default function AdminAboutPage() {
  const [aboutSettings, setAboutSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("settings");

  useEffect(() => {
    fetchAboutSettings();
  }, []);

  const fetchAboutSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("about_settings")
        .select("*")
        .eq("is_active", true)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      setAboutSettings(data);
    } catch (err: any) {
      console.error("Error fetching about settings:", err);
      setError(err.message || "Failed to fetch about settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsUpdate = () => {
    fetchAboutSettings();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <User className="w-8 h-8 text-primary" />
              About Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your professional profile, experience, education, and
              achievements
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive rounded-md p-4 mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="experience" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Experience
            </TabsTrigger>
            <TabsTrigger value="education" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Education
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="workshops" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Workshops
            </TabsTrigger>
            <TabsTrigger value="certifications" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Certifications
            </TabsTrigger>
            <TabsTrigger
              value="achievements"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  About Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AboutSettingsForm
                  initialData={aboutSettings}
                  onUpdate={handleSettingsUpdate}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="experience">
            <Card>
              <CardHeader>
                <CardTitle>Professional Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <ExperienceManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="education">
            <Card>
              <CardHeader>
                <CardTitle>Education</CardTitle>
              </CardHeader>
              <CardContent>
                <EducationManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle>Professional Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <CoursesManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workshops">
            <Card>
              <CardHeader>
                <CardTitle>Workshops & Events</CardTitle>
              </CardHeader>
              <CardContent>
                <WorkshopsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certifications">
            <Card>
              <CardHeader>
                <CardTitle>Professional Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <CertificationsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle>Achievements & Awards</CardTitle>
              </CardHeader>
              <CardContent>
                <AchievementsManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
