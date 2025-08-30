// src/components/home/contact.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ANIMATIONS, GRADIENTS, SPACING } from "@/lib/design-constants";
import {
  countries,
  formatPhoneNumber,
  getFullPhoneNumber,
  validatePhoneNumber,
  type Country,
} from "@/lib/phone-utils";
import { createClient } from "@/utils/supabase/client";
const supabase = createClient();
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  CheckCircle,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Star,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";
import ReCAPTCHAComponent, { ReCAPTCHAV3Ref } from "@/components/ui/recaptcha";

// Interfaces
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

interface ContactProps {
  contactInfo: ContactInfo[];
  businessHours: BusinessHours[];
  availability: AvailabilityStatus | null;
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

export default function Contact({
  contactInfo,
  businessHours,
  availability,
}: ContactProps) {
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
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHAV3Ref>(null);

  // Form handlers (keep the same logic as your original)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "phone") setPhoneError("");
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

    if (!recaptchaToken) {
      throw new Error("Please complete the reCAPTCHA verification");
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
        recaptcha_token: recaptchaToken,
      });

      if (error) throw error;

      setSubmitStatus({
        success: true,
        message:
          "Thank you! Your message has been sent successfully. We'll get back to you soon.",
      });

      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setRecaptchaToken(null);
      // For v3, automatically get a new token for next submission
      try {
        if (recaptchaRef.current) {
          const newToken = await recaptchaRef.current.execute();
          setRecaptchaToken(newToken);
        }
      } catch (error) {
        console.warn('Failed to get new reCAPTCHA token:', error);
        // Don't block the success flow for this
      }
    } catch (submitError: any) {
      setSubmitStatus({
        success: false,
        message:
          submitError.message ||
          "There was an error sending your message. Please try again.",
      });
      // Reset reCAPTCHA on error so user can try again
      setRecaptchaToken(null);
      try {
        if (recaptchaRef.current) {
          const newToken = await recaptchaRef.current.execute();
          setRecaptchaToken(newToken);
        }
      } catch (error) {
        console.warn('Failed to get new reCAPTCHA token after error:', error);
        // User can still retry form submission
      }
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
    if (!businessHours || businessHours.length === 0) {
      return { isOpen: false, text: "Contact anytime", color: "bg-blue-500" };
    }

    const today = new Date().getDay();
    const todayHours = businessHours.find((h) => h.day_of_week === today);

    if (!todayHours || !todayHours.is_open) {
      return { isOpen: false, text: "Closed today", color: "bg-red-500" };
    }

    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const openTime = parseInt(todayHours.open_time?.replace(":", "") || "0");
    const closeTime = parseInt(todayHours.close_time?.replace(":", "") || "0");

    if (currentTime >= openTime && currentTime <= closeTime) {
      return {
        isOpen: true,
        text: `Open until ${todayHours.close_time}`,
        color: "bg-green-500",
      };
    } else if (currentTime < openTime) {
      return {
        isOpen: false,
        text: `Opens at ${todayHours.open_time}`,
        color: "bg-yellow-500",
      };
    } else {
      return { isOpen: false, text: "Closed", color: "bg-red-500" };
    }
  };

  const dayStatus = getCurrentDayStatus();

  return (
    <section
      className={`${SPACING.section} ${GRADIENTS.background} relative overflow-hidden`}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className={`${SPACING.container} relative z-10`}>
        {/* Section Header */}
        <motion.div {...ANIMATIONS.fadeIn} className="text-center mb-16">
          <h2
            className={`text-4xl md:text-5xl font-bold mb-6 ${GRADIENTS.primaryText}`}
          >
            Get In Touch
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Ready to bring your ideas to life? Let's discuss your next project
            or collaboration.
            <span className="block mt-2 text-primary font-semibold">
              Quick response • Professional service • Quality results
            </span>
          </p>
        </motion.div>

        {/* Stats/Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16"
        >
          <div className="text-center p-6 rounded-2xl bg-card/60 backdrop-blur-sm border border-white/10 hover:shadow-lg transition-all duration-300 group">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div className="font-semibold mb-1">Quick Response</div>
            <div className="text-sm text-muted-foreground">
              {availability?.response_time || "Within 24 hours"}
            </div>
          </div>

          <div className="text-center p-6 rounded-2xl bg-card/60 backdrop-blur-sm border border-white/10 hover:shadow-lg transition-all duration-300 group">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="font-semibold mb-1">Available Now</div>
            <div className="text-sm text-muted-foreground">
              {availability?.title || "Ready for new projects"}
            </div>
          </div>

          <div className="text-center p-6 rounded-2xl bg-card/60 backdrop-blur-sm border border-white/10 hover:shadow-lg transition-all duration-300 group">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="font-semibold mb-1">100+ Projects</div>
            <div className="text-sm text-muted-foreground">
              Successfully delivered
            </div>
          </div>

          <div className="text-center p-6 rounded-2xl bg-card/60 backdrop-blur-sm border border-white/10 hover:shadow-lg transition-all duration-300 group">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="font-semibold mb-1">6+ Years</div>
            <div className="text-sm text-muted-foreground">
              Professional experience
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-8"
          >
            {/* Availability Status */}
            {availability && (
              <Card className="bg-card/60 backdrop-blur-sm border-white/10 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${availability.color_class} animate-pulse`}
                    ></div>
                    {availability.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">
                    {availability.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>Response time: {availability.response_time}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Methods */}
            {contactInfo && contactInfo.length > 0 && (
              <Card className="bg-card/60 backdrop-blur-sm border-white/10 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    Contact Methods
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contactInfo.map((contact, index) => (
                    <motion.div
                      key={contact.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * (index + 1) }}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-white/5 hover:bg-white/10 transition-all duration-200 cursor-pointer group"
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
                            <Badge
                              variant="secondary"
                              className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            >
                              WhatsApp
                            </Badge>
                          )}
                        </h3>
                        <p className="text-muted-foreground text-sm group-hover:text-primary transition-colors">
                          {contact.value}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Business Hours with Current Day Highlighting */}
            {businessHours && businessHours.length > 0 && (
              <Card className="bg-card/60 backdrop-blur-sm border-white/10 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      Working Hours
                    </span>
                    <Badge
                      variant="outline"
                      className={`${dayStatus.color} text-white border-0 font-medium`}
                    >
                      {dayStatus.text}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {businessHours.map((hours) => {
                      const isToday = hours.day_of_week === new Date().getDay();
                      return (
                        <div
                          key={hours.id}
                          className={`flex justify-between items-center text-sm p-3 rounded-lg transition-all duration-200 ${
                            isToday
                              ? "bg-primary/10 text-primary border border-primary/20 font-medium shadow-sm"
                              : "hover:bg-white/5"
                          }`}
                        >
                          <span
                            className={`font-medium ${
                              isToday ? "text-primary" : ""
                            }`}
                          >
                            {hours.day_name}
                            {isToday && (
                              <Badge
                                variant="secondary"
                                className="ml-2 text-xs bg-primary/20 text-primary"
                              >
                                Today
                              </Badge>
                            )}
                          </span>
                          <span
                            className={`${
                              isToday
                                ? "text-primary font-medium"
                                : "text-muted-foreground"
                            }`}
                          >
                            {hours.is_open
                              ? `${hours.open_time} - ${hours.close_time}`
                              : "Closed"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-card/60 backdrop-blur-sm border-white/10 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Send className="w-5 h-5 text-primary" />
                  Send Me a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name and Email Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="name"
                        className="text-sm font-medium flex items-center gap-2"
                      >
                        <User className="w-4 h-4 text-primary" />
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
                        className="bg-white/5 border-white/20 focus:border-primary/50 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-sm font-medium flex items-center gap-2"
                      >
                        <Mail className="w-4 h-4 text-primary" />
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
                        className="bg-white/5 border-white/20 focus:border-primary/50 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <label
                      htmlFor="phone"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <Phone className="w-4 h-4 text-primary" />
                      Phone Number (Optional)
                    </label>
                    <div className="flex gap-2">
                      <Select
                        value={selectedCountry.code}
                        onValueChange={handleCountryChange}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="w-40 bg-white/5 border-white/20">
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
                          {countries.slice(0, 10).map((country) => (
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
                          className={`bg-white/5 border-white/20 focus:border-primary/50 transition-colors ${
                            phoneError ? "border-red-500" : ""
                          }`}
                        />
                        {phoneError && (
                          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {phoneError}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <label
                      htmlFor="subject"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <Briefcase className="w-4 h-4 text-primary" />
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
                      className="bg-white/5 border-white/20 focus:border-primary/50 transition-colors"
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label
                      htmlFor="message"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4 text-primary" />
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      placeholder="Tell me about your project..."
                      className="bg-white/5 border-white/20 focus:border-primary/50 transition-colors"
                    />
                  </div>

                  {/* reCAPTCHA */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <span>Security Verification</span>
                    </label>
                    <ReCAPTCHAComponent
                      ref={recaptchaRef}
                      onVerify={setRecaptchaToken}
                      onError={() => setRecaptchaToken(null)}
                      action="contact_form"
                      autoExecute={true}
                    />
                  </div>

                  {/* Submit Status */}
                  {submitStatus.message && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg border flex items-start gap-3 ${
                        submitStatus.success
                          ? "text-green-600 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                          : "text-red-600 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
                      }`}
                    >
                      {submitStatus.success ? (
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      )}
                      <span className="text-sm">{submitStatus.message}</span>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16"
        >
          <div className="max-w-3xl mx-auto p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 border border-white/20 backdrop-blur-sm">
            <h3 className="text-2xl font-bold mb-4">
              Let's Build Something Amazing Together
            </h3>
            <p className="text-muted-foreground mb-6">
              Ready to turn your vision into reality? I'm here to help with your
              next project.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href="/contact">
                  <MessageCircle className="w-5 h-5" />
                  Full Contact Page
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="gap-2 border-primary/20 hover:bg-primary/10 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href="/projects">
                  <Briefcase className="w-5 h-5" />
                  View My Work
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
