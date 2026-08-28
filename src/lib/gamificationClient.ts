import { createClient } from "@/lib/supabase/client";

export async function earnXP(xpToAdd: number, badgeToEarn?: string) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || "mock-user";

    const res = await fetch("/api/gamification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, xpToAdd, badgeToEarn })
    });
    return await res.json();
  } catch (err) {
    console.error("Failed to earn XP:", err);
    return null;
  }
}
