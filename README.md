# 🤖 AI Daily

Agregator wiadomości w stylu [daily.dev](https://daily.dev), ale **wyłącznie o sztucznej inteligencji**.
Personalizowany feed z prawdziwych źródeł RSS o AI, z głosowaniem, zakładkami, śledzeniem tematów,
serią czytania (reading streak) i wyszukiwarką.

## Funkcje

- **Spersonalizowany feed** kart w ciemnym motywie (jak daily.dev), zasilany ~14 źródłami AI.
- **Widoki feedu**: Najnowsze · Popularne · Dyskutowane · Najwyżej oceniane.
- **Głosowanie (upvote)** i **zakładki z lokalnym zapisem** (localStorage).
- **Tematy/tagi** automatycznie wykrywane z treści (LLM, Generative AI, Agents, Robotics, Ethics…) — można je **śledzić**.
- **Reading streak** + dzienny cel (liczy się otwarcie oryginalnego artykułu).
- **Wyszukiwarka** pełnotekstowa i **lista źródeł** pogrupowanych wg kategorii.
- **Backend agregujący RSS** w czasie rzeczywistym z cache (10 min) i **fallbackiem offline**,
  gdy brak internetu — aplikacja zawsze pokazuje treści.

## Funkcje AI (Claude) — opcjonalne

Po dodaniu klucza API włączają się funkcje oparte o Claude:
- **TL;DR** na każdej karcie (streszczenie po polsku: co nowego + czemu ważne),
- **Dzienny digest** (`/digest`) — redakcyjny przegląd najważniejszych historii dnia,
- **Zapytaj feed** (`/ask`) — RAG: pytasz po polsku, Claude odpowiada na podstawie dzisiejszych artykułów z **cytowaniami [n]** do źródeł.

**Włączenie:** skopiuj `.env.example` do `server/.env`, wpisz `ANTHROPIC_API_KEY` i (opcjonalnie) `AI_MODEL`
(domyślnie `claude-opus-4-8`; dla taniego/szybkiego streszczania ustaw `claude-haiku-4-5`). Zrestartuj aplikację.
Bez klucza aplikacja działa normalnie — funkcje AI po prostu się nie pokazują (a „Zapytaj feed" i tak zwraca trafne artykuły).

### Inteligentne przetwarzanie feedu (działa bez klucza)
- **Dedup/klastrowanie** — ta sama historia z wielu serwisów = jedna karta z licznikiem „N źródeł" (prawdziwy sygnał ważności).
- **Typy treści** — Paper / Release / Tool / Tutorial / Opinion / News (chipy filtra).
- **Prawdziwy sygnał** — głosy/komentarze z Hacker News, gwiazdki z GitHub, polubienia z Hugging Face (ikona ⚡).
- **Skróty klawiszowe** — `j`/`k` nawigacja, `r` czytaj w aplikacji, `o` otwórz, `b` zakładka, `u` głos.

### Funkcje pracy z AI
- **Dla Ciebie** — ranking personalizowany, uczy się z głosów/zakładek/czytań/śledzonych tematów (wagi lokalne).
- **Trendy** (`/trends`) — które tematy AI rosną/słabną; sparkline 7/14/30 dni.
- **Premiery modeli** (`/models`) — kuratorowany kanon wydań (OpenAI, Anthropic, Google, Meta, Mistral, xAI, DeepSeek, Qwen).
- **Paper'y arXiv** (`/papers`) — abstrakt, autorzy, PDF, link do kodu (Papers-with-Code), kopiowanie BibTeX, **„Wyjaśnij paper"** po polsku (AI).
- **Reader view** — czytaj w aplikacji bez wychodzenia (Mozilla Readability po stronie serwera).
- **Alerty** (`/alerts`) — zapisane wyszukiwania z powiadomieniami przeglądarki, polling co 5 min.
- **PWA** — manifest + service worker, instalowalna; działa też w trybie offline (cache).

## Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS v4 + react-router + lucide-react
- **Backend:** Node.js + Express + rss-parser

## Uruchomienie

```bash
# 1. Instalacja zależności (root + client)
npm run install:all

# 2. Start: backend (port 3001) + frontend (port 5173) jednocześnie
npm run dev
```

Następnie otwórz **http://localhost:4317**.

> Frontend proxuje `/api` na `http://localhost:4399`, więc wystarczy jedno polecenie `npm run dev`.

## Uruchamianie na Windows — jeden skrót, ikona w zasobniku

Wszystko jest zintegrowane w **jeden punkt wejścia**. Na pulpicie jest jeden skrót **`AI Daily`** (można go przypiąć do paska zadań).

**Kliknięcie skrótu** uruchamia aplikację (backend + frontend w tle, bez okna konsoli), pokazuje **ikonę „AI" w zasobniku systemowym** i otwiera przeglądarkę. Kolejne kliknięcie tylko otwiera nową kartę — działa **jedna instancja** (pilnuje tego muteks).

**Ikona w zasobniku → prawy przycisk** daje pełne sterowanie:
- **Otwórz AI Daily** — otwiera `http://localhost:4317` (też podwójny klik w ikonę),
- **Uruchom serwery / Zatrzymaj serwery** — z auto-wykrywaniem stanu,
- **☑ Uruchamiaj z Windowsem** — przełącznik **autostartu** jednym kliknięciem (dodaje/usuwa skrót w `shell:startup`),
- **Zakończ** — zatrzymuje serwery i zamyka ikonę.

**Przypięcie do paska zadań:** PPM na skrócie → *Pokaż więcej opcji* → *Przypnij do paska zadań* (działa, bo skrót celuje w `wscript.exe`).

Pliki launchera: [`AI-Daily.vbs`](AI-Daily.vbs) (jedyny launcher) + [`tray/ai-daily-tray.ps1`](tray/ai-daily-tray.ps1) (aplikacja tray) + `ai-daily.ico`.
Do debugowania nadal działa `npm run dev` w terminalu.

## Źródła AI

OpenAI · Google DeepMind · Google AI · Hugging Face (blog + trending models) · The Decoder ·
TechCrunch AI · The Verge AI · VentureBeat AI · Ars Technica AI · MIT Tech Review AI ·
MarkTechPost · Synced · arXiv cs.AI · arXiv cs.LG · **Hacker News** (AI, realne punkty) ·
**GitHub** (trending repo AI, realne gwiazdki)

Listę można edytować w [`server/feeds.js`](server/feeds.js).

## Struktura

```
ai_news/
├── server/            # Express API: agregacja RSS, tagowanie, cache
│   ├── index.js
│   ├── feeds.js       # lista źródeł + reguły tagowania
│   └── seed.js        # dane fallback (offline)
└── client/            # aplikacja React (Vite)
    └── src/
        ├── components/  # PostCard, Sidebar, Topbar, RightRail, StreakWidget…
        ├── pages/       # Feed, Bookmarks, Tags, Sources
        ├── store.tsx    # stan lokalny (upvote/zakładki/tagi/streak)
        └── api.ts
```

## Uwaga

Liczby głosów i komentarzy są generowane deterministycznie (na podstawie świeżości i ID),
ponieważ kanały RSS nie udostępniają danych społecznościowych — odwzorowują mechanikę daily.dev
w celach demonstracyjnych. Reszta (treść, źródła, linki) pochodzi z prawdziwych feedów.
