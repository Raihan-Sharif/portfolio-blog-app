// src/components/editor/rich-text-editor.tsx (updated)
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
import { supabase } from "@/lib/supabase/client";
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
import { useEffect, useState } from "react";

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

  const editor = useEditor({
    extensions: [
      StarterKit,
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
    content: initialContent || "",
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
  });

  useEffect(() => {
    if (editor && initialContent) {
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
      } catch (error) {
        console.error("Error setting editor content:", error);
        editor.commands.setContent("");
      }
    }
  }, [editor, initialContent]);

  if (!editor) {
    return null;
  }

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
      setUploadError(null);
    }
  };

  const uploadImage = async () => {
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

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from("raihan-blog-app") // Using your bucket name
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

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

  const addImage = () => {
    // If we have a file, upload it first
    if (imageFile) {
      uploadImage();
      return;
    }

    // Otherwise use the URL
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
      setIsImageDialogOpen(false);
    }
  };

  const addLink = () => {
    if (linkUrl) {
      if (linkText) {
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

  const addYoutube = () => {
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
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-accent" : ""}
          title="Bold"
          type="button"
        >
          <Bold size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleItalic().run()}
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
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
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
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
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
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
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
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-accent" : ""}
          title="Bullet List"
          type="button"
        >
          <List size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
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
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "bg-accent" : ""}
          title="Quote"
          type="button"
        >
          <Quote size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive("codeBlock") ? "bg-accent" : ""}
          title="Code Block"
          type="button"
        >
          <Code size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
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
                  />
                  {imageFile && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setImageFile(null)}
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
              <Button onClick={addLink} className="w-full" type="button">
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
              <Button onClick={addYoutube} className="w-full" type="button">
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
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
          type="button"
        >
          <Undo size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
          type="button"
        >
          <Redo size={18} />
        </Button>
      </div>
      <div className="p-4 min-h-[300px] prose prose-sm dark:prose-invert max-w-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
