# Fierce Leadership Lab — WordPress embed + HubSpot payment

Two pieces were set up:
1. **Native HTML embed** (best for SEO — content is crawlable on your WP URL, unlike an iframe).
2. **HubSpot Payment Links** — registrants are sent straight to checkout after they register.

---

## The files

| File | What it is |
|---|---|
| `fierce-leadership-lab.html` | **Source of truth.** Keep editing this one. Also the standalone GitHub Pages version. |
| `build-wp-embed.py` | Build script. Run it after any edit to regenerate the two files below. |
| `wp-embed-content.html` | Paste into a WordPress **Custom HTML block**. (Scoped CSS + page markup.) |
| `wp-embed-script.html` | Paste into **WPCode** (the JavaScript). |

Rebuild after any edit to the source:
```
python3 build-wp-embed.py
```

---

## Part 1 — Embed in WordPress (SEO-friendly)

Why not the usual iframe: Google credits iframe content to the *source* URL, not the
WordPress page — so the WP page looks empty to crawlers. Embedding the markup natively
fixes that. The build script scopes all CSS under `#fierce-lab` so it can't bleed into
the rest of your site.

1. **Create/edit the WP page** (a full-width or blank template looks best).
2. Add a **Custom HTML block** and paste the entire contents of `wp-embed-content.html`.
3. Install the free **WPCode** plugin (or "Insert Headers and Footers"). Add a new
   **HTML Snippet**, paste the contents of `wp-embed-script.html`, set:
   - Location: **Footer**
   - Smart logic: load **only on this page** (URL contains your Lab slug).
   - Save + activate.
   > The script must go through WPCode because Gutenberg/security plugins often strip
   > `<script>` from Custom HTML blocks.
4. Preview. The registration modal, calendar tiles, and "Reserve" buttons should all work.

### SEO housekeeping (do this so you don't compete with yourself)
- Set this WP page's **canonical URL** to itself (Yoast/Rank Math do this by default).
- On the **GitHub Pages copy**, either:
  - add `<meta name="robots" content="noindex">` to its `<head>`, **or**
  - add `<link rel="canonical" href="https://YOUR-WP-URL/...">` pointing at the WP page.
  This stops the raw `github.io` URL from ranking instead of your branded page.
- Optional but worth it: add **Course**/**Event** structured data (JSON-LD) so the Labs
  can show rich results. Ask and I'll generate it.

> Note: the page's own sticky top nav is hidden in the embed (`#fierce-lab .nav { display:none }`)
> since WordPress already provides the site header. Delete that line in
> `wp-embed-content.html` if you want to keep it.

---

## Part 2 — HubSpot Payment Links

The page now sends a registrant to HubSpot checkout **after** their info is recorded.
You just need to create the two links and paste the URLs in.

1. In HubSpot: **Commerce → Payment links → Create payment link**.
   - Link A: **$299** — single Lab. Name it e.g. "Leadership Lab — Single Session".
   - Link B: **$1,794** — full 2026 series. Name it e.g. "Leadership Lab — Full Series".
   - Set the success/redirect URL on each to a thank-you page if you want.
2. Copy each link's URL.
3. In `fierce-leadership-lab.html`, find this block and paste the URLs:
   ```js
   const HUBSPOT_PAY_SINGLE = 'PLACEHOLDER_PAY_SINGLE';   // <- $299 link
   const HUBSPOT_PAY_SERIES = 'PLACEHOLDER_PAY_SERIES';   // <- $1,794 link
   ```
4. Re-run `python3 build-wp-embed.py` and re-paste `wp-embed-script.html` into WPCode.

**Behavior:** until you paste real links, each path falls back to the old flow (shows the
confirmation card; admin team bills manually). Once a link is set, that selection redirects
to checkout automatically. The registrant's name, email, company, and chosen session are
already logged to HubSpot via the form before the redirect.

> Also remember to set the live registration form: replace `HUBSPOT_FORM_ID =
> 'PLACEHOLDER_FORM_ID'` with the real Leadership Lab form GUID, or the form stays in
> demo mode (no contact is recorded — it goes straight to payment/confirmation).
