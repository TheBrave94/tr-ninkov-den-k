# Tréninkový deník — nasazení na web

Appka je postavená na **Next.js** (frontend + hosting), **Supabase** (databáze + přihlašování) a nasazuje se přes **Vercel**. Všechny tři služby mají bezplatný tarif, který na tým ~10 lidí bohatě stačí.

## Krok 1 — Supabase (databáze + přihlašování)

1. Jdi na [supabase.com](https://supabase.com), založ si zdarma účet a vytvoř nový projekt (zvol libovolné jméno a heslo k databázi — to heslo nikde jinde nepotřebuješ, jen si ho ulož pro jistotu).
2. Počkej, až se projekt vytvoří (cca 1–2 minuty).
3. V levém menu klikni na **SQL Editor** → **New query**.
4. Otevři soubor `supabase/schema.sql` z tohoto projektu, zkopíruj celý obsah, vlož ho do editoru a klikni **Run**.
5. V levém menu jdi na **Authentication** → **Providers** a ujisti se, že je zapnutý **Email** provider (bývá zapnutý defaultně).
6. V **Authentication** → **URL Configuration** přidej do "Redirect URLs" adresu, na které appka poběží (tu dostaneš v kroku 3 od Vercelu — klidně se k tomuto kroku vrať později).
7. V levém menu jdi na **Project Settings** → **API**. Najdeš tam:
   - **Project URL** (něco jako `https://xxxx.supabase.co`)
   - **anon public** klíč (dlouhý řetězec)

   Tyhle dvě hodnoty budeš potřebovat v kroku 3.

## Krok 2 — Kód na GitHub

1. Založ si zdarma účet na [github.com](https://github.com), pokud ho ještě nemáš.
2. Vytvoř nový (prázdný) repozitář, např. `treninkovy-denik`.
3. Nahraj do něj celý obsah téhle složky (přes web rozhraní GitHubu jde nahrát drag & drop, nebo přes `git push`, pokud s gitem umíš).

## Krok 3 — Vercel (hosting)

1. Jdi na [vercel.com](https://vercel.com), založ si účet přes GitHub (nejjednodušší) a klikni **Add New → Project**.
2. Vyber repozitář `treninkovy-denik`, který jsi nahrál v kroku 2.
3. V sekci **Environment Variables** přidej:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL ze Supabase (krok 1.7)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon public klíč ze Supabase (krok 1.7)
4. Klikni **Deploy**. Za chvíli appka poběží na adrese jako `treninkovy-denik.vercel.app`.
5. Vrať se do Supabase (krok 1.6) a do "Redirect URLs" přidej tuhle finální adresu (např. `https://treninkovy-denik.vercel.app`), aby přihlašovací odkazy fungovaly správně.

## Krok 4 — první přihlášení

1. Otevři appku na její adrese, zadej svůj e-mail (trenérský) a klikni na odkaz, který ti přijde do e-mailu.
2. Appka pozná, že jsi první, kdo appku otevřel, a nechá tě založit trenérský účet.
3. V **Nastavení** pak přidáš atlety podle jejich e-mailu — každý z nich se pak přihlásí stejně, jen zadá svůj e-mail a klikne na odkaz, co mu přijde.

## Vlastní doména (volitelné)

Ve Vercelu v nastavení projektu (**Settings → Domains**) můžeš appce přiřadit vlastní doménu (např. `trenink.vasoddil.cz`) — návod je přímo tam, stačí u domény upravit DNS záznamy podle instrukcí Vercelu.

## Běžný provoz

- Appka se dál dá upravovat úplně stejně jako dosud (stačí upravit soubor `components/App.jsx`).
- Po nahrání změny na GitHub Vercel appku automaticky znovu nasadí.
- Zálohu dat pořád najdeš v appce v **Nastavení → Záloha dat**.

## Lokální vývoj (volitelné, pro techničtější použití)

```bash
npm install
cp .env.local.example .env.local   # a doplň skutečné hodnoty ze Supabase
npm run dev
```

Appka pak poběží na `http://localhost:3000`.
