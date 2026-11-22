#!/usr/bin/env python3
"""Turn the Netlify build (netlify-site/) into a GitHub Pages build (docs/).

GitHub Pages serves the site from a sub-path (/AI-tool-creator/), so asset paths
become relative, and it has no form backend, so the contact form sends through EmailJS
(https://www.emailjs.com) using Nachman's Gmail: one template mails the customer
the auto-reply and BCCs Nachman with the request details.

Usage: python3 build-pages.py <netlify-site-dir> <out-dir> <form-email>
"""
import re
import shutil
import sys
from pathlib import Path

EMAILJS = {
    "service_id": "service_z6dgkxh",
    "template_id": "template_61bgmms",
    "public_key": "JSZhl2EYIvZx-tkI7",
}

PAGES_JS = """/* Contact form via EmailJS (sends from Nachman's Gmail). */
(function () {
	'use strict';
	var form = document.querySelector('form[name="contact"]');
	if (!form) return;
	var ok = document.getElementById('form-ok');
	var err = document.getElementById('form-err');

	form.addEventListener('submit', function (e) {
		e.preventDefault();
		var data = new FormData(form);
		var btn = form.querySelector('button[type="submit"]');
		ok.hidden = true; err.hidden = true;
		var show = function (el) { el.hidden = false; el.scrollIntoView({ block: 'center', behavior: 'smooth' }); };
		if (data.get('np_website')) { form.reset(); show(ok); return; } // bot honeypot
		btn.disabled = true;
		fetch('https://api.emailjs.com/api/v1.0/email/send', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				service_id: form.getAttribute('data-service'),
				template_id: form.getAttribute('data-template'),
				user_id: form.getAttribute('data-key'),
				template_params: {
					name: data.get('name') || '',
					email: data.get('email') || '',
					film_type: data.get('film_type') || '—',
					'package': data.get('package') || '—',
					message: data.get('message') || '—'
				}
			})
		}).then(function (r) {
			if (r.ok) { form.reset(); show(ok); return; }
			return r.text().then(function (t) { throw new Error(r.status + ' ' + t); });
		}).catch(function (e) {
			// Show EmailJS's reason so problems can be diagnosed.
			var why = err.querySelector('.form__why');
			if (!why) { why = document.createElement('small'); why.className = 'form__why'; why.style.display = 'block'; why.style.direction = 'ltr'; why.style.marginTop = '6px'; err.appendChild(why); }
			why.textContent = String(e && e.message || e);
			show(err);
		}).then(function () {
			btn.disabled = false;
		});
	});
})();
"""




def convert(html, email):
    # Relative paths: the site lives under /<repo>/ on GitHub Pages.
    html = re.sub(r'(["\'(])/assets/', r"\1assets/", html)
    # A url() inside a CSS variable is resolved against the stylesheet (assets/css/).
    html = html.replace("--hero-img:url('assets/", "--hero-img:url('../")
    html = html.replace('href="/#', 'href="#').replace('href="/"', 'href="./"')

    # Form: Netlify Forms -> EmailJS (handled by pages-form.js). Without JavaScript,
    # the form falls back to opening the visitor's email app.
    html = re.sub(
        r'<form class="form" name="contact"[^>]*>',
        f'<form class="form" name="contact" method="POST" action="mailto:{email}" enctype="text/plain" '
        f'data-service="{EMAILJS["service_id"]}" data-template="{EMAILJS["template_id"]}" '
        f'data-key="{EMAILJS["public_key"]}">',
        html,
    )
    html = html.replace('<input type="hidden" name="form-name" value="contact">', "")
    html = re.sub(r'<input type="hidden" name="subject"[^>]*>\s*', "", html)
    html = html.replace(
        "משאירים שם ומייל, ונחמן יחזור אליכם במייל עם כל הפרטים.",
        "משאירים שם ומייל, ומיד מקבלים מייל עם הסבר איך לשלוח את החומרים לסרט.",
    )
    html = html.replace(
        "תודה! הפנייה התקבלה, ונחמן יחזור אליכם במייל בהקדם.",
        "תודה! הפנייה התקבלה. שלחנו לכם מייל עם הסבר איך לשלוח את החומרים (בדקו גם בספאם).",
    )
    html = html.replace(
        "משהו השתבש בשליחה. נסו שוב בעוד רגע.",
        "משהו השתבש בשליחה. נסו שוב, או כתבו לנו ישירות ל-" + email + ".",
    )
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
