#!/usr/bin/env python3
"""
build-wp-embed.py — generate WordPress-ready embed files from the canonical
standalone page (fierce-leadership-lab.html).

Why this exists: the standalone page is a full HTML document whose CSS uses a
global reset (`*`, `html`, `body`) and generic class names (.nav, .container,
.btn ...). Pasting that raw into a WordPress Custom HTML block would leak styles
into the rest of the site and collide with the theme. This script scopes every
CSS rule under a single wrapper (#fierce-lab) and wraps the body markup in that
wrapper, so the content is embedded NATIVELY (good for SEO) without bleeding.

Keep editing fierce-leadership-lab.html as the single source of truth, then run:
    python3 build-wp-embed.py
and re-paste the two output files into WordPress.

Outputs:
  wp-embed-content.html  -> paste into a WordPress "Custom HTML" block
  wp-embed-script.html   -> paste into WPCode (Footer, "this page only")
"""

import re
import sys
from pathlib import Path

SRC = Path(__file__).with_name("fierce-leadership-lab.html")
WRAPPER = "#fierce-lab"


def extract(html, open_tag, close_tag):
    """Return inner text between the first open_tag and matching close_tag."""
    start = html.index(open_tag) + len(open_tag)
    # open_tag may include attributes up to '>', handle <body ...> / <script ...>
    if not open_tag.endswith(">"):
        start = html.index(">", start) + 1
    end = html.index(close_tag, start)
    return html[start:end]


def strip_comments(css):
    return re.sub(r"/\*.*?\*/", "", css, flags=re.S)


def split_top_commas(sel):
    """Split a selector list on top-level commas (respecting () and [])."""
    parts, depth, buf = [], 0, ""
    for ch in sel:
        if ch in "([":
            depth += 1
        elif ch in ")]":
            depth -= 1
        if ch == "," and depth == 0:
            parts.append(buf)
            buf = ""
        else:
            buf += ch
    if buf.strip():
        parts.append(buf)
    return parts


def scope_one(sel):
    s = sel.strip()
    if not s:
        return s
    # Global element / root selectors become the wrapper itself.
    if s in ("html", "body", ":root", "html body", "html, body"):
        return WRAPPER
    if s.startswith("html "):
        return f"{WRAPPER} {s[5:]}"
    if s.startswith("body "):
        return f"{WRAPPER} {s[5:]}"
    # Universal selector and its pseudo-elements -> descendants of wrapper.
    if s == "*" or s.startswith("*"):
        return f"{WRAPPER} {s}"
    return f"{WRAPPER} {s}"


def scope_selectors(prelude):
    return ", ".join(scope_one(p) for p in split_top_commas(prelude) if p.strip())


def top_level_items(css):
    """Yield ('stmt', text) or ('rule', prelude, inner) at the top level."""
    items, i, n, start = [], 0, len(css), 0
    while i < n:
        c = css[i]
        if c == "/" and i + 1 < n and css[i + 1] == "*":
            j = css.find("*/", i + 2)
            i = (j + 2) if j != -1 else n
            continue
        if c == ";":
            stmt = css[start:i + 1].strip()
            if stmt:
                items.append(("stmt", stmt))
            i += 1
            start = i
            continue
        if c == "{":
            prelude = css[start:i]
            depth, j = 1, i + 1
            while j < n and depth > 0:
                cj = css[j]
                if cj == "/" and j + 1 < n and css[j + 1] == "*":
                    k = css.find("*/", j + 2)
                    j = (k + 2) if k != -1 else n
                    continue
                if cj == "{":
                    depth += 1
                elif cj == "}":
                    depth -= 1
                j += 1
            inner = css[i + 1:j - 1]
            items.append(("rule", prelude, inner))
            i = j
            start = i
            continue
        i += 1
    return items


# At-rules whose inner block must NOT be scoped (selectors aren't elements).
RAW_ATRULES = ("@keyframes", "@-webkit-keyframes", "@font-face", "@page", "@charset", "@import")
# At-rules whose inner block is itself a list of rules to scope recursively.
NESTED_ATRULES = ("@media", "@supports", "@container")


def scope_css(css):
    out = []
    for item in top_level_items(css):
        if item[0] == "stmt":
            out.append(item[1])
            continue
        _, prelude, inner = item
        p = strip_comments(prelude).strip()
        low = p.lower()
        if any(low.startswith(a) for a in NESTED_ATRULES):
            out.append(f"{p} {{\n{scope_css(inner)}\n}}")
        elif any(low.startswith(a) for a in RAW_ATRULES) or p.startswith("@"):
            out.append(f"{p} {{{inner}}}")
        else:
            out.append(f"{scope_selectors(p)} {{{inner}}}")
    return "\n".join(out)


def main():
    if not SRC.exists():
        sys.exit(f"Source not found: {SRC}")
    html = SRC.read_text()

    raw_css = extract(html, "<style>", "</style>")
    scoped_css = scope_css(raw_css)

    # Body markup minus the trailing <script> block.
    body = extract(html, "<body>", "</body>")
    body = body[:body.index("<script>")].strip()

    script = extract(html, "<script>", "</script>").strip()

    # Carry the Google Fonts link into the block (a <link> works inside a
    # Custom HTML block). Pull whatever font <link>s are in the source <head>.
    font_links = "\n".join(re.findall(r"<link[^>]+fonts[^>]+>", html))

    content = f"""<!-- ════════════════════════════════════════════════════════════════
     Fierce Leadership Lab — paste this whole block into a WordPress
     "Custom HTML" block. Generated by build-wp-embed.py — DO NOT hand-edit;
     edit fierce-leadership-lab.html and re-run the script instead.
     ════════════════════════════════════════════════════════════════ -->
{font_links}
<style>
{scoped_css}

/* --- Embed overrides (WordPress already provides the site header) --- */
#fierce-lab .nav {{ display: none; }}          /* hide the page's own sticky nav; delete this line to keep it */
#fierce-lab {{ overflow-x: hidden; }}
</style>

<div id="fierce-lab">
{body}
</div>
"""

    script_out = f"""<!-- ════════════════════════════════════════════════════════════════
     Fierce Leadership Lab — paste into WPCode as a "HTML Snippet",
     location = Site Wide Footer (or page-specific footer), set to load
     ONLY on the Leadership Lab page. Generated by build-wp-embed.py.
     ════════════════════════════════════════════════════════════════ -->
<script>
{script}
</script>
"""

    Path(SRC.with_name("wp-embed-content.html")).write_text(content)
    Path(SRC.with_name("wp-embed-script.html")).write_text(script_out)
    print("Wrote wp-embed-content.html (%d bytes) and wp-embed-script.html (%d bytes)"
          % (len(content), len(script_out)))


if __name__ == "__main__":
    main()
