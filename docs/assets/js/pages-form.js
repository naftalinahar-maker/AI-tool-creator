/* Contact form via FormSubmit: submit without leaving the page. */
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
