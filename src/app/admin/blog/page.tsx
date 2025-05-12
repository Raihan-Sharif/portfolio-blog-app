"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function BlogAdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/admin/blog/new");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting to blog post editor...</p>
    </div>
  );
}
