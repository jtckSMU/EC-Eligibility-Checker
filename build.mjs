// Builds the password-protected index.html for GitHub Pages.
// Usage (PowerShell):  $env:EC_PASSWORD = '...'; & "C:\Program Files\nodejs\node.exe" build.mjs
// The app is encrypted with AES-256-GCM using a key derived from the password (PBKDF2-SHA256),
// so the published index.html does not contain the readable app.
import { readFileSync, writeFileSync } from 'node:fs';
import { webcrypto as crypto, randomBytes } from 'node:crypto';

const pw = process.env.EC_PASSWORD;
if (!pw) { console.error('Set EC_PASSWORD first.'); process.exit(1); }

const dir = new URL('.', import.meta.url);
const read = f => readFileSync(new URL(f, dir), 'utf8');
const logo = 'data:image/png;base64,' + readFileSync(new URL('propnex-logo.png', dir)).toString('base64');

const src = read('ec-eligibility.html').replace('src="propnex-logo.png"', `src="${logo}"`);
const [head, body] = src.split(/<\/style>\n/);
const lock = `<script>(function(){var b=document.getElementById('lockBtn');if(!b)return;b.hidden=false;b.addEventListener('click',function(){location.reload()})})();</script>`;
const app = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<meta name="robots" content="noindex, nofollow">\n<style>[hidden]{display:none!important}body{margin:0}</style>\n${head}</style>\n</head>\n<body>\n${body}${lock}\n</body>\n</html>\n`;

const iter = 600000;
const salt = randomBytes(16), iv = randomBytes(12);
const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits']);
const raw = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: iter }, base, 256);
const key = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt']);
const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(app));

const payload = JSON.stringify({
  v: salt.toString('hex').slice(0, 8), iter,
  salt: salt.toString('base64'), iv: iv.toString('base64'),
  data: Buffer.from(data).toString('base64'),
});
const out = read('gate-template.html').replace('__LOGO__', logo).replace('__PAYLOAD__', payload);
writeFileSync(new URL('index.html', dir), out);
console.log(`index.html written (${Math.round(out.length / 1024)} KB)`);
