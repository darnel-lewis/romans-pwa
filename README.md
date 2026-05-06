# Today's Worship

**Worship outside the sanctuary.**

Lyrics, scripture, and notes on every phone — built for churches on mission, in homes, restaurants, and anywhere a projector won't go. Free to use; supported by gifts.

## What it is

A mobile-first web app that lets a worship leader paste a service (songs + scripture + notes), share a single URL or QR code, and have everyone follow along on their own phone. Two visual styles (Modern and Quiet & Contemplative), light/dark mode, font-size controls, and a kiosk view that turns any tablet into a "scan to join" display.

## Routes

- `/` — public worship page (the live service for the church)
- `/#about` — landing page with a live phone preview
- `/#admin` — magic-link sign-in + service planner
- `/#kiosk` — full-screen QR display for tablets / shared screens

## Built with

- Vanilla HTML / CSS / JS — no framework, no build step
- Inter (Google Fonts) for Modern style; Newsreader + Cormorant Garamond for Quiet
- [Sortable.js](https://sortablejs.github.io/Sortable/) for drag-to-reorder in admin
- [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) for QR codes
- Service worker (network-first for same-origin, cache-first for fonts) so updates land immediately and offline still works

## Status

Demo phase. Auth and storage are mocked with `localStorage` so the full flow (sign in → plan → publish → view) works end-to-end without a backend. Supabase wiring (multi-tenant accounts, slug-based URLs, member invites, song-library persistence) is the next step.
