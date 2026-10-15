# upload.zaes.dev

Small file host. Images are converted (WebP by default, PNG with `format=png`); PDF, txt, md, json and csv files are stored as they are (content is checked: `%PDF-` header, UTF-8 text). Everything is served from `/i/...`; text types are served as text with `nosniff` and a sandbox CSP.

## Keys

- `API_KEY` in `.env` is the **admin** key: sees everything, manages invites and users, used by the gallery at `/`.
- Everyone else gets **their own key through an invite**. A user key is confined to its own folder `u-<id>/`
  (up to two sub-folders), can only list and delete its own files, and is capped at 100 MB in total and 5 MB per
  file (`USER_QUOTA_MB`, `USER_MAX_FILE_MB`). Only hashes of keys and invite codes are stored (`keys.json`).

```bash
node invite.js "Alex"                 # create a single-use invite, prints a /join.html link
node invite.js --list                 # pending invites and users with their usage
node invite.js --revoke-user <id>     # revoke a key (files stay under u-<id>/)
node invite.js --revoke-invite <id>
```

The invitee opens the link, gets their key (shown once) and pastes it into the generator at
https://tools.zaes.dev/generator, or into the gallery at `/`. Run `invite.js` on the machine that runs the server
(it talks to `localhost:$PORT` with the admin key from `.env`; set `ADMIN_URL` to use another address).

## Admin view

`/admin.html` (link "Admin" in the gallery): sign in with the admin key to see every key with its name, id, creation
date, **last used**, file count and storage against the quota (sortable), revoke a key, delete a user's files, and
create or revoke invites. "Last used" is recorded when a key makes a request (updated at most every 5 minutes).

## API

`Authorization: Bearer <key>` on everything except `/health`, `/api/register`, `/i/*`.

| Route | Who | |
| --- | --- | --- |
| `POST /upload` (`file`, optional `folder`, `name`, `format=webp\|png`) | any key | users land in `u-<id>/<folder>/` |
| `GET /api/me` | any key | label, usage, quota |
| `GET /api/images`, `DELETE /api/images/<path>`, `DELETE /api/folders/<path>` | any key | users: own files only |
| `POST /api/register` (`invite`, `label`) | public | redeems an invite, returns the key once; 10 attempts/hour/IP |
| `POST/GET/DELETE /api/invites`, `GET/DELETE /api/users` | admin | users include `lastUsedAt`, `bytes`, `files` |

CORS allows `https://tools.zaes.dev` and `http://localhost:3000` (`ALLOWED_ORIGINS` overrides, comma separated).
