# Deploying to Vercel

The repository is ready to deploy as-is. Nothing below requires editing code —
it is all repo creation, one import, and environment variables.

## 1. Put the repository on GitHub

The history is already here: one commit on `main`, with `.gitignore` excluding
`node_modules`, `.next`, `/verify` and every `.env` file. Create an empty repo
on GitHub (no README, no `.gitignore`, no license — the repo already has them),
then from the project folder:

```bash
git remote add origin https://github.com/<you>/ridefleet-web.git
git push -u origin main
```

If you were handed `ridefleet-web.bundle` instead of the folder, unpack it first:

```bash
git clone ridefleet-web.bundle ridefleet-web
cd ridefleet-web
git remote set-url origin https://github.com/<you>/ridefleet-web.git
git push -u origin main
```

Private is the right default. The site is public once deployed, but the source
carries the unreviewed legal drafts and the placeholder register, and there is
no reason for either to be readable before launch.

## 2. Import into Vercel

At vercel.com → Add New → Project → import the repo. Vercel detects Next.js and
reads `vercel.json`, so leave every build setting alone. Two things that file
already handles and you should not re-enter by hand: the build command runs the
i18n parity gate before `next build`, so a missing translation fails the deploy
instead of shipping a raw key; and `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` stops
the Playwright devDependency from pulling ~300 MB of browsers on every build.
Playwright is only there for the local verification scripts.

The function region is `iad1` (Washington DC) — the closest Vercel region to
Puerto Rico, which matters for the middleware that runs on every request and
for `POST /api/lead`.

## 3. Set the environment variables

Project → Settings → Environment Variables. Every key is listed in
`.env.example` with what it does; these are the ones worth deciding before the
first production deploy.

`NEXT_PUBLIC_SITE_URL` must be your real origin with no trailing slash, set on
the Production environment only. It drives canonical URLs, `hreflang` and the
sitemap, so pointing it at a preview URL would tell Google the preview is the
canonical site. Leave it unset on Preview and Development.

`NEXT_PUBLIC_DEMO_PHONE_E164` is the switch that makes tap-to-call real. While
it is empty the site prints the masked number and renders zero `tel:` links —
that is deliberate, not a bug, so set it only when the tracked line answers.

`CRM_WEBHOOK_URL` and `CRM_WEBHOOK_TOKEN` are where a submitted demo request
goes. Unset, `/api/lead` validates the payload and logs it and nothing leaves
the server, which is fine for a preview and not fine for launch.

Changing any `NEXT_PUBLIC_*` value requires a redeploy — they are inlined at
build time, not read at request time.

## 4. Attach the domain

Project → Settings → Domains. Add both the apex and `www`, and let Vercel
redirect one to the other so only one origin is canonical. Then update
`NEXT_PUBLIC_SITE_URL` to match and redeploy, or the canonical tags will keep
pointing at the old origin.

## 5. Check the deploy

```bash
curl -sI https://<your-domain>/            # 307 → /es
curl -s  https://<your-domain>/sitemap.xml | head
curl -sI https://<your-domain>/en/demo     # 200
```

Then run the accessibility and SEO gate against the live site rather than
localhost:

```bash
npm ci
BASE_URL=https://<your-domain> npm run verify:a11y
```

It renders all 24 pages and fails on an unnamed control, an unlabelled input, a
dead in-page anchor, a heading-level jump, a missing `alt`, a wrong `hreflang`
set, or a focus ring that is not the blue `rgb(11, 99, 214)`.

## Notes

Preview deployments are the right place to review copy changes: every branch
gets its own URL, and because `NEXT_PUBLIC_SITE_URL` is unset outside
Production, previews carry canonical tags pointing at localhost rather than
competing with the real site for indexing.

There is no database, no CMS and no build-time API call, so a rollback is just
Vercel → Deployments → Promote to Production on the previous build.
