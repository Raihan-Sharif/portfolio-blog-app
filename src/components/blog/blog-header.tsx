"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { BookOpen, Filter, Search, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Define the Category interface directly
interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

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
    <section className="relative py-24 overflow-hidden">
      {/* Enhanced Background with animated elements */}
      <div className="absolute inset-0">
        {/* Primary gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-blue-500/10" />

        {/* Animated floating elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-blue-500/8 rounded-full blur-2xl animate-pulse delay-500" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] bg-foreground" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Enhanced Header Content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-background/90 dark:bg-background/90 backdrop-blur-md border border-border/50 shadow-xl mb-8"
          >
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary">
              Developer Blog
            </span>
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 relative"
          >
            <span className="bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Blog
            </span>
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-r from-primary to-purple-600 rounded-full opacity-20 blur-sm animate-pulse" />
            <div className="absolute -bottom-2 -left-4 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-20 blur-sm animate-pulse delay-1000" />
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            Thoughts, tutorials, and insights about web development, technology,
            and software engineering best practices.
          </motion.p>
        </motion.div>

        {/* Enhanced Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <form onSubmit={handleSearch} className="relative group">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search articles, topics, or technologies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-20 py-4 text-lg bg-background/90 dark:bg-background/90 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl focus:bg-background/95 focus:border-primary/50 transition-all duration-300 placeholder:text-muted-foreground/60 text-foreground"
              />
              <Search
                size={20}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6"
              >
                <Search size={16} />
              </Button>
            </div>

            {/* Search glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-xl -z-10" />
          </form>
        </motion.div>

        {/* Enhanced Categories */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {/* Filter Icon and Label */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2 md:mb-0">
            <Filter size={16} />
            <span className="font-medium">Filter by:</span>
          </div>

          {/* All Categories Button */}
          <Link href="/blog">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 backdrop-blur-md border shadow-lg hover:shadow-xl ${
                !selectedCategory
                  ? "bg-primary text-primary-foreground border-primary/30 shadow-primary/20"
                  : "bg-background/90 dark:bg-background/90 hover:bg-accent/80 border-border/50 text-foreground hover:text-primary"
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp size={14} />
                All Posts
              </div>
            </motion.div>
          </Link>

          {/* Category Buttons */}
          {categories.map((category, index) => (
            <Link key={category.id} href={`/blog?category=${category.slug}`}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 backdrop-blur-md border shadow-lg hover:shadow-xl ${
                  selectedCategory === category.slug
                    ? "bg-primary text-primary-foreground border-primary/30 shadow-primary/20"
                    : "bg-background/90 dark:bg-background/90 hover:bg-accent/80 border-border/50 text-foreground hover:text-primary"
                }`}
              >
                {category.name}
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 left-8 w-2 h-2 bg-primary rounded-full animate-ping opacity-60" />
        <div className="absolute top-1/3 right-8 w-3 h-3 bg-purple-500 rounded-full animate-pulse opacity-40" />
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce opacity-50" />
      </div>
    </section>
  );
}
