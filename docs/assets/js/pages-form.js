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
			if (!r.ok) throw new Error(r.status);
			form.reset();
			show(ok);
		}).catch(function () {
			show(err);
		}).then(function () {
			btn.disabled = false;
		});
	});
})();
