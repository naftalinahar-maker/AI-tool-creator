/* Contact form via EmailJS (sends from Nachman's Gmail). */
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
