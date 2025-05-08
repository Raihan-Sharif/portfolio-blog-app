"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Define a type for the blog content
interface BlogContentType {
  type?: string;
  content?: string | Record<string, unknown>;
  html?: string;
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
      // For this example, we're assuming content is stored as a JSON object
      // from a rich text editor like Tiptap
      if (typeof content === "string") {
        // If it's HTML string (simple case)
        setRenderedContent(
          <div dangerouslySetInnerHTML={{ __html: content }} />
        );
      } else if (content.html && typeof content.html === "string") {
        // If it has an html property
        setRenderedContent(
          <div dangerouslySetInnerHTML={{ __html: content.html }} />
        );
      } else {
        // For complex JSON content from Tiptap/ProseMirror
        // In a real application, you would use a proper parser for your specific format
        // This is just a placeholder
        setRenderedContent(
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p>
              Content would be rendered here based on the stored JSON format.
            </p>
          </div>
        );
      }
    } catch (error) {
      console.error("Error rendering blog content:", error);
      setRenderedContent(<p>Error rendering content.</p>);
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
