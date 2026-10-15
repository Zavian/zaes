#!/usr/bin/env node
// Admin helper. Run next to the server (it reads API_KEY and PORT from .env):
//   node invite.js "Alex"                create an invite (code is shown once)
//   node invite.js --list                pending invites and users
//   node invite.js --revoke-user <id>    revoke a user's key (their files stay)
//   node invite.js --revoke-invite <id>
require('dotenv').config();

const PORT = process.env.PORT || 3001;
const BASE = process.env.ADMIN_URL || `http://localhost:${PORT}`;
const PUBLIC = (process.env.PUBLIC_BASE_URL || BASE).replace(/\/$/, '');
const headers = { Authorization: `Bearer ${process.env.API_KEY}`, 'Content-Type': 'application/json' };

async function call(method, route, body) {
  const res = await fetch(`${BASE}${route}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `${method} ${route} failed (${res.status})`);
  return data;
}

async function main() {
  const [arg, id] = process.argv.slice(2);
  if (arg === '--list') {
    const [inv, usr] = await Promise.all([call('GET', '/api/invites'), call('GET', '/api/users')]);
    console.log('Pending invites:');
    inv.invites.forEach((i) => console.log(`  ${i.id}  ${i.label || '(no label)'}  ${i.createdAt}`));
    console.log('Users:');
    usr.users.forEach((u) => console.log(`  ${u.id}  ${u.label}  ${u.files} files, ${(u.bytes / 1048576).toFixed(1)} MB  ${u.createdAt}`));
  } else if (arg === '--revoke-user' && id) {
    await call('DELETE', `/api/users/${id}`);
    console.log(`Revoked user ${id}. Their files remain under u-${id}/.`);
  } else if (arg === '--revoke-invite' && id) {
    await call('DELETE', `/api/invites/${id}`);
    console.log(`Revoked invite ${id}.`);
  } else {
    const r = await call('POST', '/api/invites', { label: arg || '' });
    console.log(`Invite for ${r.label || '(no label)'} (id ${r.id}), single use:\n\n  ${PUBLIC}/join.html?invite=${r.code}\n\nCode: ${r.code}`);
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
