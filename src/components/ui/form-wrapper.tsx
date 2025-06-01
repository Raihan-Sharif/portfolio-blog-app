// src/components/ui/form-wrapper.tsx
"use client";

import React, { useRef } from "react";

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
  const formRef = useRef<HTMLFormElement>(null);
  const isFileUploadingRef = useRef(false);

  // Prevent all form submissions except when explicitly allowed
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Don't submit if file upload is in progress
    if (isFileUploadingRef.current) {
      return;
    }

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

  // Handle file input events to prevent form submission
  const handleFileInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.type === "file") {
      isFileUploadingRef.current = true;

      // Reset the flag after a short delay
      setTimeout(() => {
        isFileUploadingRef.current = false;
      }, 500);

      e.stopPropagation();
    }
  };

  // Enhanced click handler
  const handleClick = (e: React.MouseEvent<HTMLFormElement>) => {
    const target = e.target as HTMLElement;

    // Handle file inputs specially
    if (target.closest('input[type="file"]')) {
      e.stopPropagation();
      isFileUploadingRef.current = true;

      // Reset after delay
      setTimeout(() => {
        isFileUploadingRef.current = false;
      }, 1000);
      return;
    }

    // Prevent form submission on button clicks without explicit type="submit"
    if (
      target.tagName === "BUTTON" &&
      target.getAttribute("type") !== "submit"
    ) {
      e.preventDefault();
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
        ref={formRef}
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        // Prevent default behavior for all form events
        onReset={(e) => e.preventDefault()}
        onChange={(e) => {
          // Handle file input changes specially
          if ((e.target as HTMLInputElement).type === "file") {
            handleFileInputChange(e.nativeEvent);
          }
          e.stopPropagation();
        }}
        // Additional event handlers to prevent unwanted submissions
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            const target = e.target as HTMLElement;
            if (
              target.tagName !== "TEXTAREA" &&
              !target.closest(".ProseMirror") &&
              !target.closest('[data-allow-enter="true"]')
            ) {
              e.preventDefault();
              e.stopPropagation();
            }
          }
        }}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            const target = e.target as HTMLElement;
            if (
              target.tagName !== "TEXTAREA" &&
              !target.closest(".ProseMirror") &&
              !target.closest('[data-allow-enter="true"]')
            ) {
              e.preventDefault();
              e.stopPropagation();
            }
          }
        }}
      >
        {children}
      </form>
    </div>
  );
}
