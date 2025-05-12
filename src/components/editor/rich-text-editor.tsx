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
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isYoutubeDialogOpen, setIsYoutubeDialogOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Youtube.configure({
        width: 640,
        height: 480,
        controls: true,
      }),
    ],
    content: initialContent || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
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
          editor.commands.setContent(initialContent);
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

  const addImage = () => {
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
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
              <Button onClick={addImage} className="w-full" type="button">
                Insert
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
