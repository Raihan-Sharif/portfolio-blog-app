"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
const supabase = createClient();
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo,
  Undo,
  Youtube as YoutubeIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Define types for the RichTextEditor
interface RichTextEditorProps {
  initialContent?: Record<string, unknown> | string;
  onChange: (content: Record<string, unknown>) => void;
}

export default function RichTextEditor({
  initialContent,
  onChange,
}: RichTextEditorProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isYoutubeDialogOpen, setIsYoutubeDialogOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [editorInitialized, setEditorInitialized] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Fix for spaces not working properly in editing mode
        history: {
          newGroupDelay: 300, // Adjust the delay for history grouping
        },
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: "max-w-full rounded-lg mx-auto my-4",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Youtube.configure({
        width: 640,
        height: 480,
        controls: true,
        nocookie: true,
        modestBranding: true,
      }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      // Get both HTML and JSON content
      const html = editor.getHTML();
      const json = editor.getJSON();

      // Use a content structure that includes both formats
      const contentObject = {
        type: "rich-text",
        html: html,
        json: json,
      };

      onChange(contentObject);
    },
    editable: true,
    // Improve cursor behavior
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[200px] w-full p-4",
        spellcheck: "true",
      },
      handleDOMEvents: {
        // Ensure click events maintain focus
        click: (view) => {
          if (!view.hasFocus()) {
            view.focus();
          }
          return false;
        },
      },
      handleKeyDown: (view, evt) => {
        // Handle Enter key to prevent unwanted form submission
        if (evt.key === "Enter" && !evt.shiftKey) {
          if (
            evt.target instanceof HTMLElement &&
            evt.target.closest(".ProseMirror")
          ) {
            evt.stopPropagation();
          }
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor && initialContent && !editorInitialized) {
      try {
        // Handle different types of initialContent
        if (typeof initialContent === "string") {
          editor.commands.setContent(initialContent);
        } else if (
          typeof initialContent === "object" &&
          Object.keys(initialContent).length > 0
        ) {
          // Check if it has HTML content from our enhanced format
          if (initialContent.html && typeof initialContent.html === "string") {
            editor.commands.setContent(initialContent.html);
          } else if (initialContent.json) {
            // If it has JSON content
            editor.commands.setContent(initialContent.json);
          } else {
            // Legacy content object (likely a tiptap JSON structure)
            editor.commands.setContent(initialContent);
          }
        } else {
          // Default empty content
          editor.commands.setContent("");
        }
        setEditorInitialized(true);
        // Focus the editor at the end
        setTimeout(() => {
          editor.commands.focus("end");
        }, 100);
      } catch (error) {
        console.error("Error setting editor content:", error);
        editor.commands.setContent("");
      }
    }
  }, [editor, initialContent, editorInitialized]);

  // Form protection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isUploading) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isUploading]);

  if (!editor) {
    return null;
  }

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation();

    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
      setUploadError(null);
    }
  };

  const uploadImage = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation();

    if (!imageFile) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadError(null);

      // Generate a unique filename
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 15)}.${fileExt}`;
      const filePath = `uploads/images/${fileName}`;

      // Begin simulating progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 5;
        if (progress > 90) progress = 90; // Avoid reaching 100% before actually complete
        setUploadProgress(progress);
      }, 100);

      // Upload to Supabase storage
      const { error } = await supabase.storage
        .from("raihan-blog-app") // Using your bucket name
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (error) {
        console.error("Storage upload error:", error);
        throw error;
      }

      // Get public URL for the uploaded image
      const { data: urlData } = supabase.storage
        .from("raihan-blog-app") // Using your bucket name
        .getPublicUrl(filePath);

      if (urlData && urlData.publicUrl) {
        // Insert the image into the editor
        editor.chain().focus().setImage({ src: urlData.publicUrl }).run();
        setIsImageDialogOpen(false);
        setImageFile(null);
        setImageUrl("");

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);
      setUploadError(
        error.message || "Failed to upload image. Please try again."
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const addImage = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation();

    // If we have a file, upload it first
    if (imageFile) {
      uploadImage(e);
      return;
    }

    // Otherwise use the URL
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
      setIsImageDialogOpen(false);
    }
  };

  const addLink = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation();

    if (linkUrl) {
      if (linkText) {
        // If we have link text, insert it and select it
        editor.chain().focus().insertContent(linkText).run();
        editor
          .chain()
          .focus()
          .setTextSelection({
            from: editor.state.selection.from - linkText.length,
            to: editor.state.selection.from,
          })
          .run();
      }

      editor.chain().focus().setLink({ href: linkUrl }).run();

      setLinkUrl("");
      setLinkText("");
      setIsLinkDialogOpen(false);
    }
  };

  const addYoutube = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation();

    if (youtubeUrl) {
      // Extract YouTube ID
      const youtubeId = youtubeUrl.match(
        /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=))([\w\-]{10,12})\b/
      )?.[1];

      if (youtubeId) {
        editor
          .chain()
          .focus()
          .setYoutubeVideo({
            src: youtubeId,
            width: 640,
            height: 480,
          })
          .run();
      } else {
        // Fallback
        editor.chain().focus().insertContent(`[YouTube: ${youtubeUrl}]`).run();
      }

      setYoutubeUrl("");
      setIsYoutubeDialogOpen(false);
    }
  };

  return (
    <div className="border rounded-md">
      <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/20">
        {/* Text formatting */}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            editor.chain().focus().toggleBold().run();
          }}
          className={editor.isActive("bold") ? "bg-accent" : ""}
          title="Bold"
          type="button"
        >
          <Bold size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            editor.chain().focus().toggleItalic().run();
          }}
          className={editor.isActive("italic") ? "bg-accent" : ""}
          title="Italic"
          type="button"
        >
          <Italic size={18} />
        </Button>
        <div className="h-6 w-px bg-border mx-1"></div>

        {/* Headings */}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            editor.chain().focus().toggleHeading({ level: 1 }).run();
          }}
          className={
            editor.isActive("heading", { level: 1 }) ? "bg-accent" : ""
          }
          title="Heading 1"
          type="button"
        >
          <Heading1 size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            editor.chain().focus().toggleHeading({ level: 2 }).run();
          }}
          className={
            editor.isActive("heading", { level: 2 }) ? "bg-accent" : ""
          }
          title="Heading 2"
          type="button"
        >
          <Heading2 size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            editor.chain().focus().toggleHeading({ level: 3 }).run();
          }}
          className={
            editor.isActive("heading", { level: 3 }) ? "bg-accent" : ""
          }
          title="Heading 3"
          type="button"
        >
          <Heading3 size={18} />
        </Button>
        <div className="h-6 w-px bg-border mx-1"></div>

        {/* Lists */}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            editor.chain().focus().toggleBulletList().run();
          }}
          className={editor.isActive("bulletList") ? "bg-accent" : ""}
          title="Bullet List"
          type="button"
        >
          <List size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            editor.chain().focus().toggleOrderedList().run();
          }}
          className={editor.isActive("orderedList") ? "bg-accent" : ""}
          title="Ordered List"
          type="button"
        >
          <ListOrdered size={18} />
        </Button>
        <div className="h-6 w-px bg-border mx-1"></div>

        {/* Blockquote */}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            editor.chain().focus().toggleBlockquote().run();
          }}
          className={editor.isActive("blockquote") ? "bg-accent" : ""}
          title="Quote"
          type="button"
        >
          <Quote size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            editor.chain().focus().toggleCodeBlock().run();
          }}
          className={editor.isActive("codeBlock") ? "bg-accent" : ""}
          title="Code Block"
          type="button"
        >
          <Code size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            editor.chain().focus().setHorizontalRule().run();
          }}
          title="Horizontal Rule"
          type="button"
        >
          <Minus size={18} />
        </Button>
        <div className="h-6 w-px bg-border mx-1"></div>

        {/* Image, Link, Youtube */}
        <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              title="Insert Image"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <ImageIcon size={18} />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insert Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="imageFile">Upload Image</Label>
                <div className="flex gap-2">
                  <Input
                    id="imageFile"
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="flex-1"
                    ref={fileInputRef}
                  />
                  {imageFile && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setImageFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      title="Clear file"
                      type="button"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                {isUploading && (
                  <div className="w-full bg-accent/30 h-2 rounded-full mt-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
                {uploadError && (
                  <div className="text-sm text-destructive mt-2">
                    {uploadError}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Or enter image URL</Label>
                <Input
                  id="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  disabled={!!imageFile}
                />
              </div>
              <Button
                onClick={addImage}
                className="w-full"
                type="button"
                disabled={(!imageUrl && !imageFile) || isUploading}
              >
                {isUploading ? "Uploading..." : "Insert"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              title="Insert Link"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Pre-fill the link text with the current selection
                // Fixed: Safely accessing textContent with optional chaining
                const selectionContent = editor.state.selection.content();
                if (selectionContent.size > 0) {
                  // Get the selected text more safely
                  const selectedText = selectionContent.content
                    ? String(selectionContent.content.content?.[0]?.text || "")
                    : "";
                  setLinkText(selectedText);
                }
              }}
            >
              <LinkIcon size={18} />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insert Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="linkText">Text (optional)</Label>
                <Input
                  id="linkText"
                  placeholder="Link text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkUrl">URL</Label>
                <Input
                  id="linkUrl"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
              </div>
              <Button
                onClick={addLink}
                className="w-full"
                type="button"
                disabled={!linkUrl}
              >
                Insert
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isYoutubeDialogOpen}
          onOpenChange={setIsYoutubeDialogOpen}
        >
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              title="Insert YouTube Video"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <YoutubeIcon size={18} />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insert YouTube Video</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="youtubeUrl">YouTube URL</Label>
                <Input
                  id="youtubeUrl"
                  placeholder="https://youtube.com/watch?v=dQw4w9WgXcQ"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                />
              </div>
              <Button
                onClick={addYoutube}
                className="w-full"
                type="button"
                disabled={!youtubeUrl}
              >
                Insert
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <div className="h-6 w-px bg-border mx-1"></div>

        {/* Undo/Redo */}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            editor.chain().focus().undo().run();
          }}
          disabled={!editor.can().undo()}
          title="Undo"
          type="button"
        >
          <Undo size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            editor.chain().focus().redo().run();
          }}
          disabled={!editor.can().redo()}
          title="Redo"
          type="button"
        >
          <Redo size={18} />
        </Button>
      </div>
      <div
        className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none"
        onClick={() => editor.commands.focus()}
      >
        <EditorContent
          editor={editor}
          onClick={(e) => {
            // CRITICAL FIX: Stop propagation to prevent form submission
            e.stopPropagation();
            editor.commands.focus();
          }}
          className="prose-content"
          data-allow-enter="true"
        />
      </div>
    </div>
  );
}
