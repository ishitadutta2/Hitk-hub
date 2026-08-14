import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: "Supabase isn't connected yet — see .env.local.example." },
      { status: 501 }
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Log in first." }, { status: 401 });
  }

  const { data: note, error: noteError } = await supabase
    .from("notes")
    .select("id, file_path, seller_id")
    .eq("id", params.id)
    .maybeSingle();

  if (noteError || !note) {
    return NextResponse.json({ error: "Note not found." }, { status: 404 });
  }

  const isOwner = note.seller_id === user.id;

  let isVerifiedBuyer = false;
  if (!isOwner) {
    const { data: purchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("note_id", note.id)
      .eq("buyer_id", user.id)
      .eq("payment_status", "verified")
      .maybeSingle();
    isVerifiedBuyer = !!purchase;
  }

  if (!isOwner && !isVerifiedBuyer) {
    return NextResponse.json(
      { error: "You need a verified purchase to download this note." },
      { status: 403 }
    );
  }

  // Only the service-role client can sign URLs for files outside the
  // uploader's own storage RLS policy — that's the whole point of gating
  // buyer downloads through this route instead of client-side storage calls.
  const admin = createAdminClient();
  const { data: signed, error: signError } = await admin.storage
    .from("notes")
    .createSignedUrl(note.file_path, 60 * 5); // 5-minute link

  if (signError || !signed) {
    return NextResponse.json({ error: "Could not generate download link." }, { status: 500 });
  }

  return NextResponse.json({ url: signed.signedUrl });
}
