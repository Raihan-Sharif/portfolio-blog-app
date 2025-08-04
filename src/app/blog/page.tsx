// Fixed Main Blog Page - Works with existing components
// File: src/app/blog/page.tsx

import BlogGrid from "@/components/blog/blog-grid";
import BlogHeader from "@/components/blog/blog-header";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Raihan Sharif",
  description:
    "Read the latest articles about web development, technology trends, and software engineering best practices.",
  openGraph: {
    title: "Blog | Raihan Sharif",
    description:
      "Read the latest articles about web development, technology trends, and software engineering best practices.",
    type: "website",
  },
};

interface BlogPageProps {
  searchParams: {
    page?: string;
    category?: string;
    tag?: string;
    search?: string;
  };
}

const POSTS_PER_PAGE = 9;

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const supabase = createServerSupabaseClient() as any;

  // Parse search parameters
  const currentPage = parseInt(searchParams.page || "1", 10);
  const selectedCategory = searchParams.category;
  const selectedTag = searchParams.tag;
  const searchQuery = searchParams.search;

  try {
    // Get categories for header
    const { data: categories } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    // Get tags for sidebar
    const { data: tags } = await supabase
      .from("tags")
      .select("*")
      .order("name");

    // Get trending posts for sidebar (most viewed) - Simple approach
    const { data: trendingPostsData } = await supabase
      .from("posts")
      .select(
        `
        id,
        title,
        slug,
        excerpt,
        cover_image_url,
        created_at,
        view_count,
        category_id
      `
      )
      .eq("published", true)
      .order("view_count", { ascending: false })
      .limit(8);

    // Get categories for trending posts
    const categoryIds = [
      ...new Set(trendingPostsData?.map((p: any) => p.category_id).filter(Boolean)),
    ];
    const { data: trendingCategories } =
      categoryIds.length > 0
        ? await supabase
            .from("categories")
            .select("id, name, slug")
            .in("id", categoryIds)
        : { data: [] };

    // Map categories to trending posts
    const trendingPosts: {
      id: number;
      title: string;
      slug: string;
      excerpt?: string;
      cover_image_url?: string;
      created_at: string;
      view_count: number;
      category?: {
        id: number;
        name: string;
        slug: string;
      } | null;
    }[] = (trendingPostsData || []).map((p: any) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt || undefined,
      cover_image_url: p.cover_image_url || undefined,
      created_at: p.created_at,
      view_count: p.view_count || 0,
      category: trendingCategories?.find((c: any) => c.id === p.category_id) || null,
    }));

    // Build the posts query with all necessary joins
    let postsQuery = supabase
      .from("posts")
      .select(
        `
        *,
        author:profiles(*),
        category:categories(*)
      `
      )
      .eq("published", true)
      .order("created_at", { ascending: false });

    // Apply category filter if provided
    if (selectedCategory) {
      const { data: categoryData } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", selectedCategory)
        .single();

      if (categoryData) {
        postsQuery = postsQuery.eq("category_id", categoryData.id);
      }
    }

    // Apply search filter if provided
    if (searchQuery) {
      postsQuery = postsQuery.ilike("title", `%${searchQuery}%`);
    }

    // Get total count for pagination (with same filters)
    let countQuery = supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("published", true);

    if (selectedCategory) {
      const { data: categoryData } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", selectedCategory)
        .single();

      if (categoryData) {
        countQuery = countQuery.eq("category_id", categoryData.id);
      }
    }

    if (searchQuery) {
      countQuery = countQuery.ilike("title", `%${searchQuery}%`);
    }

    const { count: totalCount } = await countQuery;
    const totalPages = Math.ceil((totalCount || 0) / POSTS_PER_PAGE);

    // Calculate pagination
    const offset = (currentPage - 1) * POSTS_PER_PAGE;

    // Get posts for current page
    const { data: posts } = await postsQuery.range(
      offset,
      offset + POSTS_PER_PAGE - 1
    );

    // Handle tag filtering (post-query filtering since it involves joins)
    let filteredPosts = posts || [];
    if (selectedTag) {
      const { data: taggedPosts } = await supabase
        .from("post_tags")
        .select(
          `
          post_id,
          tags!inner(slug)
        `
        )
        .eq("tags.slug", selectedTag);

      if (taggedPosts) {
        const taggedPostIds = taggedPosts.map((pt: any) => pt.post_id);
        filteredPosts = filteredPosts.filter((post: any) =>
          taggedPostIds.includes(post.id)
        );
      } else {
        filteredPosts = [];
      }
    }

    return (
      <div className="min-h-screen bg-background">
        {/* Blog Header */}
        <BlogHeader
          categories={categories || []}
          selectedCategory={selectedCategory}
          search={searchQuery}
        />

        {/* Blog Grid with proper data */}
        <BlogGrid
          posts={filteredPosts}
          tags={tags || []}
          currentPage={currentPage}
          totalPages={totalPages}
          selectedTag={selectedTag}
          searchQuery={searchQuery}
          trendingPosts={trendingPosts}
        />
      </div>
    );
  } catch (error) {
    console.error("Error in blog page:", error);

    // Fallback: Return page with empty data instead of throwing error
    const emptyTrendingPosts: {
      id: number;
      title: string;
      slug: string;
      excerpt?: string;
      cover_image_url?: string;
      created_at: string;
      view_count: number;
      category?: {
        id: number;
        name: string;
        slug: string;
      } | null;
    }[] = [];

    return (
      <div className="min-h-screen bg-background">
        <BlogHeader
          categories={[]}
          selectedCategory={selectedCategory}
          search={searchQuery}
        />
        <BlogGrid
          posts={[]}
          tags={[]}
          currentPage={1}
          totalPages={1}
          selectedTag={selectedTag}
          searchQuery={searchQuery}
          trendingPosts={emptyTrendingPosts}
        />
      </div>
    );
  }
}
