#!/usr/bin/env bash
# Daily on the Oracle box: re-sync addons from GitHub, redeploy tools.zaes.dev only if anything changed.
# Needs ~/.zaes-sync.env with GITHUB_TOKEN, CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID (chmod 600).
# crontab: 0 5 * * * /home/ubuntu/src/zaes-repo/tools/deploy/cron-sync.sh >> /home/ubuntu/zaes-addons-sync.log 2>&1
set -euo pipefail
exec 9>"$HOME/.zaes-sync.lock"; flock -n 9 || { echo "already running"; exit 0; }

set -a; . "$HOME/.zaes-sync.env"; set +a
# wrangler needs Node >=22; the system node (used by other services) stays untouched.
export PATH="$HOME/node22/bin:$PATH"
REPO="$HOME/src/zaes-repo"
STATE="$HOME/.zaes-sync.state"
log() { echo "$(date -Is) $*"; }

# Token goes to git through env, not argv.
export GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=http.https://github.com/.extraheader
export GIT_CONFIG_VALUE_0="AUTHORIZATION: basic $(printf 'x-access-token:%s' "$GITHUB_TOKEN" | base64 -w0)"

cd "$REPO"
git fetch -q origin main
git reset -q --hard origin/main
cd tools

node scripts/sync-addons.mjs | head -1

# Fingerprint = site code + addons.json without its timestamp + every zip (git archive output is deterministic).
fp=$( { git rev-parse HEAD; grep -v '"generated"' src/wow/addons.json; cat public/addons/*.zip; } | sha256sum | cut -d' ' -f1)
if [ -f "$STATE" ] && [ "$(cat "$STATE")" = "$fp" ]; then log "no changes"; exit 0; fi

log "changes found, deploying"
npm ci --no-audit --no-fund --silent
npm run build --silent
npx --yes wrangler deploy
echo "$fp" > "$STATE"
log "deployed"
