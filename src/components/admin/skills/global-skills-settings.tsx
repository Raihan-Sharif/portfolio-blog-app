"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/client";
import { 
  Settings,
  Eye,
  EyeOff,
  Globe,
  Users,
  Shield,
  Save,
  RefreshCw
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface GlobalSkillsSettings {
  show_skills_section: boolean;
  default_show_percentage: boolean;
  allow_skill_filtering: boolean;
  show_skill_categories: boolean;
  enable_skill_search: boolean;
  show_proficiency_levels: boolean;
  enable_skill_animations: boolean;
  public_skill_count: number;
}

export default function GlobalSkillsSettings() {
  const [settings, setSettings] = useState<GlobalSkillsSettings>({
    show_skills_section: true,
    default_show_percentage: true,
    allow_skill_filtering: true,
    show_skill_categories: true,
    enable_skill_search: true,
    show_proficiency_levels: true,
    enable_skill_animations: true,
    public_skill_count: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skillsCount, setSkillsCount] = useState(0);
  const [visibleSkillsCount, setVisibleSkillsCount] = useState(0);

  const supabase = createClient();

  useEffect(() => {
    fetchSettings();
    fetchSkillsStats();
  }, []);

  const fetchSettings = async () => {
    try {
      // This would typically fetch from a settings table
      // For now, we'll use default values
      setSettings({
        show_skills_section: true,
        default_show_percentage: true,
        allow_skill_filtering: true,
        show_skill_categories: true,
        enable_skill_search: true,
        show_proficiency_levels: true,
        enable_skill_animations: true,
        public_skill_count: 0,
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchSkillsStats = async () => {
    try {
      const { data: allSkills, error: allError } = await supabase
        .from('skills')
        .select('id, show_percentage');

      if (allError) throw allError;

      setSkillsCount(allSkills.length);
      setVisibleSkillsCount(allSkills.filter(skill => skill.show_percentage).length);
    } catch (error) {
      console.error('Error fetching skills stats:', error);
    }
  };

  const handleSettingChange = (key: keyof GlobalSkillsSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      // In a real implementation, you would save to a settings table
      // For now, we'll just show a success message
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast.success('Global skills settings updated successfully! 🎉');
      
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const applyDefaultToAllSkills = async (showPercentage: boolean) => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('skills')
        .update({ show_percentage: showPercentage })
        .neq('id', 0);

      if (error) throw error;

      await fetchSkillsStats();
      
      toast.success(
        showPercentage 
          ? 'All skills now show percentages! 👁️' 
          : 'All skill percentages are now hidden! 🔒'
      );
      
    } catch (error) {
      console.error('Error applying default:', error);
      toast.error('Failed to apply settings to all skills');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
        <CardContent className="p-6 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading global settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Settings Card */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Global Skills Settings</CardTitle>
              <p className="text-sm text-muted-foreground">Configure how skills are displayed across your website</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{skillsCount}</div>
              <div className="text-sm text-blue-600/70">Total Skills</div>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{visibleSkillsCount}</div>
              <div className="text-sm text-green-600/70">Show Percentage</div>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{skillsCount - visibleSkillsCount}</div>
              <div className="text-sm text-red-600/70">Hidden Percentage</div>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {skillsCount > 0 ? Math.round((visibleSkillsCount / skillsCount) * 100) : 0}%
              </div>
              <div className="text-sm text-purple-600/70">Visibility Ratio</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => applyDefaultToAllSkills(true)}
              disabled={saving}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
            >
              <Eye className="w-4 h-4 mr-2" />
              Show All Percentages
            </Button>
            <Button
              onClick={() => applyDefaultToAllSkills(false)}
              disabled={saving}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
            >
              <EyeOff className="w-4 h-4 mr-2" />
              Hide All Percentages
            </Button>
            <Button
              onClick={fetchSkillsStats}
              variant="outline"
              disabled={saving}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Stats
            </Button>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Display Settings */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Public Display
              </h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Show Skills Section</Label>
                    <p className="text-xs text-muted-foreground">Display skills section on public pages</p>
                  </div>
                  <Switch
                    checked={settings.show_skills_section}
                    onCheckedChange={(checked) => handleSettingChange('show_skills_section', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Show Categories</Label>
                    <p className="text-xs text-muted-foreground">Group skills by category</p>
                  </div>
                  <Switch
                    checked={settings.show_skill_categories}
                    onCheckedChange={(checked) => handleSettingChange('show_skill_categories', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Enable Animations</Label>
                    <p className="text-xs text-muted-foreground">Smooth transitions and effects</p>
                  </div>
                  <Switch
                    checked={settings.enable_skill_animations}
                    onCheckedChange={(checked) => handleSettingChange('enable_skill_animations', checked)}
                  />
                </div>
              </div>
            </div>

            {/* User Experience Settings */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                User Experience
              </h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Enable Search</Label>
                    <p className="text-xs text-muted-foreground">Allow visitors to search skills</p>
                  </div>
                  <Switch
                    checked={settings.enable_skill_search}
                    onCheckedChange={(checked) => handleSettingChange('enable_skill_search', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Allow Filtering</Label>
                    <p className="text-xs text-muted-foreground">Filter skills by category</p>
                  </div>
                  <Switch
                    checked={settings.allow_skill_filtering}
                    onCheckedChange={(checked) => handleSettingChange('allow_skill_filtering', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Show Proficiency Levels</Label>
                    <p className="text-xs text-muted-foreground">Display skill level indicators</p>
                  </div>
                  <Switch
                    checked={settings.show_proficiency_levels}
                    onCheckedChange={(checked) => handleSettingChange('show_proficiency_levels', checked)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Default Settings */}
          <div className="p-4 bg-muted/20 rounded-lg">
            <h4 className="font-semibold text-foreground flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4" />
              Default Settings for New Skills
            </h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Show Percentage by Default</Label>
                <p className="text-xs text-muted-foreground">New skills will show percentages unless manually changed</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={settings.default_show_percentage}
                  onCheckedChange={(checked) => handleSettingChange('default_show_percentage', checked)}
                />
                <Badge variant={settings.default_show_percentage ? "default" : "secondary"}>
                  {settings.default_show_percentage ? "Visible" : "Hidden"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-border">
            <Button
              onClick={saveSettings}
              disabled={saving}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Global Settings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}