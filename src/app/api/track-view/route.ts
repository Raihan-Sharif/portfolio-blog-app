// src/app/api/test-view-tracking/route.ts
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient() as any;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!type || !id) {
      return NextResponse.json(
        { error: "type and id required" },
        { status: 400 }
      );
    }

    console.log(`Testing ${type} view tracking for ID: ${id}`);

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

    console.log("RPC Result:", result);

    if (result.error) {
      return NextResponse.json(
        {
          success: false,
          error: result.error.message,
          details: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      result: result.data,
      message: `Successfully incremented ${type} view`,
    });
  } catch (error) {
    console.error("Test API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
