"use client";

import React, { useEffect, useState } from "react";

interface FormWrapperProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
}

/**
 * A wrapper component to prevent unwanted form submissions
 * Especially useful when editing blog posts or projects to avoid page reloads
 */
export function FormWrapper({
  children,
  onSubmit,
  className,
}: FormWrapperProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Set up a beforeunload listener to warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isEditing) {
        // Standard way to show a confirmation dialog
        e.preventDefault();
        e.returnValue = ""; // Chrome requires returnValue to be set
        return ""; // Legacy browsers need this
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isEditing]);

  // Monitor changes in the form to set editing state
  useEffect(() => {
    // Set up event listeners for change events within the form
    const handleChange = () => {
      setIsEditing(true);
    };

    // Find all input, textarea, and select elements within the form
    const form = document.querySelector(".form-wrapper") as HTMLFormElement;
    if (form) {
      const inputs = form.querySelectorAll("input, textarea, select");
      inputs.forEach((input) => {
        input.addEventListener("change", handleChange);
        input.addEventListener("input", handleChange);
      });

      return () => {
        inputs.forEach((input) => {
          input.removeEventListener("change", handleChange);
          input.removeEventListener("input", handleChange);
        });
      };
    }
  }, []);

  // Handle form submission and prevent default
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (onSubmit) {
      onSubmit(e);
    }

    // Reset editing state after successful submission
    setIsEditing(false);
  };

  // CRITICAL FIX: Proper form event handlers to prevent unwanted submissions
  const handleClick = (e: React.MouseEvent<HTMLFormElement>) => {
    const target = e.target as HTMLElement;

    // Prevent form submissions for certain elements
    if (target.tagName === "BUTTON" && !target.hasAttribute("type")) {
      // Prevent default for buttons without type
      e.preventDefault();
    }

    // Prevent form submission when clicking file inputs or ProseMirror content
    if (
      target.closest('input[type="file"]') ||
      target.closest(".ProseMirror")
    ) {
      e.stopPropagation();
    }
  };

  // Prevent Enter key from submitting form except in textareas
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && e.target instanceof HTMLElement) {
      // Allow Enter in textareas and specific elements that need it
      if (
        e.target.tagName !== "TEXTAREA" &&
        !e.target.closest(".ProseMirror") &&
        !e.target.closest('[data-allow-enter="true"]')
      ) {
        e.preventDefault();
      }
    }
  };

  return (
    <form
      className={`form-wrapper${className ? ` ${className}` : ""}`}
      onSubmit={handleSubmit}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      data-editing={isEditing ? "true" : "false"}
    >
      {children}
    </form>
  );
}
