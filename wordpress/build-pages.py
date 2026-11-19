#!/usr/bin/env python3
"""Turn the Netlify build (netlify-site/) into a GitHub Pages build (docs/).

GitHub Pages serves the site from a sub-path (/AI-tool-creator/), so asset paths
become relative, and it has no form backend, so the contact form posts to
FormSubmit (https://formsubmit.co), which emails each submission.

Usage: python3 build-pages.py <netlify-site-dir> <out-dir> <form-email>
"""
import re
import shutil
import sys
from pathlib import Path

PAGES_JS = """/* Contact form via FormSubmit: submit without leaving the page. */
(function () {
	'use strict';
	var form = document.querySelector('form[name="contact"]');
	if (!form) return;
	var ok = document.getElementById('form-ok');
	var err = document.getElementById('form-err');
	if (/[?&]np_sent=1/.test(location.search)) ok.hidden = false;

	form.addEventListener('submit', function (e) {
		if (!window.fetch || !window.FormData) return;
		e.preventDefault();
		var btn = form.querySelector('button[type="submit"]');
		btn.disabled = true;
		ok.hidden = true; err.hidden = true;
		fetch(form.getAttribute('data-ajax'), {
			method: 'POST',
			headers: { 'Accept': 'application/json' },
			body: new FormData(form)
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


AUTORESPONSE = (
    "תודה שפניתם לנחמן הפקות! קיבלנו את הבקשה שלכם לעריכת סרט.\n\n"
    "כדי שנוכל להתחיל, שלחו לנו את החומרים לסרט למייל {email}:\n"
    "• סרטונים ותמונות (לקבצים גדולים: קישור Google Drive או WeTransfer)\n"
    "• מוזיקה, אם יש שיר מסוים שרוצים\n"
    "• טקסטים, כתוביות או שמות שצריכים להופיע\n"
    "• כל הערה על הסגנון שאתם רוצים\n\n"
    "נחזור אליכם בהקדם,\n"
    "נחמן הפקות"
)


def convert(html, email):
    # Relative paths: the site lives under /<repo>/ on GitHub Pages.
    html = re.sub(r'(["\'(])/assets/', r"\1assets/", html)
    # A url() inside a CSS variable is resolved against the stylesheet (assets/css/).
    html = html.replace("--hero-img:url('assets/", "--hero-img:url('../")
    html = html.replace('href="/#', 'href="#').replace('href="/"', 'href="./"')

    # Form: Netlify Forms -> FormSubmit.
    html = re.sub(
        r'<form class="form" name="contact"[^>]*>',
        f'<form class="form" name="contact" method="POST" action="https://formsubmit.co/{email}" '
        f'data-ajax="https://formsubmit.co/ajax/{email}">',
        html,
    )
    html = html.replace(
        '<input type="hidden" name="form-name" value="contact">',
        '<input type="hidden" name="_template" value="table">'
        '<input type="hidden" name="_captcha" value="false">'
        # FormSubmit emails this text to the address in the form's "email" field.
        '<input type="hidden" name="_autoresponse" value="'
        + AUTORESPONSE.format(email=email).replace("\n", "&#10;") + '">',
    )
    html = html.replace(
        "משאירים שם ומייל, ונחמן יחזור אליכם במייל עם כל הפרטים.",
        "משאירים שם ומייל, ומיד מקבלים מייל עם הסבר איך לשלוח את החומרים לסרט.",
    )
    html = html.replace(
        "תודה! הפנייה התקבלה, ונחמן יחזור אליכם במייל בהקדם.",
        "תודה! הפנייה התקבלה. שלחנו לכם מייל עם הסבר איך לשלוח את החומרים (בדקו גם בספאם).",
    )
    html = html.replace('name="subject"', 'name="_subject"')
    html = html.replace('name="np_website"', 'name="_honey"')
    html = html.replace("netlify-form.js", "pages-form.js")
    return html


def main(src, out, email):
    src, out = Path(src), Path(out)
    if out.exists():
        shutil.rmtree(out)
    shutil.copytree(src, out)
    (out / "netlify.toml").unlink(missing_ok=True)
    (out / "assets" / "js" / "netlify-form.js").unlink(missing_ok=True)
    (out / "assets" / "js" / "pages-form.js").write_text(PAGES_JS, encoding="utf-8")
    (out / ".nojekyll").write_text("", encoding="utf-8")
    for page in ("index.html", "404.html"):
        p = out / page
        p.write_text(convert(p.read_text(encoding="utf-8"), email), encoding="utf-8")
    print("built", out)


if __name__ == "__main__":
    main(*sys.argv[1:4])
