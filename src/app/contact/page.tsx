"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  countries,
  formatPhoneNumber,
  getFullPhoneNumber,
  validatePhoneNumber,
  type Country,
} from "@/lib/phone-utils";
import { supabase } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import {
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Star,
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
}

interface BusinessHours {
  id: number;
  day_of_week: number;
  day_name: string;
  is_open: boolean;
  open_time?: string;
  close_time?: string;
  timezone: string;
}

interface AvailabilityStatus {
  id: number;
  status: string;
  title: string;
  description: string;
  response_time: string;
  is_current: boolean;
  color_class: string;
}

interface ContactComponentProps {
  showForm?: boolean;
  showFullLayout?: boolean;
  className?: string;
}

const getIcon = (iconName: string, size: number = 20) => {
  const iconProps = { size };

  switch (iconName) {
    case "Mail":
      return <Mail {...iconProps} />;
    case "Phone":
      return <Phone {...iconProps} />;
    case "MessageCircle":
      return <MessageCircle {...iconProps} />;
    case "MapPin":
      return <MapPin {...iconProps} />;
    case "ExternalLink":
      return <ExternalLink {...iconProps} />;
    default:
      return <Mail {...iconProps} />;
  }
};

export default function ContactPage() {
  const showFullLayout = true;
  const showForm = true;
  const className = "";

  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [availability, setAvailability] = useState<AvailabilityStatus | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countries.find((c) => c.code === "BD") || countries[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});
  const [phoneError, setPhoneError] = useState<string>("");

  useEffect(() => {
    fetchContactData();
  }, []);

  const fetchContactData = async () => {
    try {
      setLoading(true);

      // Fetch contact info
      const { data: contactData, error: contactError } = await supabase
        .from("contact_info")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (contactError) throw contactError;

      // Fetch business hours
      const { data: hoursData, error: hoursError } = await supabase
        .from("business_hours")
        .select("*")
        .eq("is_active", true)
        .order("day_of_week");

      if (hoursError) throw hoursError;

      // Fetch current availability
      const { data: availabilityData, error: availabilityError } =
        await supabase
          .from("availability_status")
          .select("*")
          .eq("is_current", true)
          .eq("is_active", true)
          .single();

      if (availabilityError && availabilityError.code !== "PGRST116") {
        throw availabilityError;
      }

      setContactInfo(contactData || []);
      setBusinessHours(hoursData || []);
      setAvailability(availabilityData);
    } catch (error) {
      console.error("Error fetching contact data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "phone") {
      setPhoneError("");
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, phone: value }));
    setPhoneError("");

    if (value) {
      const formatted = formatPhoneNumber(value, selectedCountry.code);
      if (formatted !== value) {
        setTimeout(() => {
          setFormData((prev) => ({ ...prev, phone: formatted }));
        }, 0);
      }
    }
  };

  const handleCountryChange = (countryCode: string) => {
    const country = countries.find((c) => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
      setPhoneError("");

      if (formData.phone) {
        const cleanNumber = formData.phone.replace(/\D/g, "");
        const formatted = formatPhoneNumber(cleanNumber, countryCode);
        setFormData((prev) => ({ ...prev, phone: formatted }));
      }
    }
  };

  const validateForm = () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      throw new Error("Please fill in all required fields");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      throw new Error("Please enter a valid email address");
    }

    if (formData.phone) {
      const isValidPhone = validatePhoneNumber(
        formData.phone,
        selectedCountry.code
      );
      if (!isValidPhone) {
        setPhoneError(
          `Please enter a valid phone number for ${selectedCountry.name}`
        );
        throw new Error("Invalid phone number");
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({});
    setPhoneError("");

    try {
      validateForm();

      const fullPhoneNumber = formData.phone
        ? getFullPhoneNumber(formData.phone, selectedCountry.dialCode)
        : null;

      const { error } = await supabase.from("contact_messages").insert({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: fullPhoneNumber,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        status: "pending",
      });

      if (error) throw error;

      setSubmitStatus({
        success: true,
        message:
          "Thank you! Your message has been sent successfully. We'll get back to you soon.",
      });

      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (submitError: any) {
      setSubmitStatus({
        success: false,
        message:
          submitError.message ||
          "There was an error sending your message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactClick = (contact: ContactInfo) => {
    if (contact.type === "email") {
      window.location.href = `mailto:${contact.value}`;
    } else if (contact.type === "phone") {
      if (contact.is_whatsapp) {
        window.open(
          `https://wa.me/${contact.value.replace(/\D/g, "")}`,
          "_blank"
        );
      } else {
        window.location.href = `tel:${contact.value}`;
      }
    }
  };

  const getCurrentDayStatus = () => {
    const today = new Date().getDay();
    const todayHours = businessHours.find((h) => h.day_of_week === today);

    if (!todayHours || !todayHours.is_open) {
      return { isOpen: false, text: "Closed today" };
    }

    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const openTime = parseInt(todayHours.open_time?.replace(":", "") || "0");
    const closeTime = parseInt(todayHours.close_time?.replace(":", "") || "0");

    if (currentTime >= openTime && currentTime <= closeTime) {
      return { isOpen: true, text: `Open until ${todayHours.close_time}` };
    } else if (currentTime < openTime) {
      return { isOpen: false, text: `Opens at ${todayHours.open_time}` };
    } else {
      return { isOpen: false, text: "Closed" };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const containerClass = showFullLayout ? "min-h-screen bg-background" : "";

  const dayStatus = getCurrentDayStatus();

  return (
    <section className={`py-20 ${containerClass} ${className}`}>
      <div className="container mx-auto px-4">
        {showFullLayout && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Get In Touch
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Have a project in mind or want to discuss a collaboration? Feel
              free to reach out using the form below or through my contact
              information.
            </p>
          </motion.div>
        )}

        <div
          className={`grid grid-cols-1 ${
            showForm ? "lg:grid-cols-2" : "lg:grid-cols-1"
          } gap-12`}
        >
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-semibold mb-8">Contact Information</h2>

            {/* Availability Status */}
            {availability && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-3 h-3 rounded-full ${availability.color_class}`}
                  ></div>
                  <h3 className="font-semibold">{availability.title}</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-2">
                  {availability.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  Response time: {availability.response_time}
                </p>
              </motion.div>
            )}

            {/* Contact Methods */}
            <div className="space-y-6 mb-8">
              {contactInfo.map((contact, index) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (index + 1) }}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-all duration-200 cursor-pointer group"
                  onClick={() => handleContactClick(contact)}
                >
                  <div className="flex-shrink-0 p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <div className="text-primary">
                      {getIcon(contact.icon || "Mail")}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium flex items-center gap-2">
                      {contact.label}
                      {contact.is_primary && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      )}
                      {contact.is_whatsapp && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          WhatsApp
                        </span>
                      )}
                    </h3>
                    <p className="text-muted-foreground mt-1 group-hover:text-primary transition-colors">
                      {contact.value}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </div>

            {/* Business Hours */}
            {businessHours.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-card p-6 rounded-lg border"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Working Hours
                  </h3>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      dayStatus.isOpen
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {dayStatus.text}
                  </div>
                </div>
                <div className="space-y-2">
                  {businessHours.map((hours) => (
                    <div
                      key={hours.id}
                      className="flex justify-between items-center text-sm"
                    >
                      <span
                        className={`font-medium ${
                          hours.day_of_week === new Date().getDay()
                            ? "text-primary"
                            : "text-foreground"
                        }`}
                      >
                        {hours.day_name}
                      </span>
                      <span className="text-muted-foreground">
                        {hours.is_open
                          ? `${hours.open_time} - ${hours.close_time} (${hours.timezone})`
                          : "Closed"}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Contact Form */}
          {showForm && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <form
                onSubmit={handleSubmit}
                className="space-y-6 bg-card p-8 rounded-lg border shadow-sm"
              >
                <h2 className="text-xl font-semibold mb-6">
                  Send Me a Message
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium mb-2"
                    >
                      Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium mb-2"
                    >
                      Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium mb-2"
                  >
                    Phone Number (Optional)
                  </label>
                  <div className="flex gap-2">
                    <Select
                      value={selectedCountry.code}
                      onValueChange={handleCountryChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue>
                          <div className="flex items-center gap-2">
                            <span>{selectedCountry.flag}</span>
                            <span className="text-xs">
                              {selectedCountry.dialCode}
                            </span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            <div className="flex items-center gap-2">
                              <span>{country.flag}</span>
                              <span className="text-xs">
                                {country.dialCode}
                              </span>
                              <span className="text-sm">{country.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex-1">
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        disabled={isSubmitting}
                        placeholder="1234567890"
                        className={phoneError ? "border-red-500" : ""}
                      />
                      {phoneError && (
                        <p className="text-xs text-red-500 mt-1">
                          {phoneError}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Include your phone number for faster response
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium mb-2"
                  >
                    Subject *
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    placeholder="Project Inquiry"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium mb-2"
                  >
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    placeholder="Tell me about your project or how I can help you..."
                  />
                </div>

                <div>
                  {submitStatus.message && (
                    <div
                      className={`text-sm mb-4 p-3 rounded-md border ${
                        submitStatus.success
                          ? "text-green-600 bg-green-50 border-green-200"
                          : "text-red-600 bg-red-50 border-red-200"
                      }`}
                    >
                      {submitStatus.message}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                    <Send size={16} />
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
