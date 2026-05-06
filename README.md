# WM Bookings

Next.js app for WanderMate multi-day package booking (Spiritual Triangle, Varanasi Package, WhatsApp CTA, checkout tax stub).

## Local development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_WHATSAPP_BOOKING_NUMBER` (country code + digits, no spaces).

## Environment variables (production / Vercel)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_WHATSAPP_BOOKING_NUMBER` | Business WhatsApp for “Book via WhatsApp” (e.g. `919214313559`) |

Do not commit `.env.local` (it is gitignored).

## Deploy on Vercel (wandermate123)

1. Push this repo to GitHub under the **wandermate123** account (see commands below).
2. In [Vercel Dashboard](https://vercel.com) → log in as **wandermate123** → **Add New…** → **Project** → **Import** the GitHub repository.
3. Framework: **Next.js** (auto-detected). Root directory: **.** (default).
4. **Environment Variables**: add `NEXT_PUBLIC_WHATSAPP_BOOKING_NUMBER` for **Production** (and Preview if you want).
5. **Deploy**. Use the generated URL or attach a custom domain (e.g. `book.wandermate.in`).

## Push to GitHub (first time)

Create an **empty** repository on GitHub named e.g. `wm-bookings` (no README/license if you already have this commit), then:

```bash
cd path/to/WM_bookings
git remote add origin https://github.com/wandermate123/wm-bookings.git
git branch -M main
git push -u origin main
```

Use SSH if you prefer: `git@github.com:wandermate123/wm-bookings.git`
