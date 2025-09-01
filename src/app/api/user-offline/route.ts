// src/app/api/user-offline/route.ts
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient() as any;
    const body = await request.json();

    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Remove the user from online users table
    const { error } = await supabase
      .from("online_users")
      .delete()
      .eq("session_id", sessionId);

    if (error) {
      console.error("Error removing online user:", error);
      return NextResponse.json(
        { error: "Failed to update offline status" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in user-offline API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle beacon requests (OPTIONS for CORS)
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
