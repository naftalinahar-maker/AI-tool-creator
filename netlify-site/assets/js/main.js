/* Nachman Productions – small front-end helpers (no dependencies). */
(function () {
	'use strict';

	document.documentElement.classList.add('js');

	// Mobile menu.
	var toggle = document.querySelector('.nav-toggle');
	var nav = document.getElementById('site-nav');
	if (toggle && nav) {
		var setOpen = function (open) {
			toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
			nav.classList.toggle('is-open', open);
		};
		toggle.addEventListener('click', function () {
			setOpen(toggle.getAttribute('aria-expanded') !== 'true');
		});
		nav.addEventListener('click', function (e) {
			if (e.target.closest('a')) setOpen(false);
		});
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape') setOpen(false);
		});
	}

	// Package buttons preselect the package in the contact form.
	var pkgSelect = document.getElementById('form-package');
	document.querySelectorAll('[data-package]').forEach(function (btn) {
		btn.addEventListener('click', function () {
			if (pkgSelect) pkgSelect.value = btn.getAttribute('data-package');
		});
	});

	// Reveal on scroll.
	var items = document.querySelectorAll('.reveal');
	if ('IntersectionObserver' in window && items.length) {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-visible');
					io.unobserve(entry.target);
				}
			});
		}, { rootMargin: '0px 0px -10% 0px' });
		items.forEach(function (el) { io.observe(el); });
	} else {
		items.forEach(function (el) { el.classList.add('is-visible'); });
	}
})();
