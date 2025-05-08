import BlogGrid from "@/components/blog/blog-grid";
import BlogHeader from "@/components/blog/blog-header";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Category, Post, Tag } from "@/types";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Raihan Sharif",
  description:
    "Read articles about web development, technology, and software engineering by Raihan Sharif.",
};

export const revalidate = 3600; // Revalidate every hour

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createServerSupabaseClient();

  // Get the current page from query params or default to 1
  const page =
    typeof searchParams.page === "string" ? parseInt(searchParams.page) : 1;
  const category =
    typeof searchParams.category === "string"
      ? searchParams.category
      : undefined;
  const tag =
    typeof searchParams.tag === "string" ? searchParams.tag : undefined;
  const search =
    typeof searchParams.search === "string" ? searchParams.search : undefined;

  const postsPerPage = 9;
  const from = (page - 1) * postsPerPage;
  const to = from + postsPerPage - 1;

  // Build the query
  let query = supabase
    .from("posts")
    .select(
      `
      *,
      author:profiles(*),
      category:categories(*)
    `
    )
    .eq("published", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  // Apply filters if provided
  if (category) {
    const { data: categoryData } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", category)
      .single();

    if (categoryData) {
      query = query.eq("category_id", categoryData.id);
    }
  }

  if (tag) {
    const { data: tagData } = await supabase
      .from("tags")
      .select("id")
      .eq("slug", tag)
      .single();

    if (tagData) {
      // Get post IDs that have this tag
      const { data: postTags } = await supabase
        .from("post_tags")
        .select("post_id")
        .eq("tag_id", tagData.id);

      if (postTags && postTags.length > 0) {
        const postIds = postTags.map((pt) => pt.post_id);
        query = query.in("id", postIds);
      }
    }
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
  }

  // Execute the query
  const { data: posts, error } = await query;
  if (error) {
    console.error("Error fetching posts:", error);
  }
  // Get count for pagination
  let countQuery = supabase
    .from("posts")
    .select("id", { count: "exact" })
    .eq("published", true);

  // Apply the same filters to count query
  if (category) {
    const { data: categoryData } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", category)
      .single();

    if (categoryData) {
      countQuery = countQuery.eq("category_id", categoryData.id);
    }
  }

  if (tag) {
    const { data: tagData } = await supabase
      .from("tags")
      .select("id")
      .eq("slug", tag)
      .single();

    if (tagData) {
      // Get post IDs that have this tag
      const { data: postTags } = await supabase
        .from("post_tags")
        .select("post_id")
        .eq("tag_id", tagData.id);

      if (postTags && postTags.length > 0) {
        const postIds = postTags.map((pt) => pt.post_id);
        countQuery = countQuery.in("id", postIds);
      }
    }
  }

  if (search) {
    countQuery = countQuery.or(
      `title.ilike.%${search}%,excerpt.ilike.%${search}%`
    );
  }

  const { count } = await countQuery;
  const totalPages = count ? Math.ceil(count / postsPerPage) : 0;

  // Get all categories and tags for filters
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  const { data: tags } = await supabase.from("tags").select("*").order("name");

  return (
    <div className="min-h-screen">
      <BlogHeader
        categories={(categories as Category[]) || []}
        selectedCategory={category}
        search={search}
      />
      <BlogGrid
        posts={(posts as Post[]) || []}
        currentPage={page}
        totalPages={totalPages}
        tags={(tags as Tag[]) || []}
        selectedTag={tag}
      />
    </div>
  );
}
