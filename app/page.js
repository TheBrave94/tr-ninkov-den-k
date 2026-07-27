import AppClient from "../components/AppClient";

// Appka je celá závislá na přihlášení a datech z prohlížeče (Supabase),
// takže nemá smysl ji staticky generovat při buildu - vykresluje se vždy za běhu.
export const dynamic = "force-dynamic";

export default function Page() {
  return <AppClient />;
}
