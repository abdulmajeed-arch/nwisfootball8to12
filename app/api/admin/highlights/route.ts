import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
  match_id,
  title,
  title_ar,
  description,
  description_ar,
  video_url,
  thumbnail_url,
} = body;

    if (!match_id || !title || !video_url || !thumbnail_url) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Make sure the selected match exists and is finished.
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("id, status")
      .eq("id", match_id)
      .single();

    if (matchError || !match) {
      return NextResponse.json(
        { error: "Match not found." },
        { status: 404 }
      );
    }

    if (match.status !== "finished") {
      return NextResponse.json(
        { error: "Highlights can only be added to finished matches." },
        { status: 400 }
      );
    }

    const { error: insertError } = await supabase
      .from("highlights")
      .insert({
  match_id,
  title: title.trim(),
  title_ar: title_ar?.trim() || title.trim(),
  description: description?.trim() || null,
  description_ar: description_ar?.trim() || null,
  video_url: video_url.trim(),
  thumbnail_url: thumbnail_url.trim(),
});

    if (insertError) {
      console.error(insertError);

      return NextResponse.json(
        { error: "Unable to create highlight." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Unable to create highlight." },
      { status: 500 }
    );
  }
}