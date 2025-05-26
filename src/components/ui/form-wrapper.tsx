// src/components/ui/form-wrapper.tsx
"use client";

import React from "react";

interface FormWrapperProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
}

export function FormWrapper({
  children,
  onSubmit,
  className,
}: FormWrapperProps) {
  // Prevent all form submissions except when explicitly allowed
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (onSubmit) {
      onSubmit(e);
    }
  };

  // Prevent Enter key from submitting form
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter") {
      const target = e.target as HTMLElement;

      // Allow Enter only in textareas and rich text editor
      if (
        target.tagName !== "TEXTAREA" &&
        !target.closest(".ProseMirror") &&
        !target.closest('[data-allow-enter="true"]')
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  };

  return (
    <div
      className={className}
      // Prevent any click events from bubbling up
      onClick={(e) => {
        const target = e.target as HTMLElement;

        // Stop propagation for file inputs to prevent form submission
        if (target.closest('input[type="file"]')) {
          e.stopPropagation();
        }
      }}
    >
      <form
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        // Prevent default behavior for all form events
        onReset={(e) => e.preventDefault()}
        onChange={(e) => {
          // Prevent form submission on change events
          e.stopPropagation();
        }}
        // Prevent form submission on button clicks
        onClick={(e) => {
          const target = e.target as HTMLElement;

          // If clicking a button without explicit type="submit", prevent submission
          if (
            target.tagName === "BUTTON" &&
            target.getAttribute("type") !== "submit"
          ) {
            e.preventDefault();
          }
        }}
      >
        {children}
      </form>
    </div>
  );
}
