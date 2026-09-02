import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin(locale: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("AUTH USER:", user);
  console.log("AUTH ERROR:", userError);

  if (!user) {
    console.log("NO USER → LOGIN");
    redirect(`/${locale}/login`);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  console.log("PROFILE:", profile);
  console.log("PROFILE ERROR:", profileError);

  if (!profile || profile.role !== "admin") {
    console.log("NOT ADMIN → HOME");
    redirect(`/${locale}`);
  }

  console.log("ADMIN VERIFIED");

  return user;
}1