"use client";

import AdminLayout from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/client";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Code, 
  Database, 
  Cloud, 
  Palette, 
  Star,
  Zap,
  Activity,
  Search,
  Filter,
  Grid3X3,
  List,
  Eye,
  EyeOff,
  TrendingUp,
  Award,
  Sparkles,
  Target
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSkillIcon } from "@/lib/skill-icons";
import { toast } from "sonner";

interface Skill {
  id: number;
  name: string;
  category: string;
  proficiency: number;
  icon?: string;
  show_percentage: boolean;
  created_at: string;
}

const SKILL_CATEGORIES = [
  { name: 'Frontend', icon: Code, color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-50 dark:bg-blue-950' },
  { name: 'Backend', icon: Database, color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-50 dark:bg-green-950' },
  { name: 'Database', icon: Database, color: 'from-purple-500 to-violet-500', bgColor: 'bg-purple-50 dark:bg-purple-950' },
  { name: 'DevOps', icon: Cloud, color: 'from-orange-500 to-red-500', bgColor: 'bg-orange-50 dark:bg-orange-950' },
  { name: 'Infrastructure', icon: Cloud, color: 'from-gray-500 to-slate-500', bgColor: 'bg-gray-50 dark:bg-gray-950' },
  { name: 'Mobile', icon: Code, color: 'from-pink-500 to-rose-500', bgColor: 'bg-pink-50 dark:bg-pink-950' },
  { name: 'Tools', icon: Zap, color: 'from-yellow-500 to-amber-500', bgColor: 'bg-yellow-50 dark:bg-yellow-950' },
  { name: 'Design', icon: Palette, color: 'from-indigo-500 to-blue-500', bgColor: 'bg-indigo-50 dark:bg-indigo-950' },
  { name: 'Other', icon: Star, color: 'from-teal-500 to-cyan-500', bgColor: 'bg-teal-50 dark:bg-teal-950' },
];

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showPercentageFilter, setShowPercentageFilter] = useState<string>('');
  const [isTogglingGlobal, setIsTogglingGlobal] = useState(false);
  
  const [newSkill, setNewSkill] = useState({
    name: '',
    category: '',
    proficiency: 70,
    icon: '',
    show_percentage: true
  });

  const supabase = createClient();

  const fetchSkills = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('category', { ascending: true })
        .order('proficiency', { ascending: false });

      if (error) {
        console.error('Error fetching skills:', error);
        toast.error('Failed to fetch skills');
        return;
      }

      setSkills(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while fetching skills');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const handleCreateSkill = async () => {
    if (!newSkill.name.trim() || !newSkill.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('skills')
        .insert([{
          name: newSkill.name.trim(),
          category: newSkill.category,
          proficiency: newSkill.proficiency,
          icon: newSkill.icon.trim() || null,
          show_percentage: newSkill.show_percentage
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating skill:', error);
        toast.error('Failed to create skill');
        return;
      }

      setSkills([...skills, data]);
      setShowAddForm(false);
      setNewSkill({
        name: '',
        category: '',
        proficiency: 70,
        icon: '',
        show_percentage: true
      });
      toast.success('Skill created successfully! 🎉');
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while creating skill');
    }
  };

  const handleUpdateSkill = async (skill: Skill) => {
    if (!skill.name.trim() || !skill.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('skills')
        .update({
          name: skill.name.trim(),
          category: skill.category,
          proficiency: skill.proficiency,
          icon: skill.icon?.trim() || null,
          show_percentage: skill.show_percentage
        })
        .eq('id', skill.id);

      if (error) {
        console.error('Error updating skill:', error);
        toast.error('Failed to update skill');
        return;
      }

      setSkills(skills.map(s => s.id === skill.id ? skill : s));
      setEditingSkill(null);
      toast.success('Skill updated successfully! ✨');
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while updating skill');
    }
  };

  const handleToggleAllPercentages = async () => {
    if (skills.length === 0) return;

    try {
      setIsTogglingGlobal(true);
      
      const { error } = await supabase
        .from('skills')
        .update({ show_percentage: true })
        .neq('id', 0); // Update all skills

      if (error) {
        console.error('Error updating all skills:', error);
        toast.error('Failed to show all percentages');
        return;
      }

      setSkills(skills.map(skill => ({ ...skill, show_percentage: true })));
      toast.success('All skill percentages are now visible! 👁️');
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while updating skills');
    } finally {
      setIsTogglingGlobal(false);
    }
  };

  const handleHideAllPercentages = async () => {
    if (skills.length === 0) return;

    try {
      setIsTogglingGlobal(true);
      
      const { error } = await supabase
        .from('skills')
        .update({ show_percentage: false })
        .neq('id', 0); // Update all skills

      if (error) {
        console.error('Error updating all skills:', error);
        toast.error('Failed to hide all percentages');
        return;
      }

      setSkills(skills.map(skill => ({ ...skill, show_percentage: false })));
      toast.success('All skill percentages are now hidden! 🔒');
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while updating skills');
    } finally {
      setIsTogglingGlobal(false);
    }
  };

  const handleDeleteSkill = async (skillId: number) => {
    if (!confirm('Are you sure you want to delete this skill? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', skillId);

      if (error) {
        console.error('Error deleting skill:', error);
        toast.error('Failed to delete skill');
        return;
      }

      setSkills(skills.filter(s => s.id !== skillId));
      toast.success('Skill deleted successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while deleting skill');
    }
  };

  const getCategoryInfo = (category: string) => {
    return SKILL_CATEGORIES.find(cat => cat.name === category) || SKILL_CATEGORIES[SKILL_CATEGORIES.length - 1];
  };

  const getProficiencyLevel = (proficiency: number) => {
    if (proficiency >= 90) return { level: 'Master', color: 'text-purple-600 dark:text-purple-400', icon: Award };
    if (proficiency >= 75) return { level: 'Expert', color: 'text-blue-600 dark:text-blue-400', icon: Target };
    if (proficiency >= 60) return { level: 'Advanced', color: 'text-green-600 dark:text-green-400', icon: TrendingUp };
    if (proficiency >= 40) return { level: 'Intermediate', color: 'text-yellow-600 dark:text-yellow-400', icon: Zap };
    return { level: 'Beginner', color: 'text-gray-600 dark:text-gray-400', icon: Sparkles };
  };

  // Filter skills based on search and filters
  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || skill.category === selectedCategory;
    const matchesPercentage = !showPercentageFilter || 
                             (showPercentageFilter === 'shown' && skill.show_percentage) ||
                             (showPercentageFilter === 'hidden' && !skill.show_percentage);
    
    return matchesSearch && matchesCategory && matchesPercentage;
  });

  const groupedSkills = filteredSkills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const stats = {
    total: skills.length,
    categories: new Set(skills.map(s => s.category)).size,
    withPercentage: skills.filter(s => s.show_percentage).length,
    avgProficiency: Math.round(skills.reduce((sum, skill) => sum + skill.proficiency, 0) / skills.length) || 0,
    masterLevel: skills.filter(s => s.proficiency >= 90).length,
    expertLevel: skills.filter(s => s.proficiency >= 75).length
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground text-lg">Loading your skills...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950 p-8 border border-slate-200/60 dark:border-slate-700/60">
          <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800/40 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.02))]"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                    <Code className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-700 to-purple-600 dark:from-white dark:via-blue-300 dark:to-purple-400 bg-clip-text text-transparent">
                      Skills Management
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                      Showcase your expertise with style and precision
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => setShowAddForm(true)}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add New Skill
                </Button>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleToggleAllPercentages}
                      disabled={isTogglingGlobal || skills.length === 0}
                      className="bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-green-200 text-green-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isTogglingGlobal ? (
                        <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <Eye className="w-4 h-4 mr-2" />
                      )}
                      {isTogglingGlobal ? 'Updating...' : 'Show All %'}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleHideAllPercentages}
                      disabled={isTogglingGlobal || skills.length === 0}
                      className="bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 border-red-200 text-red-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isTogglingGlobal ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <EyeOff className="w-4 h-4 mr-2" />
                      )}
                      {isTogglingGlobal ? 'Updating...' : 'Hide All %'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total Skills', value: stats.total, icon: Activity, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-950' },
            { label: 'Categories', value: stats.categories, icon: Star, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50 dark:bg-purple-950' },
            { label: 'With %', value: stats.withPercentage, icon: Eye, color: 'from-green-500 to-green-600', bg: 'bg-green-50 dark:bg-green-950' },
            { label: 'Avg Level', value: `${stats.avgProficiency}%`, icon: TrendingUp, color: 'from-orange-500 to-orange-600', bg: 'bg-orange-50 dark:bg-orange-950' },
            { label: 'Masters', value: stats.masterLevel, icon: Award, color: 'from-yellow-500 to-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950' },
            { label: 'Experts', value: stats.expertLevel, icon: Target, color: 'from-pink-500 to-pink-600', bg: 'bg-pink-50 dark:bg-pink-950' },
          ].map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`border-0 shadow-xl ${stat.bg} hover:shadow-2xl transition-all duration-300 hover:scale-105`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Enhanced Filters & Search */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search skills or categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <Select value={selectedCategory || "all"} onValueChange={(value) => setSelectedCategory(value === "all" ? "" : value)}>
                <SelectTrigger className="w-full lg:w-48 bg-white/80 dark:bg-slate-800/80">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {SKILL_CATEGORIES.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <SelectItem key={category.name} value={category.name}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4" />
                          {category.name}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              <Select value={showPercentageFilter || "all"} onValueChange={(value) => setShowPercentageFilter(value === "all" ? "" : value)}>
                <SelectTrigger className="w-full lg:w-48 bg-white/80 dark:bg-slate-800/80">
                  <Eye className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Percentage Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  <SelectItem value="shown">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Shows Percentage
                    </div>
                  </SelectItem>
                  <SelectItem value="hidden">
                    <div className="flex items-center gap-2">
                      <EyeOff className="w-4 h-4" />
                      Hides Percentage
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Add Skill Modal */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowAddForm(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl"
              >
                <Card className="border-0 shadow-2xl bg-white dark:bg-slate-900">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                          <Plus className="w-5 h-5 text-white" />
                        </div>
                        <CardTitle className="text-2xl">Add New Skill</CardTitle>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowAddForm(false)}
                        className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">Skill Name *</Label>
                        <Input
                          id="name"
                          value={newSkill.name}
                          onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                          placeholder="e.g. React, Node.js, Python"
                          className="border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
                        <Select
                          value={newSkill.category || "placeholder"}
                          onValueChange={(value) => setNewSkill({...newSkill, category: value === "placeholder" ? "" : value})}
                        >
                          <SelectTrigger className="border-slate-200 dark:border-slate-700 focus:border-blue-500">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="placeholder" disabled>Select category</SelectItem>
                            {SKILL_CATEGORIES.map((category) => {
                              const IconComponent = category.icon;
                              return (
                                <SelectItem key={category.name} value={category.name}>
                                  <div className="flex items-center gap-2">
                                    <IconComponent className="w-4 h-4" />
                                    {category.name}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">
                          Proficiency Level: <span className="text-blue-600 font-bold">{newSkill.proficiency}%</span>
                        </Label>
                        <div className="space-y-2">
                          <input
                            type="range"
                            min="1"
                            max="100"
                            value={newSkill.proficiency}
                            onChange={(e) => setNewSkill({...newSkill, proficiency: parseInt(e.target.value)})}
                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Beginner</span>
                            <span>Intermediate</span>
                            <span>Advanced</span>
                            <span>Expert</span>
                            <span>Master</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="icon" className="text-sm font-medium">Icon (optional)</Label>
                        <Input
                          id="icon"
                          value={newSkill.icon}
                          onChange={(e) => setNewSkill({...newSkill, icon: e.target.value})}
                          placeholder="🚀 or text"
                          className="border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="show-percentage" className="text-sm font-medium">Show percentage on frontend</Label>
                        <p className="text-xs text-muted-foreground">Control whether to display exact percentage or skill level badge</p>
                      </div>
                      <Switch
                        id="show-percentage"
                        checked={newSkill.show_percentage}
                        onCheckedChange={(checked) => setNewSkill({...newSkill, show_percentage: checked})}
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowAddForm(false)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleCreateSkill}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Create Skill
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skills Display */}
        {Object.keys(groupedSkills).length === 0 ? (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Code className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">No Skills Found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || selectedCategory || showPercentageFilter 
                  ? "No skills match your current filters. Try adjusting your search criteria." 
                  : "Get started by adding your first skill to showcase your expertise."
                }
              </p>
              {!searchTerm && !selectedCategory && !showPercentageFilter && (
                <Button 
                  onClick={() => setShowAddForm(true)}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your First Skill
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedSkills).map(([category, categorySkills]) => {
              const categoryInfo = getCategoryInfo(category);
              const IconComponent = categoryInfo.icon;
              
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className={`border-0 shadow-xl ${categoryInfo.bgColor} overflow-hidden`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl bg-gradient-to-r ${categoryInfo.color} shadow-lg`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-2xl">{category}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {categorySkills.length} skill{categorySkills.length !== 1 ? 's' : ''} • 
                              Avg: {Math.round(categorySkills.reduce((sum, skill) => sum + skill.proficiency, 0) / categorySkills.length)}%
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="px-3 py-1">
                          {categorySkills.length}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className={viewMode === 'grid' 
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
                        : "space-y-3"
                      }>
                        <AnimatePresence>
                          {categorySkills.map((skill, index) => {
                            const proficiencyInfo = getProficiencyLevel(skill.proficiency);
                            const ProficiencyIcon = proficiencyInfo.icon;
                            
                            return (
                              <motion.div
                                key={skill.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.1 }}
                                className="group"
                              >
                                {editingSkill?.id === skill.id ? (
                                  <Card className="border-2 border-blue-500 bg-blue-50/50 dark:bg-blue-950/50 shadow-lg">
                                    <CardContent className="p-4 space-y-4">
                                      <Input
                                        value={editingSkill.name}
                                        onChange={(e) => setEditingSkill({...editingSkill, name: e.target.value})}
                                        className="font-semibold border-blue-200 focus:border-blue-500"
                                        placeholder="Skill name"
                                      />
                                      
                                      <Select
                                        value={editingSkill.category}
                                        onValueChange={(value) => setEditingSkill({...editingSkill, category: value})}
                                      >
                                        <SelectTrigger className="border-blue-200 focus:border-blue-500">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {SKILL_CATEGORIES.map((cat) => {
                                            const CatIcon = cat.icon;
                                            return (
                                              <SelectItem key={cat.name} value={cat.name}>
                                                <div className="flex items-center gap-2">
                                                  <CatIcon className="w-4 h-4" />
                                                  {cat.name}
                                                </div>
                                              </SelectItem>
                                            );
                                          })}
                                        </SelectContent>
                                      </Select>
                                      
                                      <div className="space-y-2">
                                        <Label className="text-xs font-medium">
                                          Proficiency: <span className="text-blue-600 font-bold">{editingSkill.proficiency}%</span>
                                        </Label>
                                        <input
                                          type="range"
                                          min="1"
                                          max="100"
                                          value={editingSkill.proficiency}
                                          onChange={(e) => setEditingSkill({...editingSkill, proficiency: parseInt(e.target.value)})}
                                          className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                        />
                                      </div>
                                      
                                      <Input
                                        value={editingSkill.icon || ''}
                                        onChange={(e) => setEditingSkill({...editingSkill, icon: e.target.value})}
                                        placeholder="Icon"
                                        className="text-sm border-blue-200 focus:border-blue-500"
                                      />
                                      
                                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                        <Label className="text-xs font-medium">Show percentage</Label>
                                        <Switch
                                          checked={editingSkill.show_percentage}
                                          onCheckedChange={(checked) => setEditingSkill({...editingSkill, show_percentage: checked})}
                                        />
                                      </div>
                                      
                                      <div className="flex justify-end gap-2">
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          onClick={() => setEditingSkill(null)}
                                        >
                                          <X className="w-3 h-3" />
                                        </Button>
                                        <Button 
                                          size="sm" 
                                          onClick={() => handleUpdateSkill(editingSkill)}
                                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                                        >
                                          <Save className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ) : (
                                  <Card className={`h-full transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                                    viewMode === 'list' ? 'hover:bg-slate-50 dark:hover:bg-slate-800' : ''
                                  } group-hover:border-blue-300 dark:group-hover:border-blue-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm`}>
                                    <CardContent className={viewMode === 'list' ? "p-4" : "p-6"}>
                                      <div className={`flex ${viewMode === 'list' ? 'items-center gap-4' : 'flex-col gap-4'}`}>
                                        {/* Skill Header */}
                                        <div className={`flex items-start ${viewMode === 'list' ? 'gap-3 flex-1' : 'justify-between w-full'}`}>
                                          <div className="flex items-center gap-3">
                                            <div className="text-2xl">{getSkillIcon(skill.name, skill.icon, skill.category)}</div>
                                            <div className={viewMode === 'list' ? '' : 'text-center'}>
                                              <h4 className="font-bold text-lg">{skill.name}</h4>
                                              <p className="text-xs text-muted-foreground">{skill.category}</p>
                                            </div>
                                          </div>
                                          
                                          {viewMode === 'grid' && (
                                            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-1">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setEditingSkill(skill)}
                                                className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                                              >
                                                <Edit className="w-3 h-3" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteSkill(skill.id)}
                                                className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900 text-red-600"
                                              >
                                                <Trash2 className="w-3 h-3" />
                                              </Button>
                                            </div>
                                          )}
                                        </div>

                                        {/* Skill Content */}
                                        <div className={`space-y-3 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                                          <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-muted-foreground">
                                              {skill.show_percentage ? 'Proficiency' : 'Level'}
                                            </span>
                                            {skill.show_percentage ? (
                                              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                {skill.proficiency}%
                                              </span>
                                            ) : (
                                              <Badge
                                                variant="secondary"
                                                className={`${proficiencyInfo.color} bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border border-current/20 font-semibold px-3 py-1`}
                                              >
                                                <div className="flex items-center gap-1.5">
                                                  <ProficiencyIcon className="w-3 h-3" />
                                                  {proficiencyInfo.level}
                                                </div>
                                              </Badge>
                                            )}
                                          </div>

                                          {/* Progress Bar */}
                                          <div className="relative">
                                            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                              <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${skill.proficiency}%` }}
                                                transition={{ duration: 1, delay: index * 0.1 }}
                                                className={`h-full bg-gradient-to-r ${categoryInfo.color} rounded-full relative overflow-hidden`}
                                              >
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                                              </motion.div>
                                            </div>
                                          </div>

                                          {/* Status Badges */}
                                          <div className="flex items-center justify-between pt-2">
                                            <Badge 
                                              variant={skill.show_percentage ? "default" : "secondary"}
                                              className="text-xs px-2 py-0.5"
                                            >
                                              <div className="flex items-center gap-1">
                                                {skill.show_percentage ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                                {skill.show_percentage ? "Shows %" : "Hidden %"}
                                              </div>
                                            </Badge>
                                            
                                            {viewMode === 'list' && (
                                              <div className="flex gap-1">
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => setEditingSkill(skill)}
                                                  className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                                                >
                                                  <Edit className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => handleDeleteSkill(skill.id)}
                                                  className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900 text-red-600"
                                                >
                                                  <Trash2 className="w-3 h-3" />
                                                </Button>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                )}
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}