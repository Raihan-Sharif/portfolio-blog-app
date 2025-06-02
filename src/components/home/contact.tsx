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
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear phone error when user starts typing
    if (name === "phone") {
      setPhoneError("");
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, phone: value }));
    setPhoneError("");

    // Format phone number as user types
    if (value) {
      const formatted = formatPhoneNumber(value, selectedCountry.code);
      if (formatted !== value) {
        // Update with formatted version
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

      // Re-format existing phone number for new country
      if (formData.phone) {
        const cleanNumber = formData.phone.replace(/\D/g, "");
        const formatted = formatPhoneNumber(cleanNumber, countryCode);
        setFormData((prev) => ({ ...prev, phone: formatted }));
      }
    }
  };

  const validateForm = () => {
    // Validate required fields
    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      throw new Error("Please fill in all required fields");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      throw new Error("Please enter a valid email address");
    }

    // Validate phone number if provided
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
      // Validate form
      validateForm();

      // Prepare phone number with country code if provided
      const fullPhoneNumber = formData.phone
        ? getFullPhoneNumber(formData.phone, selectedCountry.dialCode)
        : null;

      // Save to database
      const { error } = await supabase.from("contact_messages").insert({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: fullPhoneNumber,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        status: "pending",
      });

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(error.message || "Failed to send message");
      }

      setSubmitStatus({
        success: true,
        message:
          "Thank you! Your message has been sent successfully. We'll get back to you soon.",
      });

      // Reset form
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (submitError: any) {
      console.error("Error submitting form:", submitError);
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Get In Touch</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Have a project in mind or want to discuss a collaboration? Feel free
            to reach out using the form below or through our contact
            information.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="mr-3 bg-primary/10 p-3 rounded-lg">
                  <Mail className="text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-muted-foreground">
                    contact@raihansharif.com
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-3 bg-primary/10 p-3 rounded-lg">
                  <Phone className="text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Phone</h3>
                  <p className="text-muted-foreground">+880 1234-567890</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-3 bg-primary/10 p-3 rounded-lg">
                  <MapPin className="text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Location</h3>
                  <p className="text-muted-foreground">Dhaka, Bangladesh</p>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <h2 className="text-xl font-semibold mb-6">Availability</h2>
              <p className="text-muted-foreground mb-6">
                I'm currently available for freelance work and open to
                discussing new opportunities. My typical response time is within
                24 hours.
              </p>

              <div className="bg-accent/30 p-6 rounded-lg">
                <h3 className="font-medium mb-2">Working Hours</h3>
                <p className="text-muted-foreground">
                  Monday - Friday: 9:00 AM - 6:00 PM (GMT+6)
                </p>
              </div>
            </div>
          </div>

          <div>
            <form
              onSubmit={handleSubmit}
              className="space-y-6 bg-card p-8 rounded-lg border shadow-sm"
            >
              <h2 className="text-xl font-semibold mb-6">Send Me a Message</h2>

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
                            <span className="text-xs">{country.dialCode}</span>
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
                      <p className="text-xs text-red-500 mt-1">{phoneError}</p>
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
                  placeholder="Tell us about your project or how we can help you..."
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
          </div>
        </div>
      </div>
    </div>
  );
}
