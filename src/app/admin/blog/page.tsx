"use client";

import { redirect } from "next/navigation";

export default function BlogAdminPage() {
  redirect("/admin/blog/new");
}
