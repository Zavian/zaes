# tools.zaes.dev

Small browser tools for tabletop RPG players and game masters, made by Zavian.
React, TypeScript, Tailwind CSS and Vite, using the same design tokens as [zaes.dev](https://zaes.dev).
Every page is prerendered to static HTML at build time and is served as static assets by Cloudflare.

## Tools

- **RPG Card Generator** (`/generator`): a port of the [original generator](https://github.com/Zavian/zavian.github.io),
  itself based on [crobi's rpg-cards](https://github.com/crobi/rpg-cards). Opens the original generator's JSON save files.

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # vitest (includes a real save file from the original generator)
npm run build    # vite build + static prerender into dist/
```

## Adding a tool

1. Build the tool as a lazy-loaded component under `src/<tool>/`.
2. Register it in `src/tools.ts` (home page card, header link, sitemap and prerender come from that list).
3. Render it in `src/App.tsx`.

## Uploading

The Export panel uploads card images (PNG) to [upload.zaes.dev](https://upload.zaes.dev) and builds the Tabletop
Simulator line from the links. Each person connects with their own API key: ask for an invite, redeem it at
`upload.zaes.dev/join.html` and paste the key into the panel (stored only in that browser). Downloading PNGs needs no key.
For local work against another server set `VITE_UPLOAD_BASE` (for example `http://localhost:3001`).

## Icons

The 4,000+ game-icons.net icons (CC BY 3.0) are not stored in this repo. They are loaded on demand from
`https://zavian.github.io/generator/icons/` (see `src/generator/core/assets.ts`). Keep that site up, or change the
base URL there. `public/generator-assets/icons.json` is just the list of icon names.

## Deploying

Cloudflare Workers static assets (`wrangler.jsonc`), custom domain `tools.zaes.dev` (the zone is on Cloudflare, so
the DNS record is created on first deploy). `.github/workflows/deploy-tools.yml` deploys on pushes to `main` that touch
`tools/`; it needs repo secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Manual: `npm run build && npx wrangler deploy`.
