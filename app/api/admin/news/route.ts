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
      title,
      title_ar,
      excerpt,
      excerpt_ar,
      content,
      content_ar,
      image_url,
      published,
    } = body;

    if (
      !title ||
      !title_ar ||
      !content ||
      !content_ar
    ) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const { error: insertError } = await supabase
  .from("news")
  .insert({
    title: title.trim(),
    title_ar: title_ar.trim(),
    excerpt: excerpt?.trim() || null,
    excerpt_ar: excerpt_ar?.trim() || null,
    content: content.trim(),
    content_ar: content_ar.trim(),
    image_url: image_url?.trim() || null,
    published: Boolean(published),
    published_at: published ? new Date().toISOString() : null,
    competition_id: "812b117a-df69-40ce-b4b2-62ae9ca3e8cf",
  });

    if (insertError) {
      console.error(insertError);

      return NextResponse.json(
        { error: "Unable to create news." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Unable to create news." },
      { status: 500 }
    );
  }
}