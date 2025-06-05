"use client";

import AdminLayout from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";
import {
  AlertCircle,
  Clock,
  Contact,
  Edit,
  Plus,
  Save,
  Settings,
  Star,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ContactInfo {
  id: number;
  type: string;
  label: string;
  value: string;
  icon?: string;
  is_primary: boolean;
  is_whatsapp: boolean;
  display_order: number;
  is_active: boolean;
}

interface BusinessHours {
  id: number;
  day_of_week: number;
  day_name: string;
  is_open: boolean;
  open_time?: string;
  close_time?: string;
  timezone: string;
  is_active: boolean;
}

interface AvailabilityStatus {
  id: number;
  status: string;
  title: string;
  description: string;
  response_time: string;
  is_current: boolean;
  color_class: string;
  is_active: boolean;
}

const CONTACT_TYPES = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "address", label: "Address" },
  { value: "social", label: "Social Media" },
  { value: "website", label: "Website" },
];

const ICON_OPTIONS = [
  { value: "Mail", label: "Mail" },
  { value: "Phone", label: "Phone" },
  { value: "MessageCircle", label: "Message Circle" },
  { value: "MapPin", label: "Map Pin" },
  { value: "ExternalLink", label: "External Link" },
];

const STATUS_COLORS = [
  { value: "bg-green-500", label: "Green (Available)" },
  { value: "bg-yellow-500", label: "Yellow (Busy)" },
  { value: "bg-red-500", label: "Red (Unavailable)" },
  { value: "bg-blue-500", label: "Blue (Custom)" },
];

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export default function AdminContactManagement() {
  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [availabilityStatuses, setAvailabilityStatuses] = useState<
    AvailabilityStatus[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Contact Info Form
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactInfo | null>(
    null
  );
  const [contactForm, setContactForm] = useState({
    type: "",
    label: "",
    value: "",
    icon: "",
    is_primary: false,
    is_whatsapp: false,
    display_order: 0,
    is_active: true,
  });

  // Business Hours Form
  const [hoursDialogOpen, setHoursDialogOpen] = useState(false);
  const [editingHours, setEditingHours] = useState<BusinessHours | null>(null);
  const [hoursForm, setHoursForm] = useState({
    day_of_week: 1,
    day_name: "",
    is_open: true,
    open_time: "",
    close_time: "",
    timezone: "GMT+6",
    is_active: true,
  });

  // Availability Form
  const [availabilityDialogOpen, setAvailabilityDialogOpen] = useState(false);
  const [editingAvailability, setEditingAvailability] =
    useState<AvailabilityStatus | null>(null);
  const [availabilityForm, setAvailabilityForm] = useState({
    status: "",
    title: "",
    description: "",
    response_time: "",
    is_current: false,
    color_class: "bg-green-500",
    is_active: true,
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [contactRes, hoursRes, availabilityRes] = await Promise.all([
        supabase.from("contact_info").select("*").order("display_order"),
        supabase.from("business_hours").select("*").order("day_of_week"),
        supabase.from("availability_status").select("*").order("created_at"),
      ]);

      if (contactRes.error) throw contactRes.error;
      if (hoursRes.error) throw hoursRes.error;
      if (availabilityRes.error) throw availabilityRes.error;

      setContactInfo(contactRes.data || []);
      setBusinessHours(hoursRes.data || []);
      setAvailabilityStatuses(availabilityRes.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  // Contact Info CRUD
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingContact) {
        const { error } = await supabase
          .from("contact_info")
          .update({
            ...contactForm,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingContact.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("contact_info")
          .insert(contactForm);
        if (error) throw error;
      }

      await fetchAllData();
      setContactDialogOpen(false);
      resetContactForm();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditContact = (contact: ContactInfo) => {
    setEditingContact(contact);
    setContactForm({
      type: contact.type,
      label: contact.label,
      value: contact.value,
      icon: contact.icon || "",
      is_primary: contact.is_primary,
      is_whatsapp: contact.is_whatsapp,
      display_order: contact.display_order,
      is_active: contact.is_active,
    });
    setContactDialogOpen(true);
  };

  const handleDeleteContact = async (id: number) => {
    if (!confirm("Are you sure you want to delete this contact info?")) return;

    try {
      const { error } = await supabase
        .from("contact_info")
        .delete()
        .eq("id", id);
      if (error) throw error;
      await fetchAllData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetContactForm = () => {
    setEditingContact(null);
    setContactForm({
      type: "",
      label: "",
      value: "",
      icon: "",
      is_primary: false,
      is_whatsapp: false,
      display_order: 0,
      is_active: true,
    });
  };

  // Business Hours CRUD
  const handleHoursSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const selectedDay = DAYS_OF_WEEK.find(
        (d) => d.value === parseInt(hoursForm.day_of_week.toString())
      );
      const formData = {
        ...hoursForm,
        day_name: selectedDay?.label || "",
        day_of_week: parseInt(hoursForm.day_of_week.toString()),
      };

      if (editingHours) {
        const { error } = await supabase
          .from("business_hours")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingHours.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("business_hours")
          .insert(formData);
        if (error) throw error;
      }

      await fetchAllData();
      setHoursDialogOpen(false);
      resetHoursForm();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditHours = (hours: BusinessHours) => {
    setEditingHours(hours);
    setHoursForm({
      day_of_week: hours.day_of_week,
      day_name: hours.day_name,
      is_open: hours.is_open,
      open_time: hours.open_time || "",
      close_time: hours.close_time || "",
      timezone: hours.timezone,
      is_active: hours.is_active,
    });
    setHoursDialogOpen(true);
  };

  const handleDeleteHours = async (id: number) => {
    if (!confirm("Are you sure you want to delete this business hour?")) return;

    try {
      const { error } = await supabase
        .from("business_hours")
        .delete()
        .eq("id", id);
      if (error) throw error;
      await fetchAllData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetHoursForm = () => {
    setEditingHours(null);
    setHoursForm({
      day_of_week: 1,
      day_name: "",
      is_open: true,
      open_time: "",
      close_time: "",
      timezone: "GMT+6",
      is_active: true,
    });
  };

  // Availability Status CRUD
  const handleAvailabilitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // If setting as current, unset all others
      if (availabilityForm.is_current) {
        await supabase
          .from("availability_status")
          .update({ is_current: false })
          .neq("id", editingAvailability?.id || 0);
      }

      if (editingAvailability) {
        const { error } = await supabase
          .from("availability_status")
          .update({
            ...availabilityForm,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingAvailability.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("availability_status")
          .insert(availabilityForm);
        if (error) throw error;
      }

      await fetchAllData();
      setAvailabilityDialogOpen(false);
      resetAvailabilityForm();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditAvailability = (availability: AvailabilityStatus) => {
    setEditingAvailability(availability);
    setAvailabilityForm({
      status: availability.status,
      title: availability.title,
      description: availability.description,
      response_time: availability.response_time,
      is_current: availability.is_current,
      color_class: availability.color_class,
      is_active: availability.is_active,
    });
    setAvailabilityDialogOpen(true);
  };

  const handleDeleteAvailability = async (id: number) => {
    if (!confirm("Are you sure you want to delete this availability status?"))
      return;

    try {
      const { error } = await supabase
        .from("availability_status")
        .delete()
        .eq("id", id);
      if (error) throw error;
      await fetchAllData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const setCurrentAvailability = async (id: number) => {
    try {
      // Unset all current statuses
      await supabase
        .from("availability_status")
        .update({ is_current: false })
        .neq("id", 0);

      // Set the selected one as current
      const { error } = await supabase
        .from("availability_status")
        .update({ is_current: true })
        .eq("id", id);

      if (error) throw error;
      await fetchAllData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetAvailabilityForm = () => {
    setEditingAvailability(null);
    setAvailabilityForm({
      status: "",
      title: "",
      description: "",
      response_time: "",
      is_current: false,
      color_class: "bg-green-500",
      is_active: true,
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p>Loading contact management...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Contact Management</h1>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive rounded-md p-4 mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        <Tabs defaultValue="contact-info" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger
              value="contact-info"
              className="flex items-center gap-2"
            >
              <Contact size={16} />
              Contact Info
            </TabsTrigger>
            <TabsTrigger
              value="business-hours"
              className="flex items-center gap-2"
            >
              <Clock size={16} />
              Business Hours
            </TabsTrigger>
            <TabsTrigger
              value="availability"
              className="flex items-center gap-2"
            >
              <Settings size={16} />
              Availability
            </TabsTrigger>
          </TabsList>

          {/* Contact Info Tab */}
          <TabsContent value="contact-info">
            <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold">Contact Information</h2>
                <Dialog
                  open={contactDialogOpen}
                  onOpenChange={setContactDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="gap-2" onClick={resetContactForm}>
                      <Plus size={16} />
                      Add Contact Info
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingContact
                          ? "Edit Contact Info"
                          : "Add Contact Info"}
                      </DialogTitle>
                      <DialogDescription>
                        Add or edit contact information that will be displayed
                        to visitors.
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="type">Type</Label>
                          <Select
                            value={contactForm.type}
                            onValueChange={(value) =>
                              setContactForm((prev) => ({
                                ...prev,
                                type: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {CONTACT_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="icon">Icon</Label>
                          <Select
                            value={contactForm.icon}
                            onValueChange={(value) =>
                              setContactForm((prev) => ({
                                ...prev,
                                icon: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select icon" />
                            </SelectTrigger>
                            <SelectContent>
                              {ICON_OPTIONS.map((icon) => (
                                <SelectItem key={icon.value} value={icon.value}>
                                  {icon.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="label">Label</Label>
                        <Input
                          id="label"
                          value={contactForm.label}
                          onChange={(e) =>
                            setContactForm((prev) => ({
                              ...prev,
                              label: e.target.value,
                            }))
                          }
                          placeholder="e.g., Email, Phone, WhatsApp"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="value">Value</Label>
                        <Input
                          id="value"
                          value={contactForm.value}
                          onChange={(e) =>
                            setContactForm((prev) => ({
                              ...prev,
                              value: e.target.value,
                            }))
                          }
                          placeholder="e.g., email@example.com, +1234567890"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="display_order">Display Order</Label>
                        <Input
                          id="display_order"
                          type="number"
                          value={contactForm.display_order}
                          onChange={(e) =>
                            setContactForm((prev) => ({
                              ...prev,
                              display_order: parseInt(e.target.value) || 0,
                            }))
                          }
                          min="0"
                        />
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="is_primary"
                            checked={contactForm.is_primary}
                            onCheckedChange={(checked) =>
                              setContactForm((prev) => ({
                                ...prev,
                                is_primary: checked,
                              }))
                            }
                          />
                          <Label htmlFor="is_primary">Primary Contact</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="is_whatsapp"
                            checked={contactForm.is_whatsapp}
                            onCheckedChange={(checked) =>
                              setContactForm((prev) => ({
                                ...prev,
                                is_whatsapp: checked,
                              }))
                            }
                          />
                          <Label htmlFor="is_whatsapp">WhatsApp</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="is_active"
                            checked={contactForm.is_active}
                            onCheckedChange={(checked) =>
                              setContactForm((prev) => ({
                                ...prev,
                                is_active: checked,
                              }))
                            }
                          />
                          <Label htmlFor="is_active">Active</Label>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setContactDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="gap-2">
                          <Save size={16} />
                          {editingContact ? "Update" : "Create"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contactInfo.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="capitalize">
                        {contact.type}
                      </TableCell>
                      <TableCell className="font-medium flex items-center gap-2">
                        {contact.label}
                        {contact.is_primary && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                        {contact.is_whatsapp && (
                          <span className="text-xs bg-green-100 text-green-700 px-1 py-0.5 rounded">
                            WA
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {contact.value}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            contact.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {contact.is_active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell>{contact.display_order}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditContact(contact)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteContact(contact.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Business Hours Tab */}
          <TabsContent value="business-hours">
            <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold">Business Hours</h2>
                <Dialog
                  open={hoursDialogOpen}
                  onOpenChange={setHoursDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="gap-2" onClick={resetHoursForm}>
                      <Plus size={16} />
                      Add Business Hours
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingHours
                          ? "Edit Business Hours"
                          : "Add Business Hours"}
                      </DialogTitle>
                      <DialogDescription>
                        Set your working hours for each day of the week.
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleHoursSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="day_of_week">Day of Week</Label>
                        <Select
                          value={hoursForm.day_of_week.toString()}
                          onValueChange={(value) =>
                            setHoursForm((prev) => ({
                              ...prev,
                              day_of_week: parseInt(value),
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                          <SelectContent>
                            {DAYS_OF_WEEK.map((day) => (
                              <SelectItem
                                key={day.value}
                                value={day.value.toString()}
                              >
                                {day.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_open"
                          checked={hoursForm.is_open}
                          onCheckedChange={(checked) =>
                            setHoursForm((prev) => ({
                              ...prev,
                              is_open: checked,
                            }))
                          }
                        />
                        <Label htmlFor="is_open">Open on this day</Label>
                      </div>

                      {hoursForm.is_open && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="open_time">Open Time</Label>
                            <Input
                              id="open_time"
                              type="time"
                              value={hoursForm.open_time}
                              onChange={(e) =>
                                setHoursForm((prev) => ({
                                  ...prev,
                                  open_time: e.target.value,
                                }))
                              }
                              required={hoursForm.is_open}
                            />
                          </div>

                          <div>
                            <Label htmlFor="close_time">Close Time</Label>
                            <Input
                              id="close_time"
                              type="time"
                              value={hoursForm.close_time}
                              onChange={(e) =>
                                setHoursForm((prev) => ({
                                  ...prev,
                                  close_time: e.target.value,
                                }))
                              }
                              required={hoursForm.is_open}
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <Label htmlFor="timezone">Timezone</Label>
                        <Input
                          id="timezone"
                          value={hoursForm.timezone}
                          onChange={(e) =>
                            setHoursForm((prev) => ({
                              ...prev,
                              timezone: e.target.value,
                            }))
                          }
                          placeholder="e.g., GMT+6"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_active_hours"
                          checked={hoursForm.is_active}
                          onCheckedChange={(checked) =>
                            setHoursForm((prev) => ({
                              ...prev,
                              is_active: checked,
                            }))
                          }
                        />
                        <Label htmlFor="is_active_hours">Active</Label>
                      </div>

                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setHoursDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="gap-2">
                          <Save size={16} />
                          {editingHours ? "Update" : "Create"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Timezone</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {businessHours.map((hours) => (
                    <TableRow key={hours.id}>
                      <TableCell className="font-medium">
                        {hours.day_name}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            hours.is_open
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {hours.is_open ? "Open" : "Closed"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {hours.is_open
                          ? `${hours.open_time} - ${hours.close_time}`
                          : "Closed"}
                      </TableCell>
                      <TableCell>{hours.timezone}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            hours.is_active
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {hours.is_active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditHours(hours)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteHours(hours.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Availability Tab */}
          <TabsContent value="availability">
            <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold">Availability Status</h2>
                <Dialog
                  open={availabilityDialogOpen}
                  onOpenChange={setAvailabilityDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="gap-2" onClick={resetAvailabilityForm}>
                      <Plus size={16} />
                      Add Availability Status
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingAvailability
                          ? "Edit Availability"
                          : "Add Availability Status"}
                      </DialogTitle>
                      <DialogDescription>
                        Create availability statuses to let visitors know your
                        current status.
                      </DialogDescription>
                    </DialogHeader>

                    <form
                      onSubmit={handleAvailabilitySubmit}
                      className="space-y-4"
                    >
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Input
                          id="status"
                          value={availabilityForm.status}
                          onChange={(e) =>
                            setAvailabilityForm((prev) => ({
                              ...prev,
                              status: e.target.value,
                            }))
                          }
                          placeholder="e.g., available, busy, unavailable"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={availabilityForm.title}
                          onChange={(e) =>
                            setAvailabilityForm((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          placeholder="e.g., Available for Projects"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={availabilityForm.description}
                          onChange={(e) =>
                            setAvailabilityForm((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Detailed description of your availability"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="response_time">Response Time</Label>
                        <Input
                          id="response_time"
                          value={availabilityForm.response_time}
                          onChange={(e) =>
                            setAvailabilityForm((prev) => ({
                              ...prev,
                              response_time: e.target.value,
                            }))
                          }
                          placeholder="e.g., Within 24 hours"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="color_class">Status Color</Label>
                        <Select
                          value={availabilityForm.color_class}
                          onValueChange={(value) =>
                            setAvailabilityForm((prev) => ({
                              ...prev,
                              color_class: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select color" />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_COLORS.map((color) => (
                              <SelectItem key={color.value} value={color.value}>
                                {color.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="is_current"
                            checked={availabilityForm.is_current}
                            onCheckedChange={(checked) =>
                              setAvailabilityForm((prev) => ({
                                ...prev,
                                is_current: checked,
                              }))
                            }
                          />
                          <Label htmlFor="is_current">Current Status</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="is_active_availability"
                            checked={availabilityForm.is_active}
                            onCheckedChange={(checked) =>
                              setAvailabilityForm((prev) => ({
                                ...prev,
                                is_active: checked,
                              }))
                            }
                          />
                          <Label htmlFor="is_active_availability">Active</Label>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setAvailabilityDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="gap-2">
                          <Save size={16} />
                          {editingAvailability ? "Update" : "Create"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Response Time</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availabilityStatuses.map((availability) => (
                    <TableRow key={availability.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${availability.color_class}`}
                          ></div>
                          <span className="capitalize">
                            {availability.status}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {availability.title}
                      </TableCell>
                      <TableCell>{availability.response_time}</TableCell>
                      <TableCell>
                        {availability.is_current ? (
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                            Current
                          </span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setCurrentAvailability(availability.id)
                            }
                            className="text-xs"
                          >
                            Set Current
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            availability.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {availability.is_active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditAvailability(availability)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleDeleteAvailability(availability.id)
                            }
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
