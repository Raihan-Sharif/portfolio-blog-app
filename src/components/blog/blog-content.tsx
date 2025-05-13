"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Define a type for the blog content
interface BlogContentType {
  type?: string;
  html?: string;
  json?: Record<string, unknown>;
  content?: string | Record<string, unknown>;
  [key: string]: unknown;
}

interface BlogContentProps {
  content: BlogContentType;
}

export default function BlogContent({ content }: BlogContentProps) {
  const [renderedContent, setRenderedContent] = useState<React.ReactNode>(null);

  useEffect(() => {
    if (!content) {
      setRenderedContent(<p>No content available.</p>);
      return;
    }

    try {
      // Handle different content formats
      if (typeof content === "string") {
        // If it's a simple HTML string
        setRenderedContent(
          <div dangerouslySetInnerHTML={{ __html: content }} />
        );
      } else if (content.html && typeof content.html === "string") {
        // If it has an html property (our enhanced format)
        setRenderedContent(
          <div
            dangerouslySetInnerHTML={{ __html: content.html }}
            className="prose prose-lg dark:prose-invert max-w-none"
          />
        );
      } else if (content.type === "rich-text" && content.html) {
        // If it's our rich-text format
        setRenderedContent(
          <div
            dangerouslySetInnerHTML={{ __html: content.html as string }}
            className="prose prose-lg dark:prose-invert max-w-none"
          />
        );
      } else if (content.content && typeof content.content === "string") {
        // Legacy format with content as HTML string
        setRenderedContent(
          <div
            dangerouslySetInnerHTML={{ __html: content.content }}
            className="prose prose-lg dark:prose-invert max-w-none"
          />
        );
      } else {
        // For complex JSON content from Tiptap/ProseMirror or unknown formats
        // Just show a simple message
        setRenderedContent(
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p>
              Content is available but in a format that cannot be displayed
              directly.
            </p>
          </div>
        );
      }
    } catch (error) {
      console.error("Error rendering blog content:", error);
      setRenderedContent(
        <p className="text-destructive">
          Error rendering content. Please try refreshing the page.
        </p>
      );
    }
  }, [content]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="prose prose-lg dark:prose-invert max-w-none"
    >
      {renderedContent}
    </motion.div>
  );
}
