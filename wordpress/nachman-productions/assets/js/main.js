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

	// Price calculator.
	var range = document.getElementById('calc-minutes');
	if (range && window.NP_PRICE) {
		var out = document.getElementById('calc-min-out');
		var total = document.getElementById('calc-total');
		var cta = document.getElementById('calc-cta');
		var formLength = document.getElementById('form-length');
		var cfg = window.NP_PRICE;

		var update = function () {
			var m = parseInt(range.value, 10) || 1;
			var price = Math.ceil(m / cfg.block) * cfg.price;
			out.textContent = m;
			total.innerHTML = '<span class="num">' + (Math.round(price) === price ? String(price) : price.toFixed(2)) + '</span><span class="cur">₪</span>';
			range.style.setProperty('--p', ((m - range.min) / (range.max - range.min || 1)) * 100 + '%');
		};
		range.addEventListener('input', update);
		update();

		if (cta && formLength) {
			cta.addEventListener('click', function () {
				formLength.value = range.value;
			});
		}
	}

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
