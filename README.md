# Tréninkový deník — nasazení na web

Appka je postavená na **Next.js** (frontend + hosting), **Supabase** (databáze + přihlašování) a nasazuje se přes **Vercel**. Všechny tři služby mají bezplatný tarif, který na tým ~10 lidí bohatě stačí.

## Krok 1 — Supabase (databáze + přihlašování)

1. Jdi na [supabase.com](https://supabase.com), založ si zdarma účet a vytvoř nový projekt (zvol libovolné jméno a heslo k databázi — to heslo nikde jinde nepotřebuješ, jen si ho ulož pro jistotu).
2. Počkej, až se projekt vytvoří (cca 1–2 minuty).
3. V levém menu klikni na **SQL Editor** → **New query**.
4. Otevři soubor `supabase/schema.sql` z tohoto projektu, zkopíruj celý obsah, vlož ho do editoru a klikni **Run**.
5. V levém menu jdi na **Authentication** → **Providers** → **Email**, ujisti se, že je zapnutý, a vypni přepínač **"Confirm email"** (appka účty potvrzuje sama, tohle by jen přidávalo zbytečný krok navíc).
6. V **Authentication** → **URL Configuration** přidej do "Site URL" i "Redirect URLs" adresu, na které appka poběží (tu dostaneš v kroku 3 od Vercelu — klidně se k tomuto kroku vrať později).
7. V levém menu jdi na **Project Settings** → **API**. Najdeš tam tři hodnoty, všechny budeš potřebovat v kroku 3:
   - **Project URL** (něco jako `https://xxxx.supabase.co`)
   - **anon public** klíč (dlouhý řetězec)
   - **service_role** klíč (taky dlouhý řetězec — **tenhle je citlivý a mocný, nikdy ho nikam nevkládej do kódu ani appky v prohlížeči a nikomu ho neposílej**; používá se jen na serveru pro zakládání účtů)

## Krok 2 — Kód na GitHub

1. Založ si zdarma účet na [github.com](https://github.com), pokud ho ještě nemáš.
2. Vytvoř nový (prázdný) repozitář, např. `treninkovy-denik`.
3. Nahraj do něj celý obsah téhle složky (přes web rozhraní GitHubu jde nahrát drag & drop, nebo přes `git push`, pokud s gitem umíš).

## Krok 3 — Vercel (hosting)

1. Jdi na [vercel.com](https://vercel.com), založ si účet přes GitHub (nejjednodušší) a klikni **Add New → Project**.
2. Vyber repozitář `treninkovy-denik`, který jsi nahrál v kroku 2.
3. V sekci **Environment Variables** přidej tři proměnné:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL ze Supabase (krok 1.7)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon public klíč ze Supabase (krok 1.7)
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role klíč ze Supabase (krok 1.7) — **bez `NEXT_PUBLIC_` na začátku**, jinak by unikl do prohlížeče
4. Klikni **Deploy**. Za chvíli appka poběží na adrese jako `treninkovy-denik.vercel.app`.
5. Vrať se do Supabase (krok 1.6) a do "Site URL" i "Redirect URLs" přidej tuhle finální adresu (např. `https://treninkovy-denik.vercel.app`).

## Krok 4 — první přihlášení

1. Otevři appku na její adrese. Protože ještě nikdo appku neotevřel, appka tě rovnou nechá založit **trenérský účet** — zadej jméno, e-mail a heslo, které si sám/sama zvolíš.
2. Přihlas se tím e-mailem a heslem.
3. V **Nastavení** pak přidáváš atlety — u každého zadáš jméno, e-mail a **heslo, které mu appka rovnou založí**. Heslo mu pak řekneš sám/sama (SMS, WhatsApp, osobně) — appka ho po zavření okna už nikde nezobrazí, tak si ho zkopíruj hned.
4. Atlet se přihlásí přesně tím e-mailem a heslem, co jsi mu dal/a. Heslo si může kdykoliv změnit přes "Zapomenuté heslo?" na přihlašovací obrazovce.

## Vlastní doména (volitelné)

Ve Vercelu v nastavení projektu (**Settings → Domains**) můžeš appce přiřadit vlastní doménu (např. `trenink.vasoddil.cz`) — návod je přímo tam, stačí u domény upravit DNS záznamy podle instrukcí Vercelu. Nezapomeň pak novou doménu doplnit i do Supabase (krok 1.6).

## Běžný provoz

- Appka se dál dá upravovat úplně stejně jako dosud (stačí upravit soubory v `components/` nebo `app/`).
- Po nahrání změny na GitHub Vercel appku automaticky znovu nasadí.
- Zálohu dat pořád najdeš v appce v **Nastavení → Záloha dat**.

## Lokální vývoj (volitelné, pro techničtější použití)

```bash
npm install
cp .env.local.example .env.local   # a doplň skutečné hodnoty ze Supabase
npm run dev
```

Appka pak poběží na `http://localhost:3000`.
