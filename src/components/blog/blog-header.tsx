"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Category } from "@/types";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface BlogHeaderProps {
  categories: Category[];
  selectedCategory?: string;
  search?: string;
}

export default function BlogHeader({
  categories,
  selectedCategory,
  search,
}: BlogHeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(search || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/blog?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <section className="bg-accent/30 py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">Blog</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Thoughts, tutorials, and insights about web development, technology,
            and software engineering.
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="flex w-full gap-2">
            <Input
              type="search"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            <Button type="submit" size="icon">
              <Search size={18} />
            </Button>
          </form>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <Link
            href="/blog"
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              !selectedCategory
                ? "bg-primary text-primary-foreground"
                : "bg-card hover:bg-primary/10"
            }`}
          >
            All
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/blog?category=${category.slug}`}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                selectedCategory === category.slug
                  ? "bg-primary text-primary-foreground"
                  : "bg-card hover:bg-primary/10"
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
