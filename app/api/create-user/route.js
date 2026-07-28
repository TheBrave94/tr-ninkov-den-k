import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

// Zakládá nový účet (e-mail + heslo) v Supabase Auth. Volá se z appky, když
// trenér v Nastavení přidává atleta. Používá service_role klíč, proto musí
// běžet jen tady na serveru (Route Handler), nikdy v prohlížeči.
export async function POST(request) {
  try {
    const { email, password, requesterToken } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Neplatný e-mail." }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: "Heslo musí mít alespoň 8 znaků." }, { status: 400 });
    }
    if (!requesterToken) {
      return NextResponse.json({ error: "Chybí ověření požadavku." }, { status: 401 });
    }

    // ověř, kdo o vytvoření účtu žádá
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const requesterClient = createClient(supabaseUrl, anonKey);
    const { data: requesterData, error: requesterError } = await requesterClient.auth.getUser(requesterToken);

    if (requesterError || !requesterData?.user) {
      return NextResponse.json({ error: "Neplatné přihlášení." }, { status: 401 });
    }

    // ověř, že žadatel je v appce trenér
    const { data: stateRow, error: stateError } = await supabaseAdmin
      .from("app_state")
      .select("data")
      .eq("id", "main")
      .single();

    if (stateError) {
      return NextResponse.json({ error: "Nepodařilo se ověřit oprávnění." }, { status: 500 });
    }

    const requesterEmail = requesterData.user.email.toLowerCase();
    const requesterProfile = (stateRow?.data?.users || []).find(
      (u) => u.email && u.email.toLowerCase() === requesterEmail
    );

    if (!requesterProfile || requesterProfile.role !== "coach") {
      return NextResponse.json({ error: "Jen trenér může přidávat účty." }, { status: 403 });
    }

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) {
      return NextResponse.json({ error: createError.message || "Účet se nepodařilo založit." }, { status: 400 });
    }

    return NextResponse.json({ ok: true, userId: created.user.id });
  } catch (e) {
    return NextResponse.json({ error: "Neočekávaná chyba serveru." }, { status: 500 });
  }
}
