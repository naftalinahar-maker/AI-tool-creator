/* נחמן AI – menu, course preselect, reveal, signup form. */
(function () {
	'use strict';
	document.documentElement.classList.add('js');

	// Mobile menu.
	var burger = document.querySelector('.burger');
	var nav = document.getElementById('nav');
	if (burger && nav) {
		var set = function (o) { burger.setAttribute('aria-expanded', o ? 'true' : 'false'); nav.classList.toggle('open', o); };
		burger.addEventListener('click', function () { set(burger.getAttribute('aria-expanded') !== 'true'); });
		nav.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
	}

	// "Register" buttons preselect the course.
	var course = document.getElementById('course');
	document.querySelectorAll('[data-course]').forEach(function (b) {
		b.addEventListener('click', function () { if (course) course.value = b.getAttribute('data-course'); });
	});

	// Reveal on scroll.
	var items = document.querySelectorAll('.reveal');
	if ('IntersectionObserver' in window) {
		var io = new IntersectionObserver(function (es) {
			es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
		}, { rootMargin: '0px 0px -10% 0px' });
		items.forEach(function (el) { io.observe(el); });
	} else { items.forEach(function (el) { el.classList.add('in'); }); }

	// Signup form: EmailJS when a template is set, otherwise the visitor's email app.
	var form = document.getElementById('signup-form');
	if (!form) return;
	var ok = document.getElementById('ok');
	var err = document.getElementById('err');
	var show = function (el) { el.hidden = false; el.scrollIntoView({ block: 'center', behavior: 'smooth' }); };

	form.addEventListener('submit', function (e) {
		e.preventDefault();
		ok.hidden = true; err.hidden = true;
		if (!form.checkValidity()) { form.reportValidity(); return; }
		var d = new FormData(form);
		if (d.get('website')) { form.reset(); show(ok); return; } // bot honeypot
		var params = {
			name: d.get('name') || '',
			email: d.get('email') || '',
			phone: d.get('phone') || '—',
			course: d.get('course') || '—',
			age: d.get('age') || '—',
			message: d.get('message') || '—'
		};
		var template = form.getAttribute('data-template');

		if (!template) {
			// No email template configured yet: send the visitor to WhatsApp to finish signing up.
			err.textContent = 'ההרשמה דרך הטופס עוד לא פעילה. לחצו על כפתור הוואצאפ כדי להירשם.';
			show(err);
			return;
		}

		var btn = form.querySelector('button[type="submit"]');
		btn.disabled = true;
		fetch('https://api.emailjs.com/api/v1.0/email/send', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				service_id: form.getAttribute('data-service'),
				template_id: template,
				user_id: form.getAttribute('data-key'),
				template_params: params
			})
		}).then(function (r) {
			if (r.ok) { form.reset(); show(ok); return; }
			return r.text().then(function (t) { throw new Error(r.status + ' ' + t); });
		}).catch(function (x) {
			var why = err.querySelector('small') || err.appendChild(document.createElement('small'));
			why.style.cssText = 'display:block;direction:ltr;margin-top:6px';
			why.textContent = String(x && x.message || x);
			show(err);
		}).then(function () { btn.disabled = false; });
	});
})();
