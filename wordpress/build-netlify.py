#!/usr/bin/env python3
"""Build a static copy of the Nachman Productions site for Netlify.

Takes the home page as rendered by a local WordPress running the theme and writes
a self-contained static site: clean <head>, relative asset paths, and the contact
form converted to a Netlify Form (submissions are emailed by Netlify).

Usage: python3 build-netlify.py <rendered-home.html> <wp-base-url> <out-dir>
"""
import html
import re
import shutil
import sys
from pathlib import Path

THEME = Path(__file__).resolve().parent / "nachman-productions"


def main(src, base, out):
    page = Path(src).read_text(encoding="utf-8")
    out = Path(out)
    if out.exists():
        shutil.rmtree(out)
    (out / "assets").mkdir(parents=True)

    theme_url = base.rstrip("/") + "/wp-content/themes/nachman-productions/assets/"

    # --- Clean <head>: keep only what the page needs.
    head = re.search(r"<head>(.*?)</head>", page, re.S).group(1)
    keep = []
    for pattern in (
        r'<meta charset[^>]*>',
        r'<meta name="viewport"[^>]*>',
        r'<meta name="theme-color"[^>]*>',
        r'<meta name="description"[^>]*>',
        r"<title>.*?</title>",
        r'<link rel="icon"[^>]*>',
        r'<link rel="apple-touch-icon"[^>]*>',
        r"<link rel='preconnect'[^>]*>",
        r"<link href='https://fonts.gstatic.com'[^>]*>",
        r"<link rel='stylesheet' id='np-fonts-css'[^>]*>",
        r"<link rel='stylesheet' id='np-main-css'[^>]*>",
    ):
        keep += re.findall(pattern, head, re.S)
    page = page.replace(head, "\n\t" + "\n\t".join(keep) + "\n")

    # --- Paths.
    page = page.replace(theme_url, "/assets/")
    page = re.sub(r"(/assets/[^\"'?]+)\?ver=[^\"']*", r"\1", page)
    page = page.replace(base.rstrip("/") + "/#", "/#").replace(base.rstrip("/") + "/", "/")

    # --- Contact form → Netlify Form.
    page = re.sub(
        r'<form class="form" method="post" action="[^"]*">',
        '<form class="form" name="contact" method="POST" action="/?np_sent=1#contact" '
        'data-netlify="true" netlify-honeypot="np_website">\n'
        '\t\t\t\t<input type="hidden" name="form-name" value="contact">\n'
        '\t\t\t\t<input type="hidden" name="subject" value="פנייה חדשה מהאתר – נחמן הפקות">\n'
        '\t\t\t\t<p class="form__msg form__msg--ok" id="form-ok" role="status" hidden>'
        "תודה! הפנייה התקבלה, ונחמן יחזור אליכם במייל בהקדם.</p>\n"
        '\t\t\t\t<p class="form__msg form__msg--err" id="form-err" role="alert" hidden>'
        "משהו השתבש בשליחה. נסו שוב בעוד רגע.</p>",
        page,
    )
    page = re.sub(r'<input type="hidden" name="action" value="np_contact">\s*', "", page)
    page = re.sub(r'<input type="hidden" id="np_nonce"[^>]*/>', "", page)
    page = re.sub(r'<input type="hidden" name="_wp_http_referer"[^>]*/>', "", page)

    # Package values: send readable text instead of internal keys.
    labels = dict(
        (key, html.unescape(text))
        for key, text in re.findall(r'<option value="(single|pack10|pack20)">([^<]+)</option>', page)
    )
    for key, text in labels.items():
        safe = html.escape(text, quote=True)
        page = page.replace(f'<option value="{key}">', f'<option value="{safe}">')
        page = page.replace(f'data-package="{key}"', f'data-package="{safe}"')

    # Readable field names in Netlify's submission emails.
    for old, new in (("np_name", "name"), ("np_email", "email"), ("np_type", "film_type"),
                     ("np_package", "package"), ("np_message", "message")):
        page = page.replace(f'name="{old}"', f'name="{new}"')

    # Netlify-only script: AJAX submit + success message.
    page = page.replace(
        '<script src="/assets/js/main.js"',
        '<script src="/assets/js/netlify-form.js" defer></script>\n<script src="/assets/js/main.js"',
    )
    page = re.sub(r"<script>\s*window\._wpemojiSettings.*?</script>", "", page, flags=re.S)

    (out / "index.html").write_text(page, encoding="utf-8")

    # --- Assets.
    shutil.copytree(THEME / "assets" / "css", out / "assets" / "css")
    shutil.copytree(THEME / "assets" / "js", out / "assets" / "js")
    shutil.copytree(THEME / "assets" / "img", out / "assets" / "img")
    shutil.copy(THEME / "assets" / "img" / "favicon.ico", out / "favicon.ico")
    (out / "assets" / "js" / "netlify-form.js").write_text(NETLIFY_JS, encoding="utf-8")
    (out / "404.html").write_text(NOT_FOUND.replace("{head}", "\n\t".join(keep)), encoding="utf-8")
    (out / "netlify.toml").write_text(NETLIFY_TOML, encoding="utf-8")
    print("built", out)


NETLIFY_JS = """/* Netlify Forms: submit without leaving the page. */
(function () {
	'use strict';
	var form = document.querySelector('form[name="contact"]');
	if (!form) return;
	var ok = document.getElementById('form-ok');
	var err = document.getElementById('form-err');
	if (/[?&]np_sent=1/.test(location.search)) ok.hidden = false;

	form.addEventListener('submit', function (e) {
		if (!window.fetch || !window.URLSearchParams) return;
		e.preventDefault();
		var btn = form.querySelector('button[type="submit"]');
		btn.disabled = true;
		ok.hidden = true; err.hidden = true;
		fetch('/', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams(new FormData(form)).toString()
		}).then(function (r) {
			if (!r.ok) throw new Error(r.status);
			form.reset();
			ok.hidden = false;
		}).catch(function () {
			err.hidden = false;
		}).then(function () {
			btn.disabled = false;
			(ok.hidden ? err : ok).scrollIntoView({ block: 'center', behavior: 'smooth' });
		});
	});
})();
"""

NETLIFY_TOML = """[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=604800"
"""

NOT_FOUND = """<!doctype html>
<html dir="rtl" lang="he-IL">
<head>
	{head}
</head>
<body>
<main class="section page-main">
	<div class="container container--narrow" style="text-align:center">
		<p class="eyebrow">שגיאה 404</p>
		<h1 class="section__title">הסצנה הזאת נחתכה בעריכה ✂️</h1>
		<p class="section__lead">הדף שחיפשתם לא קיים.</p>
		<p><a class="btn btn--fire" href="/">חזרה לדף הבית</a></p>
	</div>
</main>
</body>
</html>
"""

if __name__ == "__main__":
    main(*sys.argv[1:4])
