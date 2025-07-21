// src/app/api/track-view/route.ts
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const body = await request.json();
    const { type, id, timeSpent } = body;

    if (!type || !id) {
      return NextResponse.json(
        { error: "Type and ID are required" },
        { status: 400 }
      );
    }

    // Only track if user spent enough time (3+ seconds)
    if (timeSpent < 3000) {
      return NextResponse.json({
        success: false,
        reason: "Insufficient time spent",
      });
    }

    let result;
    if (type === "post") {
      result = await supabase.rpc("increment_post_view", {
        post_id_param: parseInt(id),
      });
    } else if (type === "project") {
      result = await supabase.rpc("increment_project_view", {
        project_id_param: parseInt(id),
      });
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    if (result.error) {
      console.error("Error tracking view:", result.error);
      return NextResponse.json(
        { error: "Failed to track view" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in track-view API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
